# Generated by Django 3.0.6 on 2021-11-18 16:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0123_remove_paddockrules_midfielddriverpredictiondeadlinesession'),
    ]

    operations = [
        migrations.AddField(
            model_name='paddockrules',
            name='midfieldDriverPredictionDeadlineSession',
            field=models.CharField(default='Q1/Sprint', max_length=55, null=True),
        ),
    ]
