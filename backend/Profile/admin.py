from django.contrib import admin
from .models import FreelancerProfile, ClientProfile,PaymentHistory,Feedback,FreelancerReview
from django.contrib.admin import ModelAdmin
class FreelancerProfileAdmin(ModelAdmin):
    fieldsets = (
        ('Basic Info', {
            'fields': ('user','bio', 'location', 'profile_picture')
        }),
        ('Bank Info', {
            'fields': ('bank_name', 'bank_account_number', 'bank_ifsc', 'bank_verified','card_number','expiry_date','cvv')
        }),
        ('ID Proof', {
            'fields': ('id_proof', 'id_verified')
        }),
        ('Company Info (Optional)', {
            'fields': ('company_name', 'company_website', 'company_registration_number')
        }),
        ('Freelancer Stats', {
            'fields': ('skills', 'number_of_completed_tasks', 'total_tasks_assigned', 'average_rating')
        }),
        ('Portfolio', {
            'fields': ('portfolio_url', 'portfolio_description')
        }),
        ('Freelancer Records', {
            'fields': ('honesty_score', 'payment_history')
        }),
        
    )

class ClientProfileAdmin(ModelAdmin):
    fieldsets = (
        ('Basic Info', {
            'fields': ('user','bio', 'location', 'profile_picture')
        }),
        ('Bank Info', {
            'fields': ('bank_name', 'bank_account_number', 'bank_ifsc', 'bank_verified')
        }),
        ('ID Proof', {
            'fields': ('id_proof', 'id_verified')
        }),
        ('Company Info (Optional)', {
            'fields': ('company_name', 'company_website', 'company_registration_number')
        }),
        ('Project Stats', {
            'fields': ('successful_projects', 'all_projects_posted', 'average_rating')
        }),
        ('Client Records', {
            'fields': ('honesty_score', 'payment_history')
        }),
    )

class PaymentHistoryAdmin(ModelAdmin):
    model = PaymentHistory
    list_display = ('user', 'transaction_id', 'amount', 'status', 'payment_date')
    list_filter = ('status', 'payment_date')
    search_fields = ('user__username', 'transaction_id')
    date_hierarchy = 'payment_date'
    ordering = ('-payment_date',)

    actions = ['mark_as_completed', 'mark_as_failed']

    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected payments as completed"

    def mark_as_failed(self, request, queryset):
        queryset.update(status='failed')
    mark_as_failed.short_description = "Mark selected payments as failed"


# Register the models with the custom admin classes
admin.site.register(FreelancerProfile, FreelancerProfileAdmin)
admin.site.register(ClientProfile, ClientProfileAdmin)
admin.site.register(PaymentHistory,PaymentHistoryAdmin)
admin.site.register(Feedback)
admin.site.register(FreelancerReview)