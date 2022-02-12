from django.contrib.auth.models import User

from . import models

def create_user_profile(sender,**kwargs):
    #When a user is created, we create a user profile for the user.
    if sender == User:
        user = kwargs["instance"]

        profile_exists = models.UserProfile.objects.filter(user = user).count() == 1

        if not profile_exists:
            user_profile = models.UserProfile()
            user_profile.user = user
            user_profile.save()