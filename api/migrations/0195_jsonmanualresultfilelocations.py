# Generated by Django 3.2.9 on 2022-05-10 22:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0194_alter_manualresults_driver'),
    ]

    operations = [
        migrations.CreateModel(
            name='jsonManualResultFileLocations',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('createdDate', models.DateTimeField(auto_now_add=True, null=True)),
                ('year', models.IntegerField(default=2022, null=True)),
                ('isGeneralLeaderboard', models.SmallIntegerField(default=0, null=True)),
                ('isMidfieldGame', models.SmallIntegerField(default=0, null=True)),
                ('isPreSeasonDriverGame', models.SmallIntegerField(default=0, null=True)),
                ('isMidSeasonDriverGame', models.SmallIntegerField(default=0, null=True)),
                ('isPreSeasonConstructorGame', models.SmallIntegerField(default=0, null=True)),
                ('isMidSeasonConstructorGame', models.SmallIntegerField(default=0, null=True)),
                ('isPreSeasonCombinedGame', models.SmallIntegerField(default=0, null=True)),
                ('isMidSeasonCombinedGame', models.SmallIntegerField(default=0, null=True)),
                ('isCustomGameFile', models.SmallIntegerField(default=0, null=True)),
                ('fileLocation', models.CharField(max_length=255, null=True)),
                ('paddock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddocks')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasoncalendar')),
            ],
        ),
    ]