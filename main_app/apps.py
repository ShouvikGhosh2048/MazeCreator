import imp
from django.apps import AppConfig
from django.db.models.signals import post_save

class MainAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main_app'
    
    def ready(self):
        from . import signals
        post_save.connect(signals.create_user_profile)