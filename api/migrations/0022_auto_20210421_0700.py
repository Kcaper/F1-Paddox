# Generated by Django 3.0.6 on 2021-04-21 07:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_constructors_apiname'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='constructorstandings',
            name='race',
        ),
        migrations.AddField(
            model_name='constructorstandings',
            name='seasonCalendar',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seasonCalendar'),
        ),
    ]