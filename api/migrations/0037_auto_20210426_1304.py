# Generated by Django 3.0.6 on 2021-04-26 13:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_constructorapinameconverstions'),
    ]

    operations = [
        migrations.RenameField(
            model_name='constructorapinameconverstions',
            old_name='constructorId',
            new_name='constructor',
        ),
    ]
