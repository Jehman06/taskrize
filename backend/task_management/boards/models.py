import random
from django.db import models
from authentication.models import CustomUser
from workspaces.models import Workspace

DEFAULT_IMAGES = [
    ('cherryBlossom', 'images/cherryblossom.jpg'),
    ('mountainLake', 'images/mountainlake.jpg'),
    ('goldenGate', 'images/goldenGate.jpg'),
    ('palmTrees', 'images/palmTrees.jpg'),
    ('bigSur', 'images/bigSur.jpg'),
    ('newYork', 'images/newYork.jpg'),
    ('yellowstone', 'images/yellowstone.jpg'),
    ('monumentValley', 'images/monumentValley.jpg')
]

class Board(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    favorite = models.ManyToManyField(CustomUser, related_name='favorite_boards', blank=True)
    custom_image = models.ImageField(upload_to='board_images/', blank=True, null=True) # Feature I will work on in the future
    default_image = models.CharField(max_length=100, choices=DEFAULT_IMAGES, blank=True, null=True) 
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards', null=True, blank=True)
    members = models.ManyToManyField(CustomUser, related_name='boards', blank=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.custom_image and not self.default_image:  # If neither custom nor default image is provided
            # Set a random default image if it's not selected by the user
            default_image = random.choice(DEFAULT_IMAGES)
            self.default_image = default_image[0]  # Set the default image identifier
        super().save(*args, **kwargs)