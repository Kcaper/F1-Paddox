# Generated by Django 3.2.9 on 2022-05-12 16:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0195_jsonmanualresultfilelocations'),
    ]

    operations = [
        migrations.AddField(
            model_name='manualresults',
            name='paddock',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paddocks'),
        ),
    ]
