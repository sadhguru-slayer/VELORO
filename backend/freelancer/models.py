from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=255)
    start = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
