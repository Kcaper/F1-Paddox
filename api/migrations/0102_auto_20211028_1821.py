# Generated by Django 3.0.6 on 2021-10-28 16:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0101_auto_20211028_1820'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddockuserstatusmaxusers',
            old_name='maxUser',
            new_name='maxUsers',
        ),
    ]
