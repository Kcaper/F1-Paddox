# Generated by Django 3.2.9 on 2022-04-12 18:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0143_rename_predictionpointssysyems_predictionpointssysems'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='predictionPointsSysems',
            new_name='predictionPointsSystems',
        ),
    ]
