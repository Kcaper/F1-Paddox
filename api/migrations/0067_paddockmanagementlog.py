# Generated by Django 3.0.6 on 2021-06-09 09:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0066_userpaddocks_ispaddocksuperadmin'),
    ]

    operations = [
        migrations.CreateModel(
            name='paddockManagementLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('createdDate', models.DateTimeField(auto_now_add=True, null=True)),
                ('action', models.CharField(max_length=50, null=True)),
                ('affectedUser', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='affectedUser', to=settings.AUTH_USER_MODEL)),
                ('executingUser', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='executingUser', to=settings.AUTH_USER_MODEL)),
                ('paddock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.paddocks')),
            ],
        ),
    ]