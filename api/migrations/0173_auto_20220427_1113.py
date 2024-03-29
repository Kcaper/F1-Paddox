# Generated by Django 3.2.9 on 2022-04-27 09:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0172_auto_20220427_0127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driverseasoncalendarsubs',
            name='outgoingDriverFromConstructor',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='outgoingDriverFromConstructor', to='api.constructors'),
        ),
        migrations.AlterField(
            model_name='driverseasoncalendarsubs',
            name='outgoingDriverToConstructor',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='outgoingDriverToConstructor', to='api.constructors'),
        ),
    ]
