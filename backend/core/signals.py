# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Connection, Notification,User,Project,Task,Payment
from Profile.models import FreelancerProfile
from django.utils.translation import gettext_lazy as _
from django.db.models import Count

from django.urls import reverse

@receiver(post_save, sender=Connection)
def create_connection_notification(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        # Create a notification for the user who sent the connection request
        message_from_user = _(f"You have sent a connection request to <strong><a href='/{instance.to_user.role}/profile/{instance.to_user.id}'>{instance.to_user.username}</a></strong>.")
        
        Notification.objects.create(
            user=instance.from_user,  # The user who sent the request
            type='Connections',
            related_model_id=instance.id,  # Link to the Connection model
            notification_text=message_from_user,
        )

        # Create a notification for the user who received the connection request
        message_to_user = _(f"You have received a connection request from <strong><a href='/{instance.from_user.username}/profile/{instance.from_user.id}'>{instance.from_user.username}</a></strong>.")
        
        Notification.objects.create(
            user=instance.to_user,  # The user who received the request
            type='Connections',
            related_model_id=instance.id,  # Link to the Connection model
            notification_text=message_to_user,
        )



from django.db.models.signals import m2m_changed

@receiver(m2m_changed, sender=Project.skills_required.through)
def create_project_notification(sender, instance, action, **kwargs):
    if action == "post_add":  # This triggers after skills are added
        # Fetch all skills required for the project
        project_skills = set(instance.skills_required.all())

        if project_skills:
            # For each freelancer, check if their skills align with the project
            freelancers = User.objects.filter(role='freelancer')

            for freelancer in freelancers:
                # Get the FreelancerProfile or skip if it doesn't exist
                freelancer_profile, created = FreelancerProfile.objects.get_or_create(user=freelancer)

                # Get the freelancer's skills
                freelancer_skills = set(freelancer_profile.skills.all())

                # Calculate skill match percentage
                skill_match = len(freelancer_skills.intersection(project_skills)) / len(project_skills) * 100 if project_skills else 0

                # Send notification only if there's a match
                if skill_match > 0:
                    notification_text = _(
                        f"Exciting opportunity! A new project titled <strong>'{instance.title}'</strong> is looking for skills you possess! "
                        f"Your skill alignment with this project is <strong>{skill_match:.2f}%</strong>."
                    )
                    Notification.objects.create(
                        user=freelancer,
                        type='Projects',
                        related_model_id=instance.id,
                        notification_text=notification_text
                    )
                else:
                    notification_text = _(
                        f"New project alert! A new project titled <strong>'{instance.title}'</strong> might be a great fit for your skillset. "
                        "Explore the details to see if it's the right opportunity for you."
                    )
                    Notification.objects.create(
                        user=freelancer,
                        type='Projects',
                        related_model_id=instance.id,
                        notification_text=notification_text
                    )
               

@receiver(m2m_changed, sender=Task.skills_required_for_task.through)
def create_task_notification(sender, instance, action, **kwargs):
    if action == "post_add":
        # For each freelancer, check if their skills align with the task
        freelancers = User.objects.filter(role='freelancer')

        for freelancer in freelancers:
            # Attempt to get FreelancerProfile or skip if it doesn't exist
            freelancer_profile, created = FreelancerProfile.objects.get_or_create(user=freelancer)

            # Calculate skill match percentage
            freelancer_skills = set(freelancer_profile.skills.all())
            task_skills = set(instance.skills_required_for_task.all())

            if task_skills:
                # Calculate the percentage of skills matching
                skill_match = len(freelancer_skills.intersection(task_skills)) / len(task_skills) * 100
            else:
                skill_match = 0

            # Send a tailored notification based on the skill match
            if skill_match > 0:
                notification_text = _(
                    f"You may be the perfect fit for the task titled <strong>'{instance.title}'</strong>! "
                    f"Your skill alignment with this task is <strong>{skill_match:.2f}%</strong>."
                )
            else:
                notification_text = _(
                    f"New task alert! The task titled <strong>'{instance.title}'</strong> might be a great opportunity for you. "
                    "Explore the details to see if it's a match for your skillset."
                )

            Notification.objects.create(
                user=freelancer,
                type='Tasks',
                related_model_id=instance.id,
                notification_text=notification_text
            )



@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    """
    Signal to create notifications when a Payment is created or its status is updated.
    """
    if created:
        # Notification for payment creation
        notification_text = _(
            f"A new payment of {instance.amount} {instance.currency} has been initiated for {instance.payment_for}. "
            f"Payment method: {instance.get_payment_method_display()}. Status: {instance.get_status_display()}."
        )
        Notification.objects.create(
            user=instance.to_user,  # Notify the recipient of the payment
            type='Payments',
            related_model_id=instance.id,
            notification_text=notification_text
        )
    else:
        # Notification for payment status update
        if instance.status == 'paid':
            notification_text = _(
                f"Your payment of {instance.amount} {instance.currency} for {instance.payment_for} has been marked as paid. "
                f"Transaction ID: {instance.transaction_id}."
            )
            Notification.objects.create(
                user=instance.to_user,  # Notify the recipient of the payment
                type='Payments',
                related_model_id=instance.id,
                notification_text=notification_text
            )

            # Notify the sender of the payment
            sender_notification_text = _(
                f"Your payment of {instance.amount} {instance.currency} to {instance.to_user.username} for {instance.payment_for} "
                f"has been successfully processed. Transaction ID: {instance.transaction_id}."
            )
            Notification.objects.create(
                user=instance.from_user,  # Notify the sender of the payment
                type='Payments',
                related_model_id=instance.id,
                notification_text=sender_notification_text
            )
        elif instance.status == 'pending':
            notification_text = _(
                f"Your payment of {instance.amount} {instance.currency} for {instance.payment_for} is pending. "
                f"Please complete the payment process."
            )
            Notification.objects.create(
                user=instance.from_user,  # Notify the sender of the payment
                type='Payments',
                related_model_id=instance.id,
                notification_text=notification_text
            )