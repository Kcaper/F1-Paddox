# Generated by Django 3.2.9 on 2022-04-26 20:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0170_rename_ispremanantsub_driverseasoncalendarsubs_ispermanantsub'),
    ]

    operations = [
        migrations.RenameField(
            model_name='driverseasoncalendarsubs',
            old_name='isPermanantSub',
            new_name='isPermanentSub',
        ),
    ]
