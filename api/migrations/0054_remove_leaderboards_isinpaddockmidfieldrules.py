# Generated by Django 3.0.6 on 2021-05-07 22:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0053_leaderboards_isinpaddockmidfieldrules'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='leaderboards',
            name='isInPaddockMidfieldRules',
        ),
    ]
