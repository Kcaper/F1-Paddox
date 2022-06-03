# Generated by Django 3.0.6 on 2021-11-16 19:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0112_auto_20211115_2339'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customgames',
            name='createdBy',
        ),
        migrations.RemoveField(
            model_name='gameexcludedteamsbypaddock',
            name='constructor',
        ),
        migrations.RemoveField(
            model_name='gameexcludedteamsbypaddock',
            name='paddock',
        ),
        migrations.RemoveField(
            model_name='paddockrulesexcludedteams',
            name='paddockMidfieldExcludedTeams',
        ),
        migrations.RemoveField(
            model_name='paddockrulesexcludedteams',
            name='paddockRules',
        ),
        migrations.RemoveField(
            model_name='racelymidfieldpredictions',
            name='driver',
        ),
        migrations.RemoveField(
            model_name='racelymidfieldpredictions',
            name='paddock',
        ),
        migrations.RemoveField(
            model_name='racelymidfieldpredictions',
            name='result',
        ),
        migrations.RemoveField(
            model_name='racelymidfieldpredictions',
            name='user',
        ),
        migrations.RemoveField(
            model_name='races',
            name='calendar',
        ),
        migrations.RemoveField(
            model_name='races',
            name='circuit',
        ),
        migrations.RemoveField(
            model_name='seasonteampredictions',
            name='constructor',
        ),
        migrations.RemoveField(
            model_name='seasonteampredictions',
            name='paddock',
        ),
        migrations.RemoveField(
            model_name='seasonteampredictions',
            name='result',
        ),
        migrations.RemoveField(
            model_name='seasonteampredictions',
            name='user',
        ),
        migrations.RemoveField(
            model_name='paddockcustomgames',
            name='customGame',
        ),
        migrations.RemoveField(
            model_name='qualifying',
            name='race',
        ),
        migrations.DeleteModel(
            name='constructorResults',
        ),
        migrations.DeleteModel(
            name='customGames',
        ),
        migrations.DeleteModel(
            name='gameExcludedTeamsByPaddock',
        ),
        migrations.DeleteModel(
            name='paddockRulesExcludedTeams',
        ),
        migrations.DeleteModel(
            name='racelyMidfieldPredictions',
        ),
        migrations.DeleteModel(
            name='races',
        ),
        migrations.DeleteModel(
            name='seasonTeamPredictions',
        ),
    ]