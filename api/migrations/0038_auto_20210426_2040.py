# Generated by Django 3.0.6 on 2021-04-26 20:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_auto_20210426_1304'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddockpointscapturelog',
            old_name='isFeatureRaceMidfeildPoints',
            new_name='isFeatureRaceMidfieldPoints',
        ),
    ]
