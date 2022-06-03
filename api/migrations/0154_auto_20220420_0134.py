# Generated by Django 3.2.9 on 2022-04-19 23:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0153_polefasteslappredictions_resultdriver_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='results',
            name='hasFastestLap',
            field=models.SmallIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='results',
            name='isPoleSitter',
            field=models.SmallIntegerField(default=0, null=True),
        ),
    ]