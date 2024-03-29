# Generated by Django 3.0.6 on 2021-04-21 11:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0023_constructorstandings_year'),
    ]

    operations = [
        migrations.CreateModel(
            name='predictionPoints',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('predictedPosition', models.IntegerField(null=True)),
                ('finishingPosition', models.IntegerField(default=100, null=True)),
                ('pointsForPrediction', models.IntegerField(default=0, null=True)),
                ('driver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.drivers')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
