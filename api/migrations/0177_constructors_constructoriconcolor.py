# Generated by Django 3.2.9 on 2022-05-02 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0176_paddockdrivers'),
    ]

    operations = [
        migrations.AddField(
            model_name='constructors',
            name='constructorIconColor',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
