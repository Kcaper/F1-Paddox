# Generated by Django 3.2.9 on 2022-05-10 16:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0192_categorydriverresultpoints_manualresultleaderboards'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manualpredictionpoints',
            name='driver',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddockdrivers'),
        ),
    ]
