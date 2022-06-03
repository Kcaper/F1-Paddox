# Generated by Django 3.2.9 on 2022-04-26 07:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0165_auto_20220426_0917'),
    ]

    operations = [
        migrations.RenameField(
            model_name='driverseasoncalendarsubs',
            old_name='outgoingDriver',
            new_name='driver',
        ),
        migrations.RemoveField(
            model_name='driverseasoncalendarsubs',
            name='incomingDriver',
        ),
        migrations.AddField(
            model_name='driverseasoncalendarsubs',
            name='isPartTimeDriver',
            field=models.SmallIntegerField(null=True),
        ),
    ]