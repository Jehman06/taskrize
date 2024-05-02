import random
from django.db import models
from authentication.models import CustomUser
from workspaces.models import Workspace
from images.models import Image

class Board(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    favorite = models.ManyToManyField(CustomUser, related_name='favorite_boards', blank=True)
    custom_image = models.ImageField(upload_to='board_images/', blank=True, null=True) # Feature I will work on in the future
    default_image = models.ForeignKey(Image, on_delete=models.SET_NULL, blank=True, null=True) 
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards', null=True, blank=True)
    members = models.ManyToManyField(CustomUser, related_name='boards', blank=True)

    def __str__(self):
        return self.title