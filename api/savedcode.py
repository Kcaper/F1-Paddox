from webbrowser import get
from django.http.response import HttpResponse
from .models import *
from datetime import datetime
import random
import requests
import json
from pprint import pprint
import sys
import os
import shutil
from dateutil import parser

def createJsonFolderStructure(pad_id, race_round, result_type):

    cwd = '/Users/johnpapenfus/Google Drive/John/Coding Projects/F1/f1predictions/'
    season = str(now.year)
    r=str(race_round)

    if result_type == "ergast":
        try:
            if not os.path.exists(os.path.join(cwd, 'json-files','leaderboards','paddocks',pad_id,season,r)):
                os.makedirs(os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r)))

            cwd = os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r))
            os.chdir(cwd)
        except:
            pass
            return "error"

    elif result_type == "manual":
        try:
            if not os.path.exists(os.path.join(cwd, 'json-files','leaderboards','paddocks',pad_id,season,r, "manual")):
                os.makedirs(os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r, "manual")))

            cwd = os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r, "manual"))
            os.chdir(cwd)
        except:
            pass
            return "error"

    return cwd

def getPaddockLastCapturedRound(paddockId, prediction_type):
    
    try:
        if prediction_type == 'racely':

            last_captured_round = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=paddockPointsCaptureLog.objects.filter(
                    year=now.year,
                    paddock_id=paddockId,
                    isFeatureRaceMidfieldPoints=1,
                ).latest('seasonCalendar_id').seasonCalendar.raceRound
            ).latest('raceRound').raceRound

        elif prediction_type == 'drivers':

            last_captured_round = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=paddockPointsCaptureLog.objects.filter(
                    year=now.year,
                    paddock_id=paddockId,
                    isDriverStandingPoints=1,
                ).latest('seasonCalendar_id').seasonCalendar.raceRound
            ).latest('raceRound').raceRound

        elif prediction_type == 'combined':

            last_captured_round = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=paddockPointsCaptureLog.objects.filter(
                    year=now.year,
                    paddock_id=paddockId,
                    isConstructorStandingPoints=1,
                ).latest('seasonCalendar_id').seasonCalendar.raceRound
            ).latest('raceRound').raceRound

        elif prediction_type == 'constructors':

            last_captured_round = seasonCalendar.objects.filter(
                year=now.year,
                raceRound=paddockPointsCaptureLog.objects.filter(
                    year=now.year,
                    paddock_id=paddockId,
                    isCombinedStandingPoints=1,
                ).latest('seasonCalendar_id').seasonCalendar.raceRound
            ).latest('raceRound').raceRound
    except:
        last_captured_round=0

    return last_captured_round

def getPaddockRulesStartRound(paddockId, prediction_type):

    try:
        paddock_rules_id = paddocks.objects.get(
            year=now.year,
            id=paddockId
        ).paddockRules_id
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)
        return 1

    if prediction_type == "racely":
        racely_rule_start_round = paddockRulesStartRounds.objects.filter(
            year=now.year,
            paddockRules_id=paddock_rules_id,
            isRacelyRule=1,
        ).latest('id').startRound

    elif prediction_type == "drivers":
        racely_rule_start_round = paddockRulesStartRounds.objects.filter(
            year=now.year,
            paddockRules_id=paddock_rules_id,
            isPreSeasonDriverRule=1,
        ).latest('id').startRound

    elif prediction_type == "constructors":
        racely_rule_start_round = paddockRulesStartRounds.objects.filter(
            year=now.year,
            paddockRules_id=paddock_rules_id,
            isPreSeasonConstructorRule=1,
        ).latest('id').startRound

    print(racely_rule_start_round)
    return racely_rule_start_round

def deletePaddockLeaderboardDataByRound(pad_id, race_round):

    cwd = '/Users/johnpapenfus/Google Drive/John/Coding Projects/F1/f1predictions/'
    season = str(now.year)
    r=str(race_round)

    if not os.path.exists(os.path.join(cwd, 'json-files','leaderboards','paddocks',pad_id,season,r)):
        os.makedirs(os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r)))
        
    cwd = os.path.join(os.path.join(cwd, 'json-files', 'leaderboards', 'paddocks', pad_id, season, r))
    shutil.rmtree(cwd)

    return cwd

def getNextRaceRound():
    
    try:
        next_race_by_date = str(seasonCalendar.objects.get(year=now.year, raceRound = 1).featureRaceDate)
        race_datetime = parser.parse(next_race_by_date + " " + str(seasonCalendar.objects.get(year=now.year, raceRound = 1).featureRaceStartTime))
        temp_race_round = 1
    
        while datetime.today() > race_datetime:
            next_race_by_date = str(seasonCalendar.objects.get(year=now.year, raceRound = temp_race_round).featureRaceDate)
            race_datetime = parser.parse(next_race_by_date + " " + str(seasonCalendar.objects.get(year=now.year, raceRound = temp_race_round+1).featureRaceStartTime))
            next_race_round = temp_race_round
            temp_race_round = temp_race_round + 1

    except Exception as e:
        print(e)
        print("The season is over, see you next year!")
        return

    return(next_race_round)

#def getNextRaceRound():

    next_race_round = 1
    
    try:
        next_race_by_date = str(seasonCalendar.objects.filter(
            year=now.year,
            isComplete=0
        ).order_by('raceRound')[0].featureRaceDate)

        race_datetime = parser.parse(
            next_race_by_date + " " + str(seasonCalendar.objects.filter(
                year=now.year, isComplete=0
            ).order_by('raceRound')[0].featureRaceStartTime))

        while datetime.today() > race_datetime:

            next_race_by_date = str(seasonCalendar.objects.filter(
                year=now.year,
                isComplete=0,
                raceRound = next_race_round + 1
            ).order_by('raceRound')[0].featureRaceDate)

            race_datetime = parser.parse(
                next_race_by_date + " " + str(seasonCalendar.objects.filter(
                    year=now.year,
                    isComplete=0,
                    raceRound = next_race_round + 1
                ).order_by('raceRound')[0].featureRaceStartTime))

            next_race_round = next_race_round + 1

    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)
        print(next_race_by_date)
        print(race_datetime)
        print(next_race_round)
        next_race_round = seasonCalendar.objects.filter(year=now.year, isComplete=0).order_by('raceRound')[0].raceRound
        print(e)
        print("The season is over, see you next year!")
    print("THE NEXT RACE ROUND RETURNED IS " + str(next_race_round))
    return(next_race_round)

def createDefaultPredictions(uid):

    midfield_driver_id_list = []

    testVar = driverPredictions.objects.filter(user_id=uid).filter(isSeasonPrediction=1)
    if testVar.count()>0:
        pass       
    else:
        print("This user has no driver season prediction")

    testVar = driverPredictions.objects.filter(user_id=uid).filter(isFeatureRaceMidfield=1)
    if testVar.count()>0:
        pass
    else:
        print("This user has no midfield race prediction")

    testVar = driverPredictions.objects.filter(user_id=uid).filter(isSprintRacePrediction=1)
    if testVar.count()>0:
        pass
    else:
        print("This user has no sprint race prediction")
        
    testVar = constructorSeasonPredictions.objects.filter(user_id=uid)
    if testVar.count()>0:
        pass
    else:
        print("This user has no constructor season prediction")

def midfieldDeadline():
    now = datetime.now()
    
    next_race_round = getNextRaceRound()

    print("THE NEXT RACE ROUND IS " + str(next_race_round))
    
    next_race_id = seasonCalendar.objects.filter(year=now.year, raceRound=next_race_round)[0].id

    return next_race_id

def setupBetaUser(uid):

    if uid == None:
        return

    now=datetime.now()

    if now.year==2021 or now.year==2022:
        status_db_entry = userStatus(
            id=None,
            isBeta=1,
            user_id=uid,
            year=now.year,
            donationAmount=-10,
            hasDonated=1,
            )
        status_db_entry.save()

    countUserPaddocks(uid)

def getPaddockMaxPlayers(pid):
    paddock_creator_id = paddocks.objects.get(id=pid).createdBy_id
    userStatus = getUserStatus(paddock_creator_id)
    return(userStatus[0]['userPaddockMaxUsers'])

def createPaddockRules(uid, data):
    now=datetime.now()
    user_status_dict = getUserStatus(uid)
    old_paddock_name=False

    pprint(data)

    if paddocks.objects.filter(year=now.year, paddockName=data['paddockName']).count() > 0:
        paddock=paddocks.objects.filter(year=now.year, paddockName=data['paddockName'])
        paddock.update(
            createdBy_id=uid,
            isActive=1,
            numPlayers=1,
            paddockCode=getPaddockCode(),
            paddockUserStatusMaxUsers=user_status_dict[0]['userPaddockMaxUsers'],
        )
        old_paddock_name=True
    
    pre_season_driver_session_deadline = data['paddockRules']['preSeasonDriverSessionDeadline']
    pre_season_constructor_session_deadline = data['paddockRules']['preSeasonConstructorSessionDeadline']
    racely_session_deadline = data['paddockRules']['midfieldSessionDeadline']

    if pre_season_driver_session_deadline == "FP1":
        pre_season_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').fp1Date
        pre_season_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').fp1StartTime
    elif pre_season_driver_session_deadline == "FP2":
        pre_season_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').fp2Date
        pre_season_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').fp2StartTime
    elif pre_season_driver_session_deadline == "Q1/Sprint Race":
        pre_season_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').qualiDate
        pre_season_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').qualiStartTime
    elif pre_season_driver_session_deadline == "Feature Race":
        pre_season_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').featureRaceDate
        pre_season_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            year=now.year,
        ).latest('id').featureRaceStartTime
     
    if pre_season_constructor_session_deadline == "FP1":
        pre_season_constructor_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').fp1Date
        pre_season_constructor_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').fp1StartTime
    elif pre_season_constructor_session_deadline == "FP2":
        pre_season_constructor_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').fp2Date
        pre_season_constructor_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').fp2StartTime
    elif pre_season_constructor_session_deadline == "Q1/Sprint Race":
        pre_season_constructor_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').qualiDate
        pre_season_constructor_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').qualiStartTime
    elif pre_season_constructor_session_deadline == "Feature Race":
        pre_season_constructor_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').featureRaceDate
        pre_season_constructor_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            year=now.year,
        ).latest('id').featureRaceStartTime

    if racely_session_deadline == "FP1":
        racely_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').fp1Date
        racely_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').fp1StartTime
    elif racely_session_deadline == "FP2":
        racely_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').fp2Date
        racely_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').fp2StartTime
    elif racely_session_deadline == "Q1/Sprint Race":
        racely_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').qualiDate
        racely_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').qualiStartTime
    elif racely_session_deadline == "Feature Race":
        racely_driver_prediction_deadline_date = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').featureRaceDate
        racely_driver_deadline_time = seasonCalendar.objects.filter(
            raceRound=data['paddockRules']['midfieldStartRound'],
            year=now.year,
        ).latest('id').featureRaceStartTime

    paddock_rules=paddockRules(
        id=None,
        ruleSetName=data['paddockRules']['ruleSetName'],
        preSeasonDriverPredictionDeadlineDate = pre_season_driver_prediction_deadline_date,
        preSeasonDriverPredictionDeadlineTime = pre_season_driver_deadline_time,
        preSeasonConstructorPredictionDeadlineDate = pre_season_constructor_prediction_deadline_date,
        preSeasonConstructorPredictionDeadlineTime = pre_season_constructor_deadline_time,
        midfieldDriverPredictionStartDate = racely_driver_prediction_deadline_date,
        midfieldDriverPredictionDeadlineSession = racely_session_deadline,
        midfieldDriverPredictionDeadlineTime = racely_driver_deadline_time,
        preSeasonDriverStandingDeadlineSession = pre_season_driver_session_deadline,
        preSeasonConstructorStandingDeadlineSession = pre_season_constructor_session_deadline,
        numDriversOnPreSeasonLeaderboard = data['paddockRules']['numPreSeasonDrivers'],
        numConstructorsOnPreSeasonLeaderboard = data['paddockRules']['numPreSeasonConstructors'],
        numDriversOnMidfieldLeaderBoard = data['paddockRules']['numRacelyDrivers']
    )

    paddock_rules.save()

    paddock_rule_id=paddockRules.objects.all().latest('id').id

    if old_paddock_name == False:
        createNewPaddock(uid, data['paddockName'], paddock_rule_id, data['paddockRules']['paddockMaxPlayers'], data['isPublic'])
    else:
        paddock.update(paddockRules_id=paddock_rule_id)

    try:
        this_paddock_id = paddocks.objects.get(paddockName=data['paddockName']).id
        for i in range(0, len(data['excludedTeams']), 1):
            try:
                entry = paddockMidfieldExcludedTeams(
                    paddock_id = this_paddock_id,
                    constructor_id = data['excludedTeams'][i],
                    paddockRules_id = paddock_rule_id,
                )
                entry.save()
            except Exception as e:
                print(e)
                pass
            try:
                entry2 = ruleSetExcludedConstructors(
                    constructor_id = data['excludedTeams'][i],
                    paddockRule_id = paddock_rule_id,
                )
                entry2.save()
            except Exception as e:
                print(e)
                continue
            

        entry = paddockRulesStartRounds(
        year=now.year,
        isRacelyRule=1,
        startRound=data['paddockRules']['midfieldStartRound'],
        paddockRules_id=paddock_rule_id,
        seasonCalendar_id=seasonCalendar.objects.filter(
            year=now.year,
            raceRound=data['paddockRules']['midfieldStartRound'],
            ).latest('id').id
        )

        entry.save()

        entry = paddockRulesStartRounds(
        year=now.year,
        isPreSeasonDriverRule=1,
        paddockRules_id=paddock_rule_id,
        startRound=data['paddockRules']['preSeasonDriverStartRound'],
        seasonCalendar_id=seasonCalendar.objects.filter(
            year=now.year,
            raceRound=data['paddockRules']['preSeasonDriverStartRound'],
            ).latest('id').id
        )

        entry.save()

        entry = paddockRulesStartRounds(
        year=now.year,
        isPreSeasonConstructorRule=1,
        paddockRules_id=paddock_rule_id,
        startRound=data['paddockRules']['preSeasonConstructorStartRound'],
        seasonCalendar_id=seasonCalendar.objects.filter(
            year=now.year,
            raceRound=data['paddockRules']['preSeasonConstructorStartRound'],
            ).latest('id').id
        )

        entry.save()

        print("Paddock Start rounds Created")

        entry=paddockRules.objects.get(id=paddock_rule_id)
        entry.paddockRulesStartRounds_id=paddockRulesStartRounds.objects.all().latest('-id').id
        entry.save()

        print("Paddock Rule start round id included in paddock rule entry")

        addUserToPaddock(uid, data['paddockName'])

    except Exception as e:
        print("there was an error creating this paddock.")
        print(e)
        return

def createNewPaddock(uid, paddock_name, paddocks_rules_id, max_payers, is_public):
    now=datetime.now()
    new_paddock=paddocks(
        paddockRules_id=paddocks_rules_id,
        paddockName=paddock_name,
        createdBy_id=uid,
        paddockUserStatusMaxUsers = max_payers,
        paddockCode=getPaddockCode(),
        numPlayers = 1,
        year=now.year,
        isPublic = is_public,
    )
    new_paddock.save()

def addUserToPaddock(uid, paddock_name):
    print("ARE WE GETTING HERE")
    if uid == None:
        return("Error: Please login to create a paddock")

    paddockId=paddocks.objects.get(year=now.year, paddockName=paddock_name).id
    paddock = paddocks.objects.get(id=paddockId)
    numPaddockPlayers = userPaddocks.objects.filter(paddock_id=paddockId).count()
    max_paddock_players = paddocks.objects.get(id=paddockId).paddockUserStatusMaxUsers

    if userPaddocks.objects.filter(year=now.year, paddock_id=paddockId, user_id=uid).count() > 0:
        return "error: User already a member"

    if numPaddockPlayers == max_paddock_players:
        return "error: Paddock Player Limit"
    
    try:
        paddock_creator_status_dict = getUserStatus(paddocks.objects.filter(
            paddockName = paddock_name,
            year=now.year,
        ).latest('id').createdBy_id)

        if userPaddocks.objects.filter(
            paddock_id=paddockId
            ).count() >= paddock_creator_status_dict[0]["userPaddockMaxUsers"]:
            print("This paddock is full")
            return("error: error: Paddock Player Limit")
    except Exception as e:
        print(e)
        print("This paddock does not exist")
        return ("Error: This paddock does not exist")

    paddock_banned_user_qset = paddockBannedUsers.objects.filter(
        paddock_id=paddockId,
        bannedUser_id=uid
    )

    if paddock_banned_user_qset.count() > 0:
        print("This user is banned from this paddock")
        return("error: Banned")

    newPaddockRel=userPaddocks(id=None, user_id=uid, paddock_id=paddockId)
    newPaddockRel.save()
    paddock.numPlayers = userPaddocks.objects.filter(paddock_id=paddockId).count()
    paddock.save()
    userPastPaddockLeaderboardQset = leaderboards.objects.filter(
        user_id=uid,
        paddock_id=paddockId,
        isActive=0
    )
    if userPastPaddockLeaderboardQset.count()>0:
        userPastPaddockLeaderboardQset.update(isActive=1)

    entry = paddockManagementLog(
        year=now.year,
        action="Paddock Created",
        affectedUser_id=uid,
        executingUser_id=uid,
        paddock_id=paddockId,
    )
    entry.save()

    print("User paddock relationship succesfully created!")

    paddock_user_qset = userPaddocks.objects.filter(user_id=uid, paddock_id=paddockId)
    if numPaddockPlayers == 0:
        paddock_user_qset.update(
            isPaddockSuperAdmin = 1,
            isPaddockAdmin = 1
        )

        print("New Paddock Super Admin rights added")

    countUserPaddocks(uid)

    return "user added"

def removeUserFromPaddock(affectedUserId, pid, executingUserId):

    paddockId = pid
    paddock = paddocks.objects.get(id=paddockId)
    paddockRel=userPaddocks.objects.filter(user_id=affectedUserId, paddock_id=paddockId)
    paddockRel.delete()
    paddock.numPlayers = userPaddocks.objects.filter(paddock_id=paddockId).count()
    paddock.save()
    paddock_deleted = False

    if paddock.numPlayers == 0:
        paddock.isActive=0
        paddock_deleted = True
        paddock.save()
        paddock_ban_qset=paddockBannedUsers.objects.filter(paddock_id=pid)
        paddock_ban_qset.delete()
        if paddockRules.objects.filter(
            year=now.year,
            ruleSetName=paddocks.objects.get(
                id=paddockId
                ).paddockRules.ruleSetName).count() == 1:
            paddock_rule_entry=paddockRules.objects.filter(
            year=now.year,
            ruleSetName=paddocks.objects.get(
                id=paddockId
                ).paddockRules.ruleSetName)[0]
            
            start_rounds_qset=paddockRulesStartRounds.objects.filter(paddockRules_id=paddock_rule_entry.id)
            start_rounds_qset.delete()
            excluded_teams_qset = ruleSetExcludedConstructors.objects.filter(year=now.year, paddockRule_id=paddock_rule_entry.id)
            excluded_teams_qset.delete()
            paddock_midfield_excluded_teams_qset = paddockMidfieldExcludedTeams.objects.filter(year=now.year, paddockRule_id=paddock_rule_entry.id)
            paddock_midfield_excluded_teams_qset.delete()
            paddock_rule_entry.delete()
        
          
    else:
        leaderboard_qset = leaderboards.objects.filter(
            user_id=affectedUserId,
            paddock_id=paddockId,
            isActive=1)
        leaderboard_qset.update(isActive=0)
        if paddock.isPublic == 0:
            new_code = getPaddockCode()
            paddock.paddockCode = new_code
            paddock.save()
    

    if paddock_deleted == False:
        if executingUserId == affectedUserId:
            reason = "Removed by Self"
        else:
            if userPaddocks.objects.filter(
                user_id=executingUserId,
                paddock_id=pid
                ).latest('id').isPaddockAdmin == 1:
                if userPaddocks.objects.filter(
                    user_id=executingUserId,
                    paddock_id=pid
                    ).latest('id').isPaddockSuperAdmin == 1:
                    reason = "Removed by Super Admin"
                else:
                    reason = "Removed by Admin"
            else:
                reason = "Removed by unknown"

        log = paddockManagementLog(
            id=None,
            year=now.year,
            executingUser_id=executingUserId,
            affectedUser_id=affectedUserId,
            action = reason,
            paddock_id = pid,
            )
        log.save()

        print("paddock removal log captured!")

    countUserPaddocks(affectedUserId)
    countUserPaddocks(executingUserId)

    season_beginning = False

    try:
        last_race_round = seasonCalendar.objects.filter(year=now.year, isComplete=1).latest('id').raceRound
        deletePaddockLeaderboardDataByRound(pid, last_race_round)
        print("User paddock relationship succesfully deleted!")
    except:
        print("No Data to delete")

def banUserFromPaddock(affectedUserId, pid, executingUserId):

    paddockId = pid
    paddock = paddocks.objects.get(id=paddockId)
    paddockRel=userPaddocks.objects.filter(user_id=affectedUserId, paddock_id=paddockId)
    paddockRel.delete()
    paddock.numPlayers = userPaddocks.objects.filter(paddock_id=paddockId).count()
    paddock.save()
    paddock_deleted = False

    if paddock.numPlayers == 0:
        paddock.isActive=0
        paddock_deleted = True
        paddock.save()
        paddock_ban_qset=paddockBannedUsers.objects.filter(paddock_id=pid)
        paddock_ban_qset.delete()
        if paddockRules.objects.filter(
            year=now.year,
            ruleSetName=paddocks.objects.get(
                id=paddockId
                ).paddockRules.ruleSetName).count() == 1:
            paddock_rule_entry=paddockRules.objects.filter(
            year=now.year,
            ruleSetName=paddocks.objects.get(
                id=paddockId
                ).paddockRules.ruleSetName)[0]
            
            start_rounds_qset=paddockRulesStartRounds.objects.filter(paddockRules_id=paddock_rule_entry.id)
            start_rounds_qset.delete()
            excluded_teams_qset = ruleSetExcludedConstructors.objects.filter(year=now.year, paddockRule_id=paddock_rule_entry.id)
            excluded_teams_qset.delete()
            paddock_midfield_excluded_teams_qset = paddockMidfieldExcludedTeams.objects.filter(year=now.year, paddockRule_id=paddock_rule_entry.id)
            paddock_midfield_excluded_teams_qset.delete()
            paddock_rule_entry.delete()
          
    else:
        leaderboard_qset = leaderboards.objects.filter(
            user_id=affectedUserId,
            paddock_id=paddockId,
            isActive=1)
        leaderboard_qset.update(isActive=0)

    if paddock_deleted == False:
        if executingUserId == affectedUserId:
            reason = "banned by Self"
        else:
            if userPaddocks.objects.filter(
                user_id=executingUserId,
                paddock_id=pid
                ).latest('id').isPaddockAdmin == 1:
                if userPaddocks.objects.filter(
                    user_id=executingUserId,
                    paddock_id=pid
                    ).latest('id').isPaddockSuperAdmin == 1:
                    reason = "Banned by Super Admin"
                else:
                    reason = "banned by Admin"
            else:
                reason = "banned by unknown"

        log = paddockManagementLog(
            id=None,
            year=now.year,
            executingUser_id=executingUserId,
            affectedUser_id=affectedUserId,
            action = reason,
            paddock_id = pid,
            )
        log.save()

        print("paddock banned log captured!")

        entry = paddockBannedUsers(
            id=None,
            bannedUser_id=affectedUserId,
            paddock_id=pid,
        )

        entry.save()

        print(User.objects.get(id=affectedUserId).username + " has been BANNED from the " + paddocks.objects.get(id=pid).paddockName + " paddock by user, " + User.objects.get(id=executingUserId).username)

    countUserPaddocks(affectedUserId)
    countUserPaddocks(executingUserId)

    last_race_round = seasonCalendar.objects.filter(year=now.year, isComplete=1).latest('id').raceRound

    deletePaddockLeaderboardDataByRound(pid, last_race_round)

    print("User paddock relationship succesfully deleted!")

def getPaddockCode():
    code = ""
    numbers = ["1","2","3","4","5","6","7","8","9"]
    letters = ["H", "L", "R", "W", "Y", "Z"]
    options = [numbers, letters]
    while True:
        for i in range(0,6,1):
            chosen_list = random.choice(options)
            code = code + random.choice(chosen_list)
        try:
            paddocks.objects.get(paddockCode=code).id
            code=""
        except:
            break
    
    return code

def resetSubbedDrivers(season_calendarId):

    season_driver_qset = drivers.objects.filter(isIncludedInPredictions = 1)

    reserve_driver_qset = drivers.objects.filter(isIncludedInPredictions = 0)

    for s in range(season_driver_qset.count()):
        season_driver_entry = drivers.objects.filter(
            id=season_driver_qset[s].id,
        )
        season_driver_entry.update(
            subbedInFor_id=None,
            seatDrivenBy_id=season_driver_qset[s].id,
            isOnGrid=1,
        )

    for r in range(reserve_driver_qset.count()):
        reserve_driver_entry = drivers.objects.filter(
            id=reserve_driver_qset[r].id,
        )
        reserve_driver_entry.update(
            subbedInFor_id=None,
            seatDrivenBy_id=reserve_driver_qset[r].id,
            isOnGrid=1
        )

    sub_entries_to_delete = driverSeasonCalendarSubs.objects.filter(
        year=now.year,
        seasonCalendar_id = season_calendarId,
    )

    sub_entries_to_delete.delete()

    print("Deleted substitute entries for race " +str(seasonCalendar.objects.get(id=season_calendarId).circuit.circuitRef))

def addNewApiDriverToDB(api_result_list_item):

    driver_firstName = api_result_list_item["Driver"]["givenName"]
    driver_surname = api_result_list_item["Driver"]["familyName"]

    db_entry = drivers(
        number = api_result_list_item["Driver"]["permanentNumber"],
        code = api_result_list_item["Driver"]["code"],
        forename = api_result_list_item["Driver"]["givenName"],
        surname = api_result_list_item["Driver"]["familyName"],
        currentTeam_id = 12,
        nationality = api_result_list_item["Driver"]["nationality"],
        thumbImgLocation = './static/images/Drivers/' + driver_firstName + driver_surname + '.png',
        isOnGrid = 0,
        isIncludedInPredictions = 0,
    )

    db_entry.save()

    last_entry = drivers.objects.get(
        number = api_result_list_item["Driver"]["permanentNumber"]
    )
    
    last_entry.seatDrivenBy = drivers.objects.get(
        number = api_result_list_item["Driver"]["permanentNumber"]
    )
    last_entry.save()

    print("Created NEW DRIVER: " + driver_firstName + " " + driver_surname)

def substituteDrivers(season_calendarId, incoming_driverId, outgoing_driverId, is_permanent, is_inter_team_sub):

    try:
        entry_id = driverSeasonCalendarSubs.objects.get(
            seasonCalendar_id = season_calendarId,
            outgoingDriver_id = outgoing_driverId,
            incomingDriver_id = incoming_driverId,
        ).id
        save_type = " updated on "
    except Exception as e:
        print(e)
        print("error above")
        entry_id = None
        save_type = " saved on "

    incoming_driver_from_constructorId = drivers.objects.get(
        id=incoming_driverId
    ).currentTeam_id

    outgoing_driver_from_constructorId = drivers.objects.get(
        id=outgoing_driverId
    ).currentTeam_id

    outgoing_driver_to_constructorId = None
    if is_inter_team_sub == 1:
        outgoing_driver_to_constructorId = incoming_driver_from_constructorId

    db_entry = driverSeasonCalendarSubs(
        id = entry_id,
        seasonCalendar_id = season_calendarId,
        outgoingDriver_id = outgoing_driverId,
        incomingDriver_id = incoming_driverId,
        isPermanentSub = is_permanent,
        isInterTeamSub = is_inter_team_sub,
        incomingDriverFromConstructor_id = incoming_driver_from_constructorId,
        incomingDriverToConstructor_id = outgoing_driver_from_constructorId,
        outgoingDriverFromConstructor_id = outgoing_driver_from_constructorId,
        outgoingDriverToConstructor_id = outgoing_driver_to_constructorId,
    )
    db_entry.save()

    outgoing_driver_db_entry = drivers.objects.get(id=outgoing_driverId)
    incoming_driver_db_entry = drivers.objects.get(id=incoming_driverId)

    if incoming_driver_db_entry.isIncludedInPredictions == 1:
        incoming_driver_db_entry.seatDrivenBy_id = incoming_driverId

    elif incoming_driver_db_entry.isIncludedInPredictions == 0:
        
        incoming_driver_db_entry.seatDrivenBy_id = incoming_driverId
        incoming_driver_db_entry.subbedInFor_id = outgoing_driverId

    if is_inter_team_sub == 1:
        incoming_driver_db_entry.subbedInFor_id = outgoing_driverId

    incoming_driver_db_entry.isOnGrid = 1
    outgoing_driver_db_entry.isOnGrid = 0

    outgoing_driver_db_entry.seatDrivenBy_id = incoming_driverId

    outgoing_driver_db_entry.save()
    incoming_driver_db_entry.save()

    print("Substituted ")

def checkForInterTeamSubstitutes(results_list, season_calendarId):
    for res in range(len(results_list)):
        
        constructorId = constructorApiNameConverstions.objects.get(
            apiName=results_list[res]["Constructor"]['name']
        ).constructor_id

        driverId = drivers.objects.get(
            number = results_list[res]['Driver']['permanentNumber']
        ).id

        driver_entry = drivers.objects.get(
            id=driverId
        )
        
        #not sure hw this is workging but hey

        try:
            if driver_entry.currentTeam_id == constructorId or driver_entry.subbedInFor.currentTeam_id == constructorId and driver_entry.subbedInFor.currentTeam_id != None:
                continue
        except Exception as e:
            print(e)
            print("problem here")

        print(results_list[res])
        constructor_drivers_qset_list = drivers.objects.filter(
            currentTeam_id = constructorId,
            isOnGrid=1,
        ).values_list("id", flat=True)

        constructor_drivers_qset = drivers.objects.filter(
            currentTeam_id = constructorId,
            isOnGrid=1,
        )

        driver_id_found_list = []

        for result in range(len(results_list)):
            
            if constructorApiNameConverstions.objects.get(
                apiName=results_list[result]["Constructor"]['name']
            ).constructor_id != constructorId:
                continue

            result_driverId = drivers.objects.get(
                number = results_list[result]['Driver']['permanentNumber']
            ).id

            print(results_list[result]["Constructor"]['name'])

            driver_id_found_list.append(
                result_driverId
            )

        print(driver_id_found_list)

        unfound_driver_list = constructor_drivers_qset.exclude(
            id__in=driver_id_found_list,
        ).values_list('id', flat=True)

        for i in range(len(unfound_driver_list)):
            outgoing_driverId = unfound_driver_list[i]
            incoming_driverId = driverId

            if len(unfound_driver_list) > 0:
                print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!FOUND INTER TEAM SUB")
                substituteDrivers(season_calendarId, incoming_driverId, outgoing_driverId, 0, 1)      

def sortSubstitutes(results_list, season_calendarId):

    season_constructors_qset = constructors.objects.filter(isOnGrid = 1, isIncludedInPredictions=1)

    for c in range(season_constructors_qset.count()):

        constructor_drivers_total_id_list = []
        constructor_drivers_in_race_id_list = []

        constructor_driver_qset = drivers.objects.filter(
            currentTeam_id = season_constructors_qset[c].id
        )

        for driver in range(constructor_driver_qset.count()):
            constructor_drivers_total_id_list.append(constructor_driver_qset[driver].id)

        for i in range(len(results_list)):
                
            result_contsructorId = constructorApiNameConverstions.objects.get(
                apiName=results_list[i]["Constructor"]['name']
            ).constructor_id

            if result_contsructorId == season_constructors_qset[c].id:
                
                try:
                    constructor_driver_id = drivers.objects.get(
                        number=results_list[i]['Driver']['permanentNumber']
                    ).id
                except:
                    addNewApiDriverToDB(results_list[i])
                    constructor_driver_id = drivers.objects.get(
                        number=results_list[i]['Driver']['permanentNumber']
                    ).id

                constructor_drivers_in_race_id_list.append(constructor_driver_id)
                
                if constructor_driver_id not in (constructor_drivers_total_id_list):
                    constructor_drivers_total_id_list.append(constructor_driver_id)

            else:
                continue

        set1 = set(constructor_drivers_total_id_list)
        set2 = set(constructor_drivers_in_race_id_list)

        substituted_out_driver_id_list = list(sorted(set1 - set2))

        is_inter_team_sub = 0
        if len(substituted_out_driver_id_list) > 0:
            if len(substituted_out_driver_id_list) == 1:
                try:
                    incoming_driverId = drivers.objects.get(
                        isIncludedInPredictions = 0,
                        id__in=constructor_drivers_total_id_list,
                    ).id
                except:
                    continue
                substituteDrivers(season_calendarId, incoming_driverId, substituted_out_driver_id_list[0], 0, is_inter_team_sub)
            elif len(substituted_out_driver_id_list) == 2:
                print(substituted_out_driver_id_list)
                for d in range(len(substituted_out_driver_id_list)):
                    outgoing_driverId = substituted_out_driver_id_list[d]
                    incoming_driverId = constructor_drivers_in_race_id_list[d]
                    substituteDrivers(season_calendarId, incoming_driverId, outgoing_driverId, 0, is_inter_team_sub)

def getRaceResults(race_round):

    def captureResults(race_round):

        #if race_round not in [1,2]:
        #    return

        next_race_round = getNextRaceRound()
        season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = race_round).id
        resetSubbedDrivers(season_calendarId)

        try:
            check_if_captured = ergastRequestLog.objects.filter(year=now.year).filter(isFeatureRaceMidfieldPoints=1).filter(raceRound=race_round).filter(status="Captured").filter(seasonCalendar=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round).id)[0].id
            print("Race results for round " + str(r) + " have already been captured!")
            return
        except:
            print("Results for round " + str(race_round) + " have not yet been captured")
        
        try:  
            result = requests.get('https://ergast.com/api/f1/current/' + str(race_round) + '/results.json')
        except:
            print("The API is not responding")
            ergast_log = ergastRequestLog(id=None, year=now.year, status="Timed out",
            isFeatureRaceResultRequest=1, raceRound = race_round)
            ergast_log.save()
            return ("results pending")
            
        try:
            ergast_log_qset = ergastRequestLog.objects.filter(year=now.year).filter(status="Capture pending").filter(raceRound=race_round).filter(isFeatureRaceResultRequest=1)
            try_test = ergast_log_qset[0].id
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            ergast_log = ergastRequestLog(id=None, year=now.year, status="Capture pending",
            isFeatureRaceResultRequest=1, raceRound = race_round)
            ergast_log.save()
            ergast_log_qset = ergastRequestLog.objects.filter(year=now.year).filter(status="Capture pending").filter(raceRound=race_round).filter(isFeatureRaceResultRequest=1)
        
        data = json.loads(result.text)
        race_round = int(data["MRData"]["RaceTable"]["Races"][0]['round'])
        season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound=race_round).id
        race_date_string = data["MRData"]["RaceTable"]["Races"][0]["date"]
        race_date = datetime.strptime(race_date_string, '%Y-%m-%d').date()
        raceResults = data["MRData"]["RaceTable"]["Races"][0]["Results"]

        if len(raceResults)>0:

            sortSubstitutes(raceResults, season_calendarId)
            checkForInterTeamSubstitutes(raceResults, season_calendarId)

            for i in range(0,len(raceResults),1):
                is_pole_sitter = 0
                has_fastest_lap = 0

                instance = raceResults[i]['Driver']
                driverId = drivers.objects.get(number=instance['permanentNumber']).id
                
                if int(raceResults[i]['grid']) == 1:
                    is_pole_sitter = 1

                try:
                    #if race_round == 4 and now.year == 2022 and drivers.objects.get(cdoe="VER").code == "VER":
                    #    has_fastest_lap = 1
                    if int(raceResults[i]['FastestLap']['rank']) == 1:
                        has_fastest_lap = 1
                except:
                    has_fastest_lap = 0

                driverNumber = drivers.objects.get(id=driverId).number
                seasonCalendarId = seasonCalendar.objects.get(year=now.year, raceRound=race_round).id

                if driverSeasonCalendarSubs.objects.filter(
                    seasonCalendar_id = season_calendarId,
                    incomingDriver_id = driverId,
                ).count() > 0:

                    print(driverSeasonCalendarSubs.objects.filter(
                        seasonCalendar_id = season_calendarId,
                        incomingDriver_id = driverId,
                    ).values_list())

                    constructorId = driverSeasonCalendarSubs.objects.get(
                        seasonCalendar_id = season_calendarId,
                        incomingDriver_id = driverId,
                    ).incomingDriverToConstructor_id
                    
                else:
                    constructorId = drivers.objects.get(id=driverId).currentTeam_id

                try:
                    raceTime = instance["Time"]["time"]
                except:
                    raceTime = "unclassified"

                try:
                    fastest_lap = instance["FastestLap"]['lap']
                except:
                    fastest_lap = 0

                try:
                    fastest_lap_time = instance["FastestLap"]["Time"]['time']
                except:
                    fastest_lap_time = "unclassified"

                try:
                    print()
                    previousResultId = results.objects.filter(driver_id=driverId).filter(seasonCalendar_id=seasonCalendarId)[0].id
                    id_to_post = previousResultId
                    save_type = "updated on"
                    
                except:
                    id_to_post = None
                    save_type = "saved to"

                instance = raceResults[i]
            
                db_entry = results(
                    id=id_to_post,
                    number=driverNumber,
                    grid=instance['grid'],
                    position=instance["position"],
                    positionText=instance["positionText"],
                    points=instance['points'],
                    laps=instance["laps"],
                    time=raceTime,
                    fastestLap=fastest_lap,
                    fastestLapTime=fastest_lap_time,
                    status=instance['status'],
                    driver_id=driverId,
                    seasonCalendar_id=season_calendarId,
                    constructor_id=constructorId,
                    hasFastestLap=has_fastest_lap,
                    isPoleSitter=is_pole_sitter,
                )
                db_entry.save()
                print(drivers.objects.get(id=driverId).code + " result in position: " + str(i+1) + ", " + save_type + " the Database!")

    print("Trying to capture results for round " + str(race_round))
    if captureResults(race_round) == "results pending":
        return("results pending")

    #except Exception as e:
        #exc_type, exc_obj, exc_tb = sys.exc_info()
        #fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        #print(exc_type, fname, exc_tb.tb_lineno)
        #print("Results for round " + str(races_to_capture_list[r]) + ", have not yet been realeased on Ergast")
        #print("The next race is the " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=races_to_capture_list[r])[0].circuit.circuitRef) + " grand prix, on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=races_to_capture_list[r])[0].featureRaceDate))

    print("All result are up to date! The next race is the " + str(seasonCalendar.objects.filter(year=now.year).filter(isComplete=0).order_by('raceRound')[0].circuit.circuitRef) + " grand prix, on " + str(seasonCalendar.objects.filter(year=now.year).filter(isComplete=0).order_by('raceRound')[0].featureRaceDate))
    print("")
        
def getDriverStandings():

    now = datetime.now()

    def updatePointsTable(race_round):
        try:
            after_race_standings = requests.get('https://ergast.com/api/f1/current/' + str(race_round) + '/driverStandings.json')
            data = json.loads(after_race_standings.text)
        except:
            print('The Ergast API is not responding when fetching the driver standings after round ' + str(race_round))
            ergast_log = ergastRequestLog(id=None, status="Timed out", isDriverStandingRequest=1, raceRound=race_round,
            seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
            ergast_log.save()
            return
        
        try:
            ergast_qset = ergastRequestLog.objects.filter(status="Captured").filter(isDriverStandingRequest=1).filter(raceRound=race_round).filter(seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    
            if ergast_qset.count() == 0:
                ergast_log = ergastRequestLog(id=None, status="Capture pending", isDriverStandingRequest=1, raceRound=race_round,
                seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
                ergast_log.save()
            else:
                ergast_qset.update(status="Capture pending")

        except:
            pass
    
        try:
            sorted_constructors_by_points_list = data["MRData"]["StandingsTable"]["StandingsLists"][0]['DriverStandings']
        except:
            print("The results for the round: " + str(race_round) + ", have not been released on the Ergast API")
            return

        for p in range(0,len(sorted_constructors_by_points_list),1):
            instance = sorted_constructors_by_points_list[p]
            if drivers.objects.get(number=instance["Driver"]["permanentNumber"]).id == 23:
                driverId = 11
            else:
                driverId = drivers.objects.get(number=instance["Driver"]["permanentNumber"]).id
            seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

            try:
                check = driverStandings.objects.filter(driver_id=driverId).filter(year=now.year).filter(seasonCalendar_id=seasonCalendarId)[0]
                save_type = "Updated"
                id_type = check.id
            except:
                save_type = "Saved"
                id_type = None

            db_entry = driverStandings(id=id_type, points=instance['points'], position=instance["position"],
            positionText=instance['positionText'], wins=instance['wins'], driver_id=driverId,
            seasonCalendar_id=seasonCalendarId, year=now.year)
            db_entry.save()

            print(save_type + " driver standing of " + str(drivers.objects.get(id=driverId).code) + " after the " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].circuit_id).circuitRef) + " grand prix")

        print("Updating ergast Log")

        ergast_qset = ergastRequestLog.objects.filter(status="Capture pending").filter(isDriverStandingRequest=1).filter(raceRound=race_round).filter(seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        ergast_qset.update(status="Captured", completedDate=now.date())

        print("Ergast Log updated")
        print("Creating record of driver standing capture")

        update_calendar = seasonCalendar.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        update_calendar.driverStandingsCaptured=1
        update_calendar.save()

        paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isDriverStandingPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        paddock_points_round_qset.delete()

        print("Capture record created!")
        print("All results for " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].circuit_id).circuitRef) + " saved to the database")

    #Code Starts here
    now=datetime.now()
    num_drivers = drivers.objects.filter(isOnGrid=1).count()

    races_to_capture_list = []

    try:
        last_captured_race_round = seasonCalendar.objects.filter(year=now.year).filter(driverStandingsCaptured=1).latest('raceRound').raceRound
        for m in range(0, last_captured_race_round, 1):
            try:
                captured_results_qset = driverStandings.objects.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=m+1)[0].id)
                if captured_results_qset.count() < num_drivers:
                    races_to_capture_list.append(m+1)
            except Exception as e:
                races_to_capture_list.append(m+1)
    except:
        races_to_capture_list.append(1)

    try:
        race_round_qset = seasonCalendar.objects.filter(driverStandingsCaptured=0).filter(year=now.year).order_by('raceRound')
        if race_round_qset.count() > 0:
            for c in range(0,race_round_qset.count(),1):
                if now.date() >= race_round_qset[c].featureRaceDate:
                    if race_round_qset[c].raceRound not in races_to_capture_list:
                        races_to_capture_list.append(race_round_qset[c].raceRound)
                else:
                    if len(races_to_capture_list) > 0:
                        continue
                    else:
                        break
            
            for r in range(0,len(races_to_capture_list), 1):
                print('Updating drivers table for the ' + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=races_to_capture_list[r])[0].circuit_id).circuitRef + " grand prix")
                updatePointsTable(races_to_capture_list[r])
                
            print("All outstanding driver standing positions have been captured!")
            print("The next race is at " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(driverStandingsCaptured=0).order_by('featureRaceDate')[0].circuit_id).circuitRef) + ", starts on " + str(seasonCalendar.objects.filter(year=now.year).filter(driverStandingsCaptured=0).order_by('featureRaceDate')[0].featureRaceDate))
            print("")
            
        else:
            print("The next race to capture is on: " + str(seasonCalendar.objects.filter(year=now.year).filter(driverStandingsCaptured=0).order_by('raceRound')[0].featureRaceStartDate))
            print("")
    except Exception as e:
        print(e)   

def getConstructorStandings():
    now = datetime.now()

    def updatePointsTable(race_round):
        try:
            after_race_standings = requests.get('https://ergast.com/api/f1/current/' + str(race_round) + '/constructorStandings.json')
            data = json.loads(after_race_standings.text)
        except:
            print('The Ergast API is not responding when fetching the constructor standings after round ' + str(race_round))
            ergast_log = ergastRequestLog(id=None, status="Timed out", isConstructoStandingRequest=1, raceRound=race_round,
            seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
            ergast_log.save()
            return
        
        try:
            ergast_qset = ergastRequestLog.objects.filter(status="Captured").filter(isConstructoStandingRequest=1).filter(raceRound=race_round).filter(seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    
            if ergast_qset.count() == 0:
                ergast_log = ergastRequestLog(id=None, status="Capture pending", isConstructoStandingRequest=1, raceRound=race_round,
                seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
                ergast_log.save()
            else:
                ergast_qset.update(status="Capture pending")

        except:
            pass
    
        try:
            sorted_constructors_by_points_list = data["MRData"]["StandingsTable"]["StandingsLists"][0]['ConstructorStandings']
        except:
            print("The constructor standings for the round: " + str(race_round) + ", have not been released on the Ergast API")
            return

        for p in range(0,len(sorted_constructors_by_points_list),1):
            instance = sorted_constructors_by_points_list[p]
            constructorId = constructorApiNameConverstions.objects.get(apiName=instance["Constructor"]["name"]).constructor_id
            seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

            try:
                check = constructorStandings.objects.filter(constructor_id=constructorId).filter(year=now.year).filter(seasonCalendar_id=seasonCalendarId)[0]
                save_type = "Updated"
                id_type = check.id
            except:
                save_type = "Saved"
                id_type = None

            db_entry = constructorStandings(id=id_type, points=instance['points'], position=instance["position"],
            positionText=instance['positionText'], wins=instance['wins'], constructor_id=constructorId,
            seasonCalendar_id=seasonCalendarId, year=now.year)
            db_entry.save()

            print(save_type + " constructor standing of " + str(constructors.objects.get(id=constructorId).name) + " after the " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].circuit_id).circuitRef) + " grand prix")

        print("Updating ergast Log")

        ergast_qset = ergastRequestLog.objects.filter(status="Capture pending").filter(isConstructorStandingRequest=1).filter(raceRound=race_round).filter(seasonCalendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        ergast_qset.update(status="Captured", completedDate=now.date())

        print("Ergast Log updated")
        print("Creating record of constructor standing capture")

        update_calendar = seasonCalendar.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        update_calendar.constructorStandingsCaptured=1
        update_calendar.save()

        paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isConstructorStandingPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
        paddock_points_round_qset.delete()

        print("Capture record created!")
        print("All results for " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].circuit_id).circuitRef) + " saved to the database")

    #Code Starts here
    now=datetime.now()
    num_constructors = constructors.objects.filter(isOnGrid=1).count()

    races_to_capture_list = []
    

    try:
        last_captured_race_round = seasonCalendar.objects.filter(year=now.year).filter(constructorStandingsCaptured=1).latest('raceRound').raceRound
        for m in range(0, last_captured_race_round, 1):
            try:
                captured_results_qset = constructorStandings.objects.filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=m+1)[0].id)
                if captured_results_qset.count() < num_constructors:
                    races_to_capture_list.append(m+1)
            except Exception as e:
                races_to_capture_list.append(m+1)
    except:
         races_to_capture_list.append(1)

    try:
        race_round_qset = seasonCalendar.objects.filter(constructorStandingsCaptured=0).filter(year=now.year).order_by('raceRound')
        if race_round_qset.count() > 0:
            for c in range(0,race_round_qset.count(),1):
                if now.date() >= race_round_qset[c].featureRaceDate:
                    if race_round_qset[c].raceRound not in races_to_capture_list:
                        races_to_capture_list.append(race_round_qset[c].raceRound)
                else:
                    if len(races_to_capture_list) > 0:
                        continue
                    else:
                        break
            
            for r in range(0,len(races_to_capture_list), 1):
                print('Updating constructors table for the ' + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=races_to_capture_list[r])[0].circuit_id).circuitRef + " grand prix")
                updatePointsTable(races_to_capture_list[r])
                
            print("All outstanding constructor standing positions have been captured!")
            print("The next race is at " + str(circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(constructorStandingsCaptured=0).order_by('featureRaceDate')[0].circuit_id).circuitRef) + ", on " + str(seasonCalendar.objects.filter(year=now.year).filter(constructorStandingsCaptured=0).order_by('featureRaceDate')[0].featureRaceDate))
            print("")
            
        else:
            print("The next race to capture is on: " + str(seasonCalendar.objects.filter(year=now.year).filter(constructorStandingsCaptured=0).order_by('raceRound')[0].featureRaceStartDate))
            print("")
    except Exception as e:
        print(e)

def getPredictionPointsBySystem(paddock_RulesId, outBy, prediction_type):
    
    if prediction_type == "racely":
        points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isRacelyPredictionSystem=1,
        )
        if points_system_qset.count() == 0:
            #createing default points racely system for paddock
            db_entry1=predictionPointsSystems(
                predictionOutBy=0,
                pointsForPrediction=2,
                isRacelyPredictionSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry2=predictionPointsSystems(
                predictionOutBy=1,
                pointsForPrediction=1,
                isRacelyPredictionSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry1.save()
            db_entry2.save()
            points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isRacelyPredictionSystem=1,
        )

        print(outBy)
          
        try:
            return points_system_qset.get(predictionOutBy=outBy).pointsForPrediction
        except:
            return 0

    elif prediction_type == "preSeasonDrivers":
        points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isPreSeasonDriverSystem=1,
        )
        if points_system_qset.count() == 0:
            #createing default points racely system for paddock
            db_entry1=predictionPointsSystems(
                predictionOutBy=0,
                pointsForPrediction=2,
                isPreSeasonDriverSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry2=predictionPointsSystems(
                predictionOutBy=1,
                pointsForPrediction=1,
                isPreSeasonDriverSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry1.save()
            db_entry2.save()
            points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isPreSeasonDriverSystem=1,
            )
            
        try:
            return points_system_qset.get(predictionOutBy=outBy).pointsForPrediction
        except:
            return 0

    elif prediction_type == "midSeasonDrivers":
        points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isMidSeasonDriverSystem=1,
        )
        if points_system_qset.count() == 0:
            #createing default points racely system for paddock
            db_entry1=predictionPointsSystems(
                predictionOutBy=0,
                pointsForPrediction=2,
                isMidSeasonDriverSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry2=predictionPointsSystems(
                predictionOutBy=1,
                pointsForPrediction=1,
                isMidSeasonDriverSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry1.save()
            db_entry2.save()
            points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isMidSeasonDriverSystem=1,
        )  
        try:
            return points_system_qset.get(predictionOutBy=outBy).pointsForPrediction
        except:
            return 0

    elif prediction_type == "preSeasonConstructors":
        points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isPreSeasonConstructorsSystem=1,
        )
        if points_system_qset.count() == 0:
            #createing default points racely system for paddock
            db_entry1=predictionPointsSystems(
                predictionOutBy=0,
                pointsForPrediction=2,
                isPreSeasonConstructorsSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry2=predictionPointsSystems(
                predictionOutBy=1,
                pointsForPrediction=1,
                isPreSeasonConstructorsSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry1.save()
            db_entry2.save()
            points_system_qset = predictionPointsSystems.objects.filter(
                paddockRules_id=paddock_RulesId,
                isPreSeasonConstructorsSystem=1,
            )
        try:
            return points_system_qset.get(predictionOutBy=outBy).pointsForPrediction
        except:
            return 0

    elif prediction_type == "midSeasonConstructors":
        points_system_qset = predictionPointsSystems.objects.filter(
            paddockRules_id=paddock_RulesId,
            isMidSeasonConstructorsSystem=1,
        )
        if points_system_qset.count() == 0:
            #createing default points racely system for paddock
            db_entry1=predictionPointsSystems(
                predictionOutBy=0,
                pointsForPrediction=2,
                isMidSeasonConstructorsSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry2=predictionPointsSystems(
                predictionOutBy=1,
                pointsForPrediction=1,
                isMidSeasonConstructorsSystem=1,
                paddockRules_id=paddock_RulesId,
            )
            db_entry1.save()
            db_entry2.save()
            points_system_qset = predictionPointsSystems.objects.filter(
                paddockRules_id=paddock_RulesId,
                isMidSeasonConstructorsSystem=1,
            )
        try:
            return points_system_qset.get(predictionOutBy=outBy).pointsForPrediction
        except:
            return 0

def getUserUnsubbedRacelyPredictionIdList(paddockId, race_round, userId, is_manual):

    season_calendarId = seasonCalendar.objects.get(year = now.year, raceRound = race_round).id

    prediction = driverPredictions.objects.filter(
        isFeatureRaceMidfield = 1,
        user_id = userId,
        calendar_id = season_calendarId
    ).latest('id')

    initial_predicted_position_dict={}
    initial_predicted_position_dict['positions'] = []
    initial_predicted_position_dict['positions'].append({"1":prediction.position1_id, "predicted_position": 1})
    initial_predicted_position_dict['positions'].append({"2":prediction.position2_id, "predicted_position": 2})
    initial_predicted_position_dict['positions'].append({"3":prediction.position3_id, "predicted_position": 3})
    initial_predicted_position_dict['positions'].append({"4":prediction.position4_id, "predicted_position": 4})
    initial_predicted_position_dict['positions'].append({"5":prediction.position5_id, "predicted_position": 5})
    initial_predicted_position_dict['positions'].append({"6":prediction.position6_id, "predicted_position": 6})
    initial_predicted_position_dict['positions'].append({"7":prediction.position7_id, "predicted_position": 7})
    initial_predicted_position_dict['positions'].append({"8":prediction.position8_id, "predicted_position": 8})
    initial_predicted_position_dict['positions'].append({"9":prediction.position9_id, "predicted_position": 9})
    initial_predicted_position_dict['positions'].append({"10":prediction.position10_id, "predicted_position": 10})
    initial_predicted_position_dict['positions'].append({"11":prediction.position11_id, "predicted_position": 11})
    initial_predicted_position_dict['positions'].append({"12":prediction.position12_id, "predicted_position": 12})
    initial_predicted_position_dict['positions'].append({"13":prediction.position13_id, "predicted_position": 13})
    initial_predicted_position_dict['positions'].append({"14":prediction.position14_id, "predicted_position": 14})
    initial_predicted_position_dict['positions'].append({"15":prediction.position15_id, "predicted_position": 15})
    initial_predicted_position_dict['positions'].append({"16":prediction.position16_id, "predicted_position": 16})
    initial_predicted_position_dict['positions'].append({"17":prediction.position17_id, "predicted_position": 17})
    initial_predicted_position_dict['positions'].append({"18":prediction.position18_id, "predicted_position": 18})
    initial_predicted_position_dict['positions'].append({"19":prediction.position19_id, "predicted_position": 19})
    initial_predicted_position_dict['positions'].append({"20":prediction.position20_id, "predicted_position": 20})
    #initial_predicted_position_dict['positions'].append({"21":prediction.position21.seatDrivenBy.id, "predicted_position": 21})
    #initial_predicted_position_dict['positions'].append({"22":prediction.position22.seatDrivenBy.id, "predicted_position": 22})
    initial_predicted_position_list = initial_predicted_position_dict['positions']

    driver_id_list = []

    if is_manual == 0:
        for i in range(len(initial_predicted_position_list)):
            driver_id_list.append(initial_predicted_position_list[i][str(i+1)])

    elif is_manual == 1:
        for i in range(len(initial_predicted_position_list)):

            converted_driverId = paddockDrivers.objects.get(
                paddock_id=paddockId,
                code = drivers.objects.get(
                    id = initial_predicted_position_list[i][str(i+1)]
                ).code
            ).id
            driver_id_list.append(converted_driverId)

    return driver_id_list

def convertPrediction(paddockId, predictionId, userId, season_calendarId, prediction_object, prediction_type):

    if prediction_type == "racely":
        for i in range(len(prediction_object)):
            if prediction_object[i][str(i+1)] == None:
                continue
            
            try:
                entry_id = leaderboardSingleLinePredictions.objects.get(
                    driver_id = prediction_object[i][str(i+1)],
                    user_id = userId,
                    seasonCalendar_id = season_calendarId,
                    driverPrediction_id = predictionId,
                    predictedPosition = i+1,
                    isRacelyPrediction = 1,
                    paddock_id = paddockId,
                ).id
                entry_type = " updated on "
            except:
                entry_id = None
                entry_type = " saved on "

            db_entry = leaderboardSingleLinePredictions(
                id = entry_id,
                driver_id = prediction_object[i][str(i+1)],
                user_id = userId,
                seasonCalendar_id = season_calendarId,
                driverPrediction_id = predictionId,
                predictedPosition = i+1,
                isRacelyPrediction = 1,
                paddock_id = paddockId,
            )
            db_entry.save()

def setRaceRoundToComplete(race_round):
    completed_race = seasonCalendar.objects.get(
        raceRound=race_round,
        year=now.year
    )
    completed_race.isComplete = 1
    completed_race.constructorStandingsCaptured = 0
    completed_race.driverStandingsCaptured = 0
    completed_race.midfieldLeaderboardUpdated = 0
    completed_race.driverStandingsLeaderboardUpdated = 0
    completed_race.constructorStandingsLeaderboardUpdated = 0
    completed_race.combinedStandingsLeaderboardUpdated = 0

    completed_race.save()

    midfield_paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isFeatureRaceMidfieldPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    driver_paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isFeatureRaceMidfieldPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    constructor_paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isFeatureRaceMidfieldPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    combined_paddock_points_round_qset = paddockPointsCaptureLog.objects.filter(year=now.year).filter(isFeatureRaceMidfieldPoints=1).filter(seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
    combined_paddock_points_round_qset.delete()
    midfield_paddock_points_round_qset.delete()
    driver_paddock_points_round_qset.delete()
    constructor_paddock_points_round_qset.delete()

'''def captureMidfeildPredictionPoints(uid, r, paddockId):

    paddock_rules_id = paddocks.objects.get(id=paddockId).paddockRules_id
    num_drivers = paddockRules.objects.get(id=paddock_rules_id).numDriversOnMidfieldLeaderBoard
    season_calendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id

    #####Pole and Fastest lap prediction Points
    
    user_fast_lap_driver_id = 0
    user_pole_lap_driver_id = 0
    pole_lap_points = 0
    fastest_lap_points = 0

    if now.year > 2021 and r > 3:
        try:
            user_fast_lap_driver_id = poleFastesLapPredictions.objects.filter(
                user_id = uid,
                year=now.year,
                seasonCalendar_id = season_calendar_id,
                isFastestLapPrediction=1
            ).latest('id').driver_id
        except:
            db_entry = poleFastesLapPredictions(
                user_id = uid,
                year=now.year,
                seasonCalendar_id = season_calendar_id,
                isFastestLapPrediction=1,
                driver_id = None,
            )
            db_entry.save()

        try:
            user_pole_lap_driver_id = poleFastesLapPredictions.objects.filter(
                user_id = uid,
                year=now.year,
                seasonCalendar_id = season_calendar_id,
                isPolePrediction=1
            ).latest('id').driver_id
        except:
            db_entry = poleFastesLapPredictions(
                user_id = uid,
                year=now.year,
                seasonCalendar_id = season_calendar_id,
                isPolePrediction=1,
                driver_id=None,
            )
            db_entry.save()
        
        result_fastest_lap_driver_id = results.objects.filter(
            seasonCalendar_id = season_calendar_id,
            hasFastestLap=1,
        ).latest('id').driver_id

        result_pole_sitter_driver_id = results.objects.filter(
            seasonCalendar_id = season_calendar_id,
            isPoleSitter=1
        ).latest('id').driver_id

        if result_fastest_lap_driver_id == user_fast_lap_driver_id and user_fast_lap_driver_id != None:
            fastest_lap_points = 1
        
        if result_pole_sitter_driver_id == user_pole_lap_driver_id and user_fast_lap_driver_id != None:
            pole_lap_points = 1

        try:
            db_entry_id = predictionPoints.objects.filter(
                seasonCalendar_id=season_calendar_id,
                isFastestLapPoint = 1,
                user_id=uid,
            ).latest('id').id
            save_type = " updated on "
        except:
            db_entry_id = None
            save_type = " saved on "

        db_entry1 = predictionPoints(
            id=db_entry_id,
            driver_id=user_fast_lap_driver_id,
            seasonCalendar_id=season_calendar_id,
            isFastestLapPoint = 1,
            user_id=uid,
            pointsForPrediction = fastest_lap_points,
        )

        db_entry1.save()

        try:
            db_entry_id = predictionPoints.objects.filter(
                seasonCalendar_id=season_calendar_id,
                isPoleSitterPoint = 1,
                user_id=uid,
            ).latest('id').id
            save_type = " updated on "
        except:
            db_entry_id = None
            save_type = " saved on "

        db_entry2 = predictionPoints(
            id=db_entry_id,
            driver_id=user_pole_lap_driver_id,
            seasonCalendar_id=season_calendar_id,
            isPoleSitterPoint = 1,
            user_id=uid,
            pointsForPrediction = pole_lap_points,
        )

        db_entry2.save()

    ######

    excluded_constructors_list = ruleSetExcludedConstructors.objects.filter(
        paddockRule_id=paddock_rules_id,
        year=now.year,
    ).values_list('constructor_id', flat=True)

    excluded_driver_list = []

    on_grid_driver_qset = drivers.objects.filter(
        isOnGrid = 1
    )

    for i in range(on_grid_driver_qset.count()):
        
        if on_grid_driver_qset[i].subbedInFor_id != None:
            if on_grid_driver_qset[i].subbedInFor.currentTeam_id in excluded_constructors_list:
                excluded_driver_list.append(on_grid_driver_qset[i].id)

        else:
            if on_grid_driver_qset[i].currentTeam_id in excluded_constructors_list:
                excluded_driver_list.append(on_grid_driver_qset[i].id)

    try:
        prediction_id = driverPredictions.objects.filter(
            year=now.year,
            isFeatureRaceMidfield=1,
            user_id=uid,
            calendar_id=season_calendar_id
        ).latest('id').id

    except:
        print("User: " + str(uid) + " has no midfield predictions")
        return
    
    try:
        test = results.objects.filter(year=now.year).filter(seasonCalendar_id = season_calendar_id)[0].id
        print("There are outstanding points to be awarded for round: " + str(r) + " user: " + str(uid))
    except:
        print("Whilst user: " + str(uid) + " has made a prediction for round: " + str(r) + ". The results for round " + str(r) + " have not yet been released by Ergast API")
        return

    prediction = driverPredictions.objects.get(id=prediction_id)
    
    initial_predicted_position_dict={}
    initial_predicted_position_dict['positions'] = []
    initial_predicted_position_dict['positions'].append({"1":prediction.position1.seatDrivenBy.id, "predicted_position": 1})
    initial_predicted_position_dict['positions'].append({"2":prediction.position2.seatDrivenBy.id, "predicted_position": 2})
    initial_predicted_position_dict['positions'].append({"3":prediction.position3.seatDrivenBy.id, "predicted_position": 3})
    initial_predicted_position_dict['positions'].append({"4":prediction.position4.seatDrivenBy.id, "predicted_position": 4})
    initial_predicted_position_dict['positions'].append({"5":prediction.position5.seatDrivenBy.id, "predicted_position": 5})
    initial_predicted_position_dict['positions'].append({"6":prediction.position6.seatDrivenBy.id, "predicted_position": 6})
    initial_predicted_position_dict['positions'].append({"7":prediction.position7.seatDrivenBy.id, "predicted_position": 7})
    initial_predicted_position_dict['positions'].append({"8":prediction.position8.seatDrivenBy.id, "predicted_position": 8})
    initial_predicted_position_dict['positions'].append({"9":prediction.position9.seatDrivenBy.id, "predicted_position": 9})
    initial_predicted_position_dict['positions'].append({"10":prediction.position10.seatDrivenBy.id, "predicted_position": 10})
    initial_predicted_position_dict['positions'].append({"11":prediction.position11.seatDrivenBy.id, "predicted_position": 11})
    initial_predicted_position_dict['positions'].append({"12":prediction.position12.seatDrivenBy.id, "predicted_position": 12})
    initial_predicted_position_dict['positions'].append({"13":prediction.position13.seatDrivenBy.id, "predicted_position": 13})
    initial_predicted_position_dict['positions'].append({"14":prediction.position14.seatDrivenBy.id, "predicted_position": 14})
    initial_predicted_position_dict['positions'].append({"15":prediction.position15.seatDrivenBy.id, "predicted_position": 15})
    initial_predicted_position_dict['positions'].append({"16":prediction.position16.seatDrivenBy.id, "predicted_position": 16})
    initial_predicted_position_dict['positions'].append({"17":prediction.position17.seatDrivenBy.id, "predicted_position": 17})
    initial_predicted_position_dict['positions'].append({"18":prediction.position18.seatDrivenBy.id, "predicted_position": 18})
    initial_predicted_position_dict['positions'].append({"19":prediction.position19.seatDrivenBy.id, "predicted_position": 19})
    initial_predicted_position_dict['positions'].append({"20":prediction.position20.seatDrivenBy.id, "predicted_position": 20})
    #initial_predicted_position_dict['positions'].append({"21":prediction.position21.seatDrivenBy.id, "predicted_position": 21})
    #initial_predicted_position_dict['positions'].append({"22":prediction.position22.seatDrivenBy.id, "predicted_position": 22})
    initial_predicted_position_list = initial_predicted_position_dict['positions']

    #convertPrediction(paddockId, prediction.id, uid, season_calendar_id, initial_predicted_position_list, "racely")
    initial_position = 1
    for i in range(len(initial_predicted_position_list)):
        if initial_predicted_position_list[i][str(i+1)] == None:
            continue
        if initial_predicted_position_list[i][str(i+1)] not in excluded_driver_list:
            try:
                db_id = leaderboardSingleLinePredictions.objects.get(
                    seasonCalendar_id = season_calendar_id,
                    user_id = uid,
                    paddock_id = paddockId,
                    driverPrediction_id = prediction.id,
                    isRacelyPrediction = 1,
                    driver_id = initial_predicted_position_list[i][str(i+1)],
                ).id
                save_type = " updated on "
            except:
                db_id = None
                save_type = " saved on "

            db_entry = leaderboardSingleLinePredictions(
                id = db_id,
                seasonCalendar_id = season_calendar_id,
                user_id = uid,
                paddock_id = paddockId,
                driverPrediction_id = prediction.id,
                isRacelyPrediction = 1,
                driver_id = initial_predicted_position_list[i][str(i+1)],
                predictedPosition = initial_position,
            )

            db_entry.save()
            initial_position = initial_position + 1

        else:
            continue

    updated_leaderboard_qset = leaderboardSingleLinePredictions.objects.filter(
        seasonCalendar_id = season_calendar_id,
        user_id = uid,
        paddock_id = paddockId,
        driverPrediction_id = prediction.id,
        isRacelyPrediction = 1,
    ).order_by('predictedPosition')

    results_qset = results.objects.filter(
        seasonCalendar_id = season_calendar_id,
        year = now.year,
    ).order_by('position')
    
    finishing_position = 0
    for res in range(results_qset.count()):
        
        driverId = results_qset[res].driver_id

        subbed_in_for_driver_code = None

        user_prediction_id_list = getUserUnsubbedRacelyPredictionIdList(paddockId, r, uid)

        if driverId not in user_prediction_id_list:
            if drivers.objects.get(
                id=driverId
            ).subbedInFor_id != None:
                subbed_in_for_driver_code = drivers.objects.get(
                id=driverId
            ).subbedInFor.code
        
        if driverId in excluded_driver_list:
            continue
        else:
            finishing_position = finishing_position + 1
        
        driver_predicted_position = updated_leaderboard_qset.get(
            driver_id = driverId
        ).predictedPosition 

        if finishing_position == driver_predicted_position:
            prediction_points = 2
        elif finishing_position - driver_predicted_position == -1 or finishing_position - driver_predicted_position == 1:
            prediction_points = 1
        else:
            prediction_points = 0

        if finishing_position == num_drivers and driver_predicted_position < finishing_position:
            prediction_points = 0

        if finishing_position > num_drivers:
            prediction_points = 0

        try:
            db_entry_id = predictionPoints.objects.get(
                driver_id = driverId,
                seasonCalendar_id = season_calendar_id,
                user_id = uid,
                isFeatureRaceMidfieldPrediction = 1,
                driverPrediction_id = prediction.id,
                paddock_id = paddockId,
            ).id
            save_type = "updated on "
        except:
            db_entry_id = None
            save_type = " saved on "

        db_entry = predictionPoints(
            id = db_entry_id,
            predictedPosition = driver_predicted_position,
            finishingPosition = finishing_position,
            pointsForPrediction = prediction_points,
            driver_id = driverId,
            seasonCalendar_id = season_calendar_id,
            user_id = uid,
            isFeatureRaceMidfieldPrediction = 1,
            driverPrediction_id = prediction.id,
            paddock_id = paddockId,
            subbedOutDriverCode = subbed_in_for_driver_code,
        )

        db_entry.save()

    prediction_points_qset = predictionPoints.objects.filter(
        seasonCalendar_id = season_calendar_id,
        user_id = uid,
        isFeatureRaceMidfieldPrediction = 1,
        driverPrediction_id = prediction.id,
        paddock_id = paddockId,
    ).order_by('finishingPosition')

    for pred in range(prediction_points_qset.count()):
        try:
            is_finishing_single_point = 0
            is_predicted_single_point = 0
            instance = prediction_points_qset[pred]
            if pred == 0:
                forward_looking_pred = prediction_points_qset[pred+1]
                if forward_looking_pred.finishingPosition == instance.predictedPosition:
                    is_finishing_single_point = 1
                if forward_looking_pred.predictedPosition == instance.finishingPosition:
                    is_predicted_single_point = 1

            elif pred + 1 == num_drivers:
                backward_looking_pred = prediction_points_qset[pred-1]
                if backward_looking_pred.predictedPosition == instance.finishingPosition:
                    is_finishing_single_point = 1
                if  backward_looking_pred.finishingPosition == instance.predictedPosition:
                    is_predicted_single_point = 1

            elif pred + 1 < num_drivers:
                forward_looking_pred = prediction_points_qset[pred+1]
                backward_looking_pred = prediction_points_qset[pred-1]
                if backward_looking_pred.predictedPosition == instance.finishingPosition:
                    is_finishing_single_point = 1
                if  backward_looking_pred.finishingPosition == instance.predictedPosition:
                    is_predicted_single_point = 1
                if forward_looking_pred.finishingPosition == instance.predictedPosition:
                    is_finishing_single_point = 1
                if forward_looking_pred.predictedPosition == instance.finishingPosition:
                    is_predicted_single_point = 1

            instance.isPredictedSinglePoint = is_predicted_single_point
            instance.isFinishingSinglePoint = is_finishing_single_point
            instance.save()
        except:
            continue'''

def updateMidfieldPredictionPoints(race_round, paddockId):

    def captureMidfeildPredictionPoints(uid, r, paddockId):

        paddock_rules_id = paddocks.objects.get(id=paddockId).paddockRules_id
        num_drivers = paddockRules.objects.get(id=paddock_rules_id).numDriversOnMidfieldLeaderBoard
        season_calendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id

        #####Pole and Fastest lap prediction Points
        
        user_fast_lap_driver_id = 1
        user_pole_lap_driver_id = 1
        pole_lap_points = 0
        fastest_lap_points = 0

        if now.year > 2021 and r > 3:
            try:
                user_fast_lap_driver_id = poleFastesLapPredictions.objects.filter(
                    user_id = uid,
                    year=now.year,
                    seasonCalendar_id = season_calendar_id,
                    isFastestLapPrediction=1
                ).latest('id').driver_id
            except:
                user_fast_lap_driver_id = None
                

            try:
                user_pole_lap_driver_id = poleFastesLapPredictions.objects.filter(
                    user_id = uid,
                    year=now.year,
                    seasonCalendar_id = season_calendar_id,
                    isPolePrediction=1
                ).latest('id').driver_id
            
            except:
                user_pole_lap_driver_id = None
            
            result_fastest_lap_driver_id = results.objects.filter(
                seasonCalendar_id = season_calendar_id,
                hasFastestLap=1,
            ).latest('id').driver_id

            result_pole_sitter_driver_id = results.objects.filter(
                seasonCalendar_id = season_calendar_id,
                isPoleSitter=1
            ).latest('id').driver_id

            if result_fastest_lap_driver_id == user_fast_lap_driver_id and user_fast_lap_driver_id != None:
                fastest_lap_points = 1
            
            if result_pole_sitter_driver_id == user_pole_lap_driver_id and user_fast_lap_driver_id != None:
                pole_lap_points = 1

            try:
                db_entry_id = predictionPoints.objects.filter(
                    seasonCalendar_id=season_calendar_id,
                    isFastestLapPoint = 1,
                    user_id=uid,
                ).latest('id').id
                save_type = " updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry1 = predictionPoints(
                id=db_entry_id,
                driver_id=user_fast_lap_driver_id,
                seasonCalendar_id=season_calendar_id,
                isFastestLapPoint = 1,
                user_id=uid,
                pointsForPrediction = fastest_lap_points,
            )

            db_entry1.save()

            print("fastest lap  error")


            try:
                db_entry_id = predictionPoints.objects.filter(
                    seasonCalendar_id=season_calendar_id,
                    isPoleSitterPoint = 1,
                    user_id=uid,
                ).latest('id').id
                save_type = " updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry2 = predictionPoints(
                id=db_entry_id,
                driver_id=user_pole_lap_driver_id,
                seasonCalendar_id=season_calendar_id,
                isPoleSitterPoint = 1,
                user_id=uid,
                pointsForPrediction = pole_lap_points,
            )

            db_entry2.save()

        ######

        excluded_constructors_list = ruleSetExcludedConstructors.objects.filter(
            paddockRule_id=paddock_rules_id,
            year=now.year,
        ).values_list('constructor_id', flat=True)

        excluded_driver_list = []

        on_grid_driver_qset = drivers.objects.filter(
            isOnGrid = 1
        )

        for i in range(on_grid_driver_qset.count()):
            
            if on_grid_driver_qset[i].subbedInFor_id != None:
                if on_grid_driver_qset[i].subbedInFor.currentTeam_id in excluded_constructors_list:
                    excluded_driver_list.append(on_grid_driver_qset[i].id)

            else:
                if on_grid_driver_qset[i].currentTeam_id in excluded_constructors_list:
                    excluded_driver_list.append(on_grid_driver_qset[i].id)

        try:
            prediction_id = driverPredictions.objects.filter(
                year=now.year,
                isFeatureRaceMidfield=1,
                user_id=uid,
                calendar_id=season_calendar_id
            ).latest('id').id

        except:
            print("User: " + str(uid) + " has no midfield predictions")
            return
        
        try:
            test = results.objects.filter(year=now.year).filter(seasonCalendar_id = season_calendar_id)[0].id
            print("There are outstanding points to be awarded for round: " + str(r) + " user: " + str(uid))
        except:
            print("Whilst user: " + str(uid) + " has made a prediction for round: " + str(r) + ". The results for round " + str(r) + " have not yet been released by Ergast API")
            return

        prediction = driverPredictions.objects.get(id=prediction_id)
        
        initial_predicted_position_dict={}
        initial_predicted_position_dict['positions'] = []
        initial_predicted_position_dict['positions'].append({"1":prediction.position1.seatDrivenBy.id, "predicted_position": 1})
        initial_predicted_position_dict['positions'].append({"2":prediction.position2.seatDrivenBy.id, "predicted_position": 2})
        initial_predicted_position_dict['positions'].append({"3":prediction.position3.seatDrivenBy.id, "predicted_position": 3})
        initial_predicted_position_dict['positions'].append({"4":prediction.position4.seatDrivenBy.id, "predicted_position": 4})
        initial_predicted_position_dict['positions'].append({"5":prediction.position5.seatDrivenBy.id, "predicted_position": 5})
        initial_predicted_position_dict['positions'].append({"6":prediction.position6.seatDrivenBy.id, "predicted_position": 6})
        initial_predicted_position_dict['positions'].append({"7":prediction.position7.seatDrivenBy.id, "predicted_position": 7})
        initial_predicted_position_dict['positions'].append({"8":prediction.position8.seatDrivenBy.id, "predicted_position": 8})
        initial_predicted_position_dict['positions'].append({"9":prediction.position9.seatDrivenBy.id, "predicted_position": 9})
        initial_predicted_position_dict['positions'].append({"10":prediction.position10.seatDrivenBy.id, "predicted_position": 10})
        initial_predicted_position_dict['positions'].append({"11":prediction.position11.seatDrivenBy.id, "predicted_position": 11})
        initial_predicted_position_dict['positions'].append({"12":prediction.position12.seatDrivenBy.id, "predicted_position": 12})
        initial_predicted_position_dict['positions'].append({"13":prediction.position13.seatDrivenBy.id, "predicted_position": 13})
        initial_predicted_position_dict['positions'].append({"14":prediction.position14.seatDrivenBy.id, "predicted_position": 14})
        initial_predicted_position_dict['positions'].append({"15":prediction.position15.seatDrivenBy.id, "predicted_position": 15})
        initial_predicted_position_dict['positions'].append({"16":prediction.position16.seatDrivenBy.id, "predicted_position": 16})
        initial_predicted_position_dict['positions'].append({"17":prediction.position17.seatDrivenBy.id, "predicted_position": 17})
        initial_predicted_position_dict['positions'].append({"18":prediction.position18.seatDrivenBy.id, "predicted_position": 18})
        initial_predicted_position_dict['positions'].append({"19":prediction.position19.seatDrivenBy.id, "predicted_position": 19})
        initial_predicted_position_dict['positions'].append({"20":prediction.position20.seatDrivenBy.id, "predicted_position": 20})
        #initial_predicted_position_dict['positions'].append({"21":prediction.position21.seatDrivenBy.id, "predicted_position": 21})
        #initial_predicted_position_dict['positions'].append({"22":prediction.position22.seatDrivenBy.id, "predicted_position": 22})
        initial_predicted_position_list = initial_predicted_position_dict['positions']

        #convertPrediction(paddockId, prediction.id, uid, season_calendar_id, initial_predicted_position_list, "racely")
        initial_position = 1
        for i in range(len(initial_predicted_position_list)):
            if initial_predicted_position_list[i][str(i+1)] == None:
                continue
            if initial_predicted_position_list[i][str(i+1)] not in excluded_driver_list:
                try:
                    db_id = leaderboardSingleLinePredictions.objects.get(
                        seasonCalendar_id = season_calendar_id,
                        user_id = uid,
                        paddock_id = paddockId,
                        driverPrediction_id = prediction.id,
                        isRacelyPrediction = 1,
                        driver_id = initial_predicted_position_list[i][str(i+1)],
                    ).id
                    save_type = " updated on "
                except:
                    db_id = None
                    save_type = " saved on "

                db_entry = leaderboardSingleLinePredictions(
                    id = db_id,
                    seasonCalendar_id = season_calendar_id,
                    user_id = uid,
                    paddock_id = paddockId,
                    driverPrediction_id = prediction.id,
                    isRacelyPrediction = 1,
                    driver_id = initial_predicted_position_list[i][str(i+1)],
                    predictedPosition = initial_position,
                )

                db_entry.save()
                initial_position = initial_position + 1

            else:
                continue

        updated_leaderboard_qset = leaderboardSingleLinePredictions.objects.filter(
            seasonCalendar_id = season_calendar_id,
            user_id = uid,
            paddock_id = paddockId,
            driverPrediction_id = prediction.id,
            isRacelyPrediction = 1,
        ).order_by('predictedPosition')

        results_qset = results.objects.filter(
            seasonCalendar_id = season_calendar_id,
            year = now.year,
        ).order_by('position')
        
        finishing_position = 0
        for res in range(results_qset.count()):
            
            driverId = results_qset[res].driver_id

            subbed_in_for_driver_code = None

            user_prediction_id_list = getUserUnsubbedRacelyPredictionIdList(paddockId, r, uid, 0)

            if driverId not in user_prediction_id_list:
                if drivers.objects.get(
                    id=driverId
                ).subbedInFor_id != None:
                    subbed_in_for_driver_code = drivers.objects.get(
                    id=driverId
                ).subbedInFor.code
            
            if driverId in excluded_driver_list:
                continue
            else:
                finishing_position = finishing_position + 1
            
            driver_predicted_position = updated_leaderboard_qset.get(
                driver_id = driverId
            ).predictedPosition 

            if finishing_position == driver_predicted_position:
                prediction_points = 2
            elif finishing_position - driver_predicted_position == -1:
                prediction_points = 1
            elif finishing_position - driver_predicted_position == 1:
                prediction_points = 1
            else:
                prediction_points = 0

            try:
                db_entry_id = predictionPoints.objects.get(
                    driver_id = driverId,
                    seasonCalendar_id = season_calendar_id,
                    user_id = uid,
                    isFeatureRaceMidfieldPrediction = 1,
                    driverPrediction_id = prediction.id,
                    paddock_id = paddockId,
                ).id
                save_type = "updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry = predictionPoints(
                id = db_entry_id,
                predictedPosition = driver_predicted_position,
                finishingPosition = finishing_position,
                pointsForPrediction = prediction_points,
                driver_id = driverId,
                seasonCalendar_id = season_calendar_id,
                user_id = uid,
                isFeatureRaceMidfieldPrediction = 1,
                driverPrediction_id = prediction.id,
                paddock_id = paddockId,
                subbedOutDriverCode = subbed_in_for_driver_code,
            )

            db_entry.save()

        prediction_points_qset = predictionPoints.objects.filter(
            seasonCalendar_id = season_calendar_id,
            user_id = uid,
            isFeatureRaceMidfieldPrediction = 1,
            driverPrediction_id = prediction.id,
            paddock_id = paddockId,
        ).order_by('finishingPosition')

        for pred in range(prediction_points_qset.count()):

            instance = prediction_points_qset[pred]

            try:
                forward_looking_entry = prediction_points_qset[pred + 1]
                try:
                    if forward_looking_entry.predictedPosition == prediction_points_qset[pred].finishingPosition:
                        instance.isPredictedSinglePoint = 1
                        instance.pointsForPrediction = 1
                        forward_looking_entry.isFinishingSinglePoint = 1
                        forward_looking_entry.pointsForPrediction = 0
                except:
                    print("")
                try:
                    if forward_looking_entry.finishingPosition == prediction_points_qset[pred].predictedPosition and instance.predictedPosition <= num_drivers:
                        instance.isFinishingSinglePoint = 1
                        instance.pointsForPrediction = 0
                        forward_looking_entry.pointsForPrediction = 1
                        forward_looking_entry.isPredictedSinglePoint = 1
                except:
                    print("")
                if instance.isFinishingSinglePoint == 1 and instance.isPredictedSinglePoint == 1:
                    instance.pointsForPrediction = 1
            except:
                print("")

            if instance.finishingPosition >= num_drivers and pred + 1 == num_drivers:
                instance.isPredictedSinglePoint = 0
                instance.pointsForPrediction = 0
            if pred + 1 > num_drivers:
                instance.pointsForPrediction = 0

            instance.save()
            forward_looking_entry.save()

        next_prediction = prediction

        this_season_calendar_round = seasonCalendar.objects.get(
            id = season_calendar_id
        ).raceRound

        next_season_caledarId = seasonCalendar.objects.get(
            year=now.year,
            raceRound = this_season_calendar_round + 1
        ).id

        try:
            next_prediction_id = driverPredictions.objects.filter(
                user_id = uid,
                calendar_id = next_season_caledarId,
                isFeatureRaceMidfield = 1,
            ).latest('id').id

        except:
            try:
                print(next_season_caledarId)
                print(paddockId)
                print(next_prediction.id)
                
                next_prediction.id = None
                next_prediction.calendar_id = next_season_caledarId
                next_prediction.user_id = uid,
                next_prediction.save()
            except:
                pass

    #code starts here.
    user_qset = driverPredictions.objects.filter(year=now.year).filter(isFeatureRaceMidfield=1)

    print("Generating midfield points for users in paddock: " + str(paddocks.objects.get(id=paddockId).paddockName))

    user_qset = userPaddocks.objects.filter(paddock_id=paddockId)
    
    for u in range(0, user_qset.count(), 1):
        print("Generating midfield points for user " + str(user_qset[u].user_id))
        captureMidfeildPredictionPoints(user_qset[u].user_id, race_round, paddockId)

        try:
            predicted_qset = predictionPoints.objects.filter(
            user_id = user_qset[u].user.id,
            isFeatureRaceMidfieldPrediction = 1,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=race_round)[0].id,
                paddock_id = paddockId,
            ).order_by('finishingPosition')

            predicted_qset.update(isFinishingSinglePoint=0, isPredictedSinglePoint=0)
        except:
            user_id = user_qset[u].user.id,
            print("ERROR CAPTURING RACELY DRIVER PREDICITON POINTS FOR USER: " + User.objects.get(id=user_id).username)
            continue
        
        for pred in range(0, predicted_qset.count(),1):
            try:
                user_id = predicted_qset[pred].user_id
                if predicted_qset[pred].pointsForPrediction == 1:
                    finishing_record_id = predicted_qset[pred].id
                    predicted_record_id = predicted_qset.get(
                    finishingPosition=predicted_qset.get(
                    id=finishing_record_id).predictedPosition).id

                    predicted = predicted_qset.get(id=finishing_record_id)
                    finishing = predicted_qset.get(id=predicted_record_id)

                    finishing.isPredictedSinglePoint = 1
                    predicted.isFinishingSinglePoint = 1
                    predicted.save()
                    finishing.save()

            except Exception as e:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                continue

            capture_save = paddockPointsCaptureLog(
                id=None, 
                year=now.year, 
                isFeatureRaceMidfieldPoints=1,
                paddock_id=paddockId,
                seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
            capture_save.save()
            print("Round: " + str(race_round) + "'s midfield points have been saved to the database for all users in the " + str(paddocks.objects.get(id=paddockId).paddockName) + " paddock")

    else:
        next_race_round = getNextRaceRound()
        print("Paddock: " + str(paddocks.objects.get(id=paddockId).paddockName) + "'s midfeild points for round: " + str(next_race_round - 1) + " are up to date")
        print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
        print("")
                             
def updateDriverStandingPredictionPoints():

    def getUserDriverStandingPoints(uid, race_round, paddockId):

        now = datetime.now()
        num_drivers = drivers.objects.filter(isOnGrid=1).count()
        raceCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

        try:
            prediction = driverPredictions.objects.filter(user_id=uid, isMidSeasonPrediction=0).filter(year=now.year).filter(isSeasonPrediction=1).latest('id')
        except:
            print("User: " + str(uid) + " does not have a driver standing prediction")
            return

        gp_name = circuits.objects.get(id=seasonCalendar.objects.get(id=raceCalendarId).circuit_id).circuitRef

        predicted_position_dict={}
        predicted_position_dict['positions'] = {}
        predicted_position_dict['positions']["1"]= {"driverId": prediction.position1_id}
        predicted_position_dict['positions'][prediction.position1_id]= 1
        predicted_position_dict['positions']["2"]= {"driverId": prediction.position2_id}
        predicted_position_dict['positions'][prediction.position2_id]= 2 
        predicted_position_dict['positions']["3"]= {"driverId": prediction.position3_id}
        predicted_position_dict['positions'][prediction.position3_id]= 3 
        predicted_position_dict['positions']["4"]= {"driverId": prediction.position4_id}
        predicted_position_dict['positions'][prediction.position4_id]= 4 
        predicted_position_dict['positions']["5"]= {"driverId": prediction.position5_id}
        predicted_position_dict['positions'][prediction.position5_id]= 5 
        predicted_position_dict['positions']["6"]= {"driverId": prediction.position6_id}
        predicted_position_dict['positions'][prediction.position6_id]= 6 
        predicted_position_dict['positions']["7"]= {"driverId": prediction.position7_id}
        predicted_position_dict['positions'][prediction.position7_id]= 7 
        predicted_position_dict['positions']["8"]= {"driverId": prediction.position8_id}
        predicted_position_dict['positions'][prediction.position8_id]= 8 
        predicted_position_dict['positions']["9"]= {"driverId": prediction.position9_id}
        predicted_position_dict['positions'][prediction.position9_id]= 9 
        predicted_position_dict['positions']["10"]= {"driverId": prediction.position10_id}
        predicted_position_dict['positions'][prediction.position10_id]= 10 
        predicted_position_dict['positions']["11"]= {"driverId": prediction.position11_id}
        predicted_position_dict['positions'][prediction.position11_id]= 11 
        predicted_position_dict['positions']["12"]= {"driverId": prediction.position12_id}
        predicted_position_dict['positions'][prediction.position12_id]= 12
        predicted_position_dict['positions']["13"]= {"driverId": prediction.position13_id}
        predicted_position_dict['positions'][prediction.position13_id]= 13 
        predicted_position_dict['positions']["14"]= {"driverId": prediction.position14_id}
        predicted_position_dict['positions'][prediction.position14_id]= 14 
        predicted_position_dict['positions']["15"]= {"driverId": prediction.position15_id}
        predicted_position_dict['positions'][prediction.position15_id]= 15 
        predicted_position_dict['positions']["16"]= {"driverId": prediction.position16_id}
        predicted_position_dict['positions'][prediction.position16_id]= 16 
        predicted_position_dict['positions']["17"]= {"driverId": prediction.position17_id}
        predicted_position_dict['positions'][prediction.position17_id]= 17
        predicted_position_dict['positions']["18"]= {"driverId": prediction.position18_id}
        predicted_position_dict['positions'][prediction.position18_id]= 18 
        predicted_position_dict['positions']["19"]= {"driverId": prediction.position19_id}
        predicted_position_dict['positions'][prediction.position19_id]= 19 
        predicted_position_dict['positions']["20"]= {"driverId": prediction.position20_id}
        predicted_position_dict['positions'][prediction.position20_id]= 20

        driver_position_qset = driverStandings.objects.filter(
            seasonCalendar_id = raceCalendarId,
            year=now.year
        ).order_by('position')

        next_round_single_point_prediction_hit = 0
        
        for i in range(0, driver_position_qset.count(), 1):
            if driver_position_qset[i].driver_id == 23:
                driverId = 11
            else:
                driverId = driver_position_qset[i].driver_id

            single_point_finishing_hit = 0
            single_point_prediction_hit = 0

            if next_round_single_point_prediction_hit == 1:
                single_point_prediction_hit = 1
            else:
                single_point_prediction_hit = 0

            next_round_single_point_prediction_hit = 0

            position = i+1
            #try:

            if i == 0:
                
                if predicted_position_dict['positions'][str(i+1)]["driverId"] == driverId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["driverId"] == driverId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][driverId]
            elif i < driver_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["driverId"] == driverId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["driverId"] == driverId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                elif predicted_position_dict['positions'][str(i)]["driverId"] == driverId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][driverId]
            elif i == driver_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["driverId"] == driverId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i)]["driverId"] == driverId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][driverId]
            
            try:
                id_type = predictionPoints.objects.filter(
                    seasonCalendar_id=raceCalendarId,
                    driver_id=driverId,
                    user_id=uid,
                    isDriverStandingPrediction=1,
                    paddock_id=paddockId,
                ).latest('id').id
                save_type = "updated on "

            except Exception as e:
                id_type=None
                save_type = "saved to "

            predictionPoint = predictionPoints(
                id=id_type,
                predictedPosition=predicted_position,
                finishingPosition = position,
                pointsForPrediction = points_for_prediction,
                driver_id = driverId,
                seasonCalendar_id=raceCalendarId,
                user_id=uid,
                isDriverStandingPrediction=1,
                driverPrediction_id=prediction.id,
                isFinishingSinglePoint=single_point_finishing_hit,
                isPredictedSinglePoint = single_point_prediction_hit,
                paddock_id=paddockId,
            )
            predictionPoint.save()

            print("User " + str(uid) + " driver standing record for round " + str(race_round) + " " + save_type + " on the database")

            #except:
            #    break
        
        print("updated driver stadnings for user: " + str(uid) + " for round " + str(race_round))

    #Code starts here
    now = datetime.now()
    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    user_qset = driverPredictions.objects.filter(year=now.year).filter(isSeasonPrediction=1)

    '''user_list = []

    for user in range(0, user_qset.count(), 1):
        if user_qset[user].user_id not in user_list:
            user_list.append(user_qset[user].user_id)'''

    next_race_round = getNextRaceRound()

    #user_captured_dict = {}

    for p in range(0,paddock_qset.count(),1):
        print("Generating driver standing prediction points for users in paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName))

        rounds_to_capture_list = []
        for i in range(1,next_race_round,1):
            try:
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=i)[0].id
                paddockId = paddock_qset[p].id
                test_id = paddockPointsCaptureLog.objects.filter(paddock_id=paddockId).filter(seasonCalendar_id=seasonCalendarId).filter(isDriverStandingPoints=1)[0].id

            except Exception as e:
                rounds_to_capture_list.append(i)

        if len(rounds_to_capture_list) > 0:
            for r in rounds_to_capture_list:

                user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
                
                '''try:
                    test = user_captured_dict[r]
                except:
                    user_captured_dict[r] = []'''

                #try:
                for u in range(0, user_qset.count(), 1):
                    #if user_qset[u].user_id in user_list:
                        #if user_qset[u].user_id not in user_captured_dict[r]:
                    print("Generating driver standing points for user " + str(user_qset[u].user_id))
                    getUserDriverStandingPoints(user_qset[u].user_id, r, paddockId)
                    #user_captured_dict[r].append(user_qset[u].user_id)
                        #else:
                            #print("User " + str(user_qset[u].user_id) + "'s points have already been captured in this run")
                            #continue
                    #else: 
                        #print(str(user_qset[u].user_id)  + " does not have a driver sranding prediction ...")
                        #continue

                capture_save = paddockPointsCaptureLog(
                    id=None, 
                    year=now.year, 
                    isDriverStandingPoints=1,
                    paddock_id=paddock_qset[p].id,
                    seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                capture_save.save()
                print("Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")
                #except:
                #    pass
        else:
            print("Paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + "'s driver standing points for round: " + str(next_race_round - 1) + " are up to date")
            print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
            print("")
            continue

    print("Driver Standing records for all paddocks are up to date!")
    print("")

def updateDriverMidStandingPredictionPoints():

    def getUserDriverStandingPoints(uid, race_round, paddockId):

        now = datetime.now()
        num_drivers = drivers.objects.filter(isOnGrid=1).count()
        raceCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

        try:
            prediction = driverPredictions.objects.filter(user_id=uid, isMidSeasonPrediction=1).filter(year=now.year).filter(isSeasonPrediction=1).latest('id')
        except:
            print("User: " + str(uid) + " does not have a driver standing prediction")
            return

        gp_name = circuits.objects.get(id=seasonCalendar.objects.get(id=raceCalendarId).circuit_id).circuitRef

        predicted_position_dict={}
        predicted_position_dict['positions'] = []
        predicted_position_dict['positions'].append({"1":prediction.position1_id, "predicted_position": 1})
        predicted_position_dict['positions'].append({"2":prediction.position2_id, "predicted_position": 2})
        predicted_position_dict['positions'].append({"3":prediction.position3_id, "predicted_position": 3})
        predicted_position_dict['positions'].append({"4":prediction.position4_id, "predicted_position": 4})
        predicted_position_dict['positions'].append({"5":prediction.position5_id, "predicted_position": 5})
        predicted_position_dict['positions'].append({"6":prediction.position6_id, "predicted_position": 6})
        predicted_position_dict['positions'].append({"7":prediction.position7_id, "predicted_position": 7})
        predicted_position_dict['positions'].append({"8":prediction.position8_id, "predicted_position": 8})
        predicted_position_dict['positions'].append({"9":prediction.position9_id, "predicted_position": 9})
        predicted_position_dict['positions'].append({"10":prediction.position10_id, "predicted_position": 10})
        predicted_position_dict['positions'].append({"11":prediction.position11_id, "predicted_position": 11})
        predicted_position_dict['positions'].append({"12":prediction.position12_id, "predicted_position": 12})
        predicted_position_dict['positions'].append({"13":prediction.position13_id, "predicted_position": 13})
        predicted_position_dict['positions'].append({"14":prediction.position14_id, "predicted_position": 14})
        predicted_position_dict['positions'].append({"15":prediction.position15_id, "predicted_position": 15})
        predicted_position_dict['positions'].append({"16":prediction.position16_id, "predicted_position": 16})
        predicted_position_dict['positions'].append({"17":prediction.position17_id, "predicted_position": 17})
        predicted_position_dict['positions'].append({"18":prediction.position18_id, "predicted_position": 18})
        predicted_position_dict['positions'].append({"19":prediction.position19_id, "predicted_position": 19})
        predicted_position_dict['positions'].append({"20":prediction.position20_id, "predicted_position": 20})
        predicted_position_dict['positions'].append({"21":prediction.position21_id, "predicted_position": 21})
        predicted_position_dict['positions'].append({"22":prediction.position22_id, "predicted_position": 22})
        predicted_position_list = predicted_position_dict['positions']

        try:
            final_standings_qset = driverStandings.objects.filter(year=now.year).filter(seasonCalendar_id=raceCalendarId).order_by("position")
        except:
            print("Results for the " + gp_name + " grand prix have not been released by the Ergast API")
            return

        final_standings_dict = {}    
        final_standings_dict['positions'] = []
        final_standings_dict['final'] = {}
        final_standings_dict['final']['relative'] = {}
        relative_standing_position = 1

        origonal_drivers_qset = drivers.objects.filter(isIncludedInPredictions=1)
        driver_check_list = []

        for driver in range(0, origonal_drivers_qset.count(), 1):
            driver_check_list.append(origonal_drivers_qset[driver].id)

        for d in range(1,final_standings_qset.count()+1,1):
            driverId = final_standings_qset[d-1].driver_id
            if driverId in driver_check_list:
                final_standings_dict['positions'].append({str(d): final_standings_qset[d-1].driver_id, final_standings_qset[d-1].driver_id: d})
                final_standings_dict['final']['relative'][str(driverId)] = relative_standing_position
                relative_standing_position = relative_standing_position + 1
        final_standings_list = final_standings_dict['positions']
        
        for p in range(0,num_drivers,1):
            if p == 0:
                if predicted_position_list[p][str(p+1)] == final_standings_list[p][str(p+1)]:
                    points = 2
                elif predicted_position_list[p][str(p+1)] == final_standings_list[p+1][str(p+2)]:
                    points = 1
                else:
                    points = 0

            elif p == num_drivers-1:
                if predicted_position_list[p][str(p+1)] == final_standings_list[p][str(p+1)]:
                    points = 2
                elif predicted_position_list[p][str(p+1)] == final_standings_list[p-1][str(p)]:
                    points = 1
                else:
                    points = 0

            elif p < num_drivers - 1:
                if predicted_position_list[p][str(p+1)] == final_standings_list[p][str(p+1)]:
                    points = 2
                elif predicted_position_list[p][str(p+1)] == final_standings_list[p+1][str(p+2)]:
                    points = 1
                elif predicted_position_list[p][str(p+1)] == final_standings_list[p-1][str(p)]:
                    points = 1
                else:
                    points = 0

            driverId = predicted_position_list[p][str(p+1)]

            try:
                predictionPointsId = predictionPoints.objects.filter(
                    isDriverStandingPrediction=1,
                    user_id=uid,
                    driverPrediction_id=prediction.id,
                    predictedPosition=predicted_position_list[p]["predicted_position"],
                    seasonCalendar_id=raceCalendarId,
                    paddock_id=paddockId
                )[0].id
                id_to_post = predictionPointsId
                save_type = "updated on"
            except:
                id_to_post = None
                save_type = "saved to"

            db_entry = predictionPoints(
                id=id_to_post,
                predictedPosition=predicted_position_list[p]["predicted_position"],
                finishingPosition=final_standings_dict['final']['relative'][str(driverId)],
                pointsForPrediction=points,
                driver_id=driverId,
                seasonCalendar_id=raceCalendarId, user_id=uid,
                isDriverMidStandingPrediction=1,
                driverPrediction_id=prediction.id,
                paddock_id=paddockId,
            )
            db_entry.save()

            print("Driver standing points for user" + str(uid) + " for the " + gp_name + " grand prix " + save_type + " the database.")

        prediction.seasonCalendar_id = raceCalendarId
        prediction.save()
        return

    #Code starts here
    now = datetime.now()
    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    user_qset = driverPredictions.objects.filter(year=now.year).filter(isSeasonPrediction=1)

    user_list = []

    for user in range(0, user_qset.count(), 1):
        if user_qset[user].user_id not in user_list:
            user_list.append(user_qset[user].user_id)

    next_race_round = getNextRaceRound()

    user_captured_dict = {}

    for p in range(0,paddock_qset.count(),1):
        print("Generating driver standing prediction points for users in paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName))
        
        rounds_to_capture_list = []
        for i in range(1,next_race_round,1):
            try:
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=i)[0].id
                paddockId = paddock_qset[p].id
                test_id = paddockPointsCaptureLog.objects.filter(paddock_id=paddockId).filter(seasonCalendar_id=seasonCalendarId).filter(isDriverStandingPoints=1)[0].id

            except Exception as e:
                rounds_to_capture_list.append(i)

        if len(rounds_to_capture_list) > 0:
            for r in rounds_to_capture_list:
                user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
                
                try:
                    test = user_captured_dict[r]
                except:
                    user_captured_dict[r] = []

                try:
                    for u in range(0, user_qset.count(), 1):
                        if user_qset[u].user_id in user_list:
                            if user_qset[u].user_id not in user_captured_dict[r]:
                                print("Generating driver standing points for user " + str(user_qset[u].user_id))
                                getUserDriverStandingPoints(user_qset[u].user_id, r, paddockId)
                                user_captured_dict[r].append(user_qset[u].user_id)
                            else:
                                print("User " + str(user_qset[u].user_id) + "'s points have already been captured in this run")
                                continue
                        else: 
                            print(str(user_qset[u].user_id)  + " does not have a driver sranding prediction ...")
                            continue

                
                    capture_save = paddockPointsCaptureLog(
                        id=None, 
                        year=now.year, 
                        isDriverMidStandingPoints=1,
                        paddock_id=paddock_qset[p].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                    capture_save.save()
                    print("Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")
                except:
                    pass
        else:
            print("Paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + "'s driver standing points for round: " + str(next_race_round - 1) + " are up to date")
            print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
            print("")
            continue
    
    for u in range(0, user_qset.count(), 1):

        predicted_qset = predictionPoints.objects.filter(
        user_id = user_qset[u].user.id,
        isDriverMidStandingPrediction = 1,
        seasonCalendar_id=seasonCalendar.objects.filter(
            year=now.year,
            raceRound=next_race_round - 1)[0].id
        ).order_by('finishingPosition')

        predicted_qset.update(isFinishingSinglePoint=0, isPredictedSinglePoint=0)
        
        for p in range(0, predicted_qset.count(),1):
            if predicted_qset[p].pointsForPrediction == 1:
                finishing_record_id = predicted_qset[p].id
                predicted_record_id = predicted_qset.filter(
                    finishingPosition=predicted_qset.filter(
                        id=finishing_record_id).latest('id').predictedPosition).latest('id').id

                predicted = predicted_qset.get(id=finishing_record_id)
                finishing = predicted_qset.get(id=predicted_record_id)

                finishing.isPredictedSinglePoint = 1
                predicted.isFinishingSinglePoint = 1
                predicted.save()
                finishing.save()

    print("Driver Standing records for all paddocks are up to date!")
    print("")

def updateConstructorStandingPredictionPoints():
    
    def getUserConstructorStandingPoints(uid, race_round):

        now = datetime.now()
        num_constructors = constructors.objects.filter(isOnGrid=1).count()
        raceCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

        try:
            prediction = constructorSeasonPredictions.objects.filter(user_id=uid, isMidSeasonPrediction=0).filter(year=now.year).latest('id')
        except:
            print("User: " + str(uid) + " does not have a constructor standing prediction")
            return

        gp_name = circuits.objects.get(id=seasonCalendar.objects.get(id=raceCalendarId).circuit_id).circuitRef

        predicted_position_dict={}
        predicted_position_dict['positions'] = {}
        predicted_position_dict['positions']["1"]= {"constructorId": prediction.position1_id}
        predicted_position_dict['positions'][prediction.position1_id]= 1
        predicted_position_dict['positions']["2"]= {"constructorId": prediction.position2_id}
        predicted_position_dict['positions'][prediction.position2_id]= 2 
        predicted_position_dict['positions']["3"]= {"constructorId": prediction.position3_id}
        predicted_position_dict['positions'][prediction.position3_id]= 3 
        predicted_position_dict['positions']["4"]= {"constructorId": prediction.position4_id}
        predicted_position_dict['positions'][prediction.position4_id]= 4 
        predicted_position_dict['positions']["5"]= {"constructorId": prediction.position5_id}
        predicted_position_dict['positions'][prediction.position5_id]= 5 
        predicted_position_dict['positions']["6"]= {"constructorId": prediction.position6_id}
        predicted_position_dict['positions'][prediction.position6_id]= 6 
        predicted_position_dict['positions']["7"]= {"constructorId": prediction.position7_id}
        predicted_position_dict['positions'][prediction.position7_id]= 7 
        predicted_position_dict['positions']["8"]= {"constructorId": prediction.position8_id}
        predicted_position_dict['positions'][prediction.position8_id]= 8 
        predicted_position_dict['positions']["9"]= {"constructorId": prediction.position9_id}
        predicted_position_dict['positions'][prediction.position9_id]= 9 
        predicted_position_dict['positions']["10"]= {"constructorId": prediction.position10_id}
        predicted_position_dict['positions'][prediction.position10_id]= 10 


        constructor_position_qset = constructorStandings.objects.filter(
            seasonCalendar_id = raceCalendarId,
            year=now.year
        ).order_by('position')

        next_round_single_point_prediction_hit = 0
        
        for i in range(0, constructor_position_qset.count(), 1):
            constructorId = constructor_position_qset[i].constructor_id

            single_point_finishing_hit = 0
            single_point_prediction_hit = 0

            if next_round_single_point_prediction_hit == 1:
                single_point_prediction_hit = 1
            else:
                single_point_prediction_hit = 0

            next_round_single_point_prediction_hit = 0

            position = i+1
            #try:

            if i == 0:
                
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            elif i < constructor_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                elif predicted_position_dict['positions'][str(i)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            elif i == constructor_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            
            try:
                id_type = predictionPoints.objects.filter(
                    seasonCalendar_id=raceCalendarId,
                    constructor_id=constructorId,
                    user_id=uid,
                    isConstructorStandingPrediction=1,
                ).latest('id').id
                save_type = "updated on "

            except Exception as e:
                id_type=None
                save_type = "saved to "

            predictionPoint = predictionPoints(
                id=id_type,
                predictedPosition=predicted_position,
                finishingPosition = position,
                pointsForPrediction = points_for_prediction,
                constructor_id = constructorId,
                seasonCalendar_id=raceCalendarId,
                user_id=uid,
                isConstructorStandingPrediction=1,
                isFinishingSinglePoint= single_point_finishing_hit,
                isPredictedSinglePoint = single_point_prediction_hit,
            )
            predictionPoint.save()
            print("Constructor standing points for user" + str(uid) + " for the " + gp_name + " grand prix " + save_type + " the database.")

        

    #Code starts here
    now = datetime.now()
    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    user_qset = constructorSeasonPredictions.objects.filter(year=now.year, isMidSeasonPrediction=0)

    user_list = []

    for user in range(0, user_qset.count(), 1):
        if user_qset[user].user_id not in user_list:
            user_list.append(user_qset[user].user_id)

    next_race_round = getNextRaceRound()

    user_captured_dict = {}

    for p in range(0,paddock_qset.count(),1):
        print("Generating constructor prediction points for users in paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName))
        
        rounds_to_capture_list = []
        for i in range(1,next_race_round,1):
            try:
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=i)[0].id
                paddockId = paddock_qset[p].id
                test_id = paddockPointsCaptureLog.objects.filter(paddock_id=paddockId).filter(seasonCalendar_id=seasonCalendarId).filter(isConstructorStandingPoints=1)[0].id

            except Exception as e:
                rounds_to_capture_list.append(i)

        if len(rounds_to_capture_list) > 0:
            for r in rounds_to_capture_list:
                user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
                
                try:
                    test = user_captured_dict[r]
                except:
                    user_captured_dict[r] = []

                try:
                    for u in range(0, user_qset.count(), 1):
                        if user_qset[u].user_id in user_list:
                            if user_qset[u].user_id not in user_captured_dict[r]:
                                print("Generating constructor standing points for user " + str(user_qset[u].user_id))
                                getUserConstructorStandingPoints(user_qset[u].user_id, r)
                                user_captured_dict[r].append(user_qset[u].user_id)
                            else:
                                print("User " + str(user_qset[u].user_id) + "'s constructor standing points have already been captured in this run")
                                continue
                        else: 
                            print(str(user_qset[u].user_id)  + " does not have a constructor standing prediction ...")
                            continue

                    
                    capture_save = paddockPointsCaptureLog(
                        id=None, 
                        year=now.year, 
                        isConstructorStandingPoints=1,
                        paddock_id=paddock_qset[p].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                    capture_save.save()
                    print("Constructor Standing points for Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")

                    capture_save = paddockPointsCaptureLog(
                        id=None, 
                        year=now.year, 
                        isCombinedStandingPoints=1,
                        paddock_id=paddock_qset[p].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                    capture_save.save()
                    print("Combined points for Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")
                except Exception as e:
                    print(e)
        
        else:
            print("Paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + "'s constructor standing points for round: " + str(next_race_round - 1) + " are up to date")
            print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
            print("")
            continue
    
    print("Constructor Standing records for all paddocks are up to date!")
    print("")

def updateConstructorMidStandingPredictionPoints():
    
    def getUserConstructorStandingPoints(uid, race_round):

        now = datetime.now()
        num_constructors = constructors.objects.filter(isOnGrid=1).count()
        raceCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

        try:
            prediction = constructorSeasonPredictions.objects.filter(user_id=uid, isMidSeasonPrediction=1).filter(year=now.year).latest('id')
        except:
            print("User: " + str(uid) + " does not have a constructor standing prediction")
            return

        gp_name = circuits.objects.get(id=seasonCalendar.objects.get(id=raceCalendarId).circuit_id).circuitRef

        predicted_position_dict={}
        predicted_position_dict['positions'] = {}
        predicted_position_dict['positions']["1"]= {"constructorId": prediction.position1_id}
        predicted_position_dict['positions'][prediction.position1_id]= 1
        predicted_position_dict['positions']["2"]= {"constructorId": prediction.position2_id}
        predicted_position_dict['positions'][prediction.position2_id]= 2 
        predicted_position_dict['positions']["3"]= {"constructorId": prediction.position3_id}
        predicted_position_dict['positions'][prediction.position3_id]= 3 
        predicted_position_dict['positions']["4"]= {"constructorId": prediction.position4_id}
        predicted_position_dict['positions'][prediction.position4_id]= 4 
        predicted_position_dict['positions']["5"]= {"constructorId": prediction.position5_id}
        predicted_position_dict['positions'][prediction.position5_id]= 5 
        predicted_position_dict['positions']["6"]= {"constructorId": prediction.position6_id}
        predicted_position_dict['positions'][prediction.position6_id]= 6 
        predicted_position_dict['positions']["7"]= {"constructorId": prediction.position7_id}
        predicted_position_dict['positions'][prediction.position7_id]= 7 
        predicted_position_dict['positions']["8"]= {"constructorId": prediction.position8_id}
        predicted_position_dict['positions'][prediction.position8_id]= 8 
        predicted_position_dict['positions']["9"]= {"constructorId": prediction.position9_id}
        predicted_position_dict['positions'][prediction.position9_id]= 9 
        predicted_position_dict['positions']["10"]= {"constructorId": prediction.position10_id}
        predicted_position_dict['positions'][prediction.position10_id]= 10 

        constructor_position_qset = constructorStandings.objects.filter(
            seasonCalendar_id = raceCalendarId,
            year=now.year
        ).order_by('position')

        next_round_single_point_prediction_hit = 0
        
        for i in range(0, constructor_position_qset.count(), 1):
            constructorId = constructor_position_qset[i].constructor_id

            single_point_finishing_hit = 0
            single_point_prediction_hit = 0

            if next_round_single_point_prediction_hit == 1:
                single_point_prediction_hit = 1
            else:
                single_point_prediction_hit = 0

            next_round_single_point_prediction_hit = 0

            position = i+1
            #try:

            if i == 0:
                
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            elif i < constructor_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i+2)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position + 1
                    single_point_finishing_hit = 1
                    next_round_single_point_prediction_hit = 1
                elif predicted_position_dict['positions'][str(i)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            elif i == constructor_position_qset.count() - 1:
                if predicted_position_dict['positions'][str(i+1)]["constructorId"] == constructorId:
                    points_for_prediction = 2
                    predicted_position = position
                elif predicted_position_dict['positions'][str(i)]["constructorId"] == constructorId:
                    points_for_prediction = 1
                    predicted_position = position - 1
                    single_point_finishing_hit = 1
                else:
                    points_for_prediction = 0
                    predicted_position = predicted_position_dict['positions'][constructorId]
            
            try:
                id_type = predictionPoints.objects.filter(
                    seasonCalendar_id=raceCalendarId,
                    constructor_id=constructorId,
                    user_id=uid,
                    isconstructorStandingPrediction=1,
                ).latest('id').id
                save_type = "updated on "

            except Exception as e:
                id_type=None
                save_type = "saved to "

            predictionPoint = predictionPoints(
                id=id_type,
                predictedPosition=predicted_position,
                finishingPosition = position,
                pointsForPrediction = points_for_prediction,
                constructor_id = constructorId,
                seasonCalendar_id=raceCalendarId,
                user_id=uid,
                isconstructorStandingPrediction=1,
                constructorPrediction_id=prediction.id,
                isFinishingSinglePoint=single_point_finishing_hit,
                isPredictedSinglePoint = single_point_prediction_hit,
            )
            predictionPoint.save()

        print("Constructor standing points for user" + str(uid) + " for the " + gp_name + " grand prix " + save_type + " the database.")

    #Code starts here
    now = datetime.now()
    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    user_qset = constructorSeasonPredictions.objects.filter(year=now.year, isMidSeasonPrediction=1)

    user_list = []

    for user in range(0, user_qset.count(), 1):
        if user_qset[user].user_id not in user_list:
            user_list.append(user_qset[user].user_id)

    next_race_round = getNextRaceRound()

    user_captured_dict = {}

    for p in range(0,paddock_qset.count(),1):
        print("Generating constructor prediction points for users in paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName))
        
        rounds_to_capture_list = []
        for i in range(1,next_race_round,1):
            try:
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year).filter(raceRound=i)[0].id
                paddockId = paddock_qset[p].id
                test_id = paddockPointsCaptureLog.objects.filter(paddock_id=paddockId).filter(seasonCalendar_id=seasonCalendarId).filter(isConstructorStandingPoints=1)[0].id

            except Exception as e:
                rounds_to_capture_list.append(i)

        if len(rounds_to_capture_list) > 0:
            for r in rounds_to_capture_list:
                user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
                
                try:
                    test = user_captured_dict[r]
                except:
                    user_captured_dict[r] = []

                try:
                    for u in range(0, user_qset.count(), 1):
                        if user_qset[u].user_id in user_list:
                            if user_qset[u].user_id not in user_captured_dict[r]:
                                print("Generating constructor standing points for user " + str(user_qset[u].user_id))
                                getUserConstructorStandingPoints(user_qset[u].user_id, r)
                                user_captured_dict[r].append(user_qset[u].user_id)
                            else:
                                print("User " + str(user_qset[u].user_id) + "'s constructor standing points have already been captured in this run")
                                continue
                        else: 
                            print(str(user_qset[u].user_id)  + " does not have a constructor standing prediction ...")
                            continue

                    
                    capture_save = paddockPointsCaptureLog(
                        id=None, 
                        year=now.year, 
                        isConstructorStandingPoints=1,
                        paddock_id=paddock_qset[p].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                    capture_save.save()
                    print("Constructor Standing points for Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")

                    capture_save = paddockPointsCaptureLog(
                        id=None, 
                        year=now.year, 
                        isCombinedStandingPoints=1,
                        paddock_id=paddock_qset[p].id,
                        seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=r)[0].id)
                    capture_save.save()
                    print("Combined points for Round: " + str(r) + " has been saved to the database for all users in the " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + " paddock")
                except:
                    pass
        
        else:
            print("Paddock: " + str(paddocks.objects.get(id=paddock_qset[p].id).paddockName) + "'s constructor standing points for round: " + str(next_race_round - 1) + " are up to date")
            print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
            print("")
            continue
    
    print("Constructor Standing records for all paddocks are up to date!")
    print("")

def updateMidfieldLeaderboards(r, paddockId):

    now = datetime.now()
    next_race_round = getNextRaceRound()

    season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound=r).id

    paddock_user_qset = userPaddocks.objects.filter(
        paddock_id = paddockId
    )

    for u in range(paddock_user_qset.count()):
        userId = paddock_user_qset[u].user_id
        round_player_position = 1
        previous_position = 1
        paddock_delta = 0
        current_total_points = 0
        round_points = 0
        previous_total_points = 0
        current_overall_position = 1
        userId = paddock_user_qset[u].user_id
        bonus_points = 0
        fastest_lap_points = 0
        pole_sitter_points = 0

        race_round_points = sum(predictionPoints.objects.filter(
            paddock_id = paddockId,
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isFeatureRaceMidfieldPrediction = 1,
        ).values_list('pointsForPrediction', flat=True))

        fastest_lap_points = sum(predictionPoints.objects.filter(
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isFastestLapPoint = 1,
        ).values_list('pointsForPrediction', flat=True))

        pole_sitter_points = sum(predictionPoints.objects.filter(
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isPoleSitterPoint = 1,
        ).values_list('pointsForPrediction', flat=True))

        bonus_points = fastest_lap_points + pole_sitter_points

        round_points = race_round_points + bonus_points

        if r > 1:
            try:
                previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                previous_user_leaderbaord_entry = leaderboards.objects.get(
                    seasonCalendar_id = previous_season_calendarId,
                    paddock_id = paddockId,
                    user_id = userId,
                    isMidfieldGame = 1,
                )
                previous_total_points = previous_user_leaderbaord_entry.currentTotalPoints
            
            except Exception as e:
                print(e)
                pass

        current_total_points = round_points + previous_total_points

        try:
            entry_id = leaderboards.objects.get(
                seasonCalendar_id = season_calendarId,
                paddock_id = paddockId,
                user_id = userId,
                isMidfieldGame = 1,
            ).id
            save_type = " updated on "
        except:
            entry_id = None
            save_type = " saved on "

        db_entry = leaderboards(
            id = entry_id,
            roundPoints = round_points,
            isMidfieldGame = 1,
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            currentTotalPoints = current_total_points,
            isActive = 1,
            paddock_id = paddockId,
            previousTotalPoints = previous_total_points,
        )
        db_entry.save()

    round_point_qset = leaderboards.objects.filter(
        seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
        isMidfieldGame = 1,
    ).order_by("-roundPoints")

    paddock_postion_qset = leaderboards.objects.filter(
        seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
        isMidfieldGame = 1,
    ).order_by("-currentTotalPoints")

    pos_jump = 1
    position = 1
    previous_player_round_points = 0
    for pos in range(round_point_qset.count()):
        userId = round_point_qset[pos].user_id
        player_round_points = round_point_qset[pos].roundPoints

        if pos == 0:
            round_player_position = position
            previous_player_round_points = player_round_points

        elif player_round_points == previous_player_round_points:
            round_player_position = position
            pos_jump = pos_jump + 1
            previous_player_round_points = player_round_points

        elif player_round_points < previous_player_round_points:
            position = position + pos_jump
            round_player_position = position
            previous_player_round_points = player_round_points
            pos_jump = 1

        user_leaderboard_entry = leaderboards.objects.filter(
            user_id = userId,
            paddock_id = paddockId,
            isMidfieldGame = 1,
            isActive = 1,
            seasonCalendar_id = season_calendarId,
        )

        user_leaderboard_entry.update(
            roundPlayerPosition = round_player_position
        )

    pos_jump = 1
    position = 1
    previous_player_points = 0
    for pos in range(paddock_postion_qset.count()):
        userId = paddock_postion_qset[pos].user_id
        player_total_points = paddock_postion_qset[pos].currentTotalPoints
        if pos == 0:
            player_overall_position = position
            previous_player_points = player_total_points

        elif player_total_points == previous_player_points:
            player_overall_position = position
            pos_jump = pos_jump + 1
            previous_player_points = player_total_points

        elif player_total_points < previous_player_points:
            position = position + pos_jump
            player_overall_position = position
            previous_player_points = player_total_points
            pos_jump = 1

        if r > 1:
            try:
                previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                previous_user_leaderbaord_entry = leaderboards.objects.get(
                    seasonCalendar_id = previous_season_calendarId,
                    paddock_id = paddockId,
                    user_id = userId,
                    isMidfieldGame = 1,
                )
                previous_position = previous_user_leaderbaord_entry.currentOverallPosition
            except:
                pass

        paddock_delta = previous_position - position

        user_leaderboard_entry = leaderboards.objects.filter(
            user_id = userId,
            paddock_id = paddockId,
            isMidfieldGame = 1,
            isActive = 1,
            seasonCalendar_id = season_calendarId,
        )

        user_leaderboard_entry.update(
            paddockDelta = paddock_delta,
            currentOverallPosition = player_overall_position,
            previousPosition = previous_position,
        )

    print("Leaderboard records for paddock: " + paddocks.objects.get(id=paddockId).paddockName + " for " + seasonCalendar.objects.get(year=now.year, raceRound=r).circuit.circuitRef)

    seasonCalendarInstance = seasonCalendar.objects.get(id=season_calendarId)
    seasonCalendarInstance.midfieldLeaderboardUpdated = 1
    seasonCalendarInstance.save()

def updateDriverLeaderboards():

    now = datetime.now()
    next_race_round = getNextRaceRound()

    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    for p in range(0, paddock_qset.count(), 1):

        paddockId=paddock_qset[p].id
        paddock_start_round = getPaddockRulesStartRound(paddockId, "drivers")
        completed_races_qset = seasonCalendar.objects.filter(
            raceRound__lt=next_race_round,
            year=now.year
        ).order_by("raceRound")

        paddock_num_players = paddocks.objects.get(id=paddockId).numPlayers
        start_round_to_capture = 1

        for i in range(completed_races_qset.count()):
            if completed_races_qset[i].raceRound < paddock_start_round:
                continue
            if leaderboards.objects.filter(
                paddock_id = paddockId,
                isDriverStandingsGame = 1,
                isActive = 1,
                seasonCalendar_id = completed_races_qset[i].id
            ).count() < paddock_num_players and completed_races_qset[i].raceRound >= paddock_start_round:
                start_round_to_capture = completed_races_qset[i].raceRound
                break

        paddock_user_qset = userPaddocks.objects.filter(paddock_id = paddockId)

        for r in range(start_round_to_capture, next_race_round, 1):

            season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound=r).id

            for u in range(paddock_user_qset.count()):
                userId = paddock_user_qset[u].user_id
                round_player_position = 1
                previous_position = 1
                paddock_delta = 0
                current_total_points = 0
                round_points = 0
                previous_total_points = 0
                current_overall_position = 1
                userId = paddock_user_qset[u].user_id

                race_round_points = sum(predictionPoints.objects.filter(
                    paddock_id = paddockId,
                    seasonCalendar_id = season_calendarId,
                    user_id = userId,
                    isDriverStandingPrediction = 1,
                ).values_list('pointsForPrediction', flat=True))

                round_points = race_round_points

                if r > 1 and r > paddock_start_round:
                    try:
                        previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                        previous_user_leaderbaord_entry = leaderboards.objects.get(
                            seasonCalendar_id = previous_season_calendarId,
                            paddock_id = paddockId,
                            user_id = userId,
                            isDriverStandingsGame = 1,
                        )
                        previous_total_points = previous_user_leaderbaord_entry.currentTotalPoints
                    
                    except Exception as e:
                        print(e)
                        pass

                current_total_points = round_points

                try:
                    entry_id = leaderboards.objects.get(
                        seasonCalendar_id = season_calendarId,
                        paddock_id = paddockId,
                        user_id = userId,
                        isDriverStandingsGame = 1,
                    ).id
                    save_type = " updated on "
                except:
                    entry_id = None
                    save_type = " saved on "

                db_entry = leaderboards(
                    id = entry_id,
                    roundPoints = round_points,
                    isDriverStandingsGame = 1,
                    seasonCalendar_id = season_calendarId,
                    user_id = userId,
                    currentTotalPoints = current_total_points,
                    isActive = 1,
                    paddock_id = paddockId,
                    previousTotalPoints = previous_total_points,
                )
                db_entry.save()

            round_point_qset = leaderboards.objects.filter(
                seasonCalendar_id = season_calendarId,
                paddock_id = paddockId,
                isDriverStandingsGame = 1,
            ).order_by("-roundPoints")

            paddock_postion_qset = leaderboards.objects.filter(
                seasonCalendar_id = season_calendarId,
                paddock_id = paddockId,
                isDriverStandingsGame = 1,
            ).order_by("-currentTotalPoints")

            pos_jump = 1
            position = 1
            previous_player_round_points = 0
            for pos in range(round_point_qset.count()):
                userId = round_point_qset[pos].user_id
                player_round_points = round_point_qset[pos].roundPoints

                if pos == 0:
                    round_player_position = position
                    previous_player_round_points = player_round_points

                elif player_round_points == previous_player_round_points:
                    round_player_position = position
                    pos_jump = pos_jump + 1
                    previous_player_round_points = player_round_points

                elif player_round_points < previous_player_round_points:
                    position = position + pos_jump
                    round_player_position = position
                    previous_player_round_points = player_round_points
                    pos_jump = 1

                user_leaderboard_entry = leaderboards.objects.filter(
                    user_id = userId,
                    paddock_id = paddockId,
                    isDriverStandingsGame = 1,
                    isActive = 1,
                    seasonCalendar_id = season_calendarId,
                )

                user_leaderboard_entry.update(
                    roundPlayerPosition = round_player_position
                )

            pos_jump = 1
            position = 1
            previous_player_points = 0
            for pos in range(paddock_postion_qset.count()):
                userId = paddock_postion_qset[pos].user_id
                player_total_points = paddock_postion_qset[pos].currentTotalPoints
                if pos == 0:
                    player_overall_position = position
                    previous_player_points = player_total_points

                elif player_total_points == previous_player_points:
                    player_overall_position = position
                    pos_jump = pos_jump + 1
                    previous_player_points = player_total_points

                elif player_total_points < previous_player_points:
                    position = position + pos_jump
                    player_overall_position = position
                    previous_player_points = player_total_points
                    pos_jump = 1

                if r > 1 and r > paddock_start_round:
                    try:
                        previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                        previous_user_leaderbaord_entry = leaderboards.objects.get(
                            seasonCalendar_id = previous_season_calendarId,
                            paddock_id = paddockId,
                            user_id = userId,
                            isDriverStandingsGame = 1,
                        )
                        previous_position = previous_user_leaderbaord_entry.currentOverallPosition
                    except:
                        pass

                paddock_delta = previous_position - position

                user_leaderboard_entry = leaderboards.objects.filter(
                    user_id = userId,
                    paddock_id = paddockId,
                    isDriverStandingsGame = 1,
                    isActive = 1,
                    seasonCalendar_id = season_calendarId,
                )

                user_leaderboard_entry.update(
                    paddockDelta = paddock_delta,
                    currentOverallPosition = player_overall_position,
                    previousPosition = previous_position,
                )

            print("Driver standingLeaderboard records for paddock: " + paddocks.objects.get(id=paddockId).paddockName + " for " + seasonCalendar.objects.get(year=now.year, raceRound=r).circuit.circuitRef)

    seasonCalendarInstance = seasonCalendar.objects.get(id=season_calendarId)
    seasonCalendarInstance.driverStandingsLeaderboardUpdated = 1
    seasonCalendarInstance.save()
    
def updateConstructorLeaderboards():

    now = datetime.now()

    next_race_round = getNextRaceRound()

    try:
        first_round_to_update = seasonCalendar.objects.filter(year=now.year, constructorStandingsLeaderboardUpdated=0, isComplete=1).order_by('raceRound')[0].raceRound
    except:
        print("Constructor Standing leaderboards are up to date!")
        return

    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    for p in range(0, paddock_qset.count(), 1):
        paddock_user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
        num_constructors_on_leaderboard = constructors.objects.filter(isOnGrid=1).count()
        try:
            paddock_start_round = getPaddockRulesStartRound(paddock_user_qset[p].id, 'constructors')
            last_captured_round = getPaddockLastCapturedRound(paddock_user_qset[p].id, 'constructors')
        except:
            continue

        for u in range(0, paddock_user_qset.count(), 1):
            total_constructor_standing_points = 0
            previous_constructor_standing_points = 0
            previous_position = 1

            for r in range(last_captured_round+1, next_race_round, 1):
                if r < paddock_start_round:
                    continue

                round_points = 0
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id
                if r > 1:
                    previous_seasonCalendar_id = seasonCalendar.objects.filter(year=now.year, raceRound=r-1)[0].id
                    try:
                        previous_user_board_record = leaderboards.objects.filter(
                            seasonCalendar_id=previous_seasonCalendar_id,
                            paddock_id=paddock_qset[p].id,
                            user_id=paddock_user_qset[u].user_id,
                            isConstructorStandingsGame=1).latest('id')
                            
                        previous_constructor_standing_points = previous_user_board_record.currentTotalPoints
                        previous_position = previous_user_board_record.currentOverallPosition

                    except:
                        print("User: " + str(paddock_user_qset[u].user.username) + " does not have a leaderboard record for round: " + str(r))
                        previous_constructor_standing_points = 0
                        previous_position = 1

                else:
                    previous_constructor_standing_points = 0
                    previous_position = 1
                    player_position = 1
                    current_overall_position = 1

                try:
                    constructor_standing_instance = leaderboards.objects.filter(
                        seasonCalendar_id=seasonCalendarId,
                        paddock_id=paddock_qset[p].id,
                        user_id=paddock_user_qset[u].user_id,
                        isConstructorStandingsGame=1).latest('id')

                    id_type = constructor_standing_instance.id
                    save_type = "Updated on"
                except:
                    id_type = None
                    save_type = "Saved on"
                    
                points_qset = predictionPoints.objects.filter(
                    seasonCalendar_id=seasonCalendarId,
                    user_id=paddock_user_qset[u].user_id,
                    isConstructorStandingPrediction=1).order_by('predictedPosition')

                for point in range(0, num_constructors_on_leaderboard, 1):
                    try:
                        round_points = round_points + points_qset[point].pointsForPrediction
      
                    except:
                        print("Midfield points for round ... :" + str(r) + ", User: " + str(paddock_user_qset[u].user.username) + " have not been captured yet")
                        continue

                total_constructor_standing_points = round_points

                db_entry = leaderboards(id=id_type,
                previousPosition=previous_position,
                seasonCalendar_id=seasonCalendarId,
                paddock_id=paddock_qset[p].id,
                user_id=paddock_user_qset[u].user_id,
                isConstructorStandingsGame=1,
                currentTotalPoints=total_constructor_standing_points,
                roundPoints=round_points,
                previousTotalPoints=previous_constructor_standing_points)
                db_entry.save()

                print("User: " + str(paddock_user_qset[u].user.username) + " constructor standing points record for paddock: " + paddock_qset[p].paddockName + " Round: " + str(r) + " " + save_type + " the database")
            
        for r in range(last_captured_round+1, next_race_round, 1):
            paddock_round_leaderboard_qset = leaderboards.objects.filter(
            paddock_id=paddock_qset[p].id,
            isConstructorStandingsGame=1,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=r)[0].id
            ).order_by('-roundPoints')

            pos=1
            pos_jump=1

            for player in range(0, paddock_round_leaderboard_qset.count(), 1):
                instance = paddock_round_leaderboard_qset[player]
                if player == 0:
                    player_position = 1
                else:
                    try:
                        if paddock_round_leaderboard_qset[player].roundPoints == paddock_round_leaderboard_qset[player-1].roundPoints:
                            player_position = pos
                            pos_jump = pos_jump + 1
                        else:
                            pos = pos + pos_jump
                            player_position = pos
                            pos_jump = 1
                    except:
                        player_position = pos + pos_jump

                try:
                    previous_position = leaderboards.objects.filter(
                        paddock_id=paddock_qset[p],
                        isConstructorStandingsGame=1,
                        user_id=paddock_round_leaderboard_qset[player].user_id,
                        seasonCalendar_id=seasonCalendar.objects.filter(
                            year=now.year,
                            raceRound=r-1)[0].id)[0].currentOverallPosition
                except:
                    previous_position = 1
    
                instance.previousPosition = previous_position
                instance.roundPlayerPosition = player_position
                instance.currentOverallPosition = player_position
                instance.save()
            
            if p == paddock_qset.count() - 1:
                seasonCalendarInstance = seasonCalendar.objects.get(
                    id=seasonCalendar.objects.filter(
                        year=now.year,
                        raceRound=r
                        )[0].id
                    )
                seasonCalendarInstance.constructorStandingsLeaderboardUpdated = 1
                seasonCalendarInstance.save()

def updateCombinedLeaderBoard():

    now=datetime.now()
    
    next_race_round = getNextRaceRound()

    try:
        first_round_to_update = seasonCalendar.objects.filter(
            year=now.year,
            combinedStandingsLeaderboardUpdated=0,
            isComplete=1).order_by('raceRound')[0].raceRound
    except:
        print("Combined Standing leaderbaords are up to date!")
        return

    paddock_qset = paddocks.objects.filter(year=now.year, numPlayers__gt=0)
    for p in range(0, paddock_qset.count(), 1):
        paddock_user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
        try:
            paddock_start_round = getPaddockRulesStartRound(paddock_user_qset[p].id, 'combined')
            last_captured_round = getPaddockLastCapturedRound(paddock_user_qset[p].id, 'combined')
        except:
            continue

        for u in range(0, paddock_user_qset.count(), 1):
            total_combined_standing_points = 0
            previous_combined_standing_points = 0
            previous_position = 1

            for r in range(last_captured_round+1, next_race_round, 1):
                if r < paddock_start_round:
                        continue
                round_points = 0
                seasonCalendarId = seasonCalendar.objects.filter(
                    year=now.year,
                    raceRound=r
                ).latest('id').id
                
                if r > 1:
                    previous_seasonCalendar_id = seasonCalendar.objects.filter(year=now.year, raceRound=r-1)[0].id
                    try:
                        previous_user_board_record = leaderboards.objects.filter(
                            seasonCalendar_id=previous_seasonCalendar_id,
                            paddock_id=paddock_qset[p].id,
                            user_id=paddock_user_qset[u].user_id,
                            isCombinedStandingsGame=1).latest('id')
                            
                        previous_combined_standing_points = previous_user_board_record.currentTotalPoints
                        previous_position = previous_user_board_record.currentOverallPosition

                    except:
                        print("User: " + str(paddock_user_qset[u].user.username) + " does not have a combined leaderboard record for round: " + str(r))
                        previous_combined_standing_points = 0
                        previous_position = 1

                else:
                    previous_combined_standing_points = 0
                    previous_position = 1
                    player_position = 1

                try:
                    combined_standing_instance = leaderboards.objects.filter(
                        seasonCalendar_id=seasonCalendarId,
                        paddock_id=paddock_qset[p].id,
                        user_id=paddock_user_qset[u].user_id,
                        isCombinedStandingsGame=1).latest('id')

                    id_type = combined_standing_instance.id
                    save_type = "Updated on"
                except:
                    id_type = None
                    save_type = "Saved on"

                driver_leaderboard_points_qset = leaderboards.objects.filter(
                    seasonCalendar_id=seasonCalendarId,
                    isDriverStandingsGame = 1,
                    user_id=paddock_user_qset[u].user_id,)

                constructor_leaderboard_points_qset = leaderboards.objects.filter(
                    seasonCalendar_id=seasonCalendarId,
                    isConstructorStandingsGame = 1,
                    user_id=paddock_user_qset[u].user_id,)

                if r == 0:
                    constructor_round_points = 0
                    driver_round_points = 0
                else:
                    ##### fix this why is there a try except needed?
                    try:
                        constructor_round_points = constructor_leaderboard_points_qset.latest('id').roundPoints
                        driver_round_points = driver_leaderboard_points_qset.latest('id').roundPoints
                    except:
                        constructor_round_points = 0
                        driver_round_points = 0
            
                round_points = driver_round_points + constructor_round_points

                total_combined_standing_points = round_points

                db_entry = leaderboards(
                    id=id_type,
                    previousPosition=previous_position,
                    seasonCalendar_id=seasonCalendarId,
                    paddock_id=paddock_qset[p].id,
                    user_id=paddock_user_qset[u].user_id,
                    isCombinedStandingsGame=1,
                    isActive=1,
                    currentTotalPoints=total_combined_standing_points,
                    roundPoints=round_points,
                    previousTotalPoints=previous_combined_standing_points)

                db_entry.save()

                print("User: " + str(paddock_user_qset[u].user.username) + " combined standing points record for paddock: " + paddock_qset[p].paddockName + " Round: " + str(r) + " " + save_type + " the database")

        for r in range(last_captured_round+1, next_race_round, 1):
            paddock_round_leaderboard_qset = leaderboards.objects.filter(
            paddock_id=paddock_qset[p].id,
            isCombinedStandingsGame=1,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=r)[0].id
            ).order_by('-roundPoints')

            pos=1
            pos_jump=1

            for player in range(0, paddock_round_leaderboard_qset.count(), 1):
                instance = paddock_round_leaderboard_qset[player]
                if player == 0:
                    player_position = 1
                else:
                    try:
                        if paddock_round_leaderboard_qset[player].roundPoints == paddock_round_leaderboard_qset[player-1].roundPoints:
                            player_position = pos
                            pos_jump = pos_jump + 1
                        else:
                            pos = pos + pos_jump
                            player_position = pos
                            pos_jump = 1
                    except:
                        player_position = pos + pos_jump

                try:
                    previous_position = leaderboards.objects.filter(
                        paddock_id=paddock_qset[p],
                        isCombinedStandingsGame=1,
                        user_id=paddock_round_leaderboard_qset[player].user_id,
                        seasonCalendar_id=seasonCalendar.objects.filter(
                            year=now.year,
                            raceRound=r-1)[0].id)[0].currentOverallPosition
                except:
                    previous_position = 1
    
                instance.previousPosition = previous_position
                instance.roundPlayerPosition = player_position
                instance.currentOverallPosition = player_position
                instance.save()
            
            if p == paddock_qset.count() - 1:
                seasonCalendarInstance = seasonCalendar.objects.get(
                    id=seasonCalendar.objects.filter(
                        year=now.year,
                        raceRound=r
                        )[0].id
                    )
                seasonCalendarInstance.combinedStandingsLeaderboardUpdated = 1
                seasonCalendarInstance.save()

def updateAllManualPredictionPoints(paddockId):

    #clearPredictionData()

    next_race_round = getNextRaceRound()

    try:
        last_completed_race_round = seasonCalendar.objectsts.filter(
            isComplete = 1,
            year=now.year,
        ).order_by("raceRound")[0].raceRound
    except:
        last_completed_race_round = 0

    next_round_to_capture = last_completed_race_round + 1

    paddock_instance = paddocks.objects.get(id=paddockId)
    paddockId = paddock_instance.id

    paddock_rulesId = paddock_instance.paddockRules_id

    paddock_racely_start_round = paddockRulesStartRounds.objects.get(
        paddockRules_id = paddock_rulesId,
        isRacelyRule = 1
    ).startRound

    paddock_driver_start_round = paddockRulesStartRounds.objects.get(
        paddockRules_id = paddock_rulesId,
        isPreSeasonDriverRule = 1
    ).startRound

    paddock_constructor_start_round = paddockRulesStartRounds.objects.get(
        paddockRules_id = paddock_rulesId,
        isPreSeasonConstructorRule = 1
    ).startRound

    for race_round in range(next_round_to_capture, next_race_round, 1):

        if next_round_to_capture >= paddock_racely_start_round and next_round_to_capture <= next_race_round :
            updateMidfieldPredictionPoints(race_round, paddockId)
            updateMidfieldLeaderboards(race_round, paddockId)
        
        print("SEETING RACE ROUND " + str(race_round) + " TO COMPLETE")
        setRaceRoundToComplete(race_round)

def updateAllPredictionPoints():

    clearPredictionData()

    next_race_round = getNextRaceRound()

    try:
        last_completed_race_round = seasonCalendar.objectsts.filter(
            isComplete = 1,
            year=now.year,
        ).order_by("raceRound")[0].raceRound
    except:
        last_completed_race_round = 0

    next_round_to_capture = last_completed_race_round + 1

    for race_round in range(next_round_to_capture, next_race_round, 1):

        print("GERTTING RACE RESULTS")
        print(race_round)

        getRaceResults(race_round)

        paddock_qset = paddocks.objects.filter(
            year=now.year,
            numPlayers__gt=0,
        )

        for p in range(paddock_qset.count()):
            paddock_instance = paddock_qset[p]
            paddockId = paddock_instance.id

            paddock_rulesId = paddock_instance.paddockRules_id
            paddock_racely_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id = paddock_rulesId,
                isRacelyRule = 1
            ).startRound

            paddock_driver_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id = paddock_rulesId,
                isRacelyRule = 1
            ).startRound

            paddock_constructor_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id = paddock_rulesId,
                isRacelyRule = 1
            ).startRound

            if next_round_to_capture >= paddock_racely_start_round and next_round_to_capture <= next_race_round :
                updateMidfieldPredictionPoints(race_round, paddockId)
                updateMidfieldLeaderboards(race_round, paddockId)
        
        print("SEETING RACE ROUND " + str(race_round) + " TO COMPLETE")
        setRaceRoundToComplete(race_round)

    #This needs to be rorganised so that each points capture and leaderboard is caputred round for round this should aslo make the "cade starts here simpler" might even go as far as running the custom serializer in the function so that the json file is generated as we go round for round
    #clearPredictionData()

    #SUB TEST
    
    '''season_calendar_list = [26, 27, 28, 30]
    
    for s in range(len(season_calendar_list)):
        results_list = []
        season_calendarId = season_calendar_list[s]
        results_qset = results.objects.filter(
            seasonCalendar_id = season_calendar_list[s]
        )
        for i in range(results_qset.count()):
            print(results_qset[i].constructor_id)
            my_object = {
                "Driver" : {
                    "permanentNumber" : results_qset[i].number,
                },

                "Constructor" : {
                    "name" : constructorApiNameConverstions.objects.get(
                            constructor_id=results_qset[i].constructor_id
                        ).apiName,
                }
            }
            results_list.append(my_object)

        pprint(results_list)

        resetSubbedDrivers(season_calendarId)
        sortSubstitutes(results_list, season_calendarId)
        checkForInterTeamSubstitutes(results_list, season_calendarId'''

    #getDriverStandings()
    #updateDriverStandingPredictionPoints()
    #updateDriverLeaderboards()
    #getConstructorStandings()
    #updateConstructorStandingPredictionPoints()
    #updateConstructorLeaderboards()
    #updateCombinedLeaderBoard()
    print("ALL DONE!")

    return (HttpResponse("Results Updated"))

def clearPredictionData():
    predictionPoints.objects.all().delete()
    paddockPointsCaptureLog.objects.all().delete()
    leaderboards.objects.all().delete()
    leaderboardSingleLinePredictions.objects.all().delete()
    results.objects.all().delete()
    season_calendar_qset = seasonCalendar.objects.filter(year=now.year)

    season_calendar_qset.update(
        isComplete = 0
    )

def countUserPaddocks(uid):
    try:
        entry_id = userPaddockCount.objects.filter(year=now.year, user_id=uid).latest("id").id
        id_type = entry_id
    except:
        id_type = None

    user_private_paddocks_created_qset = paddocks.objects.filter(
        year=now.year,
        isPublic=0,
        createdBy_id=uid,
        numPlayers__gt=0,
    )

    user_public_paddocks_created_qset = paddocks.objects.filter(
        year=now.year,
        isPublic=1,
        createdBy_id=uid,
        numPlayers__gt=0,
    )

    user_total_paddock_qset = userPaddocks.objects.filter(
        user_id=uid,
        year=now.year,
    )

    num_private_paddocks_joined = 0
    num_public_paddocks_joined = 0

    for i in range(0, user_total_paddock_qset.count(), 1):
        if paddocks.objects.get(id=user_total_paddock_qset[i].paddock_id).createdBy_id != uid:
            if paddocks.objects.get(id=user_total_paddock_qset[i].paddock_id).isPublic == 1:
                num_public_paddocks_joined = num_public_paddocks_joined + 1
            elif paddocks.objects.get(id=user_total_paddock_qset[i].paddock_id).isPublic == 0:
                num_private_paddocks_joined = num_private_paddocks_joined + 1            
            
    entry=userPaddockCount(
        id=id_type,
        year=now.year,
        numPrivatePaddocksJoined=num_private_paddocks_joined,
        numPublicPaddocksJoined=num_public_paddocks_joined,
        numPrivatePaddocksCreated=user_private_paddocks_created_qset.count(),
        numPublicPaddocksCreated=user_public_paddocks_created_qset.count(),
        user_id=uid,
        )

    entry.save()

    print("User Paddock Count Adjusted")

def getUserStatus(uid):
    now=datetime.now()

    countUserPaddocks(uid)

    userDonationQset = userStatus.objects.filter(
        year=now.year,
        user_id = uid,
        hasDonated = 1,
    )

    userPaymentQset = userStatus.objects.filter(
        year=now.year,
        user_id = uid,
        hasPaid = 1,
    )

    userDonations = 0
    userPayments = 0

    if userDonationQset.count() > 0:
        for i in range(0, userDonationQset.count(), 1):
            userDonations = userDonations + userDonationQset[i].donationAmount

    if userPaymentQset.count() > 0:
        for i in range(0, userPaymentQset.count(), 1):
            userPayments = userPayments + userPaymentQset[i].paymentAmount

    statusThresholds = userPaymentThresholds.objects.filter(
        year=now.year,
    ).latest("id")

    userPaddockRules = []
    if userDonations + userPayments < statusThresholds.freeAmount:
        userPaddockRules.append({
            "publicPaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").betaUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksJoined,
            "publicPaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").betaUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksCreated,
            "privatePaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").betaNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksJoined,
            "privatePaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").betaNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksCreated,
            "userPaddockMaxUsers" : paddockUserStatusMaxUsers.objects.filter(
                year=now.year,
                statusLevel="Beta"
            ).latest('id').maxUsers
        })

    elif userDonations + userPayments <= statusThresholds.freeAmount:
        userPaddockRules.append({
            "publicPaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").freeUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksJoined,
            "publicPaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").freeUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksCreated,
            "privatePaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").freeUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksJoined,
            "privatePaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").freeUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksCreated,
            "userPaddockMaxUsers" : paddockUserStatusMaxUsers.objects.filter(
                year=now.year,
                statusLevel="Free"
            ).latest('id').maxUsers
        })

    elif userDonations + userPayments <= statusThresholds.bronzeAmount:
        userPaddockRules.append({
            "publicPaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").bronzeUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksJoined,
            "publicPaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").bronzeUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksCreated,
            "privatePaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").bronzeUserNumprivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksJoined,
            "privatePaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").bronzeUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksCreated,
            "userPaddockMaxUsers" : paddockUserStatusMaxUsers.objects.filter(
                year=now.year,
                statusLevel="Bronze"
            ).latest('id').maxUsers
        })

    elif userDonations + userPayments <= statusThresholds.silverAmount:
        userPaddockRules.append({
            "publicPaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").silverUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksJoined,
            "publicPaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").silverUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksCreated,
            "privatePaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").silverUserNumprivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksJoined,
            "privatePaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").silverUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksCreated,
            "userPaddockMaxUsers" : paddockUserStatusMaxUsers.objects.filter(
                year=now.year,
                statusLevel="Silver"
            ).latest('id').maxUsers
        })

    elif userDonations + userPayments >= statusThresholds.goldAmount:
        userPaddockRules.append({
            "publicPaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").goldUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksJoined,
            "publicPaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").goldUserNumPublicPaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPublicPaddocksCreated,
            "privatePaddocksJoinable": paymentJoinPaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").goldUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksJoined,
            "privatePaddocksCreatable": paymentCreatePaddockRestrictions.objects.filter(
                year=now.year,
            ).latest("id").goldUserNumPrivatePaddocks - userPaddockCount.objects.filter(
                year=now.year,
            ).latest("id").numPrivatePaddocksCreated,
            "userPaddockMaxUsers" : paddockUserStatusMaxUsers.objects.filter(
                year=now.year,
                statusLevel="Gold"
            ).latest('id').maxUsers
        })
    
    return userPaddockRules

def cloneDriverTable(paddockId):

    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id

    offical_driver_qset = drivers.objects.all()
    for i in range(offical_driver_qset.count()):
        instance = offical_driver_qset[i]
        number = instance.number
        code = instance.code
        forname = instance.forename
        surname = instance.surname
        nationality = instance.nationality
        thumbImgLocation = instance.thumbImgLocation
        isOnGrid = instance.isOnGrid
        flagId = instance.flag_id
        isIncludedInPrediction = instance.isIncludedInPredictions
        currentTeamId=instance.currentTeam_id

        try:
            entry_id = paddockDrivers.objects.get(
                number = instance.number,
                code = instance.code,
                paddock_id = paddockId
            ).id
            save_type = " updated on "
        except Exception as e:
            print("Cloning driver " + instance.code)
            entry_id = None
            save_type = " saved on "

        if entry_id != None:
            paddock_driver_entry = paddockDrivers.objects.get(
                code = instance.code,
                number = instance.number,
                paddock_id = paddockId
            )
            if paddock_driver_entry.seasonCalendar_id == season_calendarId:
                continue

        db_entry = paddockDrivers(
            id=entry_id,
            number=number,
            code=code,
            forename=forname,
            surname=surname,
            nationality=nationality,
            thumbImgLocation=thumbImgLocation,
            isOnGrid=isOnGrid,
            flag_id=flagId,
            isIncludedInPredictions=isIncludedInPrediction,
            isPaddockCreatedDriver=0,
            paddock_id=paddockId,
            seasonCalendar_id = season_calendarId,
            currentTeam_id=currentTeamId,
            user="Kcaper",
        )

        db_entry.save()

        if instance.subbedInFor_id != None:
            paddock_driver_being_subbed_id = paddockDrivers.objects.get(
                code = drivers.objects.get(
                    id=instance.subbedInFor_id
                ).code
            ).id

            paddock_driver_subber_id = paddockDrivers.objects.get(
                code = instance.code
            ).id

            paddock_driver_being_subbed_instance = paddockDrivers.objects.get(
                id = paddock_driver_being_subbed_id
            )
            paddock_driver_being_subbed_instance.seatDrivenBy_id = paddock_driver_subber_id
            paddock_driver_being_subbed_instance.save()

            paddock_subber_instance = paddockDrivers.objects.get(
                id = paddock_driver_subber_id
            )
            paddock_subber_instance.subbedInFor_id = paddock_driver_being_subbed_id
            
            if paddock_subber_instance.seatDrivenBy == None:
                paddock_subber_instance.seatDrivenBy_id = paddock_subber_instance.id

            paddock_subber_instance.save()

        else:
            paddock_driver_id = paddockDrivers.objects.get(
                code = instance.code,
                paddock_id = paddockId,
            ).id

            paddock_driver_instance = paddockDrivers.objects.get(
                id=paddock_driver_id
            )

            paddock_driver_instance.seatDrivenBy_id = paddock_driver_id
            paddock_driver_instance.save()
        
        instance_driver_last_finishing_position = 99
        try:
            if getNextRaceRound() > 1:
                instance_driver_last_finishing_position = results.objects.get(
                    driver_id = instance.id,
                    seasonCalendar_id = seasonCalendar.objects.get(
                        year=now.year,
                        raceRound = getNextRaceRound() - 1,
                    ).id
                ).position
        except Exception as e:
            instance_driver_last_finishing_position == 99

        paddock_driver_id = paddockDrivers.objects.get(
                code = instance.code,
                paddock_id = paddockId,
            ).id

        paddock_driver_instance = paddockDrivers.objects.get(
            id=paddock_driver_id
        )

        paddock_driver_instance.lastResultPosition = instance_driver_last_finishing_position
        paddock_driver_instance.save()

    print("Cloned driver table for paddock " + paddocks.objects.get(id=paddockId).paddockName)

def updateRacelyManualPredictionPoints(race_round, paddockId):

    def captureMidfeildPredictionPoints(uid, r, paddockId):

        next_race_round = getNextRaceRound()

        last_completed_race = seasonCalendar.objects.filter(isComplete=1).latest("id").raceRound

        cwd = createJsonFolderStructure(paddockId, last_completed_race, "manual")

        try:
            shutil.rmtree(cwd)
        except OSError as e:
            print ("Error: %s - %s." % (e.filename, e.strerror))

        #####Pole and Fastest lap prediction Points
        
        user_fast_lap_driver_id = 1
        user_pole_lap_driver_id = 1
        pole_lap_points = 0
        fastest_lap_points = 0

        if now.year > 2021 and r > 3:
            try:
                user_fast_lap_driver_id = poleFastesLapPredictions.objects.filter(
                    user_id = uid,
                    year=now.year,
                    seasonCalendar_id = season_calendar_id,
                    isFastestLapPrediction=1,
                ).latest('id').driver_id

                if r >= next_race_round: 
                    converted_driver_id = paddockDrivers.objects.get(
                        paddock_id = paddockId,
                        code = drivers.objects.get(
                            id=user_fast_lap_driver_id,
                        ).code
                    ).id

                    user_fast_lap_driver_id = converted_driver_id

            except:
                user_fast_lap_driver_id = None
                print("FAST LAP RESULTS HAVE NOT BEEN SUBMITTED BY USER")

            try:
                user_pole_lap_driver_id = poleFastesLapPredictions.objects.filter(
                    user_id = uid,
                    year=now.year,
                    seasonCalendar_id = season_calendar_id,
                    isPolePrediction=1,
                ).latest('id').driver_id

                if r >= next_race_round:
                    converted_driver_id = paddockDrivers.objects.get(
                        paddock_id = paddockId,
                        code = drivers.objects.get(
                            id=user_pole_lap_driver_id
                        ).code
                    ).id

                    user_pole_lap_driver_id = converted_driver_id

            except Exception as e:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                user_pole_lap_driver_id = None
                print("POLE LAP RESULTS HAVE NOT BEEN SUBMITTED BY USER")

            try:
                result_fastest_lap_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
                    paddock_id = paddockId,
                    isFastestLapResult = 1,
                    seasonCalendar_id = season_calendar_id,
                ).latest('id').fastestLapDriver_id
            except:
                result_fastest_lap_driver_id = paddockDrivers.objects.get(
                    paddock_id = paddockId,
                    code="RAI"
                ).id

            try:
                result_pole_sitter_driver_id = manualPaddockPoleAndFastLapResults.objects.filter(
                    paddock_id = paddockId,
                    isPoleLapResult = 1,
                    seasonCalendar_id = season_calendar_id,
                ).latest('id').polePositionDriver_id
            except:
                result_pole_sitter_driver_id = paddockDrivers.objects.get(
                    paddock_id = paddockId,
                    code="RAI"
                ).id
                
            if result_fastest_lap_driver_id == user_fast_lap_driver_id and user_fast_lap_driver_id != None:
                fastest_lap_points = 1
            
            if result_pole_sitter_driver_id == user_pole_lap_driver_id and user_fast_lap_driver_id != None:
                pole_lap_points = 1

            if user_fast_lap_driver_id == None:
                user_fast_lap_driver_id = paddockDrivers.objects.get(
                    code = "RAI",
                    paddock_id = paddockId,
                ).id

            if user_pole_lap_driver_id == None:
                 user_pole_lap_driver_id = paddockDrivers.objects.get(
                    code = "RAI",
                    paddock_id = paddockId,
                ).id

            try:
                db_entry_id = manualPredictionPoints.objects.filter(
                    seasonCalendar_id=season_calendar_id,
                    isFastestLapPoint = 1,
                    user_id=uid,
                    paddock_id = paddockId,
                ).latest('id').id
                save_type = " updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry1 = manualPredictionPoints(
                id=db_entry_id,
                driver_id=user_fast_lap_driver_id,
                seasonCalendar_id=season_calendar_id,
                isFastestLapPoint = 1,
                user_id=uid,
                pointsForPrediction = fastest_lap_points,
                paddock_id = paddockId,
            )

            db_entry1.save()

            try:
                db_entry_id = manualPredictionPoints.objects.filter(
                    seasonCalendar_id=season_calendar_id,
                    paddock_id = paddockId,
                    isPoleSitterPoint = 1,
                    user_id=uid,
                ).latest('id').id
                save_type = " updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry2 = manualPredictionPoints(
                id=db_entry_id,
                driver_id=user_pole_lap_driver_id,
                seasonCalendar_id=season_calendar_id,
                isPoleSitterPoint = 1,
                user_id=uid,
                pointsForPrediction = pole_lap_points,
                paddock_id = paddockId,
            )

            db_entry2.save()

        ######

        excluded_constructors_list = ruleSetExcludedConstructors.objects.filter(
            paddockRule_id=paddock_rules_id,
            year=now.year,
        ).values_list('constructor_id', flat=True)

        excluded_driver_list = []

        on_grid_driver_qset = paddockDrivers.objects.filter(
            isOnGrid = 1,
            paddock_id = paddockId,
        )

        for i in range(on_grid_driver_qset.count()):
            
            if on_grid_driver_qset[i].subbedInFor_id != None:
                if on_grid_driver_qset[i].subbedInFor.currentTeam_id in excluded_constructors_list:
                    excluded_driver_list.append(on_grid_driver_qset[i].id)

            else:
                if on_grid_driver_qset[i].currentTeam_id in excluded_constructors_list:
                    excluded_driver_list.append(on_grid_driver_qset[i].id)

        try:
            prediction_id = driverPredictions.objects.filter(
                year=now.year,
                isFeatureRaceMidfield=1,
                user_id=uid,
                calendar_id=season_calendar_id
            ).latest('id').id

        except:
            print("User: " + str(uid) + " has no midfield predictions")
            return
        
        try:
            test = manualResults.objects.filter(year=now.year).filter(seasonCalendar_id = season_calendar_id, paddock_id = paddockId,)[0].id
            print("There are outstanding points to be awarded for round: " + str(r) + " user: " + str(uid))
        except:
            print("Whilst user: " + str(uid) + " has made a prediction for round: " + str(r) + ". The manualResults for round " + str(r) + " have not yet been released by Ergast API")
            return

        prediction = driverPredictions.objects.get(id=prediction_id)
        
        initial_predicted_position_dict={}
        initial_predicted_position_dict['positions'] = []
        initial_predicted_position_dict['positions'].append({"1":paddockDrivers.objects.get(code=prediction.position1.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 1})
        initial_predicted_position_dict['positions'].append({"2":paddockDrivers.objects.get(code=prediction.position2.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 2})
        initial_predicted_position_dict['positions'].append({"3":paddockDrivers.objects.get(code=prediction.position3.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 3})
        initial_predicted_position_dict['positions'].append({"4":paddockDrivers.objects.get(code=prediction.position4.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 4})
        initial_predicted_position_dict['positions'].append({"5":paddockDrivers.objects.get(code=prediction.position5.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 5})
        initial_predicted_position_dict['positions'].append({"6":paddockDrivers.objects.get(code=prediction.position6.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 6})
        initial_predicted_position_dict['positions'].append({"7":paddockDrivers.objects.get(code=prediction.position7.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 7})
        initial_predicted_position_dict['positions'].append({"8":paddockDrivers.objects.get(code=prediction.position8.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 8})
        initial_predicted_position_dict['positions'].append({"9":paddockDrivers.objects.get(code=prediction.position9.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 9})
        initial_predicted_position_dict['positions'].append({"10":paddockDrivers.objects.get(code=prediction.position10.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 10})
        initial_predicted_position_dict['positions'].append({"11":paddockDrivers.objects.get(code=prediction.position11.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 11})
        initial_predicted_position_dict['positions'].append({"12":paddockDrivers.objects.get(code=prediction.position12.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 12})
        initial_predicted_position_dict['positions'].append({"13":paddockDrivers.objects.get(code=prediction.position13.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 13})
        initial_predicted_position_dict['positions'].append({"14":paddockDrivers.objects.get(code=prediction.position14.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 14})
        initial_predicted_position_dict['positions'].append({"15":paddockDrivers.objects.get(code=prediction.position15.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 15})
        initial_predicted_position_dict['positions'].append({"16":paddockDrivers.objects.get(code=prediction.position16.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 16})
        initial_predicted_position_dict['positions'].append({"17":paddockDrivers.objects.get(code=prediction.position17.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 17})
        initial_predicted_position_dict['positions'].append({"18":paddockDrivers.objects.get(code=prediction.position18.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 18})
        initial_predicted_position_dict['positions'].append({"19":paddockDrivers.objects.get(code=prediction.position19.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 19})
        initial_predicted_position_dict['positions'].append({"20":paddockDrivers.objects.get(code=prediction.position20.seatDrivenBy.code, paddock_id=paddockId).id, "predicted_position": 20})
        #initial_predicted_position_dict['positions'].append({"21":prediction.position21.seatDrivenBy.id, "predicted_position": 21})
        #initial_predicted_position_dict['positions'].append({"22":prediction.position22.seatDrivenBy.id, "predicted_position": 22})
        initial_predicted_position_list = initial_predicted_position_dict['positions']

        #convertPrediction(paddockId, prediction.id, uid, season_calendar_id, initial_predicted_position_list, "racely")
        initial_position = 1
        for i in range(len(initial_predicted_position_list)):
            if initial_predicted_position_list[i][str(i+1)] == None:
                continue
            if initial_predicted_position_list[i][str(i+1)] not in excluded_driver_list:
                try:
                    db_id = leaderboardManualSingleLinePredictions.objects.get(
                        seasonCalendar_id = season_calendar_id,
                        user_id = uid,
                        paddock_id = paddockId,
                        driverPrediction_id = prediction.id,
                        isRacelyPrediction = 1,
                        driver_id = initial_predicted_position_list[i][str(i+1)],
                    ).id
                    save_type = " updated on "
                except:
                    db_id = None
                    save_type = " saved on "

                db_entry = leaderboardManualSingleLinePredictions(
                    id = db_id,
                    seasonCalendar_id = season_calendar_id,
                    user_id = uid,
                    paddock_id = paddockId,
                    driverPrediction_id = prediction.id,
                    isRacelyPrediction = 1,
                    driver_id = initial_predicted_position_list[i][str(i+1)],
                    predictedPosition = initial_position,
                )

                db_entry.save()
                initial_position = initial_position + 1

            else:
                continue

        updated_leaderboard_qset = leaderboardManualSingleLinePredictions.objects.filter(
            seasonCalendar_id = season_calendar_id,
            user_id = uid,
            paddock_id = paddockId,
            driverPrediction_id = prediction.id,
            isRacelyPrediction = 1,
        ).order_by('predictedPosition')

        results_qset = manualResults.objects.filter(
            seasonCalendar_id = season_calendar_id,
            year = now.year,
            paddock_id = paddockId,
        ).order_by('position')
        
        finishing_position = 0
        for res in range(results_qset.count()):
            
            driverId = results_qset[res].driver_id

            subbed_in_for_driver_code = None

            user_prediction_id_list = getUserUnsubbedRacelyPredictionIdList(paddockId, r, uid, 1)

            if driverId not in user_prediction_id_list:
                if paddockDrivers.objects.get(
                    id=driverId,
                    paddock_id = paddockId,
                ).subbedInFor_id != None:
                    subbed_in_for_driver_code = paddockDrivers.objects.get(
                    id=driverId,
                    paddock_id = paddockId,
                ).subbedInFor.code
            
            if driverId in excluded_driver_list:
                continue
            else:
                finishing_position = finishing_position + 1
            
            driver_predicted_position = updated_leaderboard_qset.get(
                driver_id = driverId
            ).predictedPosition 

            if finishing_position == driver_predicted_position:
                prediction_points = 2
            elif finishing_position - driver_predicted_position == -1:
                prediction_points = 1
            elif finishing_position - driver_predicted_position == 1:
                prediction_points = 1
            else:
                prediction_points = 0

            try:
                db_entry_id = manualPredictionPoints.objects.get(
                    driver_id = driverId,
                    seasonCalendar_id = season_calendar_id,
                    user_id = uid,
                    isFeatureRaceMidfieldPrediction = 1,
                    driverPrediction_id = prediction.id,
                    paddock_id = paddockId,
                ).id
                save_type = "updated on "
            except:
                db_entry_id = None
                save_type = " saved on "

            db_entry = manualPredictionPoints(
                id = db_entry_id,
                predictedPosition = driver_predicted_position,
                finishingPosition = finishing_position,
                pointsForPrediction = prediction_points,
                driver_id = driverId,
                seasonCalendar_id = season_calendar_id,
                user_id = uid,
                isFeatureRaceMidfieldPrediction = 1,
                driverPrediction_id = prediction.id,
                paddock_id = paddockId,
                subbedOutDriverCode = subbed_in_for_driver_code,
            )

            db_entry.save()

        prediction_points_qset = manualPredictionPoints.objects.filter(
            seasonCalendar_id = season_calendar_id,
            user_id = uid,
            isFeatureRaceMidfieldPrediction = 1,
            driverPrediction_id = prediction.id,
            paddock_id = paddockId,
        ).order_by('finishingPosition')

        for pred in range(prediction_points_qset.count()):
            
            instance = prediction_points_qset[pred]

            try:
                forward_looking_entry = prediction_points_qset[pred + 1]
                try:
                    if forward_looking_entry.predictedPosition == prediction_points_qset[pred].finishingPosition:
                        instance.isPredictedSinglePoint = 1
                        instance.pointsForPrediction = 1
                        forward_looking_entry.isFinishingSinglePoint = 1
                        forward_looking_entry.pointsForPrediction = 0
                except:
                    print("")
                try:
                    if forward_looking_entry.finishingPosition == prediction_points_qset[pred].predictedPosition and instance.predictedPosition <= num_drivers:
                        instance.isFinishingSinglePoint = 1
                        instance.pointsForPrediction = 0
                        forward_looking_entry.pointsForPrediction = 1
                        forward_looking_entry.isPredictedSinglePoint = 1
                except:
                    print("")
                if instance.isFinishingSinglePoint == 1 and instance.isPredictedSinglePoint == 1:
                    instance.pointsForPrediction = 1
            except:
                print("")

            if instance.finishingPosition >= num_drivers and pred + 1 == num_drivers:
                instance.isPredictedSinglePoint = 0
                instance.pointsForPrediction = 0
            if pred + 1 > num_drivers:
                instance.pointsForPrediction = 0

            instance.save()
            forward_looking_entry.save()

    #code starts here.
    user_qset = driverPredictions.objects.filter(year=now.year).filter(isFeatureRaceMidfield=1, paddock_id=paddockId)

    print("Generating midfield points for users in paddock: " + str(paddocks.objects.get(id=paddockId).paddockName))

    user_qset = userPaddocks.objects.filter(paddock_id=paddockId)

    paddock_rules_id = paddocks.objects.get(id=paddockId).paddockRules_id
    num_drivers = paddockRules.objects.get(id=paddock_rules_id).numDriversOnMidfieldLeaderBoard
    season_calendar_id = seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id

    manual_prediction_qset = manualPredictionPoints.objects.filter(
        seasonCalendar_id=season_calendar_id,
        paddock_id = paddockId,
    )
    manual_prediction_qset.delete()
    
    for u in range(0, user_qset.count(), 1):
        print("Generating midfield points for user " + str(user_qset[u].user_id))
        captureMidfeildPredictionPoints(user_qset[u].user_id, race_round, paddockId)

        try:
            predicted_qset = predictionPoints.objects.filter(
            user_id = user_qset[u].user.id,
            isFeatureRaceMidfieldPrediction = 1,
            seasonCalendar_id=seasonCalendar.objects.filter(
                year=now.year,
                raceRound=race_round)[0].id,
                paddock_id = paddockId,
            ).order_by('finishingPosition')

            predicted_qset.update(isFinishingSinglePoint=0, isPredictedSinglePoint=0)
        except:
            user_id = user_qset[u].user.id,
            print("ERROR CAPTURING RACELY DRIVER PREDICITON POINTS FOR USER: " + User.objects.get(id=user_id).username)
            continue
        
        for pred in range(0, predicted_qset.count(),1):
            try:
                user_id = predicted_qset[pred].user_id
                if predicted_qset[pred].pointsForPrediction == 1:
                    finishing_record_id = predicted_qset[pred].id
                    predicted_record_id = predicted_qset.get(
                    finishingPosition=predicted_qset.get(
                    id=finishing_record_id).predictedPosition).id

                    predicted = predicted_qset.get(id=finishing_record_id)
                    finishing = predicted_qset.get(id=predicted_record_id)

                    finishing.isPredictedSinglePoint = 1
                    predicted.isFinishingSinglePoint = 1
                    predicted.save()
                    finishing.save()

            except Exception as e:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                continue

            capture_save = paddockPointsCaptureLog(
                id=None, 
                year=now.year, 
                isFeatureRaceMidfieldPoints=1,
                paddock_id=paddockId,
                seasonCalendar_id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=race_round)[0].id)
            capture_save.save()
            print("Round: " + str(race_round) + "'s midfield points have been saved to the database for all users in the " + str(paddocks.objects.get(id=paddockId).paddockName) + " paddock")

    else:
        next_race_round = getNextRaceRound()
        print("Paddock: " + str(paddocks.objects.get(id=paddockId).paddockName) + "'s midfeild points for round: " + str(next_race_round - 1) + " are up to date")
        print("The next race is the " + circuits.objects.get(id=seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].circuit_id).circuitRef + " grand prix on " + str(seasonCalendar.objects.filter(year=now.year).filter(raceRound=next_race_round)[0].featureRaceDate))
        print("")

def updateManualRacelyLeaderboards(r, paddockId): 

    now = datetime.now()
    next_race_round = getNextRaceRound()

    season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound=r).id

    paddock_user_qset = userPaddocks.objects.filter(
        paddock_id = paddockId
    )

    for u in range(paddock_user_qset.count()):
        userId = paddock_user_qset[u].user_id
        round_player_position = 1
        previous_position = 1
        paddock_delta = 0
        current_total_points = 0
        round_points = 0
        previous_total_points = 0
        current_overall_position = 1
        userId = paddock_user_qset[u].user_id
        bonus_points = 0
        fastest_lap_points = 0
        pole_sitter_points = 0

        race_round_points = sum(manualPredictionPoints.objects.filter(
            paddock_id = paddockId,
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isFeatureRaceMidfieldPrediction = 1,
        ).order_by('finishingPosition').values_list('pointsForPrediction', flat=True))

        fastest_lap_points = sum(manualPredictionPoints.objects.filter(
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isFastestLapPoint = 1,
            paddock_id = paddockId,
        ).values_list('pointsForPrediction', flat=True))

        pole_sitter_points = sum(manualPredictionPoints.objects.filter(
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            isPoleSitterPoint = 1,
            paddock_id = paddockId,
        ).values_list('pointsForPrediction', flat=True))

        bonus_points = fastest_lap_points + pole_sitter_points

        round_points = race_round_points + bonus_points

        if r > 1:
            try:
                previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                previous_user_leaderbaord_entry = leaderboards.objects.get(
                    seasonCalendar_id = previous_season_calendarId,
                    paddock_id = paddockId,
                    user_id = userId,
                    isMidfieldGame = 1,
                    isActive = 1,
                )
                previous_total_points = previous_user_leaderbaord_entry.currentTotalPoints
            
            except Exception as e:
                print(e)
                pass

        current_total_points = round_points + previous_total_points

        try:
            entry_id = leaderboards.objects.get(
                seasonCalendar_id = season_calendarId,
                paddock_id = paddockId,
                user_id = userId,
                isMidfieldGame = 1,
            ).id
            save_type = " updated on "
        except:
            entry_id = None
            save_type = " saved on "

        db_entry = leaderboards(
            id = entry_id,
            roundPoints = round_points,
            isMidfieldGame = 1,
            seasonCalendar_id = season_calendarId,
            user_id = userId,
            currentTotalPoints = current_total_points,
            isActive = 1,
            paddock_id = paddockId,
            previousTotalPoints = previous_total_points,
        )
        db_entry.save()

    round_point_qset = leaderboards.objects.filter(
        seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
        isMidfieldGame = 1,
        isActive = 1,
    ).order_by("-roundPoints")

    paddock_postion_qset = leaderboards.objects.filter(
        seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
        isMidfieldGame = 1,
        isActive = 1,
    ).order_by("-currentTotalPoints")

    pos_jump = 1
    position = 1
    previous_player_round_points = 0
    for pos in range(round_point_qset.count()):
        userId = round_point_qset[pos].user_id
        player_round_points = round_point_qset[pos].roundPoints

        if pos == 0:
            round_player_position = position
            previous_player_round_points = player_round_points

        elif player_round_points == previous_player_round_points:
            round_player_position = position
            pos_jump = pos_jump + 1
            previous_player_round_points = player_round_points

        elif player_round_points < previous_player_round_points:
            position = position + pos_jump
            round_player_position = position
            previous_player_round_points = player_round_points
            pos_jump = 1

        user_leaderboard_entry = leaderboards.objects.filter(
            user_id = userId,
            paddock_id = paddockId,
            isMidfieldGame = 1,
            isActive = 1,
            seasonCalendar_id = season_calendarId,
        )
        user_leaderboard_entry.update(
            roundPlayerPosition = round_player_position
        )

    pos_jump = 1
    position = 1
    previous_player_points = 0
    for pos in range(paddock_postion_qset.count()):
        userId = paddock_postion_qset[pos].user_id
        player_total_points = paddock_postion_qset[pos].currentTotalPoints
        if pos == 0:
            player_overall_position = position
            previous_player_points = player_total_points

        elif player_total_points == previous_player_points:
            player_overall_position = position
            pos_jump = pos_jump + 1
            previous_player_points = player_total_points

        elif player_total_points < previous_player_points:
            position = position + pos_jump
            player_overall_position = position
            previous_player_points = player_total_points
            pos_jump = 1

        if r > 1:
            try:
                previous_season_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = r-1).id
                previous_user_leaderbaord_entry = leaderboards.objects.get(
                    seasonCalendar_id = previous_season_calendarId,
                    paddock_id = paddockId,
                    user_id = userId,
                    isMidfieldGame = 1,
                )
                previous_position = previous_user_leaderbaord_entry.currentOverallPosition
            except:
                previous_position = 1

        paddock_delta = previous_position - position

        user_leaderboard_entry = leaderboards.objects.filter(
            user_id = userId,
            paddock_id = paddockId,
            isMidfieldGame = 1,
            isActive = 1,
            seasonCalendar_id = season_calendarId,
        )

        user_leaderboard_entry.update(
            paddockDelta = paddock_delta,
            currentOverallPosition = player_overall_position,
            previousPosition = previous_position,
        )

    print("Leaderboard records for paddock: " + paddocks.objects.get(id=paddockId).paddockName + " for " + seasonCalendar.objects.get(year=now.year, raceRound=r).circuit.circuitRef)

    seasonCalendarInstance = seasonCalendar.objects.get(id=season_calendarId)
    seasonCalendarInstance.midfieldLeaderboardUpdated = 1
    seasonCalendarInstance.save()


