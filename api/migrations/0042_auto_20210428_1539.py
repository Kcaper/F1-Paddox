# Generated by Django 3.0.6 on 2021-04-28 15:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_constructors_isincludedinprediction'),
    ]

    operations = [
        migrations.RenameField(
            model_name='drivers',
            old_name='isIncludedInPredcitions',
            new_name='isIncludedInPredictions',
        ),
    ]