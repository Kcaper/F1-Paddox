# Generated by Django 3.0.6 on 2021-08-24 21:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0071_driverpredictions_ismidseasonprediction'),
    ]

    operations = [
        migrations.AddField(
            model_name='constructorseasonpredictions',
            name='isMidSeasonPrediction',
            field=models.SmallIntegerField(default=0, null=True),
        ),
    ]