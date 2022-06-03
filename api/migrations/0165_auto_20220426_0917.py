# Generated by Django 3.2.9 on 2022-04-26 07:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0164_driverseasoncalendarsubs_subbedfromconstructor'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverseasoncalendarsubs',
            name='isInterTeamSub',
            field=models.SmallIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='driverseasoncalendarsubs',
            name='subbedToConstructor',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subbedToConstructor', to='api.constructors'),
        ),
        migrations.AlterField(
            model_name='driverseasoncalendarsubs',
            name='subbedFromConstructor',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subbedFromConstructor', to='api.constructors'),
        ),
    ]
