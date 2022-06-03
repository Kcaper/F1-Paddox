from apscheduler.schedulers.background import BackgroundScheduler
import time
from api.models import seasonCalendar
from datetime import datetime
from api.functions import updateAllPredictionPoints

now = datetime.now()

def start(interval):
    print("we got here somehow")
    scheduler = BackgroundScheduler()
    scheduler.add_job(updateResults(), "interval", minutes=interval, id="results001", replace_existing=True)
    scheduler.start()
    print("The scheuler has started")

def setNextApiCallTime(race_round):
    '''next_race_date = seasonCalendar.object.filter(year=now.year, raceRound=race_round)[0]'''
    print("running the set api time function")

def updateResults():
    '''while True:
        next_uncaptured_round = seasonCalendar.objects.filter(year=now.year, isComplete=0).order_by('raceRound')[0]
        if next_uncaptured_round.featureRaceDate < now.date():
            updateAllPredictionPoints()
        elif next_uncaptured_round.featureRaceDate == now.date():
            if next_uncaptured_round.featureRaceStartTime < now.time():
                updateAllPredictionPoints()
        elif next_uncaptured_round.featureRaceDate> now.date():
            setNextApiCallTime(next_uncaptured_round.raceRound)
            break'''
    print("running the update results function")
    setNextApiCallTime(1)
