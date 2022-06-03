# Generated by Django 3.2.9 on 2022-04-26 07:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0166_auto_20220426_0932'),
    ]

    operations = [
        migrations.RenameField(
            model_name='driverseasoncalendarsubs',
            old_name='driver',
            new_name='outgoingDriver',
        ),
        migrations.RemoveField(
            model_name='driverseasoncalendarsubs',
            name='isPartTimeDriver',
        ),
        migrations.AddField(
            model_name='driverseasoncalendarsubs',
            name='incomingDriver',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='incomingDriver', to='api.drivers'),
        ),
    ]
