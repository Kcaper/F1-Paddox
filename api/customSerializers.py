from .models import *
import json
from pprint import pprint
from datetime import datetime
from .functions import *
import os
from dateutil import parser
from .models import manualResults

now = datetime.now()
        
def driverPopSerializer(uid, prediction_type, paddockId):

    demo = 0
    
    if uid != None:
        current_user = uid
        
    else:
        current_user = 0
        demo = 1

    now = datetime.now()
    thisYear = now.year
    numDrivers = seasons.objects.filter(year=thisYear)[0].numDrivers

    data = {}
    data['userPaddocks'] = []

    if paddockId == 0:
        user_paddock_list = userPaddocks.objects.filter(
            user_id = uid,
        ).values_list("paddock_id", flat=True)

        user_paddock_rule_list = paddocks.objects.filter(
            id__in=user_paddock_list,
        ).values_list("paddockRules_id", flat=True)

        user_paddock_start_round_qset = paddockRulesStartRounds.objects.filter(
            paddockRules_id__in=user_paddock_rule_list,
            isPreSeasonDriverRule = 1,
        ).order_by("startRound")

        last_completed_round = getNextRaceRound() - 1

        try:
            for i in range(user_paddock_start_round_qset.count()):
                if user_paddock_start_round_qset[i].raceRound > last_completed_round:
                    paddockId = paddocks.objects.filter(
                        year=now.year,
                        paddockRules_id = user_paddock_start_round_qset[i].paddockRules_id,
                    ).order_by("numPlayers")[0].id
                    break
        except:
            paddockId = 0

        if paddockId == 0:
            paddockId = paddocks.objects.filter(id__in=user_paddock_list).order_by('numPlayers')[0].id

    else:
        paddockId = int(paddockId)

    if uid == None:
        demo = 1
        numDrivers = drivers.objects.filter(isOnGrid=1).count()

    elif demo == 0:
        numDrivers = paddocks.objects.get(
            id=paddockId,
        ).paddockRules.numDriversOnPreSeasonLeaderboard

        user_paddock_list = userPaddocks.objects.filter(user_id = uid).values_list('paddock_id', flat=True)
        for i in range(len(user_paddock_list)):
            data["userPaddocks"].append({
                "paddockId":user_paddock_list[i],
                "paddockName":paddocks.objects.get(id=user_paddock_list[i]).paddockName,
            })

    data['selectedPaddock'] = paddockId
    data["user"] = current_user
    data["numDrivers"] = numDrivers

    if prediction_type == "pre season":
        try:
            prediction = driverPredictions.objects.filter(isSeasonPrediction=1, paddock_id=paddockId).filter(year=now.year).filter(user_id=uid).latest("id")
            print("WE FOUND A PRE-SEASON PREDICTION FOR " + User.objects.get(id=uid).username)
        except:
            driver_prediction_qset = driverPredictions.objects.filter(year=now.year).filter(user_id=current_user, isSeasonPrediction=1)

            potential_predictions_list = []

            this_paddock_rulesId = paddock_rulesId = paddocks.objects.get(id=paddockId).paddockRules_id
            this_paddock_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id = this_paddock_rulesId,
                isPreSeasonDriverRule = 1,
            ).startRound

            for pred in range(driver_prediction_qset.count()):
                pred_paddockId = driver_prediction_qset[pred].paddock_id
                paddock_rulesId = paddocks.objects.get(id=pred_paddockId).paddockRules_id
                paddock_start_round = paddockRulesStartRounds.objects.get(
                    paddockRules_id = paddock_rulesId,
                    isPreSeasonDriverRule = 1,
                ).startRound

                if paddock_start_round <= this_paddock_start_round:
                    potential_predictions_list.append(driver_prediction_qset[pred].id)

            try:
                prediction = driverPredictions.objects.filter(
                    id__in=potential_predictions_list
                ).latest('id')

                if getNextRaceRound() < this_paddock_start_round:
                    new_prediction = prediction
                    new_prediction.id = None
                    new_prediction.paddock_id = paddockId
                    new_prediction.save()

                    print("SAVED A NEW DRIVER STANDING PREDICTION FOR THIS USER")

            except:
                prediction = driverPredictions.objects.filter(year=now.year).filter(user_id=20, isSeasonPrediction=1).latest("id")
                demo = 1

    elif prediction_type == "mid season":
        try:
            prediction = driverPredictions.objects.filter(isMidSeasonPrediction=1).filter(year=now.year).filter(user_id=uid).latest("id")
            print("WE FOUND A MID-SEASON PREDICTION FOR " + User.objects.get(id=uid).username)
        except:
            prediction = driverPredictions.objects.filter(isMidSeasonPrediction=1).filter(year=now.year).filter(user_id=20).latest("id")
            demo = 1

    raceName = seasonCalendar.objects.filter(year=now.year, isComplete=0).order_by('raceRound')[0].circuit.circuitRef
    data["circuitName"] = raceName
    
    if prediction.isSeasonPrediction == 1:
        data["isSeasonPrediction"] = 1
        data["isMidSeasonPrediction"] = 0
        data['isDemo'] = demo
        data['drivers'] = []

    elif prediction.isMidSeasonPrediction == 1:
        data["isSeasonPrediction"] = 0
        data["isMidSeasonPrediction"] = 1
        data['isDemo'] = demo
        data['drivers'] = []
        
    
    driver = drivers.objects.get(id=prediction.position1_id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    data['drivers'].append({
        "id" : str(driver.id),
        "code" : str(driver.code),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })
    
    
    driver = drivers.objects.get(id=prediction.position2.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position3.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position4.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position5.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position6.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position7.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position8.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position9.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position10.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position11.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position12.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position13.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position14.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    driver = drivers.objects.get(id=prediction.position15.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position16.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position17.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })


    driver = drivers.objects.get(id=prediction.position18.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position19.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })

    
    driver = drivers.objects.get(id=prediction.position20.id)
    team = constructors.objects.get(id=driver.currentTeam_id)
    
    
    data['drivers'].append({
        "id" : str(driver.id),
        "thumb" : driver.thumbImgLocation,
        "name" : driver.surname,
        "constructorName" : team.apiName,
        "constructor_logo" : team.constructorImgLocation,
        "icon" : team.constructorIconLocation,
        "constructorIconColor" : team.constructorIconColor,
        "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation
    })
    json_data = json.dumps(data)
    return json_data

def teamPopSerializer(uid, paddockId, prediction_type):

    demo = 0

    paddockId = int(paddockId)

    if uid != None:
        current_user = uid
        
    else:
        current_user = 0
        demo = 1

    now = datetime.now()

    data = {}
    data['userPaddocks'] = []

    if paddockId == 0:
        user_paddock_list = userPaddocks.objects.filter(
            user_id = uid,
        ).values_list("paddock_id", flat=True)

        user_paddock_rule_list = paddocks.objects.filter(
            id__in=user_paddock_list,
        ).values_list("paddockRules_id", flat=True)

        user_paddock_start_round_qset = paddockRulesStartRounds.objects.filter(
            paddockRules_id__in=user_paddock_rule_list,
            isPreSeasonConstructorRule = 1,
        ).order_by("startRound")

        last_completed_round = getNextRaceRound() - 1

        try:
            for i in range(user_paddock_start_round_qset.count()):
                if user_paddock_start_round_qset[i].raceRound > last_completed_round:
                    paddockId = paddocks.objects.filter(
                        year=now.year,
                        paddockRules_id = user_paddock_start_round_qset[i].paddockRules_id,
                    ).order_by("numPlayers")[0].id
                    break
        except:
            paddockId = 0

        if paddockId == 0:
            paddockId = paddocks.objects.filter(id__in=user_paddock_list).order_by('numPlayers')[0].id

    else:
        paddockId = int(paddockId)

    if uid == None:
        demo = 1
        numTeams = constructors.objects.filter(isOnGrid=1).count()

    elif demo == 0:
        numTeams = paddocks.objects.get(
            id=paddockId,
        ).paddockRules.numConstructorsOnPreSeasonLeaderboard

        user_paddock_list = userPaddocks.objects.filter(user_id = uid).values_list('paddock_id', flat=True)
        for i in range(len(user_paddock_list)):
            data["userPaddocks"].append({
                "paddockId":user_paddock_list[i],
                "paddockName":paddocks.objects.get(id=user_paddock_list[i]).paddockName,
            })

    data['selectedPaddock'] = paddockId
    data["user"] = current_user
    data["numTeams"] = numTeams

    if prediction_type == "pre season":
        try:
            prediction = constructorSeasonPredictions.objects.filter(year=now.year).filter(user_id=current_user, isMidSeasonPrediction=0, paddock_id = paddockId).latest("id")
        except:
            constructor_prediction_qset = constructorSeasonPredictions.objects.filter(year=now.year).filter(user_id=current_user, isMidSeasonPrediction=0)

            potential_predictions_list = []

            this_paddock_rulesId = paddock_rulesId = paddocks.objects.get(id=paddockId).paddockRules_id
            this_paddock_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id = this_paddock_rulesId,
                isPreSeasonDriverRule = 1,
            ).startRound

            for pred in range(constructor_prediction_qset.count()):
                pred_paddockId = constructor_prediction_qset[pred].paddock_id
                paddock_rulesId = paddocks.objects.get(id=pred_paddockId).paddockRules_id
                paddock_start_round = paddockRulesStartRounds.objects.get(
                    paddockRules_id = paddock_rulesId,
                    isPreSeasonDriverRule = 1,
               ).startRound

                if paddock_start_round <= this_paddock_start_round:
                   potential_predictions_list.append(constructor_prediction_qset[pred].id)

            try:
                prediction = constructorSeasonPredictions.objects.filter(
                    id__in=potential_predictions_list
                ).latest('id')

                if getNextRaceRound() < this_paddock_start_round:

                    new_prediction = prediction
                    new_prediction.id = None
                    new_prediction.paddock_id = paddockId
                    new_prediction.save()

                    print("SAVED A NEW CONSTRUCTOR STANDING PREDICTION FOR THIS USER")

            except:
                prediction = constructorSeasonPredictions.objects.filter(year=now.year).filter(user_id=20, isMidSeasonPrediction=0).latest("id")
                demo = 1

    elif prediction_type == "mid season":
        try:
            prediction = constructorSeasonPredictions.objects.filter(year=now.year).filter(user_id=current_user, isMidSeasonPrediction=1, paddock_id = paddockId).latest("id")
        except:
            prediction = constructorSeasonPredictions.objects.filter(year=now.year).filter(user_id=20, isMidSeasonPrediction=1).latest("id")
            demo = 1
    
    if True:
        constructor = constructors.objects.get(id=prediction.position1.id)
        data['isDemo'] = demo
        data['constructors'] = []
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })
        
        constructor = constructors.objects.get(id=prediction.position2.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position3.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position4.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position5.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position6.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position7.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position8.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position9.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        constructor = constructors.objects.get(id=prediction.position10.id)
        data['constructors'].append({
            "id" : str(constructor.id),
            "name" : constructor.name,
            "constructor_logo" : constructor.constructorImgLocation,
            "icon" : constructor.constructorIconLocation,
            "constructorIconColor" : constructor.constructorIconColor,
            "flag" : flags.objects.get(id=constructor.flag_id).flagImgLocation
        })

        json_data = json.dumps(data)
        return json_data

def getPaddockManualDrivers(uid, paddockId):
    now=datetime.now()
    next_race_round = getNextRaceRound()
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = next_race_round,
    )

    cloneDriverTable(paddockId)

    now = datetime.now()

    demo = 0

    ordered_midfield_list = []

    if uid == None:
        demo = 1

    next_race_round = getNextRaceRound()

    if manualResults.objects.filter(paddock_id = paddockId, seasonCalendar_id = season_calendarId).count() == 0:
        driver_list = paddockDrivers.objects.filter(isOnGrid=1, paddock_id=paddockId).order_by('lastResultPosition').values_list("id", flat=True)
        
    else:
        driver_list = manualResults.objects.filter(paddock_id = paddockId, seasonCalendar_id = season_calendarId).order_by("position").values_list('driver_id', flat=True)

    try:
        pole_lap_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
            isPoleLapResult = 1,
            paddock_id = paddockId,
            seasonCalendar_id = seasonCalendar.objects.get(
                year=now.year,
                raceRound = next_race_round,
            ).id
        ).latest("id").polePositionDriver.id
    except Exception as e:
        print(e)
        pole_lap_driver_id = None

    try:
        fastest_lap_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
            paddock_id = paddockId,
            isFastestLapResult = 1,
            seasonCalendar_id = seasonCalendar.objects.get(
                year=now.year,
                raceRound = next_race_round,
            ).id
        ).latest("id").fastestLapDriver_id
    except Exception as e:
        print(e)
        fastest_lap_driver_id = None

    for i in range(len(driver_list)):
        ordered_midfield_list.append(driver_list[i])

    next_race_id = seasonCalendar.objects.filter(year=now.year, raceRound=next_race_round)[0].id
    race = seasonCalendar.objects.get(id=next_race_id)

    data = {}
    data["seasonCalendarId"] = next_race_id
    data["user"] = uid
    data["drivers"] = []
    
    data["circuitInfo"] = {
        "circuitId" : seasonCalendar.objects.get(id=race.id).circuit_id,
        "country" : circuits.objects.get(id=race.circuit_id).country,
        "circuitRef" : circuits.objects.get(id=race.circuit_id).circuitRef,
        "circuitName" : circuits.objects.get(id=race.circuit_id).name,
        "circuitFlagImageLocation" : flags.objects.get(id=circuits.objects.get(id=race.circuit_id).flag_id).flagImgLocation
    }
    data['constructors'] = []
    
    constructor_qset = constructors.objects.filter(isOnGrid=1)

    for c in range(constructor_qset.count()):
        data['constructors'].append({
            "constructorName" : constructor_qset[c].name,
            "constructorLogo" : constructor_qset[c].constructorImgLocation
        })

    data['isDemo'] = demo
    data["fastLapFound"] = 0
    data["poleLapFound"] = 0
    data['numDrivers'] = paddockDrivers.objects.filter(isOnGrid=1, paddock_id=paddockId).count()

    for i in range(0, len(ordered_midfield_list), 1):
        pickable_driver = 1
        driver = paddockDrivers.objects.get(id=ordered_midfield_list[i])
        is_reserve_driver = 0
        
        if driver.subbedInFor_id != None and driver.seatDrivenBy_id == driver.id and driver.isOnGrid == 1:
            constructor_name = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.apiName
            icon_location = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorIconLocation
            constructor_logo_location = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorImgLocation
            constructor_icon_color = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorIconColor

        else:
            constructor_name = driver.currentTeam.apiName
            icon_location = driver.currentTeam.constructorIconLocation
            constructor_icon_color = driver.currentTeam.constructorIconColor
            constructor_logo_location = driver.currentTeam.constructorImgLocation

        has_pole_position = 0
        has_fastest_lap = 0

        if driver.id == fastest_lap_driver_id:
            has_fastest_lap = 1
            data["fastLapFound"] = 1
            
        if driver.id == pole_lap_driver_id:
            has_pole_position = 1
            data["poleLapFound"] = 1

        data['drivers'].append({
            "id" : str(driver.id),
            "code" : driver.code,
            "thumb" : driver.thumbImgLocation,
            "name" : driver.forename + " " + driver.surname,
            "firstName" : driver.forename,
            "driverSurname" : driver.surname,
            "constructor_logo" : constructor_logo_location,
            "constructorName" : constructor_name,
            "icon" : icon_location,
            "constructorIconColor" : constructor_icon_color,
            "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation,
            "permanentNumber" : driver.number,
            "pickableDriver" : pickable_driver,
            "paddock_id" : paddockId,
            "hasPolePosition" : has_pole_position,
            "hasFastestLap" : has_fastest_lap,
        })

    json_data = json.dumps(data)
    return json_data

def substitutionPopSerializer(uid, paddockId):

    now = datetime.now()

    demo = 0

    cloneDriverTable(paddockId)

    ordered_midfield_list = []

    if uid == None:
        demo = 1

    next_race_round = getNextRaceRound()

    last_race_round = next_race_round - 1

    driver_list = paddockDrivers.objects.filter(paddock_id=paddockId).order_by('lastResultPosition').order_by('-isOnGrid').values_list("id", flat=True)


    for i in range(len(driver_list)):
        ordered_midfield_list.append(driver_list[i])

    next_race_id = seasonCalendar.objects.filter(year=now.year, raceRound=next_race_round)[0].id
    race = seasonCalendar.objects.get(id=next_race_id)

    data = {}
    data["seasonCalendarId"] = next_race_id
    data["user"] = uid
    data["isFeatureRaceMidfield"] = 1
    data["drivers"] = []
    
    data["circuitInfo"] = {
        "circuitId" : seasonCalendar.objects.get(id=race.id).circuit_id,
        "country" : circuits.objects.get(id=race.circuit_id).country,
        "circuitRef" : circuits.objects.get(id=race.circuit_id).circuitRef,
        "circuitName" : circuits.objects.get(id=race.circuit_id).name,
        "circuitFlagImageLocation" : flags.objects.get(id=circuits.objects.get(id=race.circuit_id).flag_id).flagImgLocation
    }
    data['constructors'] = []
    
    constructor_qset = constructors.objects.filter(isOnGrid=1)

    for c in range(constructor_qset.count()):
        data['constructors'].append({
            "constructorName" : constructor_qset[c].name,
            "constructorLogo" : constructor_qset[c].constructorImgLocation
        })
        driver_qset = paddockDrivers.objects.filter(currentTeam_id=constructor_qset[c].id, paddock_id = paddockId)
        team_member1 = paddockDrivers.objects.get(id=driver_qset[0].id, paddock_id = paddockId)
        team_member2 = paddockDrivers.objects.get(id=driver_qset[1].id, paddock_id = paddockId)

        if team_member1.subbedInFor_id == team_member2.id or team_member2.seatDrivenBy_id == team_member1.id:

            team_member1.subbedInFor_id = None
            team_member1.seatDrivenBy_id = team_member1.id

        if team_member2.subbedInFor_id == team_member1.id or team_member1.seatDrivenBy_id == team_member2.id:

            team_member2.subbedInFor_id = None
            team_member2.seatDrivenBy_id = team_member2.id

        team_member2.save()
        team_member1.save()

        if team_member1.subbedInFor_id == None:
            team_member1.seatDrivenBy_id = team_member1.id

        if team_member2.subbedInFor_id == None:
            team_member2.seatDrivenBy_id = team_member2.id

        team_member2.save()
        team_member1.save()

    data['isDemo'] = demo

    above_count = 0
    pick_threshold = 2

    for i in range(0, len(ordered_midfield_list), 1):
        pickable_driver = 1
        driver = paddockDrivers.objects.get(id=ordered_midfield_list[i], paddock_id = paddockId)
        is_reserve_driver = 0
        
        if driver.subbedInFor_id != None and driver.isOnGrid == 1:
            constructor_name = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.apiName
            icon_location = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorIconLocation
            constructor_logo_location = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorImgLocation
            constructor_icon_color = paddockDrivers.objects.get(
                id=driver.id
            ).subbedInFor.currentTeam.constructorIconColor

        elif driver.isOnGrid == 0 and driver.seatDrivenBy_id == driver.id:
            constructor_name = paddockDrivers.objects.get(
                id=driver.id
            ).seatDrivenBy.currentTeam.apiName
            icon_location = paddockDrivers.objects.get(
                id=driver.id
            ).seatDrivenBy.currentTeam.constructorIconLocation
            constructor_logo_location = paddockDrivers.objects.get(
                id=driver.id
            ).seatDrivenBy.currentTeam.constructorImgLocation
            constructor_icon_color = paddockDrivers.objects.get(
                id=driver.id
            ).seatDrivenBy.currentTeam.constructorIconColor

        elif driver.isOnGrid == 0 and driver.seatDrivenBy_id != driver.id:
            constructor_name = "On Bench"
            icon_location = None
            constructor_logo_location = None
            constructor_icon_color = None

        else:
            constructor_name = driver.currentTeam.apiName
            icon_location = driver.currentTeam.constructorIconLocation
            constructor_icon_color = driver.currentTeam.constructorIconColor
            constructor_logo_location = driver.currentTeam.constructorImgLocation

        if driver.isOnGrid == 0:
            is_reserve_driver = 1

        if driver.subbedInFor_id != None:
            subbed_with = driver.subbedInFor.code
        else:
            subbed_with = 0

        subbed_by = 0
        if driver.seatDrivenBy_id != driver.id:
            subbed_by = driver.seatDrivenBy.code

        data['drivers'].append({
            "id" : str(driver.id),
            "code" : driver.code,
            "thumb" : driver.thumbImgLocation,
            "name" : driver.forename + " " + driver.surname,
            "firstName" : driver.forename,
            "driverSurname" : driver.surname,
            "constructor_logo" : constructor_logo_location,
            "constructorName" : constructor_name,
            "icon" : icon_location,
            "constructorIconColor" : constructor_icon_color,
            "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation,
            "permanentNumber" : driver.number,
            "pickableDriver" : pickable_driver,
            "isReserveDriver" : is_reserve_driver,
            "paddock_id" : paddockId,
            "subbedWith" : subbed_with,
            "subbedBy" : subbed_by,
        })
        
    data['aboveCount'] = above_count
    data['pickThreshold'] = pick_threshold

    json_data = json.dumps(data)
    return json_data

def midfieldDriverSerializer(uid):

    now = datetime.now()

    demo = 0

    if uid == None:
        demo = 1

    midfield_driver_id_list = []

    next_race_round = getNextRaceRound()

    user_has_fast_lap_prediciton = 0
    user_has_pole_lap_prediction = 0

    try:
        fastest_lap_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            user_id = uid,
            isFastestLapPrediction = 1,
            seasonCalendar_id = seasonCalendar.objects.get(year = now.year, raceRound = next_race_round).id,
        ).latest('id').driver_id
        user_has_fast_lap_prediciton = 1
    except:
        fastest_lap_driver_id = 0

    try:
        pole_lap_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            user_id = uid,
            isPolePrediction = 1,
            seasonCalendar_id = seasonCalendar.objects.get(year = now.year, raceRound = next_race_round).id,
        ).latest('id').driver_id
        user_has_pole_lap_prediction = 1
    except:
        pole_lap_driver_id = 0

    
    next_race_id = seasonCalendar.objects.filter(year=now.year, raceRound=next_race_round)[0].id
    race = seasonCalendar.objects.get(id=next_race_id)

    max_pickable_drivers = 0
    user_paddocks_qset = userPaddocks.objects.filter(
        year=now.year,
        user_id = uid,    
    )

    num_paddock_excluded_teams = 0
    num_teams_on_grid = constructors.objects.filter(
        isOnGrid=1
    ).count()

    user_paddocks_excluded_constructors = []

    for i in range(0, user_paddocks_qset.count(), 1):

        paddock_rulesId = paddocks.objects.get(id=user_paddocks_qset[i].paddock_id).paddockRules_id

        if ruleSetExcludedConstructors.objects.filter(year=now.year, paddockRule_id = paddock_rulesId).count() == 0:
            num_paddock_excluded_teams = 0
            season_teams = constructors.objects.filter(isOnGrid=1).count()
        else:
            season_teams = constructors.objects.filter(isOnGrid=1).count()
            temp_num_excluded_teams = ruleSetExcludedConstructors.objects.filter(year=now.year, paddockRule_id = paddock_rulesId).count()
            if num_paddock_excluded_teams <= temp_num_excluded_teams:
                num_paddock_excluded_teams = temp_num_excluded_teams

        paddock_rule_id = paddocks.objects.get(id=user_paddocks_qset[i].paddock_id).paddockRules_id
        paddock_excluded_teams_list = ruleSetExcludedConstructors.objects.filter(
            paddockRule_id=paddock_rule_id
        ).values_list('constructor_id', flat=True)
        
        for c in range(len(paddock_excluded_teams_list)):
            if paddock_excluded_teams_list[c] in user_paddocks_excluded_constructors:
                user_paddocks_excluded_constructors.append(paddock_excluded_teams_list[c])

    if user_paddocks_qset.count() == 0:
        max_pickable_drivers = paddockRules.objects.filter(
            year=now.year,
            ruleSetName = "default",
        ).latest('id').numDriversOnMidfieldLeaderBoard

    else:
        for i in range(0, user_paddocks_qset.count(), 1):
            paddockId = user_paddocks_qset[i].paddock_id
            paddock_max_pickable_drivers = paddocks.objects.get(
                id=paddockId
            ).paddockRules.numDriversOnMidfieldLeaderBoard
            if max_pickable_drivers < paddock_max_pickable_drivers:
                max_pickable_drivers = paddock_max_pickable_drivers
                lcd_max_pickable = paddock_max_pickable_drivers

    data = {}
    data["seasonCalendarId"] = next_race_id
    data["user"] = uid
    data["isFeatureRaceMidfield"] = 1
    data['userHasPolePrediction'] = user_has_pole_lap_prediction
    data['userHasFastestLapPrediction'] = user_has_fast_lap_prediciton
    data["drivers"] = []
    data["numMidfieldDrivers"] = season_teams*2 - num_paddock_excluded_teams*2
    data["maxPickableDrivers"] = max_pickable_drivers
    data['ruleSetName'] = paddocks.objects.filter(id=userPaddocks.objects.filter(
        user_id=uid,
        year=now.year,
        ).latest("id").paddock_id
    ).latest('id').paddockRules.ruleSetName
    
    data["circuitInfo"] = {
        "circuitId" : seasonCalendar.objects.get(id=race.id).circuit_id,
        "country" : circuits.objects.get(id=race.circuit_id).country,
        "circuitRef" : circuits.objects.get(id=race.circuit_id).circuitRef,
        "circuitName" : circuits.objects.get(id=race.circuit_id).name,
        "circuitFlagImageLocation" : flags.objects.get(id=circuits.objects.get(id=race.circuit_id).flag_id).flagImgLocation
    }

    midfield_teams = constructors.objects.filter(isOnGrid=1)#.filter(isMidfieldTeam=1)
    num_midfield_teams = midfield_teams.count()

    for t in range(0, num_midfield_teams, 1):
        team_drivers = drivers.objects.filter(currentTeam_id=midfield_teams[t]).filter(isOnGrid=1)
        for d in range(0, team_drivers.count(), 1):
            midfield_driver_id_list.append(team_drivers[d].id)
    try:
        last_prediction = driverPredictions.objects.filter(user=uid).filter(isFeatureRaceMidfield=1).filter(year=now.year).latest('id')
    except:
        last_prediction = driverPredictions.objects.filter(user_id=20).filter(isFeatureRaceMidfield=1).filter(year=now.year).latest('id')
        demo = 1

    data['isDemo'] = demo
    
    ordered_midfield_list = []
    ordered_midfield_list.append(last_prediction.position1.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position2.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position3.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position4.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position5.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position6.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position7.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position8.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position9.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position10.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position11.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position12.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position13.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position14.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position15.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position16.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position17.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position18.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position19.seatDrivenBy_id)
    ordered_midfield_list.append(last_prediction.position20.seatDrivenBy_id)

    above_count = 0
    pick_threshold = 0
    for i in range(0, len(ordered_midfield_list), 1):
        #try:
        if ordered_midfield_list[i] in midfield_driver_id_list:
            if drivers.objects.get(id=ordered_midfield_list[i]).id == drivers.objects.get(id=ordered_midfield_list[i]).seatDrivenBy.id:
                driver = drivers.objects.get(id=ordered_midfield_list[i])
            else:
                driver = drivers.objects.get(id=drivers.objects.get(id=ordered_midfield_list[i]).seatDrivenBy.id)

            unpickable_driver_count = len(user_paddocks_excluded_constructors)*2
            zero_point_picks = len(ordered_midfield_list) - unpickable_driver_count - lcd_max_pickable
            pickable_driver = 1

            if driver.currentTeam.id in user_paddocks_excluded_constructors:
                pickable_driver = 0 
                if i + 1 <= max_pickable_drivers:
                    above_count = above_count + 1
                    pick_threshold = pick_threshold + 1
                elif i + 1 < len(ordered_midfield_list) - zero_point_picks:
                    pick_threshold = pick_threshold + 1
            elif i + 1 <= len(ordered_midfield_list) - zero_point_picks:
                    pick_threshold = pick_threshold + 1

            is_pole_lap_driver = 0
            is_fastest_lap_driver = 0

            if driver.id == pole_lap_driver_id:
                is_pole_lap_driver = 1
            
            if driver.id == fastest_lap_driver_id:
                is_fastest_lap_driver = 1

            try:
                constructor_icon_color = driver.seatDrivenBy.currentTeam.constructorIconColor
            except:
                constructor_icon_color = None

            team = constructors.objects.get(id=drivers.objects.get(id=ordered_midfield_list[i]).currentTeam_id)
            data['drivers'].append({
                "id" : str(driver.id),
                "code" : driver.code,
                "thumb" : driver.thumbImgLocation,
                "name" : driver.forename + " " + driver.surname,
                "driverSurname" : driver.surname,
                "constructor_logo" : team.constructorImgLocation,
                "constructorName" : team.apiName,
                "icon" : team.constructorIconLocation,
                "constructorIconColor" : team.constructorIconColor,
                "flag" : flags.objects.get(id=driver.flag_id).flagImgLocation,
                "pickableDriver" : pickable_driver,
                "isFastestLapDriver" : is_fastest_lap_driver,
                "isPoleLapDriver" : is_pole_lap_driver,
                "constructorIconColor" : constructor_icon_color,
            })
        else:
            pass
            #ordered_midfield_list.remove(midfield_driver_id_list[i])

        #except:
        #    continue
        
    data['aboveCount'] = above_count
    data['pickThreshold'] = pick_threshold

    json_data = json.dumps(data)
    return json_data

def userPaddocksSerializer(uid):
    now=datetime.now()

    '''try:
        testVar=userPaddocks.objects.filter(
            user_id=uid,
            paddock_id=paddocks.objects.filter(
                year=now.year,
                paddockName="International",
            ).latest('id').id,
        ).latest('id')

    except:
        try:
            if uid - uid == 0: 
                paddock_relationship = userPaddocks(
                    user_id=uid,
                    paddock_id=paddocks.objects.filter(
                        paddockName="International",
                        year=now.year,
                    ).latest('id').id
                )
                paddock_relationship.save()

                international_paddock = paddocks.objects.filter(
                    paddockName="International",
                    year=now.year).latest('id')

                num_paddock_players = userPaddocks.objects.filter(paddock_id=paddocks.objects.filter(
                    paddockName="International",
                    year=now.year,
                ).latest('id').id).count()

                international_paddock.numPlayers = num_paddock_players
                international_paddock.save()
        except:
            pass'''

    data = {}
    data['paddockUsers'] = {}
    try:
        user_paddocks = userPaddocks.objects.filter(user_id=uid)
        data["user"] = uid
        data["year"] = str(now.year)
        data["paddocks"] = []
        for i in range(0,user_paddocks.count(),1):
            paddock_users_qset = userPaddocks.objects.filter(
                paddock_id = user_paddocks[i].paddock_id
            ).order_by('dateTimeJoined')

            data["paddocks"].append(
                {
                "id" : user_paddocks[i].paddock_id,
                "paddockName" : paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockName,
                "paddockCode" : paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockCode,
                "isAdmin" : userPaddocks.objects.filter(
                    user_id=uid,
                    paddock_id=user_paddocks[i].paddock_id,
                    )[0].isPaddockAdmin,
                "isSuperAdmin": userPaddocks.objects.filter(
                    user_id=uid,
                    paddock_id=user_paddocks[i].paddock_id,
                    )[0].isPaddockSuperAdmin,
                "numAdmins": userPaddocks.objects.filter(
                    paddock_id=user_paddocks[i].paddock_id,
                    isPaddockAdmin=1
                    ).count(),
                "numSuperAdmins": userPaddocks.objects.filter(
                    paddock_id=user_paddocks[i].paddock_id,
                    isPaddockAdmin=1,
                    isPaddockSuperAdmin=1,
                    ).count(),
                "numUsers": userPaddocks.objects.filter(
                    paddock_id=user_paddocks[i].paddock_id,
                    ).count(),
                "maxUsers": paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockUserStatusMaxUsers,
                }
            )
            data['paddockUsers'][paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockName] = []
            for u in range(0, paddock_users_qset.count(), 1):
                data['paddockUsers'][paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockName].append({
                    "id": u+1,
                    "paddockId": user_paddocks[i].paddock_id,
                    "paddockName" : paddocks.objects.get(id=user_paddocks[i].paddock_id).paddockName,
                    "userId": paddock_users_qset[u].user_id,
                    "username": paddock_users_qset[u].user.username,
                    "isAdmin": userPaddocks.objects.filter(
                        paddock_id=user_paddocks[i].paddock_id,
                        user_id=paddock_users_qset[u].user_id,
                    ).latest('id').isPaddockAdmin,
                    "isSuperAdmin": userPaddocks.objects.filter(
                        paddock_id=user_paddocks[i].paddock_id,
                        user_id=paddock_users_qset[u].user_id,
                    ).latest('id').isPaddockSuperAdmin,
                    "numAdmins": userPaddocks.objects.filter(
                        paddock_id=user_paddocks[i].paddock_id,
                        isPaddockAdmin=1
                        ).count(),
                    "numSuperAdmins": userPaddocks.objects.filter(
                        paddock_id=user_paddocks[i].paddock_id,
                        isPaddockAdmin=1,
                        isPaddockSuperAdmin=1,
                        ).count(),
                    "numUsers": paddocks.objects.get(
                        id=user_paddocks[i].paddock_id
                    ).numPlayers,
                    "lastLogin": (User.objects.get(id=paddock_users_qset[u].user_id).last_login).strftime("%m/%d/%Y")
                })

    except Exception as e:
        print("PROBLEM GENERATING USER PADDOCK LIST OR NO PADDOCKS FOR THIS USER")
        print(e)
        
    data["numUserPaddocks"] = len(data['paddocks'])
    data["userRestrictions"] = getUserStatus(uid)

    json_data = json.dumps(data)
    return json_data

def getLeaderboardByPaddock(pid):

    now = datetime.now()
    file_found = False

    next_race_round = getNextRaceRound()

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    cwd = createJsonFolderStructure(pid, last_completed_race, "ergast")
    print("")
    print("")
    print("")
    print("")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(cwd)

    try:
        checkVar = jsonFileLocations.objects.filter(
            year=now.year,
            isGeneralLeaderboard=1,
            paddock_id = pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("leaderbaord json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("leaderboard json file found")
        else:
            print("No Leaderboard Json file found, creating a new one")
    except:
        print("creating new leaderboard json file")

    if file_found == False:

        paddock_user_dict = {}
        paddock_user_dict['circuitRefs'] = []
        paddock_user_dict['paddockUsers'] = []
        paddock_user_dict['isManualResult'] = 0
        paddock_user_dict['manualResultSubmitter'] = ""
        paddock_user_dict['racelyRuleSetName'] = paddocks.objects.get(id=pid).paddockRules.ruleSetName
        paddock_user_dict['paddockId'] = pid
        paddock_user_dict['paddockName'] = paddocks.objects.get(id=pid).paddockName
        paddock_user_dict['paddockRacelyStartRound'] = getPaddockRulesStartRound(pid, "racely")
        paddock_user_dict['raceRound'] = {}
        paddock_user_dict['thisRound'] = seasonCalendar.objects.get(year=now.year, raceRound = last_completed_race).circuit.circuitRef
        paddock_user_dict['lastRound'] = seasonCalendar.objects.get(year=now.year, raceRound = last_completed_race).circuit.circuitRef
        leaderboard_qset = leaderboards.objects.filter(paddock_id=pid, isActive=1)

        paddock_user_qset = userPaddocks.objects.filter(paddock_id=pid)
        for i in range(0, paddock_user_qset.count(), 1):
            try:
                paddock_user_dict['paddockUsers'].append(paddock_user_qset[i].user.username)
            except:
                continue

        paddock_user_dict['currentRound'] = next_race_round-1
        race_start_round = getPaddockRulesStartRound(pid, 'racely')

        for r in range(race_start_round, next_race_round, 1):

            midfield_season_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isMidfieldGame=1).order_by('currentOverallPosition')
            midfield_round_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isMidfieldGame=1).order_by('roundPlayerPosition')

            driver_standing_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isDriverStandingsGame=1).order_by('currentOverallPosition')
            constructor_standing_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isConstructorStandingsGame=1).order_by('currentOverallPosition')

            if r == next_race_round-1:
                r = "current"
                race_round=next_race_round-1
            else:
                race_round=r
            
            paddock_user_dict['raceRound'][r] = {}
            paddock_user_dict['raceRound'][r]['midfieldRound'] = {}
            paddock_user_dict['raceRound'][r]['midfieldOverall'] = {}
            paddock_user_dict['raceRound'][r]['driverStandings'] = {}
            paddock_user_dict['raceRound'][r]['constructorStandings'] = {}
            paddock_user_dict['raceRound'][r]['combined'] = {}

            paddock_user_dict['circuitRefs'].append(seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef)
            
            first = True
            position_text = "1."
            paddock_user_dict['raceRound'][r]['midfieldOverall'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            save_pos = 1
            pos_jump = 0
            for p in range(0, midfield_season_ordered_leaderboard_qset.count(), 1):

                if p > 0:
                    if midfield_season_ordered_leaderboard_qset[p].currentTotalPoints == midfield_season_ordered_leaderboard_qset[p-1].currentTotalPoints:
                        if first == True:
                            save_pos = save_pos + pos_jump
                            pos_jump = 1
                            position_text = str(midfield_season_ordered_leaderboard_qset[p].currentOverallPosition) + "."
                            first = False
                        else:
                            position_text = ""
                            pos_jump = pos_jump + 1
                    else:
                        first = False
                        position_text = str(midfield_season_ordered_leaderboard_qset[p].currentOverallPosition) + "."
                        save_pos = save_pos + pos_jump
                        pos_jump = 1
                else:
                    pos_jump = pos_jump + 1
                    first = False

                if midfield_season_ordered_leaderboard_qset[p].paddockDelta > 0:
                    paddock_delta_text = "^ " + str(midfield_season_ordered_leaderboard_qset[p].paddockDelta)
                elif midfield_season_ordered_leaderboard_qset[p].paddockDelta < 0:
                    paddock_delta_text = "v " + str(midfield_season_ordered_leaderboard_qset[p].paddockDelta*-1)
                else:
                    paddock_delta_text = "~"

                paddock_user_dict['raceRound'][r]['midfieldOverall'][midfield_season_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : midfield_season_ordered_leaderboard_qset[p].user_id,
                    'username' : midfield_season_ordered_leaderboard_qset[p].user.username,
                    'position' : save_pos,
                    'positionText' : position_text,
                    'currentTotalPoints' : midfield_season_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta': midfield_season_ordered_leaderboard_qset[p].paddockDelta,
                    'paddockDeltaText': paddock_delta_text,
                    'round' : r
                })
            
            try:
                top_midfield_round_points = midfield_round_ordered_leaderboard_qset[0].roundPoints
            except:
                pass
            paddock_user_dict['raceRound'][r]['midfieldRound'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            first = True
            position_text = "1."
            for p in range(0, midfield_round_ordered_leaderboard_qset.count(), 1):

                userId = midfield_round_ordered_leaderboard_qset[p].user_id
                season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = race_round).id
                if p > 0:

                    if midfield_round_ordered_leaderboard_qset[p].roundPoints == midfield_round_ordered_leaderboard_qset[p-1].roundPoints:
                        if first == True:
                            position_text = str(midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition) + "."
                            first = False
                        else:
                            position_text = ""
                    else:
                        first = False
                        position_text = str(midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition) + "."

                if midfield_round_ordered_leaderboard_qset[p].roundPoints == top_midfield_round_points:
                    round_winner = 1
                else:
                    round_winner = 0

                fastest_lap_bonus_point = 0
                pole_lap_bonusPoint = 0

                try:
                    if predictionPoints.objects.get(
                        user_id = userId,
                        seasonCalendar_id = season_calendarId,
                        isPoleSitterPoint = 1,
                    ).pointsForPrediction > 0:
                        pole_lap_bonusPoint = 1
                except Exception as e:
                    pass
                
                try:
                    if predictionPoints.objects.get(
                        user_id = userId,
                        seasonCalendar_id = season_calendarId,
                        isFastestLapPoint = 1,
                    ).pointsForPrediction > 0:
                        fastest_lap_bonus_point = 1
                except Exception as e:
                    pass
                        
                paddock_user_dict['raceRound'][r]['midfieldRound'][midfield_round_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : midfield_round_ordered_leaderboard_qset[p].user_id,
                    'username' : midfield_round_ordered_leaderboard_qset[p].user.username,
                    'position' : midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition,
                    'positionText' : position_text,
                    'roundPoints' : midfield_round_ordered_leaderboard_qset[p].roundPoints,
                    'paddockDelta' : midfield_round_ordered_leaderboard_qset[p].paddockDelta,
                    'roundWinner' : round_winner,
                    'round' : r,
                    "gotFastLapBonusPoint" : fastest_lap_bonus_point,
                    "gotPoleLapBonusPoints" : pole_lap_bonusPoint,
                })

            paddock_user_dict['raceRound'][r]['driverStandings'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            for p in range(0, driver_standing_ordered_leaderboard_qset.count(), 1):
                paddock_user_dict['raceRound'][r]['driverStandings'][driver_standing_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : driver_standing_ordered_leaderboard_qset[p].user_id,
                    'username' : driver_standing_ordered_leaderboard_qset[p].user.username,
                    'position' : driver_standing_ordered_leaderboard_qset[p].currentOverallPosition,
                    'currentTotalPoints' : driver_standing_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta' : driver_standing_ordered_leaderboard_qset[p].paddockDelta,
                    'round' : r,
                })
                
            paddock_user_dict['raceRound'][r]['constructorStandings'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            for p in range(0, constructor_standing_ordered_leaderboard_qset.count(), 1):
                paddock_user_dict['raceRound'][r]['constructorStandings'][constructor_standing_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : constructor_standing_ordered_leaderboard_qset[p].user_id,
                    'username' : constructor_standing_ordered_leaderboard_qset[p].user.username,
                    'position' : constructor_standing_ordered_leaderboard_qset[p].currentOverallPosition,
                    'currentTotalPoints' : constructor_standing_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta' : constructor_standing_ordered_leaderboard_qset[p].paddockDelta,
                    'round' : r,
                })
        paddock_user_dict['midRoundPointsByUser'] = {}
        for u in range(0, len(paddock_user_dict['paddockUsers']), 1):
            paddock_user_dict['midRoundPointsByUser'][paddock_user_dict['paddockUsers'][u]] = []
            for r in range(race_start_round, next_race_round, 1):

                userId = User.objects.get(username = paddock_user_dict['paddockUsers'][u]).id
                season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r - 1 + race_start_round).id

                fastest_lap_bonus_point = 0
                pole_lap_bonusPoint = 0

                try:
                    if predictionPoints.objects.get(
                        user_id = userId,
                        seasonCalendar_id = season_calendarId,
                        isPoleSitterPoint = 1,
                    ).pointsForPrediction > 0:
                        pole_lap_bonusPoint = 1
                except Exception as e:
                    pass
                
                try:
                    if predictionPoints.objects.get(
                        user_id = userId,
                        seasonCalendar_id = season_calendarId,
                        isFastestLapPoint = 1,
                    ).pointsForPrediction > 0:
                        fastest_lap_bonus_point = 1
                except Exception as e:
                    pass

                try:
                    round_points = leaderboards.objects.filter(
                        paddock_id=pid,
                        isActive=1,
                        user_id=User.objects.filter(
                            username=paddock_user_dict['paddockUsers'][u])[0].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(
                            year=now.year,
                            raceRound=r)[0].id,
                        isMidfieldGame=1)[0].roundPoints
                except:
                    round_points = 0

                paddock_user_dict['midRoundPointsByUser'][paddock_user_dict['paddockUsers'][u]].append({
                    'id':u+1,
                    'circuitRef':seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef,
                    'username':paddock_user_dict['paddockUsers'][u],
                    'roundPoints':round_points,
                    'gotFastestLapBonusPoint' : fastest_lap_bonus_point,
                    'gotPoleLapBonusPoint' : pole_lap_bonusPoint,
                })
            try:
                round_points = leaderboards.objects.filter(
                    paddock_id=pid,
                    isActive=1,
                    user_id=User.objects.filter(
                        username=paddock_user_dict['paddockUsers'][u])[0].id,
                    seasonCalendar_id=seasonCalendar.objects.filter(
                        year=now.year,
                        raceRound=r)[0].id,
                    isMidfieldGame=1)[0].roundPoints
            except:
                round_points = 0

        fstring = str(os.path.join(cwd, "leaderboard.json"))
        f = open(os.path.join(cwd, "leaderboard.json"), "a")
        f.write(json.dumps(paddock_user_dict))
        f.close()

        db_entry = jsonFileLocations(
            id=None, 
            isGeneralLeaderboard=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonFileLocations.objects.filter(
        isGeneralLeaderboard=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    paddock_user_dict = json.load(json_file)
    json_file.close()

    json_data = json.dumps(paddock_user_dict)
    return json_data

def getUserMidfieldPointsByPaddock(pid):
    
    now = datetime.now()
    file_found = False

    next_race_round = getNextRaceRound()

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    cwd = createJsonFolderStructure(pid, last_completed_race, "ergast")    

    try:
        checkVar = jsonFileLocations.objects.filter(
            year=now.year,
            isMidfieldGame=1,
            paddock_id=pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("Midfield json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("Midfield json file found")
        else:
            print("No Midfield Json file found, creating a new one")
    except:
        print("creating new Midfield json file") 

    if file_found == False:
        data = {}
        num_drivers_on_leaderboard = paddocks.objects.get(
            id=pid).paddockRules.numDriversOnMidfieldLeaderBoard
        user_qset = userPaddocks.objects.filter(paddock_id=pid)
        
        data['paddock'] = {
        'padockName' : paddocks.objects.get(id=pid).paddockName,
        'paddockId' : pid,
        }
        data['paddockUsers'] = []
        data["userPoints"] = {}
        data["userPoints"]['bonusPoints'] = {}
        data['manualResultSubmitter'] = ""

        race_start_round = getPaddockRulesStartRound(pid, 'racely')

        for user in range(0, user_qset.count(), 1):

            pole_bonus_points = 0
            fastest_lap_bonus_points = 0

            try:
                data['paddockUsers'].append({
                    "username" : user_qset[user].user.username,
                    "userId" : user_qset[user].user.id,
                })

                data["userPoints"][user_qset[user].user.username] = {}
                data["userPoints"]['bonusPoints'][user_qset[user].user.username] = {}
                for r in range(race_start_round, next_race_round, 1):

                    pole_bonus_points = 0
                    fastest_lap_bonus_points = 0

                    season_calendarId = seasonCalendar.objects.get(
                        year=now.year,
                        raceRound=r
                    ).id,

                    data["userPoints"][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef] = []
                    data["userPoints"]['bonusPoints'][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef] = []

                    user_prediction_qset = predictionPoints.objects.filter(
                        seasonCalendar_id=season_calendarId,
                        isFeatureRaceMidfieldPrediction=1,
                        user_id=user_qset[user].user_id,
                        paddock_id = pid,
                    ).order_by('predictedPosition')

                    user_finishing_qset = predictionPoints.objects.filter(
                        seasonCalendar_id=season_calendarId,
                        isFeatureRaceMidfieldPrediction=1,
                        user_id=user_qset[user].user_id,
                        paddock_id = pid,
                    ).order_by('finishingPosition')

                    result_finishing_qset = leaderboardSingleLinePredictions.objects.filter(
                        seasonCalendar_id=season_calendarId,
                        isRacelyPrediction=1,
                        user_id=user_qset[user].user_id,
                        paddock_id=pid,
                    ).order_by('predictedPosition')

                    try:
                        if r > 3 and now.year > 2021:
                            pole_result_driver_id = results.objects.filter(
                                seasonCalendar_id=season_calendarId,
                                isPoleSitter = 1,
                            ).latest('id').driver_id
                        else:
                            pole_result_driver_id = None
                    except:
                        pole_result_driver_id = None
                    
                    try:
                        if r > 3 and now.year > 2021:
                            fastest_lap_result_driver_id = results.objects.filter(
                                seasonCalendar_id=season_calendarId,
                                hasFastestLap = 1,
                            ).latest('id').driver_id
                        else:
                            fastest_lap_result_driver_id = None
                    except:
                        fastest_lap_result_driver_id = None

                    try:
                        if r > 3 and now.year > 2021:
                            predicted_pole_prediction_driver_id = poleFastesLapPredictions.objects.filter(
                                user_id=user_qset[user].user_id,
                                seasonCalendar_id=season_calendarId,
                                isPolPrediction = 1,
                            ).latest('id)').driver_id
                        else:
                            predicted_pole_prediction_driver_id = None
                            predicted_pole_prediction_driver_id = None
                    except:
                        predicted_pole_prediction_driver_id = None
                        predicted_pole_prediction_driver_id = None

                    try:
                        predicted_fastest_lap_prediction_driver_id = poleFastesLapPredictions.objects.filter(
                            user_id=user_qset[user].user_id,
                            seasonCalendar_id=season_calendarId,
                            isPolPrediction = 1,
                        ).latest('id)').driver_id
                    except:
                        predicted_fastest_lap_prediction_driver_id = None
                        predicted_fastest_lap_prediction_driver_code = None

                    if pole_result_driver_id == predicted_pole_prediction_driver_id:
                        pole_bonus_points = 1

                    if fastest_lap_result_driver_id == predicted_fastest_lap_prediction_driver_id:
                        fastest_lap_bonus_points = 1

                    data["userPoints"]['bonusPoints'][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef].append({
                        "poleLapDriverId": pole_result_driver_id,
                        #"poleLapDriverCode" : drivers.objects.get(id=pole_result_driver_id).code,
                        "fastestLapDriverId": fastest_lap_result_driver_id,
                        #"fastestLapDriverCode": drivers.objects.get(id=fastest_lap_result_driver_id).code,
                        "predictedFastestLapDriverId" : predicted_pole_prediction_driver_id,
                        "predictedFastestLapDriverCode" :  predicted_fastest_lap_prediction_driver_code,
                        "predictedPoleLapDriverId" : predicted_fastest_lap_prediction_driver_id,
                        #"predictedPoleLapDriverCode" : predicted_pole_prediction_driver_code,
                        'fastestLapPoints' : fastest_lap_bonus_points,
                        "poleLapPoints" : pole_bonus_points,
                    })

                    user_fastest_lap_driverId = None
                    user_pole_lap_driverId = None

                    if r > 3 and now.year>2021:

                        try:
                            user_fastest_lap_driverId = poleFastesLapPredictions.objects.filter(
                                user_id = user_qset[user].user_id,
                                seasonCalendar_id = season_calendarId,
                                isFastestLapPrediction = 1,
                            ).latest('id').driver_id
                        except Exception as e:
                            user_fastest_lap_driverId = None

                        try:
                            user_pole_lap_driverId = poleFastesLapPredictions.objects.filter(
                                user_id = user_qset[user].user_id,
                                seasonCalendar_id = season_calendarId,
                                isPolePrediction = 1,
                            ).latest('id').driver_id
                        except:
                            user_pole_lap_driverId = None
                    
                    for driver in range(result_finishing_qset.count()):

                        if driver + 1 > num_drivers_on_leaderboard:
                            break 

                        singlePointFinishingHit = 0
                        singlePointPredictionHit = 0
                        
                        try:
                            result_driverId = user_finishing_qset[driver].driver_id
                            race_position = results.objects.get(
                                year=now.year,
                                seasonCalendar_id = season_calendarId,
                                driver_id = result_driverId,
                            ).position
                            result_driver_code = user_finishing_qset[driver].driver.code
                            
                            try:
                                singlePointFinishingHit = user_finishing_qset[driver].isFinishingSinglePoint
                            except:
                                singlePointPredictionHit = 0
                            try:
                                if driver + 1 <= num_drivers_on_leaderboard:
                                    singlePointPredictionHit = user_finishing_qset[driver].isPredictedSinglePoint
                                else:
                                    singlePointPredictionHit = 0
                            except:
                                singlePointPredictionHit = 0

                            prediction_points = user_prediction_qset[driver].pointsForPrediction

                            prediction_driver_position = user_prediction_qset[driver].predictedPosition

                            subbed_out_prediction_driverId = None

                            prediction_driverId = user_prediction_qset[driver].driver_id

                            if user_prediction_qset[driver].subbedOutDriverCode == None:
                                prediction_driver_code = user_prediction_qset[driver].driver.code
                            else:
                                prediction_driver_code = user_prediction_qset[driver].subbedOutDriverCode

                            driver_is_user_pole_prediction = 0
                            driver_is_user_fastest_lap_prediction = 0

                            if r > 3 and now.year>2021:
                                if user_pole_lap_driverId == prediction_driverId:
                                    driver_is_user_pole_prediction = 1

                                if user_fastest_lap_driverId == prediction_driverId:
                                    driver_is_user_fastest_lap_prediction = 1
                            
                        except Exception as e:
                            exc_type, exc_obj, exc_tb = sys.exc_info()
                            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                            print(exc_type, fname, exc_tb.tb_lineno)
                            print("retruning")
                            return
                            continue
                        
                        try:
                            driver_standing_qset = driverStandings.objects.filter(driver_id=result_driverId)
                            if next_race_round == 1:
                                driver_delta = 0
                            elif next_race_round == 2:
                                driver_delta = 0
                            else:
                                try:
                                    driver_delta = driver_standing_qset.filter(
                                        seasonCalendar_id=seasonCalendar.objects.filter(
                                            year=now.year,
                                            raceRound = next_race_round - 2)[0].id).latest('id').position - driver_standing_qset.filter(
                                        seasonCalendar_id=seasonCalendar.objects.filter(
                                            year=now.year,
                                            raceRound = next_race_round - 1)[0].id).latest('id').position
                                except:
                                    driver_delta = 0

                            if driver_delta > 0:
                                delta_text = "^ " + str(driver_delta)

                            elif driver_delta < 0:
                                delta_text = "v " + str(driver_delta*-1)
                            else:
                                delta_text = "~"

                            try:
                                driver_points = int(driverStandings.objects.filter(driver_id=result_driverId).latest('id').points)
                            except:
                                driver_points = 0

                            if driverSeasonCalendarSubs.objects.filter(seasonCalendar_id = season_calendarId).count() > 0:

                                try:
                                    subbed_out_finishing_driverId = driverSeasonCalendarSubs.objects.get(seasonCalendar_id = season_calendarId, incomingDriver_id=result_driverId).outgoingDriver_id
                                    finishing_driver_icon_color = drivers.objects.get(id=subbed_out_finishing_driverId).currentTeam.constructorIconColor
                                except:
                                    finishing_driver_icon_color = drivers.objects.get(id=result_driverId).currentTeam.constructorIconColor

                                try:
                                    subbed_out_predicted_driverId = driverSeasonCalendarSubs.objects.get(seasonCalendar_id = season_calendarId, incomingDriver_id=user_prediction_qset[driver].driver_id).outgoingDriver_id
                                    predicted_driver_icon_color = drivers.objects.get(id=subbed_out_predicted_driverId).currentTeam.constructorIconColor
                                except:
                                    predicted_driver_icon_color = drivers.objects.get(id=user_prediction_qset[driver].driver_id).currentTeam.constructorIconColor

                            else:
                                finishing_driver_icon_color = drivers.objects.get(id=result_driverId).currentTeam.constructorIconColor
                                predicted_driver_icon_color = drivers.objects.get(id=user_prediction_qset[driver].driver_id).currentTeam.constructorIconColor

                            result_instance = results.objects.get(
                                driver_id = result_driverId,
                                seasonCalendar_id = season_calendarId,
                            )

                            position_change = result_instance.grid - result_instance.position
                            if position_change > 0:
                                position_change_text = "^ " + str(position_change)
                            elif position_change < 0:
                                position_change_text = "v " + str(-1*position_change)
                            else:
                                position_change_text = "~"

                            driver_has_pole = 0
                            if result_instance.grid == 1:
                                driver_has_pole = 1

                            driver_has_fastest_Lap = 0
                            if result_instance.hasFastestLap == 1:
                                driver_has_fastest_Lap = 1
                            
                            data["userPoints"][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef].append({
                                'id' : result_driverId,
                                'racePosition' : race_position,
                                'positionPredictionDriverCode' : prediction_driver_code,
                                'predictedPosition' : prediction_driver_position,
                                'predictionPoints' : prediction_points,
                                'resultDriverId' : result_driverId,
                                'resultDriverIconColor' : finishing_driver_icon_color,
                                'predictedDriverIconColor' : predicted_driver_icon_color,
                                'driverCode' : result_driver_code,
                                'driverPoints' : driver_points,
                                'driverDelta' : driver_delta,
                                'driverDeltaText' : delta_text,
                                'singlePointPredictionHit' : singlePointPredictionHit,
                                'singlePointFinishingHit' : singlePointFinishingHit,
                                'positionChange' :  position_change,
                                'positionChangeText' : position_change_text,
                                'driverHasPole' : driver_has_pole,
                                'driverHasFastestLap' : driver_has_fastest_Lap,
                                'userPolePrediction' : driver_is_user_pole_prediction,
                                'userFastestLapPrediction' : driver_is_user_fastest_lap_prediction,
                            })

                        except Exception as e:
                            exc_type, exc_obj, exc_tb = sys.exc_info()
                            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                            print(exc_type, fname, exc_tb.tb_lineno)
                            continue

            except Exception as e:
                print(e)
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                continue

        fstring = str(os.path.join(cwd, "midfield-points.json"))
        f = open(os.path.join(cwd, "midfield-points.json"), "a")
        f.write(json.dumps(data))
        f.close()

        db_entry = jsonFileLocations(
            id=None, 
            isMidfieldGame=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonFileLocations.objects.filter(
        isMidfieldGame=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    data = json.load(json_file)
    json_file.close()

    json_data = json.dumps(data)
    return json_data

def getDriverStandingDataByPaddock(pid):

    next_race_round = getNextRaceRound()

    file_found = False

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    if (last_completed_race < 1):
        return

    cwd = createJsonFolderStructure(pid, last_completed_race, "ergast")

    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound=last_completed_race
    ).id

    try:
        checkVar = jsonFileLocations.objects.filter(
            year=now.year,
            isPreSeasonDriverGame=1,
            paddock_id = pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("Pre Season Driver json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("Pre Season Driver json file found")
        else:
            print("No Pre Season Driver Json file found, creating a new one")
    except:
        print("creating new Pre Season Driver json file") 

    if file_found == False:

        paddock_rulesId = paddocks.objects.get(
            id=pid
        ).paddockRules_id
        num_drivers_on_leaderbaord = paddockRules.objects.get(
            id=paddock_rulesId
        ).numDriversOnPreSeasonLeaderboard

        current_round = last_completed_race
        seasonCalendarId = seasonCalendar.objects.get(year=now.year, raceRound=current_round).id
        previous_round = current_round - 1

        data = {}
        leaderboard_qset = leaderboards.objects.filter(
            seasonCalendar_id=seasonCalendarId,
            isActive=1,
            paddock_id=pid,
            isDriverStandingsGame=1).order_by('-roundPoints')

        prediction_points_qset = predictionPoints.objects.filter(
            seasonCalendar_id=seasonCalendarId,
            isDriverStandingPrediction=1,
            paddock_id=pid,
        ).order_by('finishingPosition')

        data['paddockUsers'] = []
        data['currentCircuitRef'] = seasonCalendar.objects.filter(year=now.year, raceRound=current_round)[0].circuit.circuitRef
        data['predictions'] = {}
        data['driverStandingLeaderboard'] = []

        for l in range(0, leaderboard_qset.count(), 1):
            
            if l == 0:
                position_text = "1."
            else:
                if leaderboard_qset[l].roundPoints == leaderboard_qset[l-1].roundPoints:
                    position_text = ""
                else:
                    position_text = str(leaderboard_qset[l].currentOverallPosition) + "."

            player_delta = leaderboard_qset[l].paddockDelta
            if player_delta > 0:
                player_delta_text = "^ " + str(player_delta)
            elif player_delta < 0:
                player_delta_text = "v " + str(player_delta*-1)
            else:
                player_delta_text = "~"

            if next_race_round > 2:
                points_change = leaderboard_qset[l].currentTotalPoints - leaderboard_qset[l].previousTotalPoints
            elif next_race_round == 1:
                points_change = 0
            else:
                points_change = leaderboard_qset[l].roundPoints
                
            if points_change < 0:
                points_change_text = "- " + str(points_change*-1)
            elif points_change > 0:
                points_change_text = "+ " + str(points_change)
            else:
                points_change_text="+0"

            data['paddockUsers'].append(leaderboard_qset[l].user.username)
            data['driverStandingLeaderboard'].append({
                'id':l+1,
                'raceRound':current_round,
                'currentRoundPoints':leaderboard_qset.filter(user_id=leaderboard_qset[l].user_id).latest("id").roundPoints,
                'username':leaderboard_qset[l].user.username,
                'playerPosition':leaderboard_qset[l].currentOverallPosition,
                'positionText':position_text,
                'playerDelta':player_delta,
                'paddockDeltaText':player_delta_text,
                'pointsChange':points_change,
                'pointsChangeText':points_change_text
            })
            
            user_prediction_qset = prediction_points_qset.filter(
                user_id=leaderboard_qset[l].user_id,
            ).order_by('predictedPosition')
            
            ordered_prediction_qset = user_prediction_qset.order_by('finishingPosition')

            driver_points_qset = driverStandings.objects.filter(
                year=now.year,
                seasonCalendar_id=seasonCalendar.objects.filter(
                    year=now.year,
                    raceRound=current_round
                ).latest('id').id
            ).order_by('position')

            data['predictions'][leaderboard_qset[l].user.username] = []
            driver_position = 0

            season_driver_id_list = drivers.objects.filter(
                isIncludedInPredictions = 1,
            ).values_list('id', flat=True)

            for d in range(0, driver_points_qset.count(), 1):
                driverId = driver_points_qset[d].driver_id
                if driverId not in season_driver_id_list:
                    print("coninued")
                    continue

                if d + 1 > num_drivers_on_leaderbaord:
                    continue

                if drivers.objects.get(id=driverId).isOnGrid != 1:
                    continue
                else:
                    driver_position = driver_position + 1
                    try:
                        driver_previous_position = driverStandings.objects.filter(
                            driver_id=driverId,
                            seasonCalendar_id=seasonCalendar.objects.filter(
                                year=now.year,
                                raceRound=previous_round
                            )[0].id
                        )[0].position
                    except:
                        driver_previous_position = 1
                    
                    driver_delta = driver_previous_position - driver_position
                    if driver_delta < 0:
                        driver_delta_text = "v " + str(driver_delta*-1)
                    elif driver_delta > 0:
                        driver_delta_text = "^ " + str(driver_delta)
                    else:
                        driver_delta_text = "~"
                try:
                    prediction_points = user_prediction_qset[d].pointsForPrediction

                    driver = drivers.objects.get(id=ordered_prediction_qset[d].driver_id)

                    if driverSeasonCalendarSubs.objects.filter(seasonCalendar_id = season_calendarId).count() > 0:
                        try:
                            subbed_out_finishing_driverId = driverSeasonCalendarSubs.objects.get(seasonCalendar_id = season_calendarId, incomingDriver_id=driver.id).outgoingDriver_id
                            finishing_driver_icon_color = drivers.objects.get(id=subbed_out_finishing_driverId).currentTeam.constructorIconColor
                        except:
                            finishing_driver_icon_color = drivers.objects.get(id=driver.id).currentTeam.constructorIconColor

                        try:
                            subbed_out_predicted_driverId = driverSeasonCalendarSubs.objects.get(seasonCalendar_id = season_calendarId, incomingDriver_id=user_prediction_qset[d].driver_id).outgoingDriver_id
                            predicted_driver_icon_color = drivers.objects.get(id=subbed_out_predicted_driverId).currentTeam.constructorIconColor
                        except:
                            predicted_driver_icon_color = drivers.objects.get(id=user_prediction_qset[d].driver_id).currentTeam.constructorIconColor

                    else:
                        finishing_driver_icon_color = drivers.objects.get(id=driver.id).currentTeam.constructorIconColor
                        predicted_driver_icon_color = drivers.objects.get(id=user_prediction_qset[d].driver_id).currentTeam.constructorIconColor

                    data['predictions'][leaderboard_qset[l].user.username].append({
                        'id':d+1,
                        'driverId':driverId,
                        'driverCode':driver.code,
                        'driverConstructorName':driver.currentTeam.name,
                        'currentPosition':driver_position,
                        'driverPoints':driverStandings.objects.filter(driver_id = ordered_prediction_qset[d].driver_id, seasonCalendar_id = season_calendarId).latest('id').points,
                        'positionPredictionDriverCode':drivers.objects.get(id=user_prediction_qset[d].driver_id).code,
                        'predictionPoints':prediction_points,
                        'driverDeltaText':driver_delta_text,
                        'driverDelta':driver_delta,
                        'singlePointFinishingHit': ordered_prediction_qset[d].isFinishingSinglePoint,
                        'singlePointPredictionHit': ordered_prediction_qset[d].isPredictedSinglePoint,
                        'resultDriverIconColor' : finishing_driver_icon_color,
                        'predictedDriverIconColor' : predicted_driver_icon_color,
                    })
                except Exception as e:
                    exc_type, exc_obj, exc_tb = sys.exc_info()
                    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                    print(exc_type, fname, exc_tb.tb_lineno)

        fstring = str(os.path.join(cwd, "driver-pre-season.json"))
        f = open(os.path.join(cwd, "driver-pre-season.json"), "a")
        f.write(json.dumps(data))
        f.close()

        db_entry = jsonFileLocations(
            id=None, 
            isPreSeasonDriverGame=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonFileLocations.objects.filter(
        isPreSeasonDriverGame=1,
        paddock_id=pid,
        ).latest("id").fileLocation

    json_file = open(file_location, "r+")
    data = json.load(json_file)
    json_file.close()

    json_data = json.dumps(data)
    return json_data

def getCombinedPointsByPaddock(pid):

    now=datetime.now()
    data={}
    file_found = False

    next_race_round = getNextRaceRound()

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    cwd = createJsonFolderStructure(pid, last_completed_race, "ergast")

    try:
        checkVar = jsonFileLocations.objects.filter(
            year=now.year,
            isPreSeasonCombinedGame=1,
            paddock_id = pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("Pre Season Combined json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("Pre Season Combined json file found")
        else:
            print("No Pre Season Combined Json file found, creating a new one")
    except:
        print("creating new Pre Season Combined json file") 

        print("githubtest")

    if file_found == False:
        paddock_user_qset = userPaddocks.objects.filter(paddock_id=pid)
        paddock_combined_leaderboard_qset = leaderboards.objects.filter(
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=next_race_round - 1
            ).latest('id').id,
            isCombinedStandingsGame=1,
            isActive=1,
        ).order_by("-currentTotalPoints")

        data["paddockUsers"] = []
        data["leaderboardData"] = []

        for u in range(0, paddock_combined_leaderboard_qset.count(), 1):    
            user_leaderboard_entry = paddock_combined_leaderboard_qset[u]

            points_change = user_leaderboard_entry.currentTotalPoints - user_leaderboard_entry.previousTotalPoints
            if points_change > 0:
                points_change_text = "+ " + str(points_change)
            elif points_change < 0:
                points_change_text = "- " + str(str(points_change))[1]
            else:
                points_change_text = ""

            paddock_delta = user_leaderboard_entry.paddockDelta
            if paddock_delta > 0:
                paddock_delta_text = "^ "+ str(paddock_delta)
            elif paddock_delta < 0:
                paddock_delta_text = "v "+ str(str(paddock_delta))[1]
            else:
                paddock_delta_text = "~"

            if u == 0:
                position_text = "1."
            else:
                if user_leaderboard_entry.currentOverallPosition == paddock_combined_leaderboard_qset[u-1].currentOverallPosition:
                    position_text = ""
                elif user_leaderboard_entry.currentOverallPosition > paddock_combined_leaderboard_qset[u-1].currentOverallPosition:
                    position_text = str(user_leaderboard_entry.currentOverallPosition) + "."
            
            data['leaderboardData'].append({
                "id":u+1,
                "pointsChange": points_change,
                "pointsChangeText": points_change_text,
                "paddockDelta": user_leaderboard_entry.paddockDelta,
                "paddockDeltaText": paddock_delta_text,
                "playerPoints": user_leaderboard_entry.currentTotalPoints,
                "position": user_leaderboard_entry.currentOverallPosition,
                "positionText": position_text,
                "username": user_leaderboard_entry.user.username,
            })

        fstring = str(os.path.join(cwd, "combined-pre-season.json"))
        f = open(os.path.join(cwd, "combined-pre-season.json"), "a")
        f.write(json.dumps(data))
        f.close()

        db_entry = jsonFileLocations(
            id=None, 
            isPreSeasonCombinedGame=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonFileLocations.objects.filter(
        isPreSeasonCombinedGame=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    data = json.load(json_file)
    json_file.close()

    json_data = json.dumps(data)
    return json_data

def getConstructorStandingDataByPaddock(pid):

    next_race_round = getNextRaceRound()

    file_found = False

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    paddock_rulesId = paddocks.objects.get(
            id=pid
        ).paddockRules_id
    num_constructors_on_leaderbaord = paddockRules.objects.get(
        id=paddock_rulesId
    ).numConstructorsOnPreSeasonLeaderboard

    cwd = createJsonFolderStructure(pid, last_completed_race, "ergast")

    try:
        checkVar = jsonFileLocations.objects.filter(
            year=now.year,
            isPreSeasonConstructorGame=1,
            paddock_id = pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("Pre Season Constructor json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("Pre Season Constructor json file found")
        else:
            print("No Pre Season Constructor Json file found, creating a new one")
    except:
        print("creating new Pre Season Constructor json file") 

    if file_found == False:
        current_round = next_race_round-1
        seasonCalendarId = seasonCalendar.objects.filter(year=now.year, raceRound=current_round)[0].id
        previous_round = seasonCalendar.objects.get(id=seasonCalendarId).raceRound - 1

        data = {}
        leaderboard_qset = leaderboards.objects.filter(
            seasonCalendar_id=seasonCalendarId,
            paddock_id=pid,
            isActive=1,
            isConstructorStandingsGame=1).order_by('-roundPoints')

        prediction_points_qset = predictionPoints.objects.filter(
            seasonCalendar_id=seasonCalendarId,
            paddock_id=pid,
            isConstructorStandingPrediction=1).order_by('finishingPosition')

        data['paddockUsers'] = []
        data['currentCircuitRef'] = seasonCalendar.objects.filter(year=now.year, raceRound=current_round)[0].circuit.circuitRef
        data['predictions'] = {}
        data['constructorStandingLeaderboard'] = []
        
        pos = 1
        for l in range(0, leaderboard_qset.count(), 1):
            if l == 0:
                position_text = "1."
            else:
                if leaderboard_qset[l].roundPlayerPosition == leaderboard_qset[l-1].roundPlayerPosition:
                    position_text = ""
                else:
                    position_text = str(leaderboard_qset[l].roundPlayerPosition) + "."

            player_delta = leaderboard_qset[l].paddockDelta
            if player_delta > 0:
                player_delta_text = "^ " + str(player_delta)
            elif player_delta < 0:
                player_delta_text = "v " + str(player_delta*-1)
            else:
                player_delta_text = "~"

            if next_race_round > 2:
                points_change = leaderboard_qset[l].currentTotalPoints - leaderboard_qset[l].previousTotalPoints
            elif next_race_round == 1:
                points_change = 0
            else:
                points_change = leaderboard_qset[l].roundPoints
                
                
            if points_change < 0:
                points_change_text = "- " + str(points_change*-1)
            elif points_change > 0:
                points_change_text = "+ " + str(points_change)
            else:
                points_change_text="+0"

            data['paddockUsers'].append(leaderboard_qset[l].user.username)
            data['constructorStandingLeaderboard'].append({
                'id':l+1,
                'raceRound':current_round,
                'currentRoundPoints':leaderboard_qset.filter(user_id=leaderboard_qset[l].user_id)[0].roundPoints,
                'username':leaderboard_qset[l].user.username,
                'playerPosition':leaderboard_qset[l].currentOverallPosition,
                'positionText':position_text,
                'playerDelta':player_delta,
                'paddockDeltaText':player_delta_text,
                'pointsChange':points_change,
                'pointsChangeText':points_change_text,
            })
            
            user_prediction_qset = prediction_points_qset.filter(user_id=leaderboard_qset[l].user_id)
            ordered_prediction_qset = user_prediction_qset.order_by('predictedPosition')
            constructor_points_qset = constructorStandings.objects.filter(
                year=now.year,
                seasonCalendar_id=seasonCalendar.objects.filter(
                    year=now.year,
                    raceRound=next_race_round-1)[0].id
                ).order_by('position')

            data['predictions'][leaderboard_qset[l].user.username] = []
            constructor_position = 0
            for d in range(0, constructor_points_qset.count(), 1):
                constructorId = constructor_points_qset[d].constructor_id
                if constructors.objects.get(id=constructorId).isOnGrid != 1:
                    continue

                if d+1 > num_constructors_on_leaderbaord:
                    continue

                else:
                    constructor_position = constructor_position + 1
                    try:
                        constructor_previous_position = constructorStandings.objects.filter(constructor_id=constructorId, seasonCalendar_id=seasonCalendar.objects.filter(year=now.year,raceRound=previous_round)[0].id)[0].position
                    except:
                        constructor_previous_position = 1
                    
                    constructor_delta = constructor_previous_position - constructor_position
                    if constructor_delta < 0:
                        constructor_delta_text = "v " + str(constructor_delta*-1)
                    elif constructor_delta > 0:
                        constructor_delta_text = "^ " + str(constructor_delta)
                    else:
                        constructor_delta_text = "~"
                try:
                    prediction_points = ordered_prediction_qset[d].pointsForPrediction
                    
                    if constructors.objects.get(id=constructorId).apiName == "AlphaTauri":
                        finishing_constructor_name = "Alpha Tauri"
                    else:
                        finishing_constructor_name = constructors.objects.get(id=constructorId).apiName

                    if constructors.objects.get(
                        id=user_prediction_qset.filter(
                            predictedPosition=constructor_position
                        ).latest('id').constructor_id).apiName == "AlphaTauri":
                        predicted_constructor_name = "Alpha Tauri"
                    else:
                        predicted_constructor_name = constructors.objects.get(
                            id=user_prediction_qset.filter(
                                predictedPosition=constructor_position
                            ).latest('id').constructor_id).apiName,

                    result_constructor_icon_color = constructors.objects.get(id=constructorId).constructorIconColor
                    predicted_constructor_color = constructors.objects.get(id=ordered_prediction_qset[d].constructor_id).constructorIconColor
                    
                    data['predictions'][leaderboard_qset[l].user.username].append({
                        'id':d+1,
                        'constructorId':constructorId,
                        'constructorCode':finishing_constructor_name,
                        'constructorConstructorName':constructors.objects.get(id=constructorId).name,
                        'currentPosition':constructor_position,
                        'constructorPoints':int(constructor_points_qset[d].points),
                        'predictionPoints':prediction_points,
                        'positionPredictionconstructorCode':predicted_constructor_name,
                        'constructorDeltaText':constructor_delta_text,
                        'constructorDelta':constructor_delta,
                        'singlePointFinishingHit': predictionPoints.objects.filter(seasonCalendar_id = seasonCalendarId, user_id=leaderboard_qset[l].user_id, constructor_id=constructorId, paddock_id = pid)[0].isFinishingSinglePoint,
                        'singlePointPredictionHit': predictionPoints.objects.filter(seasonCalendar_id = seasonCalendarId, user_id=leaderboard_qset[l].user_id, constructor_id=constructorId, paddock_id = pid)[0].isPredictedSinglePoint,
                        'resultDriverIconColor' : result_constructor_icon_color,
                        'predictedDriverIconColor' : predicted_constructor_color,
                    })
                except Exception as e:
                    exc_type, exc_obj, exc_tb = sys.exc_info()
                    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                    print(exc_type, fname, exc_tb.tb_lineno)
                    continue
                    

        fstring = str(os.path.join(cwd, "constructor-pre-season.json"))
        f = open(os.path.join(cwd, "constructor-pre-season.json"), "a")
        f.write(json.dumps(data))
        f.close()

        db_entry = jsonFileLocations(
            id=None, 
            isPreSeasonConstructorGame=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonFileLocations.objects.filter(
        isPreSeasonConstructorGame=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    data = json.load(json_file)
    json_file.close()

    json_data = json.dumps(data)
    return json_data
            
def getDefaultExcludedMidfieldConstructorName():
    data = []
    excluded_qset = defaultMidfieldExcludedTeamsBySeason.objects.filter(
        year=now.year
    )
    for c in range(0, excluded_qset.count(), 1):
        data.append(
            {
                "constructorName":str(constructors.objects.get(id=excluded_qset[c].constructor_id).name),
                "constructorId":str(excluded_qset[c].constructor_id)
            }
        )
    
    return data

def getUserStatusMaxPlayers(uid):
    userStatus = getUserStatus(uid)
    
    data = []
    data.append({"userMaxPlayers": userStatus[0]['userPaddockMaxUsers']})

    json_data = json.dumps(data)
    return json_data

def getUserNumPaddocksJoinable(uid):
    userStatus = getUserStatus(uid)
    userNumPaddocks = userPaddockCount.objects.filter(year=now.year, user_id=uid).latest('id')
    
    private_paddocks_joinable = userStatus[0]['privatePaddocksJoinable']
    public_paddocks_joinable = userStatus[0]['publicPaddocksJoinable']
    data = []

    data.append({
        "privatePaddocksJoinable": private_paddocks_joinable - userNumPaddocks.numPrivatePaddocksJoined,
        "publicPaddocksJoinable": public_paddocks_joinable - userNumPaddocks.numPublicPaddocksJoined,
    })

    return data

def getPaddockRulesByPaddock(pid):
    now=datetime.now()
    data = {}

    paddock=paddocks.objects.get(id=pid)
    paddockRule = paddockRules.objects.get(id=paddocks.objects.get(id=pid).paddockRules_id)
    paddock_rule_id=paddockRule.id
    start_round_qset = paddockRulesStartRounds.objects.filter(paddockRules_id=paddock_rule_id)
    racely_start_round = start_round_qset.filter(isRacelyRule=1).latest('id').startRound
    driver_start_round = start_round_qset.filter(isPreSeasonDriverRule=1).latest('id').startRound
    constructor_start_round = start_round_qset.filter(isPreSeasonConstructorRule=1).latest('id').startRound
    excluded_constructors_qset = ruleSetExcludedConstructors.objects.filter(paddockRule_id=paddock_rule_id)
    
    excluded_constructor_list = []
    duplicate_list = []
    for i in range(0, excluded_constructors_qset.count(), 1):
        constructor_id=excluded_constructors_qset[i].constructor_id
        if constructor_id not in duplicate_list:
            excluded_constructor_list.append({
                "constructorName" : constructors.objects.get(id=constructor_id).name,
                "constructorId" : constructor_id
            })
            duplicate_list.append(constructor_id)

    racely_max_drivers = drivers.objects.filter(isOnGrid=1).count() - len(excluded_constructor_list)*2
    season_drivers = drivers.objects.filter(isOnGrid=1).count()
    season_constructors = constructors.objects.filter(isOnGrid=1).count()

    data['paddockRules'] = {}
    data['paddockRules']['id'] = paddock_rule_id
    data['paddockRules']['excludedConstructors'] = excluded_constructor_list
    data['paddockRules']['ruleSetName'] = paddockRule.ruleSetName
    data['paddockRules']['racelyDriversOnLeaderboard'] = paddockRule.numDriversOnMidfieldLeaderBoard
    data['paddockRules']['maxRacelyDrivers'] = racely_max_drivers
    data['paddockRules']['maxSeasonDrivers'] = season_drivers
    data['paddockRules']['maxSeasonConstructors'] = season_constructors
    data['paddockRules']['racelyStartRound'] = racely_start_round
    data['paddockRules']['preSeasonDriverStartRound'] = driver_start_round
    data['paddockRules']['preSeasonConstructorStartRound'] = constructor_start_round
    data['paddockRules']['numConstructorsOnPreSeasonLeaderboard'] = paddockRule.numConstructorsOnPreSeasonLeaderboard
    data['paddockRules']['numDriversOnPreSeasonLeaderboard'] = paddockRule.numDriversOnPreSeasonLeaderboard
    data['paddockRules']['preSeasonDriverPredictionDeadlineDate'] = paddockRule.preSeasonDriverPredictionDeadlineDate
    data['paddockRules']['preSeasonConstructorPredictionDeadlineDate'] = paddockRule.preSeasonConstructorPredictionDeadlineDate
    data['paddockRules']['preSeasonDriverPredictionDeadlineTime'] = paddockRule.preSeasonDriverPredictionDeadlineTime
    data['paddockRules']['preSeasonConstructorPredictionDeadlineTime'] = paddockRule.preSeasonConstructorPredictionDeadlineTime
    data['paddockRules']['preSeasonDriverPredictionDeadlineSession'] = paddockRule.preSeasonDriverStandingDeadlineSession
    data['paddockRules']['preSeasonConstructorPredictionDeadlineSession'] = paddockRule.preSeasonConstructorStandingDeadlineSession
    data['paddockRules']['midfieldDriverPredictionStartDate'] = paddockRule.midfieldDriverPredictionStartDate
    data['paddockRules']['midfieldDriverPredictionDeadlineTime'] = paddockRule.midfieldDriverPredictionDeadlineTime
    data['paddockRules']['midfieldDriverPredictionDeadlineSession'] = paddockRule.midfieldDriverPredictionDeadlineSession
    data['paddockRules']['paddockId'] = paddock.id
    data['paddockRules']['paddockName'] = paddock.paddockName
    data['paddockRules']['isPublic'] = paddock.isPublic
    data['paddockRules']['year'] = paddockRule.year

    return(data)

#######

def getManualLeaderboardByPaddock(pid):

    now = datetime.now()
    file_found = False
    
    next_race_round = getNextRaceRound()

    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

    cwd = createJsonFolderStructure(pid, last_completed_race, "manual")

    try:
        checkVar = jsonManualResultFileLocations.objects.filter(
            year=now.year,
            isGeneralLeaderboard=1,
            paddock_id = pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("MANUAL leaderbaord json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("MANUAL leaderboard json file found")
        else:
            print("No MANUAL Leaderboard Json file found, creating a new one")
    except:
        print("creating new MANUAL leaderboard json file")

    if file_found == False:

        paddock_user_dict = {}
        paddock_user_dict['circuitRefs'] = []
        paddock_user_dict['paddockUsers'] = []
        paddock_user_dict['isManualResult'] = 1
        paddock_user_dict['manualResultSubmitter'] = manualResultLog.objects.filter(
                seasonCalendar_id=seasonCalendar.objects.get(
                    raceRound = next_race_round,
                    year=now.year,
                ).id
            ).latest('id').user.username
        paddock_user_dict['racelyRuleSetName'] = paddocks.objects.get(id=pid).paddockRules.ruleSetName
        paddock_user_dict['paddockId'] = pid
        paddock_user_dict['paddockName'] = paddocks.objects.get(id=pid).paddockName
        paddock_user_dict['paddockRacelyStartRound'] = getPaddockRulesStartRound(pid, "racely")
        paddock_user_dict['raceRound'] = {}
        paddock_user_dict['thisRound'] = seasonCalendar.objects.get(year=now.year, raceRound = next_race_round).circuit.circuitRef
        paddock_user_dict['lastRound'] = seasonCalendar.objects.get(year=now.year, raceRound = last_completed_race).circuit.circuitRef
        leaderboard_qset = leaderboards.objects.filter(paddock_id=pid, isActive=1)

        paddock_user_qset = userPaddocks.objects.filter(paddock_id=pid)
        for i in range(0, paddock_user_qset.count(), 1):
            try:
                paddock_user_dict['paddockUsers'].append(paddock_user_qset[i].user.username)
            except:
                continue

        paddock_user_dict['currentRound'] = next_race_round-1
        race_start_round = getPaddockRulesStartRound(pid, 'racely')

        for r in range(race_start_round, next_race_round + 1, 1):

            midfield_season_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isMidfieldGame=1).order_by('currentOverallPosition')
            midfield_round_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isMidfieldGame=1).order_by('roundPlayerPosition')

            driver_standing_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isDriverStandingsGame=1).order_by('currentOverallPosition')
            constructor_standing_ordered_leaderboard_qset = leaderboard_qset.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id, isConstructorStandingsGame=1).order_by('currentOverallPosition')

            if r == next_race_round:
                r = "current"
                race_round=next_race_round
            else:
                race_round=r
            
            paddock_user_dict['raceRound'][r] = {}
            paddock_user_dict['raceRound'][r]['midfieldRound'] = {}
            paddock_user_dict['raceRound'][r]['midfieldOverall'] = {}
            paddock_user_dict['raceRound'][r]['driverStandings'] = {}
            paddock_user_dict['raceRound'][r]['constructorStandings'] = {}
            paddock_user_dict['raceRound'][r]['combined'] = {}

            paddock_user_dict['circuitRefs'].append(seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef)
            
            first = True
            position_text = "1."
            paddock_user_dict['raceRound'][r]['midfieldOverall'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            save_pos = 1
            pos_jump = 0
            for p in range(0, midfield_season_ordered_leaderboard_qset.count(), 1):

                if p > 0:
                    if midfield_season_ordered_leaderboard_qset[p].currentTotalPoints == midfield_season_ordered_leaderboard_qset[p-1].currentTotalPoints:
                        if first == True:
                            save_pos = save_pos + pos_jump
                            pos_jump = 1
                            position_text = str(midfield_season_ordered_leaderboard_qset[p].currentOverallPosition) + "."
                            first = False
                        else:
                            position_text = ""
                            pos_jump = pos_jump + 1
                    else:
                        first = False
                        position_text = str(midfield_season_ordered_leaderboard_qset[p].currentOverallPosition) + "."
                        save_pos = save_pos + pos_jump
                        pos_jump = 1
                else:
                    pos_jump = pos_jump + 1
                    first = False

                if midfield_season_ordered_leaderboard_qset[p].paddockDelta > 0:
                    paddock_delta_text = "^ " + str(midfield_season_ordered_leaderboard_qset[p].paddockDelta)
                elif midfield_season_ordered_leaderboard_qset[p].paddockDelta < 0:
                    paddock_delta_text = "v " + str(midfield_season_ordered_leaderboard_qset[p].paddockDelta*-1)
                else:
                    paddock_delta_text = "~"

                paddock_user_dict['raceRound'][r]['midfieldOverall'][midfield_season_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : midfield_season_ordered_leaderboard_qset[p].user_id,
                    'username' : midfield_season_ordered_leaderboard_qset[p].user.username,
                    'position' : save_pos,
                    'positionText' : position_text,
                    'currentTotalPoints' : midfield_season_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta': midfield_season_ordered_leaderboard_qset[p].paddockDelta,
                    'paddockDeltaText': paddock_delta_text,
                    'round' : r
                })
            
            try:
                top_midfield_round_points = midfield_round_ordered_leaderboard_qset[0].roundPoints
            except:
                pass
            paddock_user_dict['raceRound'][r]['midfieldRound'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            first = True
            position_text = "1"
            for p in range(0, midfield_round_ordered_leaderboard_qset.count(), 1):

                userId = midfield_round_ordered_leaderboard_qset[p].user_id
                season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = race_round).id
                if p > 0:

                    if midfield_round_ordered_leaderboard_qset[p].roundPoints == midfield_round_ordered_leaderboard_qset[p-1].roundPoints:
                        if first == True:
                            position_text = str(midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition)
                            first = False
                        else:
                            position_text = ""
                    else:
                        first = False
                        position_text = str(midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition)

                if midfield_round_ordered_leaderboard_qset[p].roundPoints == top_midfield_round_points:
                    round_winner = 1
                else:
                    round_winner = 0

                fastest_lap_bonus_point = 0
                pole_lap_bonusPoint = 0

                if r == "current":
                    race_round = next_race_round
                else:
                    race_round = r

                try:
                    if race_round < next_race_round:
                        if predictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isPoleSitterPoint = 1,
                        ).pointsForPrediction > 0:
                            pole_lap_bonusPoint = 1
                    elif race_round >= next_race_round:
                        if manualPredictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isPoleSitterPoint = 1,
                            paddock_id = pid,
                        ).pointsForPrediction > 0:
                            pole_lap_bonusPoint = 1
                except Exception as e:
                    pass

                try:
                    if race_round < next_race_round:
                        if predictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isFastestLapPoint = 1,
                        ).pointsForPrediction > 0:
                            fastest_lap_bonus_point = 1
                    elif race_round >= next_race_round:
                        if manualPredictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isFastestLapPoint = 1,
                            paddock_id = pid,
                        ).pointsForPrediction > 0:
                            fastest_lap_bonus_point = 1
                except Exception as e:
                    pass
                        
                paddock_user_dict['raceRound'][r]['midfieldRound'][midfield_round_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : midfield_round_ordered_leaderboard_qset[p].user_id,
                    'username' : midfield_round_ordered_leaderboard_qset[p].user.username,
                    'position' : midfield_round_ordered_leaderboard_qset[p].roundPlayerPosition,
                    'positionText' : position_text,
                    'roundPoints' : midfield_round_ordered_leaderboard_qset[p].roundPoints,
                    'paddockDelta' : midfield_round_ordered_leaderboard_qset[p].paddockDelta,
                    'roundWinner' : round_winner,
                    'round' : r,
                    "gotFastLapBonusPoint" : fastest_lap_bonus_point,
                    "gotPoleLapBonusPoints" : pole_lap_bonusPoint,
                })

            paddock_user_dict['raceRound'][r]['driverStandings'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            for p in range(0, driver_standing_ordered_leaderboard_qset.count(), 1):
                paddock_user_dict['raceRound'][r]['driverStandings'][driver_standing_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : driver_standing_ordered_leaderboard_qset[p].user_id,
                    'username' : driver_standing_ordered_leaderboard_qset[p].user.username,
                    'position' : driver_standing_ordered_leaderboard_qset[p].currentOverallPosition,
                    'currentTotalPoints' : driver_standing_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta' : driver_standing_ordered_leaderboard_qset[p].paddockDelta,
                    'round' : r,
                })
                
            paddock_user_dict['raceRound'][r]['constructorStandings'][seasonCalendar.objects.filter(year=now.year, raceRound=race_round)[0].circuit.circuitRef] = []
            for p in range(0, constructor_standing_ordered_leaderboard_qset.count(), 1):
                paddock_user_dict['raceRound'][r]['constructorStandings'][constructor_standing_ordered_leaderboard_qset[p].seasonCalendar.circuit.circuitRef].append({
                    'user_id' : constructor_standing_ordered_leaderboard_qset[p].user_id,
                    'username' : constructor_standing_ordered_leaderboard_qset[p].user.username,
                    'position' : constructor_standing_ordered_leaderboard_qset[p].currentOverallPosition,
                    'currentTotalPoints' : constructor_standing_ordered_leaderboard_qset[p].currentTotalPoints,
                    'paddockDelta' : constructor_standing_ordered_leaderboard_qset[p].paddockDelta,
                    'round' : r,
                })
        paddock_user_dict['midRoundPointsByUser'] = {}
        for u in range(0, len(paddock_user_dict['paddockUsers']), 1):
            paddock_user_dict['midRoundPointsByUser'][paddock_user_dict['paddockUsers'][u]] = []
            for r in range(race_start_round, next_race_round + 1, 1):

                userId = User.objects.get(username = paddock_user_dict['paddockUsers'][u]).id
                season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r - 1 + race_start_round).id

                fastest_lap_bonus_point = 0
                pole_lap_bonusPoint = 0

                try:
                    if r < next_race_round:
                        if predictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isPoleSitterPoint = 1,
                        ).pointsForPrediction > 0:
                            pole_lap_bonusPoint = 1
                    else:
                        if manualPredictionPoints.objects.get(
                            paddock_id = pid,
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isPoleSitterPoint = 1,
                        ).pointsForPrediction > 0:
                            pole_lap_bonusPoint = 1
                except Exception as e:
                    pass
                
                try:
                    if r < next_race_round:
                        if predictionPoints.objects.get(
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isFastestLapPoint = 1,
                        ).pointsForPrediction > 0:
                            fastest_lap_bonus_point = 1
                    else:
                        if manualPredictionPoints.objects.get(
                            paddock_id = pid,
                            user_id = userId,
                            seasonCalendar_id = season_calendarId,
                            isFastestLapPoint = 1,
                        ).pointsForPrediction > 0:
                            fastest_lap_bonus_point = 1

                except Exception as e:
                    pass

                try:
                    round_points = leaderboards.objects.filter(
                        paddock_id=pid,
                        isActive=1,
                        user_id=User.objects.filter(
                            username=paddock_user_dict['paddockUsers'][u])[0].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(
                            year=now.year,
                            raceRound=r)[0].id,
                        isMidfieldGame=1)[0].roundPoints
                except:
                    round_points = 0

                paddock_user_dict['midRoundPointsByUser'][paddock_user_dict['paddockUsers'][u]].append({
                    'id':u+1,
                    'circuitRef':seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef,
                    'username':paddock_user_dict['paddockUsers'][u],
                    'roundPoints':round_points,
                    'gotFastestLapBonusPoint' : fastest_lap_bonus_point,
                    'gotPoleLapBonusPoint' : pole_lap_bonusPoint,
                })
            try:
                round_points = leaderboards.objects.filter(
                    paddock_id=pid,
                    isActive=1,
                    user_id=User.objects.filter(
                        username=paddock_user_dict['paddockUsers'][u])[0].id,
                    seasonCalendar_id=seasonCalendar.objects.filter(
                        year=now.year,
                        raceRound=r)[0].id,
                    isMidfieldGame=1)[0].roundPoints
            except:
                round_points = 0

        #os.chdir(cwd)
        fstring = str(os.path.join(cwd, "leaderboard.json"))
        f = open(os.path.join(cwd, "leaderboard.json"), "a")
        f.write(json.dumps(paddock_user_dict))
        f.close()
        #os.chdir('/Users/johnpapenfus/Google Drive/John/Coding Projects/F1/f1predictions/')

        db_entry = jsonManualResultFileLocations(
            id=None, 
            isGeneralLeaderboard=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonManualResultFileLocations.objects.filter(
        isGeneralLeaderboard=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    paddock_user_dict = json.load(json_file)
    json_file.close()

    json_data = json.dumps(paddock_user_dict)
    return json_data

def updateManualRacelyPredictionPoints(pid):
    
    #clearPredictionData()
    #updateAllPredictionPoints()
    #return

    now = datetime.now()
    file_found = False
    next_race_round = getNextRaceRound()
    last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound
    cwd = createJsonFolderStructure(pid, last_completed_race, "manual")    

    try:
        checkVar = jsonManualResultFileLocations.objects.filter(
            year=now.year,
            isMidfieldGame=1,
            paddock_id=pid,
            seasonCalendar_id = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
            ).latest("id").id
        ).latest("id").fileLocation
        print("MANUAL Midfield json record found")

        if os.path.exists(checkVar):
            file_found = True
            print("MANUAL Midfield json file found")
        else:
            print("No MANUAL Midfield Json file found, creating a new one")
    except:
        print("creating new MANUAL Midfield json file") 

    if file_found == False:
        data = {}
        num_drivers_on_leaderboard = paddocks.objects.get(
            id=pid).paddockRules.numDriversOnMidfieldLeaderBoard
        user_qset = userPaddocks.objects.filter(paddock_id=pid)
        
        data['paddock'] = {
        'padockName' : paddocks.objects.get(id=pid).paddockName,
        'paddockId' : pid,
        }
        data['isManualResult'] = 1
        data['paddockUsers'] = []
        data["userPoints"] = {}
        data["userPoints"]['bonusPoints'] = {}

        race_start_round = getPaddockRulesStartRound(pid, 'racely')

        for user in range(0, user_qset.count(), 1):

            pole_bonus_points = 0
            fastest_lap_bonus_points = 0

            try:
                data['paddockUsers'].append({
                    "username" : user_qset[user].user.username,
                    "userId" : user_qset[user].user.id,
                })

                data["userPoints"][user_qset[user].user.username] = {}
                data["userPoints"]['bonusPoints'][user_qset[user].user.username] = {}
                for r in range(race_start_round, next_race_round + 1, 1):

                    pole_bonus_points = 0
                    fastest_lap_bonus_points = 0

                    season_calendarId = seasonCalendar.objects.get(
                        year=now.year,
                        raceRound=r
                    ).id

                    data["userPoints"][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef] = []
                    data["userPoints"]['bonusPoints'][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef] = []

                    if r < next_race_round:
                        user_prediction_qset = predictionPoints.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isFeatureRaceMidfieldPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id = pid,
                        ).order_by('predictedPosition')
                    else:
                        user_prediction_qset = manualPredictionPoints.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isFeatureRaceMidfieldPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id = pid,
                        ).order_by('predictedPosition')

                    if r < next_race_round:
                        user_finishing_qset = predictionPoints.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isFeatureRaceMidfieldPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id = pid,
                        ).order_by('finishingPosition')
                    else:
                        user_finishing_qset = manualPredictionPoints.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isFeatureRaceMidfieldPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id = pid,
                        ).order_by('finishingPosition')

                    if r < next_race_round:
                        result_finishing_qset = leaderboardSingleLinePredictions.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isRacelyPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id=pid,
                        ).order_by('predictedPosition')

                    else:
                        result_finishing_qset = leaderboardManualSingleLinePredictions.objects.filter(
                            seasonCalendar_id=season_calendarId,
                            isRacelyPrediction=1,
                            user_id=user_qset[user].user_id,
                            paddock_id=pid,
                        ).order_by('predictedPosition')
                    try:
                        if r > 3 and now.year > 2021:
                            if r < next_race_round:
                                pole_result_driver_id = results.objects.filter(
                                    seasonCalendar_id=season_calendarId,
                                    isPoleSitter = 1,
                                ).latest('id').driver_id
                            else:
                                pole_result_driver_id = manualResults.objects.filter(
                                    seasonCalendar_id=season_calendarId,
                                    isPoleSitter = 1,
                                ).latest('id').driver_id 
                        else:
                            pole_result_driver_id = None
                    except:
                        pole_result_driver_id = None
                    
                    try:
                        if r > 3 and now.year > 2021:
                            if r < next_race_round:
                                fastest_lap_result_driver_id = results.objects.filter(
                                    seasonCalendar_id=season_calendarId,
                                    hasFastestLap = 1,
                                ).latest('id').driver_id
                            else:
                                fastest_lap_result_driver_id = manualResults.objects.filter(
                                    seasonCalendar_id=season_calendarId,
                                    hasFastestLap = 1,
                                ).latest('id').driver_id
                        else:
                            fastest_lap_result_driver_id = None
                    except:
                        fastest_lap_result_driver_id = None

                    try:
                        if r > 3 and now.year > 2021:
                            if r < next_race_round:
                                predicted_pole_prediction_driver_id = poleFastesLapPredictions.objects.filter(
                                    user_id=user_qset[user].user_id,
                                    seasonCalendar_id=season_calendarId,
                                    isPolPrediction = 1,
                                ).latest('id)').driver_id
                            else:
                                predicted_pole_prediction_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
                                    user_id=user_qset[user].user_id,
                                    seasonCalendar_id=season_calendarId,
                                    isPolPrediction = 1,
                                ).latest('id)').driver_id
                        else:
                            predicted_pole_prediction_driver_id = None
                            predicted_pole_prediction_driver_id = None
                    except:
                        predicted_pole_prediction_driver_id = None
                        predicted_pole_prediction_driver_id = None

                    try:
                        if r > 3 and now.year > 2021:
                            if r < next_race_round:
                                predicted_fastest_lap_prediction_driver_id = poleFastesLapPredictions.objects.filter(
                                    user_id=user_qset[user].user_id,
                                    seasonCalendar_id=season_calendarId,
                                    isPolPrediction = 1,
                                ).latest('id)').driver_id
                            else:
                                predicted_fastest_lap_prediction_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
                                    user_id=user_qset[user].user_id,
                                    seasonCalendar_id=season_calendarId,
                                    isPolPrediction = 1,
                                ).latest('id)').driver_id
                        else:
                            predicted_fastest_lap_prediction_driver_id = None
                            predicted_fastest_lap_prediction_driver_code = None
                    except:
                        predicted_fastest_lap_prediction_driver_id = None
                        predicted_fastest_lap_prediction_driver_code = None

                    if pole_result_driver_id == predicted_pole_prediction_driver_id:
                        pole_bonus_points = 1

                    if fastest_lap_result_driver_id == predicted_fastest_lap_prediction_driver_id:
                        fastest_lap_bonus_points = 1

                    data["userPoints"]['bonusPoints'][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef].append({
                        "poleLapDriverId": pole_result_driver_id,
                        "fastestLapDriverId": fastest_lap_result_driver_id,
                        "predictedFastestLapDriverId" : predicted_pole_prediction_driver_id,
                        "predictedFastestLapDriverCode" :  predicted_fastest_lap_prediction_driver_code,
                        "predictedPoleLapDriverId" : predicted_fastest_lap_prediction_driver_id,
                        'fastestLapPoints' : fastest_lap_bonus_points,
                        "poleLapPoints" : pole_bonus_points,
                    })

                    for driver in range(result_finishing_qset.count()):

                        if driver + 1 > num_drivers_on_leaderboard:
                            break 

                        singlePointFinishingHit = 0
                        singlePointPredictionHit = 0
                        
                        try:
                            result_driverId = user_finishing_qset[driver].driver_id

                            if r < next_race_round:
                                race_position = results.objects.get(
                                    year=now.year,
                                    seasonCalendar_id = season_calendarId,
                                    driver_id = result_driverId,
                                ).position
                            else:
                                race_position = manualResults.objects.get(
                                    year=now.year,
                                    seasonCalendar_id = season_calendarId,
                                    driver_id = result_driverId,
                                    paddock_id = pid,
                                ).position

                            result_driver_code = user_finishing_qset[driver].driver.code
                            
                            try:
                                singlePointFinishingHit = user_finishing_qset[driver].isFinishingSinglePoint
                            except:
                                singlePointPredictionHit = 0
                            try:
                                if driver + 1 <= num_drivers_on_leaderboard:
                                    singlePointPredictionHit = user_finishing_qset[driver].isPredictedSinglePoint
                                else:
                                    singlePointPredictionHit = 0
                            except:
                                singlePointPredictionHit = 0

                            prediction_points = user_prediction_qset[driver].pointsForPrediction

                            prediction_driver_position = user_prediction_qset[driver].predictedPosition

                            if user_prediction_qset[driver].subbedOutDriverCode == None:
                                prediction_driver_code = user_prediction_qset[driver].driver.code
                            else:
                                prediction_driver_code = user_prediction_qset[driver].subbedOutDriverCode
                            
                        except Exception as e:
                            exc_type, exc_obj, exc_tb = sys.exc_info()
                            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                            print(exc_type, fname, exc_tb.tb_lineno)
                            print("returning")
                            return
                        
                        try:    
                            driver_delta = 0
                            
                            delta_text = "~"
                            
                            driver_points = 0
                            
                            data["userPoints"][user_qset[user].user.username][seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].circuit.circuitRef].append({
                                'id' : result_driverId,
                                'racePosition' : race_position,
                                'positionPredictionDriverCode' : prediction_driver_code,
                                'predictedPosition' : prediction_driver_position,
                                'predictionPoints' : prediction_points,
                                'resultDriverId' : result_driverId,
                                'driverCode' : result_driver_code,
                                'driverPoints' : driver_points,
                                'driverDelta' : driver_delta,
                                'driverDeltaText' : delta_text,
                                'singlePointPredictionHit' : singlePointPredictionHit,
                                'singlePointFinishingHit' : singlePointFinishingHit,
                            })

                        except Exception as e:
                            exc_type, exc_obj, exc_tb = sys.exc_info()
                            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                            print(exc_type, fname, exc_tb.tb_lineno)
                            continue

            except Exception as e:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                continue

        fstring = str(os.path.join(cwd, "midfield-points.json"))
        f = open(os.path.join(cwd, "midfield-points.json"), "a")
        f.write(json.dumps(data))
        f.close()

        db_entry = jsonManualResultFileLocations(
            id=None, 
            isMidfieldGame=1,
            paddock_id=pid,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=last_completed_race,
                ).latest("id").id,
            fileLocation=fstring,
            )

        db_entry.save()

    file_location = jsonManualResultFileLocations.objects.filter(
        isMidfieldGame=1,
        paddock_id=pid,
        ).latest("id").fileLocation
    json_file = open(file_location, "r+")
    data = json.load(json_file)
    json_file.close()

    json_data = json.dumps(data)
    return json_data





