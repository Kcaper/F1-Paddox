# Generated by Django 3.0.6 on 2021-04-20 19:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_auto_20210419_1155'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='driverpredictions',
            name='race',
        ),
        migrations.RemoveField(
            model_name='driverstandings',
            name='race',
        ),
        migrations.RemoveField(
            model_name='results',
            name='fastestLapSpeed',
        ),
        migrations.RemoveField(
            model_name='results',
            name='milliseconds',
        ),
        migrations.RemoveField(
            model_name='results',
            name='positionOrder',
        ),
        migrations.RemoveField(
            model_name='results',
            name='race',
        ),
        migrations.RemoveField(
            model_name='results',
            name='rank',
        ),
        migrations.AddField(
            model_name='driverpredictions',
            name='calendar',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasonCalendar'),
        ),
        migrations.AddField(
            model_name='driverstandings',
            name='seasonCalendar',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar'),
        ),
        migrations.AddField(
            model_name='driverstandings',
            name='year',
            field=models.IntegerField(default=2021, null=True),
        ),
        migrations.AddField(
            model_name='results',
            name='seasonCalendar',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar'),
        ),
        migrations.AlterField(
            model_name='paddocks',
            name='paddockCode',
            field=models.CharField(max_length=6),
        ),
        migrations.AlterField(
            model_name='paddocks',
            name='paddockName',
            field=models.CharField(default='paddock', max_length=30, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='results',
            name='status',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
