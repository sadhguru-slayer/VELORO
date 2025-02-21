# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Connection, Notification,User,Project,Task
from Profile.models import FreelancerProfile
from django.utils.translation import gettext_lazy as _
from django.db.models import Count

@receiver(post_save, sender=Connection)
def create_connection_notification(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        # Create a notification for the user who sent the connection request
        message_from_user = _(f"You have sent a connection request to {instance.to_user.username}.")
        
        Notification.objects.create(
            user=instance.from_user,  # The user who sent the request
            type='Connections',
            related_model_id=instance.id,  # Link to the Connection model
            notification_text=message_from_user,
        )

        # Create a notification for the user who received the connection request
        message_to_user = _(f"You have received a connection request from {instance.from_user.username}.")
        
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
        print(f"Skills required for project: {project_skills}")

        if project_skills:
            # For each freelancer, check if their skills align with the project
            freelancers = User.objects.filter(role='freelancer')

            for freelancer in freelancers:
                # Get the FreelancerProfile or skip if it doesn't exist
                freelancer_profile, created = FreelancerProfile.objects.get_or_create(user=freelancer)

                # Get the freelancer's skills
                freelancer_skills = set(freelancer_profile.skills.all())
                print(f"Freelancer skills for {freelancer.username}: {freelancer_skills}")

                # Calculate skill match percentage
                skill_match = len(freelancer_skills.intersection(project_skills)) / len(project_skills) * 100 if project_skills else 0
                print(f"Skill match for {freelancer.username}: {skill_match}%")

                # Send notification only if there's a match
                if skill_match > 0:
                    notification_text = _(
                        f"Project '{instance.title}' might interest you! "
                        f"Your skill alignment is {skill_match:.2f}%."
                    )
                    Notification.objects.create(
                        user=freelancer,
                        type='Projects',
                        related_model_id=instance.id,
                        notification_text=notification_text
                    )



@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    if created:
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
            notification_text = _(
                f"Task '{instance.title}' might interest you! "
                f"Your skill alignment is {skill_match:.2f}%."
            ) if skill_match > 0 else f"Task '{instance.title}' might interest you."

            Notification.objects.create(
                user=freelancer,
                type='Tasks',
                related_model_id=instance.id,
                notification_text=notification_text
            )
