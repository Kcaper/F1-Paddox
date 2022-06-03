# Generated by Django 3.0.6 on 2021-10-28 16:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0100_auto_20211028_1810'),
    ]

    operations = [
        migrations.AddField(
            model_name='paddocks',
            name='createdDate',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.CreateModel(
            name='paddockUserStatusMaxUsers',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(default=2021, null=True)),
                ('maxUser', models.IntegerField(null=True)),
                ('userStatus', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.userStatus')),
            ],
        ),
        migrations.AlterField(
            model_name='paddocks',
            name='paddockMaxUsers',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddockUserStatusMaxUsers'),
        ),
        migrations.DeleteModel(
            name='paddockMaxUsers',
        ),
    ]