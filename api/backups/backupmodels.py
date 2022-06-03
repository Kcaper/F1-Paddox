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