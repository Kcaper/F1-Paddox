# Generated by Django 3.0.6 on 2021-10-19 15:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0094_paddockmidfieldexcludedteams_paddockrule'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paddockrulesexcludedteams',
            old_name='paddock',
            new_name='paddockRules',
        ),
    ]