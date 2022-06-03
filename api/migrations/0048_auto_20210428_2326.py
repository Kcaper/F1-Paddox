# Generated by Django 3.0.6 on 2021-04-28 23:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0047_auto_20210428_2240'),
    ]

    operations = [
        migrations.RenameField(
            model_name='leaderboards',
            old_name='currentPosition',
            new_name='round_player_position',
        ),
        migrations.AddField(
            model_name='leaderboards',
            name='currentOverallPosition',
            field=models.IntegerField(null=True),
        ),
    ]
