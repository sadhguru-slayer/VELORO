# signals.py
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from core.models import Project, Task, Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@receiver(post_save, sender=Project)
def notify_project_deadline(sender, instance, created, **kwargs):
    """
    Send a notification to the client when a project deadline is near.
    """
    if not created and instance.status == "pending":  # Only trigger for existing projects
        days_left = (instance.deadline - now().date()).days
        print(f"Project '{instance.title}' - {days_left} days left")  # Debugging output
        if days_left in [4, 3, 2, 1, 0]:  # Notify when deadline is in 4, 3, 2, 1, or 0 days
            notification_text = f"Your project '{instance.title}' deadline is near! Only {days_left} day(s) left!"
            Notification.objects.create(
                user=instance.client,
                type="Projects",
                related_model_id=instance.id,
                notification_text=notification_text
            )

@receiver(post_save, sender=Task)
def notify_task_deadline(sender, instance, created, **kwargs):
    """
    Send a notification to all assigned users when a task deadline is near.
    """
    print(instance)
    if not created and instance.status == "pending":
        # Debugging output
        print(f"Task '{instance.title}' - Checking if deadline is near. Status: {instance.status}")

        # Check that the deadline exists and is a valid date
        if instance.deadline:
            days_left = (instance.deadline - now().date()).days
            print(f"Task '{instance.title}' - {days_left} days left")  # Debugging output
            if days_left in [4, 3, 2, 1, 0]:  # Notify when deadline is in 4, 3, 2, 1, or 0 days
                notification_text = f"Your task '{instance.title}' deadline is approaching! Only {days_left} day(s) left!"
                
                # Check if assigned_to field has users
                if instance.assigned_to.exists():
                    for user in instance.assigned_to.all():
                        print(f"Notifying user {user.username} about task deadline.")  # Debugging output
                        Notification.objects.create(
                            user=user,
                            type="Projects & Tasks",
                            related_model_id=instance.id,
                            notification_text=notification_text
                        )
                
                Notification.objects.create(
                        user=instance.project.client,
                        type="Projects",
                        related_model_id=instance.id,
                        notification_text=notification_text
                )  # Debugging output


@receiver(post_save, sender=Notification)
def notify_user_on_new_notification(sender, instance, created, **kwargs):
    """Send real-time notification when a new Notification object is created."""
    if created:
        
        channel_layer = get_channel_layer()
        group_name = f"notifications_{instance.user.id}"  # Group name based on user ID
        
        async_to_sync(channel_layer.group_send)(
            group_name, 
            {
                "type": "send_notification",
                "message": {
                    "id": instance.id,
                    "text": instance.notification_text,
                    "timestamp": instance.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                }
            }
        )


