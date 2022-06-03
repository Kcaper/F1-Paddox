from rest_framework import serializers
from .models import *

class driverSerializer(serializers.ModelSerializer):
    class Meta:
        model = drivers
        fields = '__all__'

class paddockDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = paddockDrivers
        fields = '__all__'

class flagSerializer(serializers.ModelSerializer):
    class Meta:
        model = flags
        fields = '__all__'

class constructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = constructors
        fields = '__all__'

class seasonDriverStandingPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = driverPredictions
        fields = '__all__'
        
class midSeasonDriverStandingPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = driverPredictions
        fields = ['isMidSeasonPrediction', 'user', 'position1', 'position2', 'position3', 'position4', 'position5', 'position6', 'position7', 'position8', 'position9', 'position10', 'position11', 'position12', 'position13', 'position14', 'position15', 'position16', 'position17', 'position18', 'position19', 'position20', 'position21', 'position22']

class midfieldPredictionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = driverPredictions
        fields = ['isFeatureRaceMidfield', 'calendar', 'user', 'position1', 'position2', 'position3', 'position4', 'position5', 'position6', 'position7', 'position8', 'position9', 'position10', 'position11', 'position12', 'position13', 'position14', 'position15', 'position16', 'position17', 'position18', 'position19', 'position20', 'position21', 'position22']

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'email', 'username']

class seasonDriverPredcitionDeadline(serializers.ModelSerializer):
    class Meta:
        model = seasonCalendar
        fields = ['id', 'fp1Date', 'fp1StartTime']

class seasonPreSeasonPredictionDeadline(serializers.ModelSerializer):
    class Meta:
        model = seasonCalendar
        fields = ['id', 'fp1Date', 'fp1StartTime']

class midfieldDeadlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = seasonCalendar
        fields = ['id', 'qualiDate', 'qualiStartTime']

class seasonConstructorStandingPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = constructorSeasonPredictions
        fields = ['user', 'paddock', 'isMidSeasonPrediction', 'position1', 'position2', 'position3', 'position4', 'position5', 'position6', 'position7', 'position8', 'position9', 'position10', 'position11']

class racelyMidfieldDriverPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = driverPredictions
        fields = '__all__'
        
class calendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = seasonCalendar
        fields = '__all__'

class circuitSerializer(serializers.ModelSerializer):
    class Meta:
        model = circuits
        fields = '__all__'

class paddockSerializer(serializers.ModelSerializer):
    class Meta:
        model = paddocks
        fields = '__all__'

class userPaddockSerializer(serializers.ModelSerializer):
    class Meta:
        model = userPaddocks
        fields = '__all__'

class publicPaddockSerializer(serializers.ModelSerializer):
    class Meta:
        model = paddocks
        fields = '__all__'

class midfieldPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = driverPredictions
        fields = '__all__'

class paddockRulesSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = paddockRules
        fields = '__all__'

class poleFastPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = poleFastesLapPredictions
        fields = '__all__'




        



