# Generated by Django 5.0.6 on 2024-05-08 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
        ('boards', '0002_board_members'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='board_favorite',
            field=models.ManyToManyField(blank=True, related_name='favorited_by', to='boards.board'),
        ),
    ]