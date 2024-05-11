from django.db import models
from lists.models import List

class Card(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    position = models.PositiveIntegerField()
    due_date = models.DateTimeField(null=True, blank=True)
    attachment = models.URLField(blank=True)
    list = models.ForeignKey(List, related_name='cards', on_delete=models.CASCADE)
    label = models.CharField(max_length=7, blank=True)

    def __str__(self):
        return self.title
