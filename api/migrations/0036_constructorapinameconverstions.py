# Generated by Django 3.0.6 on 2021-04-26 12:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_paddocks_currentpointscalcround'),
    ]

    operations = [
        migrations.CreateModel(
            name='constructorApiNameConverstions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('apiName', models.CharField(max_length=255, null=True)),
                ('constructorId', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.constructors')),
            ],
        ),
    ]