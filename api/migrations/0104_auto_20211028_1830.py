# Generated by Django 3.0.6 on 2021-10-28 16:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0103_auto_20211028_1827'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddocks',
            old_name='paddockMaxUsers',
            new_name='paddockUserStatusMaxUsers',
        ),
    ]
