# Generated by Django 3.0.6 on 2021-04-23 08:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_constructorseasonpredictions_year'),
    ]

    operations = [
        migrations.CreateModel(
            name='paddockPointsCaptureLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(null=True)),
                ('isFeatureRacePoints', models.SmallIntegerField(default=0, null=True)),
                ('isDriverStandingPoints', models.SmallIntegerField(default=0, null=True)),
                ('isConstructorStandingPoints', models.SmallIntegerField(default=0, null=True)),
                ('isSprintRaceStandingPoints', models.SmallIntegerField(default=0, null=True)),
                ('calculatedDate', models.DateTimeField(auto_now_add=True, null=True)),
                ('paddock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.paddocks')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar')),
            ],
        ),
    ]
