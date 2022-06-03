from apscheduler.schedulers.backgrouund import BackgroundScheduler

import time
from .models import seasonCalendar
from datetime import datetime
from .functions import updateAllPredictionPoints

now = datetime.now()

def setNextApiCallTime(race_round):
    '''next_race_date = seasonCalendar.object.filter(year=now.year, raceRound=race_round)[0]
    if next_race_date.featureRaceDate < '''
    pass

def updateResults():
    while True:
        next_uncaptured_round = seasonCalendar.objects.filter(year=now.year, isComplete=0).order_by('raceRound')[0]
        if next_uncaptured_round.featureRaceDate < now.date():
            updateAllPredictionPoints()
        elif next_uncaptured_round.featureRaceDate == now.date():
            if next_uncaptured_round.featureRaceStartTime < now.time():
                updateAllPredictionPoints()
        elif next_uncaptured_round.featureRaceDate> now.date():
            setNextApiCallTime(next_uncaptured_round.raceRound)
            break

def start(interval):
    print("The scheuler has started")
    scheduler = BackgroundScheduler()
    scheduler.add_job(updateResults(), "interval", seconds=5, id="results001", replace_existing=True)
    scheduler.start()
    





