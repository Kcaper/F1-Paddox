# Generated by Django 3.2.9 on 2022-04-13 06:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0147_predictionpoints_maxpoints'),
    ]

    operations = [
        migrations.CreateModel(
            name='singleLinePredictions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('predictedPosition', models.IntegerField(null=True)),
                ('constructorPrediction', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.constructorseasonpredictions')),
                ('driver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.drivers')),
                ('driverPrediction', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.driverpredictions')),
                ('paddock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddocks')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasoncalendar')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
