# Generated by Django 3.0.6 on 2021-10-28 16:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0102_auto_20211028_1821'),
    ]

    operations = [
        migrations.AddField(
            model_name='userstatus',
            name='isBronze',
            field=models.SmallIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='userstatus',
            name='isFree',
            field=models.SmallIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='userstatus',
            name='isGold',
            field=models.SmallIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='userstatus',
            name='isSilver',
            field=models.SmallIntegerField(default=0, null=True),
        ),
    ]
