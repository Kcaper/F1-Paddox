# Generated by Django 3.0.6 on 2021-04-23 08:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_paddockpointscapturelog'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddockpointscapturelog',
            old_name='isFeatureRacePoints',
            new_name='isFeatureRaceMidfeildPoints',
        ),
        migrations.RenameField(
            model_name='paddockpointscapturelog',
            old_name='isSprintRaceStandingPoints',
            new_name='isSprintRacePoints',
        ),
    ]
