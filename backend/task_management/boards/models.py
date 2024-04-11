from django.db import models
from authentication.models import CustomUser
from workspaces.models import Workspace
import random

DEFAULT_IMAGES = [
    'images/cherryblossom.jpg',
    'images/mountainlake.jpg',
]

class Board(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    favorite = models.ManyToManyField(CustomUser, related_name='favorite_boards', blank=True)
    image = models.ImageField(upload_to='board_images/', blank=True) 
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards', null=True, blank=True)
    members = models.ManyToManyField(CustomUser, related_name='boards', blank=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.image: # If no image is provided by the user
            self.image = random.choice(DEFAULT_IMAGES) # Set a random default image
        super().save(*args, **kwargs)