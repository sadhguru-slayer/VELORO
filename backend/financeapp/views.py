from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from decimal import Decimal
from .models import Wallet, WalletTransaction
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet_balance(request):
    """Get user's wallet balance and recent transactions"""
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    # Get recent transactions
    recent_transactions = WalletTransaction.objects.filter(
        wallet=wallet
    ).order_by('-timestamp')[:5]
    
    transactions_data = [{
        'id': str(tx.id),
        'amount': float(tx.amount),
        'type': tx.transaction_type,
        'status': tx.status,
        'timestamp': tx.timestamp.isoformat(),
        'description': tx.description
    } for tx in recent_transactions]

    return Response({
        'balance': float(wallet.balance),
        'hold_balance': float(wallet.hold_balance),
        'currency': wallet.currency,
        'recent_transactions': transactions_data,
        'last_updated': wallet.last_updated.isoformat()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_funds(request):
    """Deposit funds into wallet"""
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
        description = request.data.get('description', 'Deposit')
        
        if amount <= 0:
            return Response({
                'error': 'Amount must be positive'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        wallet = request.user.wallet
        wallet.deposit(amount, description)
        
        return Response({
            'message': 'Deposit successful',
            'new_balance': float(wallet.balance),
            'transaction_id': wallet.transactions.latest('timestamp').reference_id
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_funds(request):
    """Withdraw funds from wallet"""
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
        description = request.data.get('description', 'Withdrawal')
        
        if amount <= 0:
            return Response({
                'error': 'Amount must be positive'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        wallet = request.user.wallet
        wallet.withdraw(amount, description)
        
        return Response({
            'message': 'Withdrawal successful',
            'new_balance': float(wallet.balance),
            'transaction_id': wallet.transactions.latest('timestamp').reference_id
        })
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_history(request):
    """Get wallet transaction history with filters"""
    wallet = request.user.wallet
    
    # Get query parameters
    transaction_type = request.GET.get('type')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    
    # Build query
    transactions = wallet.get_transaction_history()
    
    if transaction_type:
        transactions = transactions.filter(transaction_type=transaction_type)
    if start_date:
        transactions = transactions.filter(timestamp__gte=start_date)
    if end_date:
        transactions = transactions.filter(timestamp__lte=end_date)
    
    # Get total count
    total_count = transactions.count()
    
    # Apply pagination
    transactions = transactions[offset:offset + limit]
    
    transactions_data = [{
        'id': str(tx.id),
        'reference_id': tx.reference_id,
        'amount': float(tx.amount),
        'type': tx.transaction_type,
        'status': tx.status,
        'timestamp': tx.timestamp.isoformat(),
        'description': tx.description
    } for tx in transactions]
    
    return Response({
        'transactions': transactions_data,
        'total_count': total_count,
        'has_more': (offset + limit) < total_count
    })