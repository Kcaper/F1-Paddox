# Generated by Django 3.2.9 on 2022-03-24 17:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0131_paddockseasonpredictions_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='paddockseasonpredictions',
            name='StartRound',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddockrulesstartrounds'),
        ),
    ]