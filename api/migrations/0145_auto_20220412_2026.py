# Generated by Django 3.2.9 on 2022-04-12 18:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0144_rename_predictionpointssysems_predictionpointssystems'),
    ]

    operations = [
        migrations.AddField(
            model_name='predictionpointssystems',
            name='isMidSeasonConstructorPredictionSystem',
            field=models.SmallIntegerField(null=True),
        ),
        migrations.AddField(
            model_name='predictionpointssystems',
            name='isMidSeasonDriverPredictionSystem',
            field=models.SmallIntegerField(null=True),
        ),
        migrations.AddField(
            model_name='predictionpointssystems',
            name='isPreSeasonConstructorrPredictionSystem',
            field=models.SmallIntegerField(null=True),
        ),
        migrations.AddField(
            model_name='predictionpointssystems',
            name='isPreSeasonDriverPredictionSystem',
            field=models.SmallIntegerField(null=True),
        ),
        migrations.AddField(
            model_name='predictionpointssystems',
            name='isRacelyPredictionSystem',
            field=models.SmallIntegerField(null=True),
        ),
    ]
