# Generated by Django 3.0.6 on 2021-10-18 15:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0085_payementpaddockrestrictions_userpaymentthresholds'),
    ]

    operations = [
        migrations.CreateModel(
            name='payementJoinPaddockRestrictions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('betaUserNumPublicPaddocks', models.IntegerField(null=True)),
                ('betaNumPrivatePaddocks', models.IntegerField(null=True)),
                ('freeUserNumPublicPaddocks', models.IntegerField(null=True)),
                ('freeUserNumPrivatePaddocks', models.IntegerField(null=True)),
                ('bronzeUserNumPublicPaddocks', models.IntegerField(null=True)),
                ('bronzeUserNumPrivatePaddocks', models.IntegerField(null=True)),
                ('silverUserNumPublicPaddocks', models.IntegerField(null=True)),
                ('silverUserNumPrivatePaddocks', models.IntegerField(null=True)),
                ('goldUserNumPublicPaddocks', models.IntegerField(null=True)),
                ('goldUserNumPrivatePaddocks', models.IntegerField(null=True)),
            ],
        ),
        migrations.RenameModel(
            old_name='payementPaddockRestrictions',
            new_name='payementCreatePaddockRestrictions',
        ),
        migrations.CreateModel(
            name='userPaddockCount',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('numPrivatePaddocksJoined', models.IntegerField(default=0, null=True)),
                ('numPublicPaddocksJoined', models.IntegerField(default=0, null=True)),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
