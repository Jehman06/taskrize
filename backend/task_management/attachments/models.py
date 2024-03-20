from django.db import models
from cards.models import Card

class Attachment(models.Model):
    card = models.ForeignKey(Card, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.file.name} for {self.card.title}"