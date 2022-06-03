from django.db import models
from django.contrib.auth.models import User
import string
import random

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta

def getMidfieldDrivers():
    num_drivers = constructors.objects.filter(isOnGrid=True, isMidfieldTeam=1).count()*2
    return num_drivers

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
        on_delete=models.CASCADE,
    )
    isOnCurrentcalendar = models.PositiveSmallIntegerField()

    def __str__ (self):
        return self.name, self.country, self.flag, self.isOnCurrentcalendar

class constructors(models.Model):
    constructorRef = models.CharField(max_length=255, null=True, )
    apiName = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, null=True, )
    nationality = models.CharField(max_length=255, null=True, default="International")
    constructorImgLocation = models.CharField(max_length=255, null=True)
    constructorIconLocation = models.CharField(max_length=255, null=True)
    constructorIconColor = models.CharField(max_length=255, null=True)
    flag = models.ForeignKey(
        flags,
        on_delete=models.CASCADE,
        null=True
    )
    isMidfieldTeam = models.SmallIntegerField(null=True)
    isOnGrid = models.SmallIntegerField(null=True, default = 1)
    isIncludedInPredictions = models.SmallIntegerField(null=True)

    def __str__(self):
        return self.constructorRef, self.name, self.nationality, self.flag, self.isMidfieldTeam

class seasonCalendar(models.Model):
    year=models.IntegerField(null=True, default=season)
    circuit=models.ForeignKey(
        circuits,
        null=True,
        on_delete=models.CASCADE,
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

    def getMidfieldStartDate():
        date = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").qualiDate
        return date

    def getMidfieldStartTime():
        date = seasonCalendar.objects.filter(
            year=season,
            raceRound=1,    
        ).latest("id").qualiStartTime
        return date

    def getNumDriversForSeason():
        constructosOnGrid = constructors.objects.filter(isOnGrid=1)
        driversOnGridForSeason = constructosOnGrid.count() * 2
        return driversOnGridForSeason

    def getNumConstructorsForSeason():
        constructosOnGrid = constructors.objects.filter(isOnGrid=1)
        driversOnGridForSeason = constructosOnGrid.count()
        return driversOnGridForSeason

    ruleSetName = models.CharField(max_length=128, null=True)
    numDriversOnMidfieldLeaderBoard = models.IntegerField(null=True, default=getMidfieldDrivers())
    numDriversOnPreSeasonLeaderboard = models.IntegerField(null=True, default=getNumDriversForSeason())
    numDriversOnMidSeasonLeaderboard = models.IntegerField(null=True, default=getNumDriversForSeason())
    numConstructorsOnMidSeasonLeaderboard = models.IntegerField(null=True, default=getNumConstructorsForSeason())
    numConstructorsOnPreSeasonLeaderboard = models.IntegerField(null=True, default=getNumConstructorsForSeason())
    preSeasonDriverPredictionDeadlineDate = models.DateField(null=True, default=getDefaultPreSeasonStartDate())
    preSeasonDriverPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultPreSeasonStartTime())
    preSeasonConstructorPredictionDeadlineDate = models.DateField(null=True, default=getDefaultPreSeasonStartDate)
    preSeasonConstructorPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultPreSeasonStartTime)
    midSeasonDriverPredictionDeadlineDate = models.DateField(null=True, default=getDefaultMidSeasonStartDate())
    midSeasonDriverPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultMidSeasonStartTime())
    midSeasonConstructorPredictionDeadlineDate = models.DateField(null=True, default=getDefaultMidSeasonStartDate)
    midSeasonConstructorPredictionDeadlineTime = models.TimeField(null=True, default=getDefaultMidSeasonStartTime)
    midfieldDriverPredictionStartDate = models.DateField(null=True, default=getMidfieldStartDate())
    midfieldDriverPredictionDeadlineTime = models.CharField(max_length=55, null=True, default=getMidfieldStartTime())
    midfieldDriverPredictionDeadlineSession = models.CharField(max_length=55, null=True, default="Q1/Sprint")
    midSeasonDriverStandingDeadlineSession = models.CharField(max_length=255, default="FP1")
    preSeasonDriverStandingDeadlineSession = models.CharField(max_length=255, default="FP1")
    midSeasonConstructorStandingDeadlineSession = models.CharField(max_length=255, default="FP1")
    preSeasonConstructorStandingDeadlineSession = models.CharField(max_length=255, default="FP1")
    year = models.IntegerField(null=True, default=season)

    def __str__(self):
        self.year

class paddockRulesStartRounds(models.Model):
    year=models.IntegerField(null=True, default=season)
    isMidSeasonDriverRule = models.SmallIntegerField(null=True, default=0)
    isMidSeasonConstructorRule = models.SmallIntegerField(null=True, default=0)
    isPreSeasonDriverRule = models.SmallIntegerField(null=True, default=0)
    isPreSeasonConstructorRule = models.SmallIntegerField(null=True, default=0)
    isRacelyRule = models.SmallIntegerField(null=True, default=0)
    startRound = models.IntegerField(default=0, null=True)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    paddockRules = models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.CASCADE,
    )

class userPaymentThresholds(models.Model):
    betaAmount = models.IntegerField(null=True)
    freeAmount = models.IntegerField(null=True)
    bronzeAmount = models.IntegerField(null=True)
    silverAmount = models.IntegerField(null=True)
    goldAmount = models.IntegerField(null=True)
    year = models.IntegerField(null=True, default=season)

    def __str__(self):
        self.year

class userStatus(models.Model):

    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE
    )
    isBeta = models.SmallIntegerField(null=True, default=1)
    isFree = models.SmallIntegerField(null=True, default=0)
    isBronze = models.SmallIntegerField(null=True, default=0)
    isSilver = models.SmallIntegerField(null=True, default=0)
    isGold = models.SmallIntegerField(null=True, default=0)
    hasPaid = models.SmallIntegerField(null=True, default=0)
    hasDonated = models.SmallIntegerField(null=True, default=0)
    paymentAmount = models.IntegerField(null=True, default=0)
    donationAmount = models.IntegerField(null=True, default=0)
    donationDate = models.DateField(null=True)
    paymentDate = models.DateTimeField(null=True)
    year = models.IntegerField(null=True, default=season)

    def __str__(self):
        self.year

class paddockUserStatusMaxUsers(models.Model):
    
    statusLevel = models.CharField(max_length=255, null=True, default="Free")
    year = models.IntegerField(null=True, default=season)
    maxUsers=models.IntegerField(null=True)

    def __str__(self):
        self.maxUsers

class paddocks(models.Model):

    year = models.IntegerField(null=True, default=season)
    isActive = models.SmallIntegerField(null=True, default=1)
    paddockName = models.CharField(max_length=30, null=True, default="paddock")
    numPlayers = models.IntegerField(null=True, default=0)
    paddockCode = models.CharField(max_length=6)
    isPublic = models.SmallIntegerField(null=True, default=0)
    currentPointsCalcRound = models.IntegerField(null=True, default=0)
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    paddockRules=models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.CASCADE,
    )
    createdBy = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    paddockUserStatusMaxUsers = models.IntegerField(null=True, default=20)

    def __str__(self):
        self.paddockName

class paddockMidfieldExcludedTeams(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )
    year=models.IntegerField(null=True, default=season)
    paddockRule = models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        self.year

class defaultMidfieldExcludedTeamsBySeason(models.Model):
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )
    year=models.IntegerField(null=True, default=season)

class constructorStandings(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null = True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null = True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE,
        null=True,
    )
    isOnGrid=models.SmallIntegerField(null=True)
    seatDrivenBy = models.ForeignKey(
        'self',
        null=True,
        on_delete=models.CASCADE,
        related_name="subbedBy",
    )
    subbedInFor = models.ForeignKey(
        'self',
        null=True,
        on_delete=models.CASCADE,
        related_name = "subbedFor",
    )
    isIncludedInPredictions = models.IntegerField(null=True)
    
    def __str__(self):
        return self.surname

class driverStandings(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null = True,
        on_delete=models.CASCADE,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    year=models.IntegerField(null=True, default=season)
    points = models.FloatField(null=True)
    position = models.IntegerField(null = True)
    positionText = models.CharField(max_length=255, null = True)
    wins = models.IntegerField(null=True)

    def __str__ (self):
        return self.driver, self.race, self.points, self.position, self.positionText, self.wins

class qualifying(models.Model):
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE,
    )
    time=models.ForeignKey(
        seasonCalendar,
        related_name = "qualifyingStartTime",
        null=True,
        on_delete=models.CASCADE,
    )
    def __str__ (self):
        return self.race, self.driver, self.contructor, self.number, self.position, self.q1, self.q2, self.q3, self.date, self.time

class results(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
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

    hasFastestLap = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPoleSitter = models.SmallIntegerField(
        null=True,
        default=0
    )

    isManualResult = models.SmallIntegerField(
        null = True,
        default = 0,
    )

    def __str__(self):
        self.race, self.driver, self.constructor, self.number, self.grid, self.position, self.positionText, self.positionOrder, self.points, self.laps, self.time,self.milliseconds, self.fastestLap, self.rank, self.fastestLapTime, self.fastestLapSpeed, self.status

class seasonDriverPredictions:
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    driver=models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    result = models.ForeignKey(
        results,
        null=True,
        on_delete=models.CASCADE, 
    )
    
    year = models.CharField(max_length=50, null=True)
    predictedPosition = models.IntegerField(null=True)
    subittedDate = models.CharField(max_length=255, null=True) #date
    submittedTime = models.TimeField(auto_now_add=True)
    finishingPositon = models.IntegerField(null=True)
    predictionPoints = models.IntegerField(null=True)
    isEditable = models.SmallIntegerField(null=True)

class leaderboards(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE,
    )
    currentOverallPosition = models.IntegerField(null=True, default=1)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete = models.CASCADE,    
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
        on_delete=models.CASCADE,
        related_name = 'driver1Prediction',
    )
    position2 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver2Prediction',
    )
    position3 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver3Prediction',
    )
    position4 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver4Prediction',
    )
    position5 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver5Prediction',
    )
    position6 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver6Prediction',
    )
    position7 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver7Prediction',
    )
    position8 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver8Prediction',
    )
    position9 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver9Prediction',
    )
    position10 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver10Prediction',
    )
    position11 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver11Prediction',
    )
    position12 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver12Prediction',
    )
    position13 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver13Prediction',
    )
    position14 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver14Prediction',
    )
    position15 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver15Prediction',
    )
    position16 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver16Prediction',
    )
    position17 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver17Prediction',
    )
    position18 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver18Prediction',
    )
    position19 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver19Prediction',
    )
    position20 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver20Prediction',
    )
    position21 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver21Prediction',
    )
    position22 = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'driver22Prediction',
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE,
        related_name = 'constructor1Prediction',
    )
    position2 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor2Prediction',
    )
    position3 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor3Prediction',
    )
    position4 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor4Prediction',
    )
    position5 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor5Prediction',
    )
    position6 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor6Prediction',
    )
    position7 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor7Prediction',
    )
    position8 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor8Prediction',
    )
    position9 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor9Prediction',
    )
    position10 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor10Prediction',
    )
    position11 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor11Prediction',
    )
    position12 = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = 'constructor12Prediction',
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE   
    )
    isPaddockAdmin = models.SmallIntegerField(null=True, default=0)
    isPaddockSuperAdmin = models.SmallIntegerField(null=True, default=0)
    dateTimeJoined = models.DateTimeField(auto_now_add=True, null=True)
    year = models.IntegerField(null=True, default=season)

    def __str__(self):
        self.user, self.paddock

class predictionPoints(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorSeasonPrediction = models.ForeignKey(
        constructorSeasonPredictions, 
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isPoleSitterPoint = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isFastestLapPoint = models.SmallIntegerField(
        null=True,
        default=0,
    )


    predictedPosition=models.IntegerField(null=True)
    finishingPosition = models.IntegerField(null=True, default=100)
    resultFinishingPosition = models.IntegerField(null=True)
    pointsForPrediction=models.IntegerField(null=True, default=0)
    isFeatureRaceMidfieldPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isFinishingSinglePoint = models.SmallIntegerField(null=True, default=0)
    isPredictedSinglePoint = models.SmallIntegerField(null=True, default=0)
    isFinishingDoublePoint = models.SmallIntegerField(null=True, default=0)
    isPredictedDoublePoint = models.SmallIntegerField(null=True, default=0)
    maxPoints = models.SmallIntegerField(null=True, default=0)
    subbedOutDriverCode = models.CharField(max_length=8, null=True, default=None)

    def __str__(self):
        self.pointsForPrediction

class paddockPointsCaptureLog(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE
    )
    year = models.IntegerField(null=True)
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE
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
        on_delete=models.CASCADE
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
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.constructor

class paddockManagementLog(models.Model):
    year = models.IntegerField(null=True, default=season)
    executingUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
        related_name="executingUser",
        )
    affectedUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
        related_name='affectedUser',
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    action = models.CharField(max_length=50, null=True)

    def __str__(self):
        self.action

class paddockBannedUsers(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    bannedUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)

    def __str__(self):
        self.bannedUser

class jsonFileLocations(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    year = models.IntegerField(null=True, default=season)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
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
    fileLocation = models.CharField(
        max_length=255,
        null=True,
    )

    def __str__(self):
        self.fileLocation

#class userPaddockMaxPlayers(models.Model):
    
class paymentCreatePaddockRestrictions(models.Model):
    year = models.IntegerField(null=True, default=season)
    betaUserNumPublicPaddocks = models.IntegerField(null=True)
    betaNumPrivatePaddocks = models.IntegerField(null=True)
    freeUserNumPublicPaddocks = models.IntegerField(null=True)
    freeUserNumPrivatePaddocks = models.IntegerField(null=True)
    bronzeUserNumPublicPaddocks = models.IntegerField(null=True)
    bronzeUserNumPrivatePaddocks = models.IntegerField(null=True)
    silverUserNumPublicPaddocks = models.IntegerField(null=True)
    silverUserNumPrivatePaddocks = models.IntegerField(null=True)
    goldUserNumPublicPaddocks = models.IntegerField(null=True)
    goldUserNumPrivatePaddocks = models.IntegerField(null=True)

    def __str__(self):
        self.year

class paymentJoinPaddockRestrictions(models.Model):
    year = models.IntegerField(null=True, default=season)
    betaUserNumPublicPaddocks = models.IntegerField(null=True)
    betaNumPrivatePaddocks = models.IntegerField(null=True)
    freeUserNumPublicPaddocks = models.IntegerField(null=True)
    freeUserNumPrivatePaddocks = models.IntegerField(null=True)
    bronzeUserNumPublicPaddocks = models.IntegerField(null=True)
    bronzeUserNumPrivatePaddocks = models.IntegerField(null=True)
    silverUserNumPublicPaddocks = models.IntegerField(null=True)
    silverUserNumPrivatePaddocks = models.IntegerField(null=True)
    goldUserNumPublicPaddocks = models.IntegerField(null=True)
    goldUserNumPrivatePaddocks = models.IntegerField(null=True)
    
    def __str__(self):
        self.year

class userPaddockCount(models.Model):
    year = models.IntegerField(null=True, default=season)
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    numPrivatePaddocksJoined = models.IntegerField(null=True, default = 0)
    numPublicPaddocksJoined = models.IntegerField(null=True, default = 0)
    numPrivatePaddocksCreated = models.IntegerField(null=True, default = 0)
    numPublicPaddocksCreated = models.IntegerField(null=True, default = 0)

    def __str__(self):
        self.user

class ruleSetExcludedConstructors(models.Model):
    year = models.IntegerField(null=True, default=season)
    paddockRule = models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.CASCADE,
    )

    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )

class paddockSeasonPredictionStartRounds(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isDriverPrediction = models.SmallIntegerField(
        null=True,
        default=0
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorPrediction = models.ForeignKey(
        constructorSeasonPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    paddockRulesStartRound = models.IntegerField(
        null=True,
        default=1,
    )
    isMidSeasonDriverPrediction = models.SmallIntegerField(
        null=True,
        default=0
    )
    isMidSeasonConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0
    )

class poleFastesLapPredictions(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        on_delete=models.CASCADE,
        null=True,
    )
    driver = models.ForeignKey(
        drivers,
        on_delete=models.CASCADE,
        null=True,
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        on_delete=models.CASCADE,
        null=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
    )
    year = models.IntegerField(
        null=True,
        default=season,
    )
    isPolePrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isFastestLapPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    resultDriver_id = models.ForeignKey(
        drivers,
        related_name="resultDriver_id",
        on_delete=models.CASCADE,
        null=True,
    )

class predictionPointsSystems(models.Model):
    paddockRules = models.ForeignKey(
        paddockRules,
        null=True,
        on_delete=models.CASCADE,
    )
    predictionOutBy = models.IntegerField(
        null=True,
    )
    pointsForPrediction = models.IntegerField(
        null=True
    )
    isRacelyPredictionSystem = models.SmallIntegerField(
        null=True,
    )
    isPreSeasonDriverPredictionSystem = models.SmallIntegerField(
        null=True
    )
    isMidSeasonDriverPredictionSystem = models.SmallIntegerField(
        null=True
    )
    isPreSeasonConstructorrPredictionSystem = models.SmallIntegerField(
        null=True
    )
    isMidSeasonConstructorPredictionSystem = models.SmallIntegerField(
        null=True
    )

class singleLinePredictions(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete = models.CASCADE,
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorPrediction = models.ForeignKey(
        constructorSeasonPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete = models.CASCADE,
    )
    predictedPosition = models.IntegerField(
        null=True
    )

class manualResultLog(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete = models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isGeneratingResult = models.SmallIntegerField(
        null=True,
    )
    isGeneratingLeaderboard = models.SmallIntegerField(
        null=True,
    )
    playerPointsJsonLocation = models.CharField(
        max_length=255,
        null=True,
    )
    paddockLeaderboardJsonLocation = models.CharField(
        max_length=255,
        null=True,
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete = models.CASCADE,
    )
    timeStamp = models.DateTimeField(
        default=datetime.now() + timedelta(hours=2)
    )

class driverSeasonCalendarSubs(models.Model):
    outgoingDriver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name="outgoingDriver"
    )
    incomingDriver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
        related_name="incomingDriver"
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    year = models.IntegerField(
        null=True,
        default = season,
    )
    isPermanentSub = models.SmallIntegerField(
        default = 0,
        null = True,
    )
    isInterTeamSub = models.SmallIntegerField(
        default = 0,
        null = True,
    )
    incomingDriverToConstructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = "incomingDriverToConstructor"
    )
    incomingDriverFromConstructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = "incomingDriverFromConstructor"
    )
    outgoingDriverToConstructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = "outgoingDriverToConstructor"
    )
    outgoingDriverFromConstructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
        related_name = "outgoingDriverFromConstructor"
    )

class paddockDrivers(models.Model):
    forename = models.CharField(max_length=255, null=True, )
    surname = models.CharField(max_length=255, null=True, )
    number = models.IntegerField(null=True)
    code = models.CharField(max_length=3, null=True)
    isOnGrid=models.SmallIntegerField(null=True)
    isIncludedInPredictions = models.IntegerField(null=True)
    currentTeam = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE
    )
    flag = models.ForeignKey(
        flags,
        on_delete=models.CASCADE,
        null=True,
    )
    nationality = models.CharField(max_length=255, null=True, default="International")
    seatDrivenBy = models.ForeignKey(
        'self',
        null=True,
        on_delete=models.CASCADE,
        related_name="subbedBy",
    )
    subbedInFor = models.ForeignKey(
        'self',
        null=True,
        on_delete=models.CASCADE,
        related_name = "subbedFor",
    )
    subbedByUser = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isPaddockCreatedDriver = models.SmallIntegerField(null=True)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,

    )
    thumbImgLocation = models.CharField(max_length=255, null=True)
    driverRef = models.CharField(max_length=255, null=True)
    user = models.CharField(max_length=255, null=True, default = "Kcaper")
    lastResultPosition = models.IntegerField(null=True)
    hasPoleResult = models.SmallIntegerField(null=True)
    hasFastestLapResult = models.SmallIntegerField(null=True)
    
    def __str__(self):
        return self.surname

class systemModerators(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
    )

class manualPaddockPoleAndFastLapResults(models.Model):

    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    createdBy = models.CharField(max_length=255, null=True, default="Kcaper")
    polePositionDriver = models.ForeignKey(
        paddockDrivers,
        null=True,
        on_delete=models.CASCADE,
        related_name="poleLapDriver"
    )
    fastestLapDriver = models.ForeignKey(
        paddockDrivers,
        null=True,
        on_delete=models.CASCADE,
        related_name = "fastesrLapDriver"
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isPoleLapResult = models.SmallIntegerField(null=True)
    isFastestLapResult = models.SmallIntegerField(null=True)

class manualResults(models.Model):
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        paddockDrivers,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete = models.CASCADE,
    )
    year=models.IntegerField(null=True, default=season)
    grid=models.IntegerField(null=True)
    position=models.IntegerField(null=True)
    positionText=models.CharField(max_length=255, null=True)
    points=models.FloatField(null=True)

    hasFastestLap = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPoleSitter = models.SmallIntegerField(
        null=True,
        default=0
    )

class manualPredictionPoints(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE
    )
    driver = models.ForeignKey(
        paddockDrivers,
        null=True,
        on_delete=models.CASCADE
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructor = models.ForeignKey(
        constructors,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorSeasonPrediction = models.ForeignKey(
        constructorSeasonPredictions, 
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    isPoleSitterPoint = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isFastestLapPoint = models.SmallIntegerField(
        null=True,
        default=0,
    )


    predictedPosition=models.IntegerField(null=True)
    finishingPosition = models.IntegerField(null=True, default=100)
    resultFinishingPosition = models.IntegerField(null=True)
    pointsForPrediction=models.IntegerField(null=True, default=0)
    isFeatureRaceMidfieldPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isDriverMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isConstructorMidStandingPrediction = models.SmallIntegerField(null=True, default=0)
    isFinishingSinglePoint = models.SmallIntegerField(null=True, default=0)
    isPredictedSinglePoint = models.SmallIntegerField(null=True, default=0)
    isFinishingDoublePoint = models.SmallIntegerField(null=True, default=0)
    isPredictedDoublePoint = models.SmallIntegerField(null=True, default=0)
    maxPoints = models.SmallIntegerField(null=True, default=0)
    subbedOutDriverCode = models.CharField(max_length=8, null=True, default=None)

    def __str__(self):
        self.pointsForPrediction

class manualResultleaderboards(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
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
        on_delete=models.CASCADE,
    )
    currentOverallPosition = models.IntegerField(null=True, default=1)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete = models.CASCADE,    
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

        super(manualResultleaderboards, self).save(*args, **kwargs)
    
    def __str__(self):
        self.user

class categoryDriverResultPoints(models.Model):
    category = models.CharField(max_length=255)
    position = models.IntegerField(null=True)
    pointsForPosition = models.IntegerField(null=True)
    pointsForPolePosition = models.IntegerField(null=True)
    pointsForFastestLap = models.IntegerField(null=True)

class jsonManualResultFileLocations(models.Model):
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete=models.CASCADE,
    )
    createdDate = models.DateTimeField(null=True, auto_now_add=True)
    year = models.IntegerField(null=True, default=season)
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
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
    fileLocation = models.CharField(
        max_length=255,
        null=True,
    )

    def __str__(self):
        self.fileLocation

class leaderboardSingleLinePredictions(models.Model):
    
    user = models.ForeignKey(
        User,
        null=True,
        on_delete = models.CASCADE,
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorPrediction = models.ForeignKey(
        constructorSeasonPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        drivers,
        null=True,
        on_delete=models.CASCADE,
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete = models.CASCADE,
    )
    predictedPosition = models.IntegerField(
        null=True,
    )
    finishingPosition = models.IntegerField(
        null=True,
    )
    isRacelyPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonDriverPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonDriverPrediction = models.SmallIntegerField(
        null=True, 
        default=0
    )

class leaderboardManualSingleLinePredictions(models.Model):
    
    user = models.ForeignKey(
        User,
        null=True,
        on_delete = models.CASCADE,
    )
    driverPrediction = models.ForeignKey(
        driverPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    constructorPrediction = models.ForeignKey(
        constructorSeasonPredictions,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        paddockDrivers,
        null=True,
        on_delete=models.CASCADE,
    )
    seasonCalendar = models.ForeignKey(
        seasonCalendar,
        null=True,
        on_delete=models.CASCADE,
    )
    paddock = models.ForeignKey(
        paddocks,
        null=True,
        on_delete = models.CASCADE,
    )
    predictedPosition = models.IntegerField(
        null=True,
    )
    finishingPosition = models.IntegerField(
        null=True,
    )
    isRacelyPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonConstructorPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isPreSeasonDriverPrediction = models.SmallIntegerField(
        null=True,
        default=0,
    )
    isMidSeasonDriverPrediction = models.SmallIntegerField(
        null=True, 
        default=0
    )

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
    


