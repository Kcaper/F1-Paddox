# Generated by Django 3.0.6 on 2021-10-28 18:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0106_userpaddocks_year'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='paddockuserstatusmaxusers',
            name='userStatus',
        ),
        migrations.AddField(
            model_name='paddockuserstatusmaxusers',
            name='statusLevel',
            field=models.CharField(default='Free', max_length=255, null=True),
        ),
    ]
