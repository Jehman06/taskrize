from django.db import models
from boards.models import Board

class List(models.Model):
    title = models.CharField(max_length=50)
    position = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    board = models.ForeignKey(Board, related_name='lists', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
