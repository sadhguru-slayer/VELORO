# Generated by Django 5.1.4 on 2025-02-20 17:52

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collaborations', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='collaboration',
            name='admin',
        ),
        migrations.AddField(
            model_name='collaboration',
            name='admin',
            field=models.ManyToManyField(related_name='admin_collaborations', to=settings.AUTH_USER_MODEL),
        ),
    ]
