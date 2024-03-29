# Generated by Django 3.2.9 on 2022-04-23 13:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0158_rename_ismanualreault_results_ismanualresult'),
    ]

    operations = [
        migrations.CreateModel(
            name='manualRestult',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2022, null=True)),
                ('grid', models.IntegerField(null=True)),
                ('position', models.IntegerField(null=True)),
                ('positionText', models.CharField(max_length=255, null=True)),
                ('points', models.FloatField(null=True)),
                ('hasFastestLap', models.SmallIntegerField(default=0, null=True)),
                ('isPoleSitter', models.SmallIntegerField(default=0, null=True)),
                ('constructor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.constructors')),
                ('driver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.drivers')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasoncalendar')),
            ],
        ),
    ]
