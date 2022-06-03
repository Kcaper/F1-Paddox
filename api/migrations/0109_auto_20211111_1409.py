# Generated by Django 3.0.6 on 2021-11-11 12:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0108_auto_20211106_1858'),
    ]

    operations = [
        migrations.CreateModel(
            name='paddockRulesStartRounds',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('isMidSeasonDriverRule', models.SmallIntegerField(default=0, null=True)),
                ('isMidSeasonConstructorRule', models.SmallIntegerField(default=0, null=True)),
                ('isPreSeasonDriverRule', models.SmallIntegerField(default=0, null=True)),
                ('isPreSeasonConstructorRule', models.SmallIntegerField(default=0, null=True)),
                ('isRacelyRule', models.SmallIntegerField(default=0, null=True)),
                ('startRound', models.IntegerField(default=0, null=True)),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasonCalendar')),
            ],
        ),
        migrations.AddField(
            model_name='paddockrules',
            name='paddockRulesStartRounds',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddockRulesStartRounds'),
        ),
    ]
