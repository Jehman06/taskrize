from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import UserProfile

@receiver(post_save, sender=get_user_model())
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance, email=instance.email)

@receiver(post_save, sender=get_user_model())
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()

User = get_user_model()

@receiver(pre_save, sender=UserProfile)
def update_user_email(sender, instance, **kwargs):
    try:
        # Retrieve the corresponding CustomUser object
        user = instance.user

        # Check if the email has been updated
        if instance.email != user.email:
            # Update the email in the CustomUser object
            user.email = instance.email
            user.save()
    except User.DoesNotExist:
        # Handle the case where the associated CustomUser does not exist
        raise Exception('error: User does not exist')