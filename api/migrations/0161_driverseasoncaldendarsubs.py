# Generated by Django 3.2.9 on 2022-04-25 11:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0160_manualresultlog'),
    ]

    operations = [
        migrations.CreateModel(
            name='driverSeasonCaldendarSubs',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('incomingDriver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='incomingDriver', to='api.drivers')),
                ('outgoingDriver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='outgoingDriver', to='api.drivers')),
                ('seasonCalendar', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.seasoncalendar')),
            ],
        ),
    ]
