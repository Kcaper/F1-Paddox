# Generated by Django 3.0.6 on 2021-06-04 07:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0061_userpaddocks_datetimejoined'),
    ]

    operations = [
        migrations.AddField(
            model_name='seasoncalendar',
            name='combinedStandingsLeaderboardUpdated',
            field=models.SmallIntegerField(default=0, null=True),
        ),
    ]