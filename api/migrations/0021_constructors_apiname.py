# Generated by Django 3.0.6 on 2021-04-21 06:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_auto_20210420_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='constructors',
            name='apiName',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
