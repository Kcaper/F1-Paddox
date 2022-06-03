from django.db import models
from django.contrib.auth.models import User
import string
import random

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from datetime import datetime

# Create your models here.

now = datetime.now()
season = int(now.year)

class flags(models.Model):
    countryName = models.CharField(max_length=255, null=True)
    flagImgLocation = models.CharField(max_length=255, null=True, default="./static/images/flags/international.png")

    def __str__(self):
        return self.countryName, self.flagImgLocation

class circuits(models.Model):
    circuitRef = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, null=True,)
    country = models.CharField(max_length=255, null=True,)
    flag = models.ForeignKey(
        flags,
        null=True,
        on_delete=models.SET_NULL,
    )
    isOnCurrentcalendar = models.PositiveSmallIntegerField()

    def __str__ (self):
        return self.name, self.country, self.flag, self.isOnCurrentcalendar

class seasonCalendar(models.Model):
    year=models.IntegerField(null=True, default=season)
    circuit=models.ForeignKey(
        circuits,
        null=True,
        on_delete=models.SET_NULL,
    )
    qualiDate=models.DateField(auto_now_add=True, null=True)
    qualiStartTime=models.TimeField(null=True, auto_now_add=True)
    fp1Date=models.DateField(auto_now_add=True, null=True)
    fp1StartTime=models.TimeField(null=True, auto_now_add=True)
    fp2Date=models.DateField(auto_now_add=True, null=True)
    fp2StartTime=models.TimeField(null=True, auto_now_add=True)
    fp3Date=models.DateField(auto_now_add=True, null=True)
    fp3StartTime=models.TimeField(null=True, auto_now_add=True)
    sprintRaceDate=models.DateField(auto_now_add=True, null=True)
    sprintRaceStartTime=models.TimeField(null=True, auto_now_add=True)
    featureRaceDate=models.DateField(auto_now_add=True, null=True)
    featureRaceStartTime=models.TimeField(null=True, auto_now_add=True)
    raceRound = models.IntegerField(null=True)
    isComplete = models.SmallIntegerField(null=False, default=0)
    driverStandingsCaptured = models.SmallIntegerField(null=True, default=0)
    constructorStandingsCaptured = models.SmallIntegerField(null=True, default=0)
    midfieldLeaderboardUpdated = models.SmallIntegerField(null=True, default=0)
    driverStandingsLeaderboardUpdated = models.SmallIntegerField(null=True, default=0)
    constructorStandingsLeaderboardUpdated = models.SmallIntegerField(null=True, default=0)
    combinedStandingsLeaderboardUpdated = models.SmallIntegerField(null=True, default=0)

    def __str__(self):
        return self.qualiDate, self.qualiStartTime, self.fp1Date, self.fp1StartTime, self.fp2Date, self.fp2StartTime, self.fp3Date, self.fp3StartTime, self.sprintRaceDate, self.sprintRaceStartTime, self.featureRaceDate, self.featureRaceStartTime, self.circuit, self.year

class constructors(models.Model):
    constructorRef = models.CharField(max_length=255, null=True, )
    apiName = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, null=True, )
    nationality = models.CharField(max_length=255, null=True, default="International")
    constructorImgLocation = models.CharField(max_length=255, null=True)
    constructorIconLocation = models.CharField(max_length=255, null=True)
    flag = models.ForeignKey(
        flags,
        on_delete=models.SET_NULL,
        null=True
    )
    isMidfieldTeam = models.SmallIntegerField(null=True)
    isOnGrid = models.SmallIntegerField(null=True, default = 1)
    isIncludedInPrediction = models.SmallIntegerField(null=True)

    def __str__(self):
        return self.constructorRef, self.name, self.nationality, self.flag, self.isMidfieldTeam

class paddockRules(models.Model):

    def getMidfieldDrivers():
        num_drivers = constructors.objects.filter(isOnGrid=True, isMidfieldTeam=1).count()*2
        return num_drivers

    def getDefaultPreSeasonStartDate():
        date = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").fp1Date
        return date

    def getDefaultPreSeasonStartTime():
        time = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").fp1StartTime
        return time

    def getDefaultMidSeasonStartDate():
        date = seasonCalendar.objects.filter(
            year=season,
            raceRound=13   
        ).latest("id").fp1Date
        return date

    def getDefaultMidSeasonStartTime():
        time = seasonCalendar.objects.filter(
            year=season,
            raceRound=13   
        ).latest("id").fp1StartTime
        return time

    def getMidfieldDeadlineDate():
        date = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").qualiDate
        return date

    def getMidfieldDeadlineTime():
        time = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").qualiStartTime
        return time

    ruleSetName = models.CharField(max_length=128, null=True)
    numDriversOnMidfieldLeaderBoard = models.IntegerField(null=True, default=getMidfieldDrivers())
    preSeasonDriverPredictionDealineDate = models.DateField(null=True, default=getDefaultPreSeasonStartDate())
    preSeasonDriverPredictionDealineTime = models.TimeField(null=True, default=getDefaultPreSeasonStartTime())
    preSeasonConstructorPredictionDeadlineDate = models.DateField(null=True, default=getDefaultPreSeasonStartDate)
    preSeasonConstructorPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultPreSeasonStartTime)
    midSeasonDriverPredictionDealineDate = models.DateField(null=True, default=getDefaultMidSeasonStartDate())
    midSeasonDriverPredictionDealineTime = models.TimeField(null=True, default=getDefaultMidSeasonStartTime())
    midSeasonConstructorPredictionDeadlineDate = models.DateField(null=True, default=getDefaultMidSeasonStartDate)
    midSeasonConstructorPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultMidSeasonStartTime)
    midfieldDriverPredictionDeadlineDate = models.DateField(null=True, default=getMidfieldDeadlineDate())
    midfieldDriverPredictionDeadlineTime = models.TimeField(null=True, default=getMidfieldDeadlineTime())

    def __str__(self):
        self.numDriversOnLeaderBoard

class paddocks(models.Model):

    year = models.IntegerField(null=True, default=season)
    paddockName = models.CharField(max_length=30, null=True, unique=True, default="paddock")
    numPlayers = models.IntegerField(null=True, default=0)
    paddockCode = models.CharField(max_length=6)
    isPublic = models.SmallIntegerField(null=True, default=0)
    currentPointsCalcRound = models.IntegerField(null=True, default=0)
    paddockRules = models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        self.paddockName

class races(models.Model):
    year = models.IntegerField(null=True)
    circuit = models.ForeignKey(
        circuits,
        null=True,
        on_delete=models.SET_NULL,
    )
    calendar=models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL,
    )
    isComplete = models.SmallIntegerField(null=False, default=0)
    
class constructorResults(models.Model):
    race = models.ForeignKey(
        races,
        null=True,
        on_delete=models.SET_NULL,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
    )
    race = models.ForeignKey(
        races,
        null=True,
        on_delete=models.SET_NULL,
    )
    points = models.FloatField(null=True)
    status = models.CharField(max_length=255, null=True)

    def __str__ (self):
        return self.race, self.constructor, self.race, self.points, self.status

class constructorStandings(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null = True,
        on_delete=models.SET_NULL,
    )
    constructor = models.ForeignKey(
        constructors,
        null = True,
        on_delete=models.SET_NULL,
    )
    points = models.FloatField(null=True)
    position = models.IntegerField(null = True)
    positionText = models.CharField(max_length=255, null = True)
    wins = models.IntegerField(null=True)
    year = models.IntegerField(null=True, default=season)

    def __str__ (self):
        return self.race, self.constructor, self.race, self.points, self.position, self.positionText, self.wins

class drivers(models.Model):
    driverRef = models.CharField(max_length=255, null=True)
    currentTeam = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE
    )
    number = models.IntegerField(null=True)
    code = models.CharField(max_length=3, null=True)
    forename = models.CharField(max_length=255, null=True, )
    surname = models.CharField(max_length=255, null=True, )
    nationality = models.CharField(max_length=255, null=True, default="International")
    thumbImgLocation = models.CharField(max_length=255, null=True)
    flag = models.ForeignKey(
        flags,
        on_delete=models.SET_NULL,
        null=True,
    )
    isOnGrid=models.SmallIntegerField(null=True)
    seatDrivenBy = models.IntegerField(null=True)
    isIncludedInPredictions = models.IntegerField(null=True)
    
    def __str__(self):
        return self.surname

class driverStandings(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null = True,
        on_delete=models.SET_NULL,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    year=models.IntegerField(null=True, default=season)
    points = models.FloatField(null=True)
    position = models.IntegerField(null = True)
    positionText = models.CharField(max_length=255, null = True)
    wins = models.IntegerField(null=True)

    def __str__ (self):
        return self.driver, self.race, self.points, self.position, self.positionText, self.wins

class qualifying(models.Model):
    race = models.ForeignKey(
        races,
        null = True,
        on_delete=models.SET_NULL,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
    )
    number = models.IntegerField(null=True)
    position = models.IntegerField(null = True)
    q1=models.CharField(max_length=255, null=True)
    q2=models.CharField(max_length=255, null=True)
    q3=models.CharField(max_length=255, null=True)
    date=models.ForeignKey(
        seasonCalendar,
        related_name = "qualifyingDate",
        null=True,
        on_delete=models.SET_NULL,
    )
    time=models.ForeignKey(
        seasonCalendar,
        related_name = "qualifyingStartTime",
        null=True,
        on_delete=models.SET_NULL,
    )
    def __str__ (self):
        return self.race, self.driver, self.contructor, self.number, self.position, self.q1, self.q2, self.q3, self.date, self.time

class results(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL,
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
    )
    year=models.IntegerField(null=True, default=season)
    number=models.IntegerField(null=True)
    grid=models.IntegerField(null=True)
    position=models.IntegerField(null=True)
    positionText=models.CharField(max_length=255, null=True)
    points=models.FloatField(null=True)
    laps=models.IntegerField(null=True)
    time=models.CharField(max_length=255, null=True)
    fastestLap=models.IntegerField(null=True)
    fastestLapTime=models.CharField(max_length=255, null=True)
    status=models.CharField(max_length=255, null=True)

    def __str__(self):
        self.race, self.driver, self.constructor, self.number, self.grid, self.position, self.positionText, self.positionOrder, self.points, self.laps, self.time,self.milliseconds, self.fastestLap, self.rank, self.fastestLapTime, self.fastestLapSpeed, self.status

class status(models.Model):
    status=models.CharField(max_length=255, null=True)

    def __str__(self):
        self.status

class gameExcludedTeamsByPaddock(models.Model):
    paddock_id = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL
    )
    constructor_id = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL
    )
    year = models.IntegerField(null=True, default=season)

    def __str__(self):
        self.paddock_id

class seasonDriverPredictions:
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    result = models.ForeignKey(
        results,
        null=True,
        on_delete=models.SET_NULL, 
    )
    
    year = models.CharField(max_length=50, null=True)
    predictedPosition = models.IntegerField(null=True)
    subittedDate = models.CharField(max_length=255, null=True) #date
    submittedTime = models.TimeField(auto_now_add=True)
    finishingPositon = models.IntegerField(null=True)
    predictionPoints = models.IntegerField(null=True)
    isEditable = models.SmallIntegerField(null=True)

    def __str__(self):
        self.user, self.driver, self.paddock, self.result, self.year, self.finishingPositon, self.subittedDate, self.submittedTime, self.finishingPositon, self.predictionPoints, self.isEditable, self.game

class seasonTeamPredictions(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
    )
    constructor=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    result = models.ForeignKey(
        results,
        null=True,
        on_delete=models.SET_NULL, 
    )
    
    year = models.CharField(max_length=50, null=True)
    predictedPosition = models.IntegerField(null=True)
    subittedDate = models.CharField(max_length=255, null=True)
    submittedTime = models.TimeField(auto_now_add=True)
    finishingPositon = models.IntegerField(null=True)
    predictionPoints = models.IntegerField(null=True)
    isEditable = models.SmallIntegerField(null=True)

    def __str__(self):
        self.user, self.constructor, self.paddock, self.result, self.year, self.predictedPosition, self.subittedDate, self.submittedTime, self.finishingPositon, self.predictionPoints, self.isEditable, self.game

class racelyMidfieldPredictions(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    result = models.ForeignKey(
        results,
        null=True,
        on_delete=models.SET_NULL, 
    )
    
    year = models.CharField(max_length=50, null=True)
    finishingPositon = models.IntegerField(null=True)
    predictedPosition = models.IntegerField(null=True)
    subittedDate = models.CharField(max_length=255, null=True) #date
    finishingPositon = models.IntegerField(null=True)
    predictionPoints = models.IntegerField(null=True)
    isEditable = models.SmallIntegerField(null=True)

    def __str__(self):
        self.user, self.driver, self.paddock, self.result, self.year, self.finishingPositon, self.predictedPosition, self.subittedDate, self.submittedTime, self.predictionPoints, self.isEditable, self.game

class leaderboards(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
    )
    isMidfieldGame = models.SmallIntegerField(null=True, default=0)
    isDriverStandingsGame = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingsGame = models.SmallIntegerField(null=True, default=0)
    isCombinedStandingsGame = models.SmallIntegerField(null=True, default=0)
    isDriverMidStandingsGame = models.SmallIntegerField(null=True, default=0)
    isConstructorMidStandingsGame = models.SmallIntegerField(null=True, default=0)
    isCombinedMidStandingsGame = models.SmallIntegerField(null=True, default=0)
    
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    currentOverallPosition = models.IntegerField(null=True, default=1)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete = models.SET_NULL,    
    )
    previousPosition = models.IntegerField(null=True, default=1)
    previousTotalPoints = models.IntegerField(null=True, default=0)
    currentTotalPoints = models.IntegerField(null=True, default=0)
    roundPoints = models.IntegerField(null=True, default=0)

    paddockDelta = models.IntegerField(null=True)
    roundPlayerPosition = models.IntegerField(null=True, default=1)
    isActive = models.SmallIntegerField(null=True, default=1)

    def save(self, *args, **kwargs):
        if self.isDriverStandingsGame == 1:
            self.currentOverallPosition = self.roundPlayerPosition
        try:
            self.paddockDelta = self.previousPosition - self.currentOverallPosition
        except:
            self.paddockDelta = None

        super(leaderboards, self).save(*args, **kwargs)
    
    def __str__(self):
        self.user

class driverPredictions(models.Model):
    isSeasonPrediction = models.BooleanField(null=True, default=0)
    isMidSeasonPrediction = models.BooleanField(null=True, default=0)
    isFeatureRaceMidfield = models.BooleanField(null=True, default=0)
    isSprintRacePrediction = models.BooleanField(null=True, default=0)
    year=models.IntegerField(null=True, default=season)
    pointsCaptured = models.SmallIntegerField(null=True, default=0)
    calendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        User, 
        null=True,
        on_delete=models.CASCADE,
    )
    submittedDate = models.DateField(max_length=255, null=True, auto_now_add=True) #date
    submittedTime = models.TimeField(null=True, auto_now_add=True)
    position1 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver1Prediction',
    )
    position2 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver2Prediction',
    )
    position3 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver3Prediction',
    )
    position4 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver4Prediction',
    )
    position5 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver5Prediction',
    )
    position6 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver6Prediction',
    )
    position7 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver7Prediction',
    )
    position8 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver8Prediction',
    )
    position9 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver9Prediction',
    )
    position10 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver10Prediction',
    )
    position11 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver11Prediction',
    )
    position12 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver12Prediction',
    )
    position13 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver13Prediction',
    )
    position14 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver14Prediction',
    )
    position15 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver15Prediction',
    )
    position16 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver16Prediction',
    )
    position17 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver17Prediction',
    )
    position18 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver18Prediction',
    )
    position19 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver19Prediction',
    )
    position20 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver20Prediction',
    )
    position21 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver21Prediction',
    )
    position22 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'driver22Prediction',
    )
    def __str__(self):
        self.isSeasonPrediction, self.isFeatureRaceMidfield, self.isSprintRacePrediction, self.user, self.submittedDate, self.submittedTime, self.position1, self.position2, self.position3, self.position4, self.position5, self.position6, self.position7, self.position8, self.position9, self.position10, self.position11, self.position12, self.position13, self.position14, self.position15, self.position16, self.position17, self.position18, self.position19, self.position20, self.position21, self.position22

class constructorSeasonPredictions(models.Model):
    user = models.ForeignKey(
        User, 
        null=True,
        on_delete=models.CASCADE,
    )
    sumittedDate = models.DateField(null=True, auto_now_add=True) 
    submittedTime = models.TimeField(null=True, auto_now_add=True)
    year = models.IntegerField(null=True, default=season)
    isMidSeasonPrediction = models.SmallIntegerField(null=True, default=0)
    position1 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor1Prediction',
    )
    position2 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor2Prediction',
    )
    position3 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor3Prediction',
    )
    position4 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor4Prediction',
    )
    position5 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor5Prediction',
    )
    position6 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor6Prediction',
    )
    position7 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor7Prediction',
    )
    position8 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor8Prediction',
    )
    position9 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor9Prediction',
    )
    position10 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor10Prediction',
    )
    position11 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor11Prediction',
    )
    position12 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
        related_name = 'constructor12Prediction',
    )

    def __str__(self):
        self.user, self.sumittedDate, self.submittedTime, self.position1, self.position2, self.position3, self.position4, self.position5, self.position6, self.position7, self.position8, self.position9, self.position10, self.position11, self.position12

class seasons(models.Model):

    year = models.IntegerField(null=True)
    numDrivers = models.IntegerField(null=True)
    numConstructors = models.IntegerField(null=True)
    numMidfieldTeams = models.IntegerField(null=True)
    numMidfieldDrivers = models.IntegerField(null=True)

    def __str__(self):
        self.year

class userPaddocks(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL   
    )
    isPaddockAdmin = models.SmallIntegerField(null=True, default=0)
    isPaddockSuperAdmin = models.SmallIntegerField(null=True, default=0)
    dateTimeJoined = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        self.user, self.paddock

class predictionPoints(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.SET_NULL
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.SET_NULL
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL
    )

    constructorSeasonPrediction = models.ForeignKey(
        constructorSeasonPredictions, 
        null=True,
        on_delete=models.SET_NULL
    )

    predictedPosition=models.IntegerField(null=True)
    finishingPosition = models.IntegerField(null=True, default=100)
    pointsForPrediction=models.IntegerField(null=True, default=0)
    isFeatureRaceMidfieldPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isFinishingSinglePoint = models.SmallIntegerField(null=True, default=0)
    isPredictedSinglePoint = models.SmallIntegerField(null=True, default=0)

    def __str__(self):
        self.pointsForPrediction

class paddockPointsCaptureLog(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL
    )
    year = models.IntegerField(null=True)
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL
    )
    isFeatureRaceMidfieldPoints = models.SmallIntegerField(null=True, default=0)
    isDriverStandingPoints = models.SmallIntegerField(null=True, default=0)
    isDriverMidStandingPoints = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingPoints = models.SmallIntegerField(null=True, default=0)
    isConstructorMidStandingPoints = models.SmallIntegerField(null=True, default=0)
    isSprintRacePoints = models.SmallIntegerField(null=True, default=0)
    isCombinedStandingPoints = models.SmallIntegerField(null=True, default=0)
    calculatedDate = models.DateTimeField(null=True, auto_now_add=True)

    def __str__(self):
        self.calculatedDate

class ergastRequestLog(models.Model):
    year = models.IntegerField(null=True, default=season)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL
    )
    completedDate = models.DateTimeField(null=True, auto_now_add=True)
    status = models.CharField(max_length=100, null=True)
    isFeatureRaceResultRequest = models.SmallIntegerField(null=True, default=0)
    isSprintRaceResultRequest = models.SmallIntegerField(null=True, default=0)
    isDriverStandingRequest = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingRequest = models.SmallIntegerField(null=True, default=0)
    raceRound = models.SmallIntegerField(null=True)

    def __str__(self):
        return self.status

class constructorApiNameConverstions(models.Model):

    apiName = models.CharField(max_length = 255, null=True)
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return self.constructor

class paddockMidfieldExcludedTeams(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    excludedTeam = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return self.paddock

class paddockManagementLog(models.Model):
    year = models.IntegerField(null=True, default=season)
    executingUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="executingUser",
        )
    affectedUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name='affectedUser',
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    action = models.CharField(max_length=50, null=True)

class paddockMaxUsers(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    maxUsers = models.IntegerField(null=False, default = 20)
    createdDate = models.DateTimeField(null=True, auto_now_add=True)

class paddockBannedUsers(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    bannedUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)

class jsonFileLocations(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.SET_NULL,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    year = models.IntegerField(null=True, default=season)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.SET_NULL,
    )
    isGeneralLeaderboard = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidfieldGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonDriverGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonDriverGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonConstructorGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonConstructorGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonCombinedGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonCombinedGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonCombinedGame = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isCustomGameFile = models.SmallIntegerField(
        null=True,
        default=0,
    )
    customGame = models.ForeignKey(
        paddockCustomGames,
        null=True,
        on_delete=models.SET_NULL,
    )
    fileLocation = models.CharField(
        max_length=255,
        null=True,
    )

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
        international_paddock = paddocks.objects.get(paddockName = "International")
        international_paddock.numPlayers = userPaddocks.objects.filter(paddock_id=paddocks.objects.get(id=1).id).count() + 1
        international_paddock.save()


    


