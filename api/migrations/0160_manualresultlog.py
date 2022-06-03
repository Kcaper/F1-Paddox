# Generated by Django 3.2.9 on 2022-04-23 17:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0159_manualrestult'),
    ]

    operations = [
        migrations.CreateModel(
            name='manualResultLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('isGeneratingResult', models.SmallIntegerField(null=True)),
                ('isGeneratingLeaderboard', models.SmallIntegerField(null=True)),
                ('playerPointsJsonLocation', models.CharField(max_length=255, null=True)),
                ('paddockLeaderboardJsonLocation', models.CharField(max_length=255, null=True)),
                ('paddock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddocks')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]