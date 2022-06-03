# Generated by Django 3.0.6 on 2021-04-05 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driverpredictions',
            name='isFeatureRaceMidfield',
            field=models.BooleanField(default=0, null=True),
        ),
        migrations.AlterField(
            model_name='driverpredictions',
            name='isSeasonPrediction',
            field=models.BooleanField(default=0, null=True),
        ),
        migrations.AlterField(
            model_name='driverpredictions',
            name='isSprintRacePrediction',
            field=models.BooleanField(default=0, null=True),
        ),
    ]
