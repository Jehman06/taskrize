from django.db import models
from authentication.models import CustomUser
from workspaces.models import Workspace
# import random

# TODO: Provide a random image when user creates a board
"""
DEFAULT_IMAGES = [
    'path_to_image1.jpg'
    'path_to_image2.jpg'
    'path_to_image3.jpg'
    'path_to_image4.jpg'
]
"""

class Board(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    favorite = models.ManyToManyField(CustomUser, related_name='favorite_boards', blank=True)
    image = models.ImageField(upload_to='board_images/', blank=True) # TODO: Provide a default image when user creates a board (image = models.ImageField(upload_to='board_images/', blank=False, default=random.choice(DEFAULT_IMAGES)))
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards')
    members = models.ManyToManyField(CustomUser, related_name='boards', blank=True)

    def __str__(self):
        return self.title
