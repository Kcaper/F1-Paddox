# Generated by Django 3.0.6 on 2021-04-23 09:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_auto_20210423_0822'),
    ]

    operations = [
        migrations.CreateModel(
            name='ergastRequestLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('completedDate', models.DateTimeField(auto_now_add=True, null=True)),
                ('status', models.CharField(max_length=100, null=True)),
                ('isFeatureRaceResultRequest', models.SmallIntegerField(default=0, null=True)),
                ('isSprintRaceResultRequest', models.SmallIntegerField(default=0, null=True)),
                ('isDriverStandingRequest', models.SmallIntegerField(default=0, null=True)),
                ('isConstructorStandingRequest', models.SmallIntegerField(default=0, null=True)),
                ('raceRound', models.SmallIntegerField(null=True)),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar')),
            ],
        ),
    ]
