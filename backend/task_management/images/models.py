from django.db import models

class Image(models.Model):
    url = models.URLField()
    owner = models.CharField(max_length=100)
    alt = models.TextField()

    def __str__(self):
        return str(self.url)