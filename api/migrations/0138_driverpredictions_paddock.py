# Generated by Django 3.2.9 on 2022-03-24 19:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0137_rename_driverpredicton_paddockseasonpredictionstartrounds_driverprediction'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverpredictions',
            name='paddock',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddocks'),
        ),
    ]
