# Generated by Django 3.0.6 on 2021-10-11 20:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0081_auto_20211011_2114'),
    ]

    operations = [
        migrations.CreateModel(
            name='defaultMidfieldExcludedTeamsBySeason',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('constructor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.constructors')),
            ],
        ),
    ]