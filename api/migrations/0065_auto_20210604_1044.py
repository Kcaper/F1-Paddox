# Generated by Django 3.0.6 on 2021-06-04 08:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0064_paddockpointscapturelog_issprintcombinedpoints'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddockpointscapturelog',
            old_name='isSprintCombinedPoints',
            new_name='isCombinedStandingPoints',
        ),
    ]