from django.shortcuts import render, redirect 
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import *
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse
from .customSerializers import *

from django.http import HttpResponse
from django.forms import inlineformset_factory
from django.contrib.auth.forms import UserCreationForm

from django.contrib.auth import authenticate, login, logout

from django.contrib import messages

from django.contrib.auth.decorators import login_required

from .functions import *

from .forms import CreateUserForm

from .models import *
from .forms import CreateUserForm

from datetime import datetime
from .functions import midfieldDeadline, getPaddockCode
import json
from django.http import HttpResponse

from datetime import timedelta
from .countdown import manualResultTimer

from time import *
import threading
from datetime import timedelta
import pytz

def registerUser(request):
    if request.user.is_authenticated:
        print(request.user.id)
        createDefaultPredictions(request.user.id)
        return redirect('/')
    else:
        form = CreateUserForm()
        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get('username')
                messages.success(request, 'Account was created for ' + user)
                return redirect('/api/login')
			

        context = {'form':form}
        return render(request, 'register.html', context)

def loginPage(request):
    if request.user.is_authenticated:

        print(User.objects.get(id=request.user.id).username + " SUCCESFULLY LOGGED IN")
        #createDefaultPredictions(request.user.id)
        setupBetaUser(request.user.id)
        countUserPaddocks(request.user.id)
        return redirect('/')
        
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)
            print(username + " FAILED TO LOGIN")
            if user is not None:
                login(request, user)
                return redirect('/api/login/')
            else:
                messages.info(request, 'Username OR password is incorrect')

        context = {}
        return render(request, 'login.html', context)

def logoutUser(request):
	logout(request)
	return redirect('/api/login')

@api_view(['GET'])
def apioverview(request):
    api_urls = {
        'List of flags' : 'flags/',
        'Link new flag' : 'flags/create/',

        'List of constructors' : 'constructors/',
        'Single constructor' : 'constructors/<str:pk>/',
        'Create constructor' : 'constructors/create/',
        'Update constructor' : 'constructors/update/<str:pk>',

        'List of drivers' : 'drivers/',
        'Single driver' : 'drivers/<str:pk>/',
        'Create driver' : 'drivers/create/',
        'Update driver' : 'drivers/update/<str:pk>',

        'List of races' : 'races/',
        'Single race' : 'races/<str:pk>/',
        'Create race' : 'races/create/',
        'Update race' : 'races/update/<str:pk>',

        'List of users' : 'users/',
        'Single user' : 'races/<str:pk>/',
        'Create user' : 'races/create/',
        'Update user' : 'races/update/<str:pk>',

        'List of paddocks' : 'paddocks/',
        'Single paddock' : 'paddocks/<str:pk>/',
        'Create paddock' : 'paddocks/create/',
        'Update paddock' : 'paddocks/update/<str:pk>',

        'Feature Race result by raceId' : 'results/race/<str:pk>',
        'Qualifying result by qualifyingId' : 'results/qualifying/<str:pk>',
        'Sprint race result by sprintRaceId' : 'results/sprint-race/<str:pk>',

        'Season driver standing prediction by userId' : 'predictions/season/driver-standings/<str:pk>/',
        'Season constructor standing prediction by userId' : 'predictions/season/constructor-standings/<str:pk>/',
        'Race midfeild driver finishing order prediction by userId and raceId' : 'predictions/midfield/<str:pk>/<str:pk>/',

        'Season driver standing prediction points by userId' : 'player-points/season/driver-standings/<str:pk>/',
        'Season constructor standing prediction points by userId' : 'player-points/season/constructor-standings/<str:pk>/',
        'Season combined prediction points by userId' : 'player-points/season/combined/<str:pk>/',
        'Midfield points by userId' : 'player-points/midfield/<str:pk>',
        'Midfield points by userId and raceId' : 'player-points/midfield/<str:pk>/<str:pk>',

        'Paddock season constructor-standing leaderboard by PaddockId' : 'leaderboards/constructor-standings/<str:pk>/',
        'Paddock season driver-standing leaderboard by PaddockId' : 'leaderboards/driver-standings/<str:pk>/',
        'Paddock season combined leaderboard by PaddockId' : 'leaderboards/driver-standings/<str:pk>/',
        'Paddock midfield leaderboard by PaddockId' : 'leaderboards/midfield/<str:pk>/',
        'Paddock midfield leaderboard by PaddockId and RaceId' : 'leaderboards/midfield/<str:pk>/<str:pk>/',

        'Season prediction deadline' : 'predictions/deadlines/season/driver-standings/'
    }
    return Response(api_urls)

@api_view(['GET'])
def flagList(request):

    '''user_id_list = userPaddocks.objects.filter(paddock_id=204).values_list("user_id", flat=True)

    data={}

    for user in range(len(user_id_list)):
        
        pole_driver_name = "no prediction"
        fast_driver_name = "no prediction"
        try:
            pole_prediction_driverId = poleFastesLapPredictions.objects.filter(user_id=user_id_list[user], isPolePrediction=1).latest("id").driver_id
            fastest_lap_prediction_id = poleFastesLapPredictions.objects.filter(user_id=user_id_list[user], isFastestLapPrediction=1).latest("id").driver_id
            pole_driver_name = drivers.objects.get(id=pole_prediction_driverId).surname
            fast_driver_name = drivers.objects.get(id=fastest_lap_prediction_id).surname

        except:
            pass

        username = User.objects.get(id=user_id_list[user]).username

        data[user_id_list[user]] = {}

        data[username] = {
            "Pole Pick" : pole_driver_name,
            "Fastest Lap Pick" : fast_driver_name
        }

    pprint(data)'''

    '''paddock_qset = paddocks.objects.filter(
        year=now.year
    )
    
    for p in range(paddock_qset.count()):
        paddockId = paddock_qset[p].id
        paddock_user_qset = userPaddocks.objects.filter(
            paddock_id = paddockId
        )
        
        for u in range(paddock_user_qset.count()):
            userId = paddock_user_qset[u].user_id
            print(userId)
            driver_pre_season_prediction_qset = driverPredictions.objects.filter(
                isSeasonPrediction=1,
                year=now.year,
                user_id = userId,
            ).order_by("id")
            constructor_pre_season_prediction_qset = constructorSeasonPredictions.objects.filter(
                year=now.year,
                user_id = userId,
            ).order_by("id")
            paddock_ruleId = paddock_qset[p].paddockRules_id
            pre_season_driver_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id=paddock_ruleId,
                isPreSeasonDriverRule = 1
            ).startRound
            pre_season_constructor_start_round = paddockRulesStartRounds.objects.get(
                paddockRules_id=paddock_ruleId,
                isPreSeasonConstructorRule = 1
            ).startRound

            #print(driver_pre_season_prediction_qset.count())
            
            for d in range(0, driver_pre_season_prediction_qset.count(), 1):
                driver_predictionId = driver_pre_season_prediction_qset[d].id

                entry = paddockSeasonPredictionStartRounds(
                    id = None,
                    isDriverPrediction = 1,
                    driverPrediction_id = driver_predictionId,
                    paddock_id = paddockId,
                    user_id = userId,
                    paddockRulesStartRound = pre_season_driver_start_round,
                )

                entry.save()

                print("SAVED START ROUND FOR PRE SEAOSON DRIVER PICKS, USER: " + User.objects.get(id=userId).username + " PADDOCK: " + paddocks.objects.get(id=paddockId).paddockName)

            for c in range(0, constructor_pre_season_prediction_qset.count(), 1):

                constructor_predictionId = constructor_pre_season_prediction_qset[c].id

                entry = paddockSeasonPredictionStartRounds(
                    id = None,
                    isConstructorPrediction = 1,
                    constructorPrediction_id = constructor_predictionId,
                    paddock_id = paddockId,
                    user_id = userId,
                    paddockRulesStartRound = pre_season_constructor_start_round,
                )

                entry.save()

                print("SAVED START ROUND FOR PRE SEAOSON CONSTRUCTOR PICKS, USER: " + User.objects.get(id=userId).username + " PADDOCK: " + paddocks.objects.get(id=paddockId).paddockName)''' 
    
    '''from os import listdir
    from os.path import isfile, join

    path = '/Users/johnpapenfus/Google Drive/John/Coding Projects/F1/f1predictions/frontend/static/images/Flags/'

    final_list = []

    onlyfiles = [f for f in listdir(path) if isfile(join(path, f))]
    for i in range(len(onlyfiles)):
        new_string = onlyfiles[i].replace("-", " ")
        newest_string = new_string.replace(".png", "")
        last_string = newest_string.capitalize()
        final_list.insert(0, last_string)

    final_list.sort()
    onlyfiles.sort()
    print(final_list)

    for i in range(len(onlyfiles)):
        try:
            db_id = flags.objects.get(flagImgLocation = './static/images/flags/' + onlyfiles[i]).id
        except:
            db_id = None

        entry = flags(
            id = db_id,
            flagImgLocation = './static/images/flags/' + onlyfiles[i],
            countryName = final_list[i]
        )

        entry.save()'''

    flagId = flags.objects.all().order_by("countryName")
    serializer = flagSerializer(flagId, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def flagAdd(request):
    serializer = flagSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['GET'])
def constructorList(request):
    constructorId = constructors.objects.filter(isOnGrid=1)
    serializer = constructorSerializer(constructorId, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def driverList(request):
    grid_drivers = drivers.objects.all()
    serializer = driverSerializer(grid_drivers, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def driverDetail(request, pk):
    driverId = drivers.objects.get(id=pk)
    serializer = driverSerializer(driverId, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def driverCreate(request):
    serializer = driverSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        pprint(serializer.data)

        driver = drivers.objects.get(code = serializer.data['code'])
        driver.nationality = driver.flag.countryName
        driver.seatDrivenBy_id = driver.id
        driver.save()

        print("CREATED NEW DRIVER")
        pprint(serializer.data)
        pprint(serializer.data['code'])

    else:
        print("ERROR CREATING NEW DRIVER")
    
    return Response(serializer.data)

@api_view(['POST'])
def paddockDriverCreate(request, pk):
    serializer = paddockDriverSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        driver = paddockDrivers.objects.get(code = serializer.data['code'])
        driver.nationality = driver.flag.countryName
        driver.seatDrivenBy_id = driver.id
        driver.paddock_id = pk
        driver.user = request.user.username
        driver.seasonCalendar_id = seasonCalendar.objects.get(
            year=now.year,
            raceRound=getNextRaceRound()
        )
        driver.isPaddockCreatedDriver = 1
        driver.lasrResultPosition = 99
        driver.save()

        print("CREATED NEW DRIVER")
        pprint(serializer.data['code'])

    else:
        print("ERROR CREATING NEW DRIVER")
    
    return Response(serializer.data)

@api_view(['GET','POST'])
def driverUpdate(request, pk):
    driverId = drivers.objects.get(id=pk)
    serializer = driverSerializer(instance=driverId, data=request.data)
    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['POST'])
def constructorCreate(request):
    serializer = constructorSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['GET','POST'])
def constructorUpdate(request, pk):
    constructorId = constructors.objects.get(id=pk)
    serializer = constructorSerializer(instance=constructorId, data=request.data)
    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['GET'])
def seasonDriverPreditionList(request):
    predictionId = driverPredictions.objects.all()
    serializer = seasonDriverStandingPredictionSerializer(predictionId, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def midSeasonDriverPreditionList(request):
    predictionId = driverPredictions.objects.all()
    serializer = midSeasonDriverStandingPredictionSerializer(predictionId, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def seasonDriverStandingPreditionCreate(request):
    serializer = seasonDriverStandingPredictionSerializer(data=request.data)
    if serializer.is_valid():
        print("DATA CAME IN AND WE SAVED IT")
        serializer.save()
    else:
        print("SOMETHING TRIED TO COME IN BUT WAS INVALID")
        print("THE USER IS " + User.objects.get(id=request.user.id).username)
    
    pprint(serializer.data)

    return Response(serializer.data)

#@api_view(['POST'])
#def midSeasonDriverStandingPredictionCreate(request):
    serializer = midSeasonDriverStandingPredictionSerializer(data=request.data)
    if serializer.is_valid():
        print("MID SEASON DATA CAME IN AND WE SAVED IT")
        serializer.save()
    else:
        print("SOMETHING TRIED TO COME IN BUT WAS INVALID")
        print("THE USER IS " + User.objects.get(id=request.user.id).username)
    
    return Response(serializer.data)

@api_view(['GET'])
def seasonDriverPredition(request, pk):
    json_data = driverPopSerializer(request.user.id, "pre season", pk)
    return Response(json_data)

@api_view(['GET'])
def midSeasonDriverPrediction(request):
    json_data = driverPopSerializer(request.user.id, "mid season")
    return Response(json_data)

@api_view(['GET'])
def lastMidfieldPredictionByUser(request):
    try:
        predictionId = driverPredictions.objects.filter(user_id=request.user.id, isFeatureRaceMidfield=1, year=now.year).latest('id')
    except:
        predictionId = driverPredictions.objects.filter(user_id=20, year=now.year, isFeatureRaceMidfield=1).latest('id')
    serializer = midfieldPredictionSerializer(predictionId, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def userList(request):
    userId = User.objects.all()
    serializer = userSerializer(userId, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getUserStatus(request):
    json_data=getUserStatusMaxPlayers(request.user.id)
    return Response(json_data)

@api_view(['GET'])
def getUsername(request):
    try:
        userdata = User.objects.get(id=request.user.id)
    except:
        userdata = None
    serializer = userSerializer(userdata, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def getSeasonDriverPredcitionDeadline(request, pk):
    now = datetime.now()
    paddock_start_round = 1
    paddockId = int(pk)

    if paddockId == 0:
        user_paddock_list = userPaddocks.objects.filter(
            user_id = request.user.id,
        ).values_list("paddock_id", flat=True)

        user_paddock_rule_list = paddocks.objects.filter(
            paddockRules_id__in=user_paddock_list,
        ).values_list("paddockRules_id", flat=True)

        user_paddock_start_round_qset = paddockRulesStartRounds.objects.filter(
            id__in=user_paddock_rule_list,
            isPreSeasonConstructorRule = 1,
        ).order_by("startRound")

        last_completed_round = seasonCalendar.objects.filter(year=now.year, isComplete=1).order_by("raceRound")[0].raceRound

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

        if paddockId == 0 and int(pk) == 0:
            paddockId = paddocks.objects.filter(id__in=user_paddock_list).order_by('-numPlayers')[0].id

    else:
        paddockId = int(pk)

    try:
        paddock_start_round = getPaddockRulesStartRound(paddockId, "constructors")
        deadline = seasonCalendar.objects.get(year=now.year, raceRound=paddock_start_round)
    except:
        deadline = seasonCalendar.objects.get(year=now.year, raceRound=1)

    serializer = seasonDriverPredcitionDeadline(deadline, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def getSeasonConstructorPredcitionDeadline(request, pk):
    now = datetime.now()
    paddock_start_round = 1
    paddockId = int(pk)

    if paddockId == 0:
        user_paddock_list = userPaddocks.objects.filter(
            user_id = request.user.id,
        ).values_list("paddock_id", flat=True)

        user_paddock_rule_list = paddocks.objects.filter(
            paddockRules_id__in=user_paddock_list,
        ).values_list("paddockRules_id", flat=True)

        user_paddock_start_round_qset = paddockRulesStartRounds.objects.filter(
            id__in=user_paddock_rule_list,
            isPreSeasonConstructorRule = 1,
        ).order_by("startRound")

        last_completed_round = seasonCalendar.objects.filter(year=now.year, isComplete=1).order_by("raceRound")[0].raceRound

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

        if paddockId == 0 and int(pk) == 0:
            paddockId = paddocks.objects.filter(id__in=user_paddock_list).order_by('-numPlayers')[0].id

    else:
        paddockId = int(pk)

    try:
        paddock_start_round = getPaddockRulesStartRound(paddockId, "constructors")
        deadline = seasonCalendar.objects.get(year=now.year, raceRound=paddock_start_round)
    except:
        deadline = seasonCalendar.objects.get(year=now.year, raceRound=1)

    serializer = seasonDriverPredcitionDeadline(deadline, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def getMidSeasonPredictionDeadline(request):
    now = datetime.now()
    deadline = seasonCalendar.objects.get(id=14)
    serializer = seasonPreSeasonPredictionDeadline(deadline, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def seasonTeamPrediction(request, pk):
    json_data = teamPopSerializer(request.user.id, pk, "pre season")
    return Response(json_data)

@api_view(['GET'])
def midSeasonTeamPrediction(request):
    json_data = teamPopSerializer(request.user.id, "mid season")
    return Response(json_data)

@api_view(['POST'])
def seasonTeamStandingPreditionCreate(request):
    serializer = seasonConstructorStandingPredictionSerializer(data=request.data)
    print("WHATS GOING ON HERE")
    if serializer.is_valid():
        print("DATA CAME IN AND WE SAVED IT")
        serializer.save()
        pprint(serializer.data)
    else:
        print("SOMETHING TRIED TO COME IN BUT WAS INVALID")
        print("THE USER IS " + User.objects.get(id=request.user.id).username)
    
    return Response(serializer.data)

@api_view(['POST'])
def midSeasonTeamStandingPreditionCreate(request):
    serializer = seasonConstructorStandingPredictionSerializer(data=request.data)
    if serializer.is_valid():
        print("DATA CAME IN AND WE SAVED IT")
        serializer.save()
    else:
        print("SOMETHING TRIED TO COME IN BUT WAS INVALID")
        print("THE USER IS " + User.objects.get(id=request.user.id).username)
    
    return Response(serializer.data)

@api_view(['POST'])
def midfieldPredictionCreate(request):
    serializer = midfieldPredictionCreateSerializer(data=request.data)
    if serializer.is_valid():
        print("RACELY PREDICTION CAME IN FROM AND WE SAVED IT FROM " + User.objects.get(id=request.user.id).username)
        serializer.save()
        
    else:
        print("RACELY PREDICTION TRIED TO COME IN " + User.objects.get(id=request.user.id).username +User.objects.get(id=request.user.id).username + " FROM BUT WAS INVALID")
        print("THE USER IS " + User.objects.get(id=request.user.id).username)
    
    return Response(serializer.data)

@api_view(['GET'])
def getRacleyMidfieldDrivers(request):
    json_data = midfieldDriverSerializer(request.user.id)
    return Response(json_data)

@api_view(['GET'])
def getMidfieldDeadline(request):
    race_id = midfieldDeadline()
    deadline = seasonCalendar.objects.get(id=race_id)
    serializer = midfieldDeadlineSerializer(deadline, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def calendarDetails(request):
    now = datetime.now()
    calendar = seasonCalendar.objects.filter(
        year=now.year,
        raceRound__gt=0,
        ).order_by("raceRound")
    serializer = calendarSerializer(calendar, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def createCalendarEvent(request):
    serializer = calendarSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['GET','POST'])
def updateCalendarEvent(request, pk):
    calendarId = seasonCalendar.objects.get(id=pk)
    serializer = calendarSerializer(instance=calendarId, data=request.data)
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['GET'])
def circuitDetails(request):
    circuit = circuits.objects.all()
    serializer = circuitSerializer(circuit, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def createCircuit(request):
    serializer = circuitSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)

@api_view(['GET','POST'])
def updateCircuit(request, pk):
    circuitId = circuits.objects.get(id=pk)
    serializer = circuitSerializer(instance=circuitId, data=request.data)
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def createPaddock(request):
    print("Creating paddock ...")
    userId = request.user.id
    data=request.data
    #try:
    createPaddockRules(userId, data)
    print('Paddock Sucessfully Created!')
    #except Exception as e:
        #print('Paddock not created')
        #print(e)
        
    return Response(data)

@api_view(['GET'])
def getPaddocks(request):
    all_paddocks = paddocks.objects.filter(isActive=1)
    serializer = paddockSerializer(all_paddocks, many=True)
    return Response(serializer.data)

@api_view(['GET','POST'])
def updatePaddock(request, pk):
    paddockId = paddocks.objects.get(id=pk)
    serializer = paddockSerializer(instance=paddockId, data=request.data)
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['GET'])
def getUserPaddocks(request):
    userId = request.user.id
    json_data = userPaddocksSerializer(userId)
    return Response(json_data)

@api_view(['GET'])
def getPublicPaddocks(request):
    public_paddocks = paddocks.objects.filter(year=now.year, isPublic=1, isActive=1).order_by("paddockName")
    print(public_paddocks.count())
    data = []
    for i in range(0, public_paddocks.count()):
        paddockId = public_paddocks[i].id
        if userPaddocks.objects.filter(year=now.year, user_id=request.user.id, paddock_id = paddockId).count() == 0:
            data.append({
                "id":paddockId,
                "paddockName":public_paddocks[i].paddockName,
                "paddockCode":public_paddocks[i].paddockCode,
                "paddockUserStatusMaxUsers":public_paddocks[i].paddockUserStatusMaxUsers,
                "numPlayers":public_paddocks[i].numPlayers
            })

    return Response(data)

@api_view(['GET'])
def getUserPaddockCodes(request):
    all_paddocks_qset = paddocks.objects.filter(year=now.year, isActive=1).order_by("paddockName")
    user_paddocks_qset = userPaddocks.objects.filter(year=now.year, user_id=request.user.id)
    data = []
    for p in range(0, all_paddocks_qset.count(), 1):
        for u in range(0, user_paddocks_qset.count(), 1):
            if all_paddocks_qset[p].id == user_paddocks_qset[u].paddock_id:
                paddock_full = False
                if all_paddocks_qset[p].numPlayers == all_paddocks_qset[p].paddockUserStatusMaxUsers:
                    paddock_full = True
                data.append({
                    "paddockId":all_paddocks_qset[u].id,
                    "paddockCode":all_paddocks_qset[u].paddockCode,
                    "paddockFull":paddock_full,
                    })
    return Response(data)

@api_view(['POST'])
def addUserToPaddockByCode(request):
    userId = request.user.id

    try:
        paddockId = paddocks.objects.get(paddockCode=request.data['paddockCode']).id
    except:
        return HttpResponse(status=400)

    paddock_name = paddocks.objects.get(paddockCode=request.data['paddockCode']).paddockName
    add_error = addUserToPaddock(userId, paddock_name)

    if add_error == "error: User already a member":
        print("User: " + str(User.objects.get(id=userId).username) + " is already registered to paddock: " + str(paddocks.objects.get(id=paddockId).paddockName))
        return HttpResponse(status=405)
    elif add_error == "error: Banned":
        return HttpResponse(status=403)
    elif add_error == "error: Invalid Code":
        return HttpResponse(status=400)
    elif add_error == "error: Paddock Player Limit":
        return HttpResponse(status=409)
    else:
        print("Added user: " + str(User.objects.get(id=userId).username) + " to paddock: " + str(paddocks.objects.get(id=paddockId).paddockName))
        serializer = paddockSerializer(data=request.data)
        if serializer.is_valid():
            pass

        return Response(serializer.data)

@api_view(['POST'])
def removeSelfFromPaddockByPaddockId(request):
    userId = request.user.id
    paddockId = request.data['paddockId']
    removeUserFromPaddock(userId, paddockId, userId)
    serializer = paddockSerializer(data=request.data)
    if serializer.is_valid():
        pass
        
    return Response(serializer.data)

@api_view(['POST'])
def removeUserFromPaddockByPaddockId(request, pk):

    for i in range(0, len(request.data['removeUserIdList']), 1):
        removeUserFromPaddock(request.data['removeUserIdList'][i], pk, request.user.id)
     
    return HttpResponse(status=200)

@api_view(['POST'])
def banUserFromPaddockByUserId(request, pk):

    for i in range(0, len(request.data['userBanList']), 1):
        banUserFromPaddock(request.data['userBanList'][i], pk, request.user.id)
     
    return HttpResponse(status=200)

@api_view(['POST'])
def makePaddockAdmin(request):
    userId = request.user.id
    paddockId = request.data['paddockId']

    pprint(request.data)

    for i in range(0, len(request.data['affectedUserIdList']), 1):
        user_paddock_entry_qset = userPaddocks.objects.filter(year=now.year, user_id=request.data['affectedUserIdList'][i], paddock_id = paddockId)
        user_paddock_entry_qset.update(isPaddockAdmin=1)
        entry=paddockManagementLog(
            affectedUser_id=request.data['affectedUserIdList'][i],
            executingUser_id=userId,
            action="Admin perminssion added by " + User.objects.get(id=request.data['executingUserId']).username
    )
    entry.save()
        
    return HttpResponse(status=200)

@api_view(['POST'])
def removePaddockAdmin(request):
    userId = request.user.id
    paddockId = request.data['paddockId']

    pprint(request.data)

    for i in range(0, len(request.data['affectedUserIdList']), 1):
        user_paddock_entry_qset = userPaddocks.objects.filter(year=now.year, user_id=request.data['affectedUserIdList'][i], paddock_id = paddockId)
        user_paddock_entry_qset.update(isPaddockAdmin=0)
        entry=paddockManagementLog(
            affectedUser_id=request.data['affectedUserIdList'][i],
            executingUser_id=userId,
            action="Admin perminssion removed by " + User.objects.get(id=request.data['executingUserId']).username
    )
    entry.save()
        
    return HttpResponse(status=200)

@api_view(['POST'])
def makePaddockSuperAdmin(request):
    userId = request.user.id
    paddockId = request.data['paddockId']

    pprint(request.data)

    for i in range(0, len(request.data['affectedUserIdList']), 1):
        user_paddock_entry_qset = userPaddocks.objects.filter(year=now.year, user_id=request.data['affectedUserIdList'][i], paddock_id = paddockId)
        user_paddock_entry_qset.update(isPaddockSuperAdmin=1)
        entry=paddockManagementLog(
            affectedUser_id=request.data['affectedUserIdList'][i],
            executingUser_id=userId,
            action="Super Admin permission added by " + User.objects.get(id=request.data['executingUserId']).username
    )
    entry.save()
        
    return HttpResponse(status=200)

@api_view(['POST'])
def removePaddockSuperAdmin(request):
    userId = request.user.id
    paddockId = request.data['paddockId']

    pprint(request.data)

    for i in range(0, len(request.data['affectedUserIdList']), 1):
        user_paddock_entry_qset = userPaddocks.objects.filter(year=now.year, user_id=request.data['affectedUserIdList'][i], paddock_id = paddockId)
        user_paddock_entry_qset.update(isPaddockSuperAdmin=0)
        entry=paddockManagementLog(
            affectedUser_id=request.data['affectedUserIdList'][i],
            executingUser_id=userId,
            action="Super Admin perminssion removed by " + User.objects.get(id=request.data['executingUserId']).username
    )
    entry.save()
        
    return HttpResponse(status=200)

@api_view(['GET'])
def getBannedList(request):
    banned_list_qset=paddockBannedUsers.objects.all()
    data=[]
    for i in range(0, banned_list_qset.count(), 1):
        data.append({
            "id":banned_list_qset[i].id,
            "userId":banned_list_qset[i].bannedUser_id,
            "paddockId":banned_list_qset[i].paddock_id,
            "paddockCode":paddocks.objects.get(id=banned_list_qset[i].paddock_id).paddockCode,
            "paddockName":paddocks.objects.get(id=banned_list_qset[i].paddock_id).paddockName,

        })
    return Response(data)

@api_view(['GET'])
def getLeaderboardData(request, pk):
    next_race_round = getNextRaceRound()
    if manualResults.objects.filter(
        paddock_id = pk,
        seasonCalendar_id = seasonCalendar.objects.get(
            year=now.year,
            raceRound = next_race_round,
        ).id
    ).count() > 0 and results.objects.filter(
        seasonCalendar_id = seasonCalendar.objects.get(
            year=now.year,
            raceRound = next_race_round,
        ).id
    ).count() == 0:
        json_data = getManualLeaderboardByPaddock(pk)
    else:
        json_data = getLeaderboardByPaddock(pk)

    return Response(json_data)

@api_view(['GET'])
def getUserMidfieldPoints(request, pk):

    next_race_round = getNextRaceRound()

    if manualResults.objects.filter(
        paddock_id = pk,
        seasonCalendar_id = seasonCalendar.objects.get(
            year=now.year,
            raceRound = next_race_round,
        ).id
    ).count() > 0 and results.objects.filter(
        seasonCalendar_id = seasonCalendar.objects.get(
            year=now.year,
            raceRound = next_race_round,
        ).id
    ).count() == 0:
        json_data=updateManualRacelyPredictionPoints(pk)
    else:
        json_data = getUserMidfieldPointsByPaddock(pk)
    return Response(json_data)

@api_view(['GET'])
def getDriverStandingByPaddock(request, pk):
    json_data = getDriverStandingDataByPaddock(pk)
    return Response(json_data)

@api_view(['GET'])
def getConstructorStandingByPaddock(request, pk):
    json_data = getConstructorStandingDataByPaddock(pk)
    return Response(json_data)

@api_view(['GET'])
def getCombinedStandingByPaddock(request, pk):
    json_data = getCombinedPointsByPaddock(pk)
    return Response(json_data)

@api_view(['GET'])
def updateAllResults(request):
    updateAllPredictionPoints()
    json_data = {}
    return Response(json_data)

@api_view(['GET'])
def getPaddockRules(request):
    paddock_rules_qset = paddockRules.objects.filter(
        year=now.year,
    )
    print(now.year)
    print(paddock_rules_qset.count())
    serializer = paddockRulesSerilaizer(paddock_rules_qset, many=True)
    excludedTeamQset = ruleSetExcludedConstructors.objects.filter(
        year=now.year,
    )
    ruleset_list = []
    final_list=[]
    for i in range(0, len(serializer.data), 1):
        try:
            ruleId=serializer.data[i]['id']
        except:
            final_list.pop(i)
            continue
        if serializer.data[i]['ruleSetName'] in ruleset_list:
            continue
        else:
            ruleset_list.append(serializer.data[i]['ruleSetName'])
            final_list.append(serializer.data[i])
        
        temp_list = []
        duplicate_list = []
        for e in range(0, excludedTeamQset.count(), 1):
            if excludedTeamQset[e].paddockRule_id == ruleId and excludedTeamQset[e].constructor_id not in duplicate_list:
                temp_list.append({
                    "constructorId": excludedTeamQset[e].constructor_id,
                    "constructorName": constructors.objects.get(
                        id=excludedTeamQset[e].constructor_id
                    ).name
                })
                duplicate_list.append(excludedTeamQset[e].constructor_id)
        serializer.data[i]["excludedConstructors"] = temp_list
        final_list[-1]["excludedConstructors"] = temp_list

    return Response(final_list)

@api_view(['GET'])
def getDefaultMidfieldExclusions(request):
    json_data=getDefaultExcludedMidfieldConstructorName()
    return Response(json_data)

@api_view(['GET'])
def userJoinablePaddocks(request):
    json_data=getUserNumPaddocksJoinable(request.user.id)
    return Response(json_data)

@api_view(['GET'])
def getPaddockRuleDataByPaddock(request, pk):
    json_data=getPaddockRulesByPaddock(pk)
    return Response(json_data)

@api_view(['GET'])
def predictionChecklist(request):
    userId = request.user.id

    next_race_round = getNextRaceRound()
    next_race_name = seasonCalendar.objects.get(year=now.year, raceRound = next_race_round).circuit.circuitRef
    next_race_calendarId = seasonCalendar.objects.get(year=now.year, raceRound = next_race_round).id
    first_race = 1
    last_race_name = ""
    no_racely_prediction = 0
    has_pole_pick = 0
    has_fast_pick = 0

    if poleFastesLapPredictions.objects.filter(user_id=userId, year=now.year, isFastestLapPrediction=1, seasonCalendar_id=next_race_calendarId).count() > 0:
        has_fast_pick = 1

    if poleFastesLapPredictions.objects.filter(user_id=userId, year=now.year, isPolePrediction=1, seasonCalendar_id=next_race_calendarId).count() > 0:
        has_pole_pick = 1

    if next_race_round > 1:
        try:
            last_race_name = seasonCalendar.objects.get(year=now.year, raceRound = next_race_round - 1).circuit.circuitRef
            first_race = 0
        except:
            pass
        
    racelyPrediction = 0
    driverPreSeasonPrediction = 0
    constructorPreSeasonPrediction = 0

    user_paddocks_qset = userPaddocks.objects.filter(
        year=now.year,
        user_id = request.user.id
    )

    json_data = {}
    
    if driverPredictions.objects.filter(isFeatureRaceMidfield=1, year=now.year, user_id=userId).count() == 0:
        no_racely_prediction = 1
    if driverPredictions.objects.filter(isFeatureRaceMidfield=1, year=now.year, user_id=userId).count() == 1:
        racelyPrediction = 1
    if driverPredictions.objects.filter(isFeatureRaceMidfield=1, year=now.year, user_id=userId, calendar_id=next_race_calendarId).count() > 0 and next_race_round == 1:
        racelyPrediction = 1
    elif driverPredictions.objects.filter(isFeatureRaceMidfield=1, year=now.year, user_id=userId, calendar_id=next_race_calendarId).count() > 1:
        racelyPrediction = 1

    json_data = {
        'noRacelyPrediction': no_racely_prediction,
        'lastRaceName': last_race_name,
        'firstRace': first_race,
        'nextRaceName': next_race_name,
        'racelyPrediction' : racelyPrediction,
        'hasPolePick' : has_pole_pick,
        'hasFastPick' : has_fast_pick,
    }

    json_data['paddocks'] = []

    for p in range(user_paddocks_qset.count()):
        driverPreSeasonPrediction = 0
        constructorPreSeasonPrediction = 0
        paddockId = user_paddocks_qset[p].paddock_id
        if driverPredictions.objects.filter(isSeasonPrediction=1, paddock_id=paddockId, year=now.year, user_id=userId).count() > 0:
            driverPreSeasonPrediction = 1
        if constructorSeasonPredictions.objects.filter(year=now.year, user_id=userId, paddock_id=paddockId).count() > 0:
            constructorPreSeasonPrediction = 1
        json_data['paddocks'].append({
            "paddockName":paddocks.objects.get(
                id=paddockId
            ).paddockName,
            'preSeasonDriverPrediction' : driverPreSeasonPrediction,
            'preSeasonConstructorPrediction' : constructorPreSeasonPrediction,
        })

    pprint(json_data)
    return Response(json_data)
    
@api_view(['GET'])
def poleFastPrediction(request):
    userId = request.user.id
    print("USER")
    print(userId)
    try:
        prediction_template = driverPredictions.objects.filter(
            year=now.year,
            isFeatureRaceMidfield = 1,
            user_id = userId,
        ).latest('id')
    except:
        prediction_template = driverPredictions.objects.filter(
            year=now.year,
            isFeatureRaceMidfield = 1,
            user_id = 20,
        ).latest('id')
    try:
        last_pole_prediction_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            isPolePrediction = 1,
            user_id = userId,
        ).latest("id").driver_id
    except:
        last_pole_prediction_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            isPolePrediction = 1,
            user_id = 20,
        ).latest("id").driver_id
    try:
        last_fast_prediction_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            isFastestLapPrediction = 1,
            user_id = userId,
        ).latest("id").driver_id
    except:
        last_fast_prediction_driver_id = poleFastesLapPredictions.objects.filter(
            year=now.year,
            isFastestLapPrediction = 1,
            user_id = 20,
        ).latest("id").driver_id

    driver_id_list = drivers.objects.filter(
        isOnGrid = 1,
    ).values_list("id", flat=True)

    ordered_midfield_list = []
    ordered_midfield_list.append(prediction_template.position1.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position2.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position3.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position4.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position5.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position6.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position7.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position8.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position9.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position10.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position11.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position12.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position13.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position14.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position15.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position16.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position17.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position18.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position19.seatDrivenBy_id)
    ordered_midfield_list.append(prediction_template.position20.seatDrivenBy_id)

    fastest_lap_driver_id_list = []
    pole_driver_id_list = []

    fastest_lap_driver_id_list.append(last_fast_prediction_driver_id)
    pole_driver_id_list.append(last_pole_prediction_driver_id)

    for i in range(len(ordered_midfield_list)):
        if ordered_midfield_list[i] == last_pole_prediction_driver_id:
            print("ok")
        else:
            pole_driver_id_list.append(ordered_midfield_list[i])
    
        if ordered_midfield_list[i] == last_fast_prediction_driver_id:
            continue
        else:
            fastest_lap_driver_id_list.append(ordered_midfield_list[i])

    print(fastest_lap_driver_id_list)

    data = {}
    data['fastDrivers'] = []
    data['poleDrivers'] = []
    for i in range(len(fastest_lap_driver_id_list)):
        if fastest_lap_driver_id_list[i] == None:
            continue
        team = drivers.objects.get(id=fastest_lap_driver_id_list[i]).currentTeam
        driver = drivers.objects.get(id=fastest_lap_driver_id_list[i]).seatDrivenBy
        data['fastDrivers'].append({
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
            "constructorIconColor" : driver.seatDrivenBy.currentTeam.constructorIconColor,
        })

    for i in range(len(pole_driver_id_list)):
        if pole_driver_id_list[i] == None:
            continue
        team = constructors.objects.get(id=drivers.objects.get(id=pole_driver_id_list[i]).currentTeam_id)
        driver = drivers.objects.get(id=pole_driver_id_list[i]).seatDrivenBy
        data['poleDrivers'].append({
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
            "constructorIconColor" : driver.seatDrivenBy.currentTeam.constructorIconColor,
        })

    json_data = json.dumps(data)
    return Response(json_data)

@api_view(['POST'])
def polePredictionSubmit(request):
    serializer = poleFastPostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print(User.objects.get(id=request.user.id).username + " PUTS " + drivers.objects.get(id=serializer.data['driver']).surname + " ON POLE FOR " + seasonCalendar.objects.get(id=serializer.data["seasonCalendar"]).circuit.circuitRef)
        
    else:
        print("POLE PREDICTION TRIED TO COME IN FROM " + User.objects.get(id=request.user.id).username +User.objects.get(id=request.user.id).username + " BUT WAS INVALID")
    
    return Response(serializer.data)

@api_view(['POST'])
def fastestLapPredictionSubmit(request):
    serializer = poleFastPostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print(User.objects.get(id=request.user.id).username + " GIVES " + drivers.objects.get(id=serializer.data['driver']).surname + " THE FASTEST LAP FOR " + seasonCalendar.objects.get(id=serializer.data["seasonCalendar"]).circuit.circuitRef)
        
    else:
        print("POLE PREDICTION TRIED TO COME IN FROM " + User.objects.get(id=request.user.id).username +User.objects.get(id=request.user.id).username + " BUT WAS INVALID")
    
    return Response(serializer.data)

@api_view(['POST'])
def manualPoleResultSubmit(request):
    now=datetime.now()
    data=request.data
    pprint(data)
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id

    entry = manualPaddockPoleAndFastLapResults(
        createdBy = request.user.username,
        polePositionDriver_id = data['driver_id'],
        seasonCalendar_id = season_calendarId,
        paddock_id = data['paddock_id'],
        isPoleLapResult = 1,
    )
    entry.save()

    print("CREATED MANUAL POLE SITTER RESTULT")

    return HttpResponse(status=200)

@api_view(['POST'])
def manualFastesLapResultSubmit(request):
    now=datetime.now()
    data=request.data
    pprint(data)
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id

    entry = manualPaddockPoleAndFastLapResults(
        createdBy = request.user.username,
        fastestLapDriver_id = data['driver_id'],
        seasonCalendar_id = season_calendarId,
        paddock_id = data['paddock_id'],
        isFastestLapResult = 1,
    )
    entry.save()

    print("CREATED MANUAL FASTEST LAP SITTER RESTULT")

    return HttpResponse(status=200)

@api_view(['POST'])
def captureManualResults(request, pk):
    user_id = request.user.id

@api_view(['GET'])
def get5MinuteDeadline(request, pk):
    data = {}
    now=datetime.now()
    paddockId = int(pk)
    time_str = str(now)
    date_format_str = '%Y-%m-%d %H:%M:%S.%f'
    given_time = datetime.strptime(time_str, date_format_str)
    n = 5
    final_time = given_time + timedelta(minutes=n)
    final_time_str = final_time.strftime('%Y-%m-%d %H:%M:%S.%f')
    data = {
        "paddockId":paddockId,
        "timePlus5Mins":final_time_str,
    }

    countdown_thread = threading.Thread(target=manualResultTimer)
    countdown_thread.start()

    json_data = json.dumps(data)
    return Response(data)

@api_view(['GET'])
def clearManualResultLock(request, pk):
    data = {}
    paddock_manual_result_log_qset = manualResultLog.objects.filter(
        paddock_id = pk,
    )
    paddock_manual_result_log_qset.update(isGeneratingResult = 0)

@api_view(['GET'])
def getAllDrivers(request, pk):
    userId = request.user.id
    if userId != "Anonymous":
        data = substitutionPopSerializer(userId, pk)

    return Response(data)

@api_view(['GET'])
def getPaddockDrivers(request, pk):
    userId = request.user.id
    if userId != "Anonymous":
        data = getPaddockManualDrivers(userId, pk)

    return Response(data)

@api_view(["GET"])
def getPaddockName(requesst, pk):
    data = {
        "paddockName" : paddocks.objects.get(
            id=pk
        ).paddockName
    }
    json_data = json_data = json.dumps(data)
    return Response(json_data)

@api_view(['POST'])
def submitManualDriverSubstitution(request):
    user_id = request.user.id
    username = request.user.username
    data = request.data
    paddockId = data['paddock_id']
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id

    print(request.data)

    incoming_driver_entry = paddockDrivers.objects.get(
        id=data['incomingDriver_id']
    )
    outgoing_driver_entry = paddockDrivers.objects.get(
        id=data['outgoingDriver_id']
    )

    print("INCOMING " + str(incoming_driver_entry.code + " " + str(incoming_driver_entry.id))) 
    print("OUTGOING " + str(outgoing_driver_entry.code + " " + str(outgoing_driver_entry.id)))

    if incoming_driver_entry.subbedInFor_id != None:
        incoming_driver_team_id = incoming_driver_entry.subbedInFor.currentTeam_id
    else:
        incoming_driver_team_id = incoming_driver_entry.currentTeam_id
        incoming_driver_entry.seatDrivenBy_id = incoming_driver_entry.id
        incoming_driver_entry.save()

    if outgoing_driver_entry.subbedInFor_id != None:
        outgoing_driver_team_id = outgoing_driver_entry.subbedInFor.currentTeam_id
    else:
        outgoing_driver_team_id = outgoing_driver_entry.currentTeam_id
        outgoing_driver_entry.seatDrivenBy_id = outgoing_driver_entry.id
        outgoing_driver_entry.save()

    if outgoing_driver_team_id == incoming_driver_team_id:
        print("THESE DRIVER ARE IN THE SAME TEAM")
        return HttpResponse(status=200)

    if incoming_driver_entry.isOnGrid == 0:
        print("MAKING A SUB FOR A DRIVER NOT ON THE GRID")

    elif incoming_driver_entry.isOnGrid == 1 and outgoing_driver_entry.isOnGrid == 1:
        print("BOTH TEAMS ARE NOT ON THE GRID")

        incoming_driverId = incoming_driver_entry.id
        outgoing_driverId = outgoing_driver_entry.id

        try:
            incoming_driver_sdb_id = incoming_driver_entry.seatDrivenBy_id
            if incoming_driver_sdb_id == incoming_driver_entry.id:
                incoming_driver_sdb_id = None
        except:
            incoming_driver_sdb_id = None

        try:
            outgoing_driver_sdb_id = outgoing_driver_entry.seatDrivenBy_id
            if outgoing_driver_sdb_id == outgoing_driver_entry.id:
                outgoing_driver_sdb_id = None
        except:
            outgoing_driver_sdb_id = None

        try:
            incoming_driver_sif_id = incoming_driver_entry.subbedInFor_id
        except:
            incoming_driver_sif_id = None

        try:
            outgoing_driver_sif_id = outgoing_driver_entry.subbedInFor_id
        except:
            outgoing_driver_sif_id = None

        incoming_driver_teamId = incoming_driver_entry.currentTeam_id
        outgoing_driver_teamId = outgoing_driver_entry.currentTeam_id

        incoming_driver_team_driver_qset = paddockDrivers.objects.filter(
            currentTeam_id = incoming_driver_teamId
        )

        for i in range(incoming_driver_team_driver_qset.count()):
            if incoming_driver_team_driver_qset[i].id != incoming_driverId:
                incoming_driver_team_mate_id = incoming_driver_team_driver_qset[i].id

        outgoing_driver_team_driver_qset = paddockDrivers.objects.filter(
            currentTeam_id = outgoing_driver_teamId
        )

        for i in range(outgoing_driver_team_driver_qset.count()):
            if outgoing_driver_team_driver_qset[i].id != outgoing_driverId:
                outgoing_driver_team_mate_id = outgoing_driver_team_driver_qset[i].id

        if incoming_driver_sdb_id != None:
            incoming_driver_sdb_entry = paddockDrivers.objects.get(
                id = incoming_driver_sdb_id
            )

        if outgoing_driver_sdb_id != None:
            outgoing_driver_sdb_entry = paddockDrivers.objects.get(
                id = outgoing_driver_sdb_id
            )

        if incoming_driver_sif_id != None:
            incoming_driver_sif_entry = paddockDrivers.objects.get(
                id = incoming_driver_sif_id
            )

        if outgoing_driver_sif_id != None:
            outgoing_driver_sif_entry = paddockDrivers.objects.get(
                id = outgoing_driver_sif_id
            )

        incoming_driver_team_mate_entry = paddockDrivers.objects.get(
            id = incoming_driver_team_mate_id
        )

        outgoing_driver_team_mate_entry = paddockDrivers.objects.get(
            id = outgoing_driver_team_mate_id
        )

        if incoming_driver_entry.seatDrivenBy_id == incoming_driver_entry.id and outgoing_driver_entry.seatDrivenBy_id == outgoing_driver_entry.id:
            print("A MAKING A STRAIGHT SWOP")
            incoming_driver_entry.seatDrivenBy_id = incoming_driverId
            outgoing_driver_entry.seatDrivenBy_id = outgoing_driverId
            incoming_driver_entry.subbedInFor_id = incoming_driverId
            outgoing_driver_entry.subbedInFor_id = outgoing_driverId

            incoming_driver_entry.save()
            outgoing_driver_entry.save()

        elif incoming_driver_entry.subbedInFor_id == outgoing_driverId and outgoing_driver_entry.subbedInFor_id == incoming_driverId:
            print("B DRIVERS ARE DRIVING EACH OTHERS CAR")
            incoming_driver_entry.seatDrivenBy_id = incoming_driverId
            outgoing_driver_entry.seatDrivenBy_id = outgoing_driverId
            incoming_driver_entry.subbedInFor_id = None
            outgoing_driver_entry.subbedInFor_id = None

            incoming_driver_entry.save()
            outgoing_driver_entry.save()

        elif incoming_driver_entry.subbedInFor_id == outgoing_driver_team_mate_id and outgoing_driver_entry.subbedInFor_id == incoming_driver_team_mate_id:
            print("C BOTH DRIVERS ARE DRIVING THIER OPPOSING DRIVERS TEAM MATES CAR")

            if incoming_driver_team_mate_entry.isOnGrid == 1 and outgoing_driver_team_mate_entry.isOnGrid == 1:
                print("1 BOTH DRIVER TEAM MATES ARE ON THE GRID")

                incoming_driver_team_mate_entry.seatDrivenBy_id = outgoing_driver_team_mate_id
                outgoing_driver_team_mate_entry.seatDrivenBy_id = incoming_driver_team_mate_id
                incoming_driver_team_mate_entry.subbedInFor_id = outgoing_driver_team_mate_id
                outgoing_driver_team_mate_entry.subbedInFor_id = incoming_driver_team_mate_id

                incoming_driver_entry.seatDrivenBy_id = incoming_driverId
                outgoing_driver_entry.seatDrivenBy_id = outgoing_driverId
                incoming_driver_entry.subbedInFor_id = None
                outgoing_driver_entry.subbedInFor_id = None

                incoming_driver_team_mate_entry.save()
                outgoing_driver_team_mate_entry.save()
                incoming_driver_entry.save()
                outgoing_driver_entry.save()

            elif incoming_driver_team_mate_entry.isOnGrid == 0 and outgoing_driver_team_mate_entry.isOnGrid == 0:
                print("2 NEITHER DRIVERS TEAM MATES ARE ON THE GRID")

                outgoing_team_mate_sdb_id = paddockDrivers.objects.get(
                    id=outgoing_driver_team_mate_entry.seatDrivenBy_id
                ).id

                outgoing_team_mate_sdb_entry = paddockDrivers.objects.get(
                    id = outgoing_team_mate_sdb_id
                )

                incoming_team_mate_sdb_id = paddockDrivers.objects.get(
                    id=incoming_driver_team_mate_entry.seatDrivenBy_id
                ).id

                incoming_team_mate_sdb_entry = paddockDrivers.objects.get(
                    id = incoming_team_mate_sdb_id
                )

                incoming_team_mate_sdb_entry.seatDrivenBy_id = outgoing_team_mate_sdb_entry.id
                outgoing_team_mate_sdb_entry.seatDrivenBy_id = incoming_team_mate_sdb_entry.id
                incoming_team_mate_sdb_entry.subbedInFor_id = outgoing_team_mate_sdb_entry.id
                outgoing_team_mate_sdb_entry.subbedInFor_id = incoming_team_mate_sdb_entry.id

                incoming_driver_entry.seatDrivenBy_id = incoming_driverId
                outgoing_driver_entry.seatDrivenBy_id = outgoing_driverId
                incoming_driver_entry.subbedInFor_id = None
                outgoing_driver_entry.subbedInFor_id = None

                incoming_team_mate_sdb_entry.save()
                outgoing_team_mate_sdb_entry.save()
                incoming_driver_entry.save()
                outgoing_driver_entry.save()

            else:
                if incoming_driver_team_mate_entry.isOnGrid == 1 and outgoing_driver_team_mate_entry.isOnGrid == 0:
                    print("3a THE OUTGOING DRIVERS TEAM MATE IS NOT ON THE GRID")

                    outgoing_team_mate_sdb_id = paddockDrivers.objects.get(
                        id=outgoing_driver_team_mate_entry.seatDrivenBy_id
                    ).id

                    outgoing_team_mate_sdb_entry = paddockDrivers.objects.get(
                        id = outgoing_team_mate_sdb_id
                    )

                    incoming_driver_team_mate_entry.seatDrivenBy_id = outgoing_driver_team_mate_id
                    outgoing_team_mate_sdb_entry.seatDrivenBy_id = incoming_team_mate_sdb_entry.id
                    incoming_driver_team_mate_entry.subbedInFor_id = outgoing_driver_team_mate_id
                    outgoing_team_mate_sdb_entry.subbedInFor_id = incoming_team_mate_sdb_entry.id

                    incoming_driver_entry.seatDrivenBy_id = incoming_driverId
                    outgoing_driver_entry.seatDrivenBy_id = outgoing_driverId
                    incoming_driver_entry.subbedInFor_id = None
                    outgoing_driver_entry.subbedInFor_id = None

                    incoming_driver_team_mate_entry.save()
                    outgoing_team_mate_sdb_entry.save()
                    incoming_driver_entry.save()
                    outgoing_driver_entry.save()

                else:
                    print("3b THE OUTGOING DRIVERS TEAM MATE IS ON THE GRID")
                
                if outgoing_driver_team_mate_entry.isOnGrid == 0 and outgoing_driver_team_mate_entry.isOnGrid == 1:
                    print("4a THE INCOMING DRIVERS TEAM MATE IS NOT ON THE GRID")

                else:
                    print("4b THE INCOMING DRIVERS TEAM MATE IS ON THE GRID")

        elif incoming_driver_entry.subbedInFor_id == outgoing_driver_team_mate_id:
            print("D THE INCOMING DRIVER IS DRIVING THE SEAT OF THE OUTGOING DRIVERS TEAM MATE")

            if outgoing_driver_team_mate_entry.seatDrivenBy_id != incoming_driver_team_mate_entry.id:
                print("1 THE OUTGOING DRIVERS TEAM MATE IS NOT DRIVING HIS OWN CAR")

                if outgoing_driver_team_mate_entry.isOnGrid == 1:
                    print("x THE OUTGOING DRIVERS TEAM MATE IS NOT ON THE GRID")

                else:
                    print("y THE OUTGOING DRIVERS TEAM MATE IS NOT ON THE GRID")

            else:
                print("2 THE OUTGOING DRIVERS TEAM MATE IS DRIVING HIS OWN CAR")

            if outgoing_driver_entry.seatDrivenBy_id == outgoing_driverId:
                print("3 HOW DID WE GET HERE")
                
            elif outgoing_driver_entry.subbedInFor_id != None:
                print("4 THE OUTGOING DRIVER IS DRIVING SOMEONE ELSES CAR")

                if outgoing_driver_sif_entry.isOnGrid == 0:
                    print("a1 THE OUTGOING DRIVER IS SUBBING DRIVING FOR SOMEONE OFF GRID")

                elif outgoing_driver_sif_entry.isOnGrid == 1:
                    print("a2 THE OUTGOING DRIVER IS SUBBING DRIVING FOR SOMEONE ON GRID")

        elif outgoing_driver_entry.subbedInFor_id == incoming_driver_team_mate_id:
            print("E THE OUTGOING DRIVER IS DRIVING THE SEAT OF THE INCOMING DRIVERS TEAM MATE")

            if incoming_driver_team_mate_entry.seatDrivenBt_id != incoming_driver_team_mate_entry.id:
                print("THE INCOMING DRIVERS TEAM MATE IS NOT DRIVING HIS OWN CAR")

                if incoming_driver_team_mate_entry.isOnGrid == 1:
                    print("x THE INCOMING DRIVERS TEAM MATE IS NOT ON THE GRID")

                else:
                    print("y THE INCOMING DRIVERS TEAM MATE IS NOT ON THE GRID")

            else:
                print("THE INCOMING DRIVERS TEAM MATE IS DRIVING HIS OWN CAR")

            if incoming_driver_entry.seatDrivenBy_id == incoming_driverId:
                print("1 HOW DID WE GET HERE")
            
            elif incoming_driver_entry.subbedInFor_id != None:
                print("2 THE INCOMING DRIVER IS DRIVING SOMEONE ELSES CAR")

                if incoming_driver_sif_entry.isOnGrid == 0:
                    print("a1 THE INCOMING DRIVER IS SUBBING DRIVING FOR SOMEONE OFF GRID")

                elif outgoing_driver_sif_entry.isOnGrid == 1:
                    print("a2 THE INCOMING DRIVER IS SUBBING DRIVING FOR SOMEONE ON GRID")

        elif incoming_driver_sif_id != None and outgoing_driver_sif_id != None:
            print("F BOTH DRIVERS ARE SUBBING")

            if incoming_driver_sif_entry.isOnGrid == 0:
                print("1a THE INCOMING DRIVER IS SUBBING FOR SOMEONE OFF GRID")

            else:
                print("1b THE INCOMING DRIVER IS SUBBING FOR SOMEONE ON GRID")

            if outgoing_driver_sif_entry.isOnGrid == 0:
                print("2a THE OUTGOING DRIVER IS SUBBING FOR SOMEONE OFF GRID")

            else:
                print("2a THE OUTGOING DRIVER IS SUBBING FOR SOMEONE ON GRID")

        elif incoming_driver_sif_id == None and outgoing_driver_sif_id != None:
            print("G THE OUTGOING DRIVER IS SUBBING ONLY")
            if incoming_driver_sif_entry.isOnGrid == 0:
                print("1a THE INCOMING DRIVER IS SUBBING FOR SOMEONE OFF GRID")

            else:
                print("1b THE INCOMING DRIVER IS SUBBING FOR SOMEONE ON GRID")

        elif outgoing_driver_sif_id != None and outgoing_driver_sif_id == None:
            print("H THE INCOMING DRIVER IS SUBBING ONLY")

            if outgoing_driver_sif_entry.isOnGrid == 0:
                print("2a THE OUTGOING DRIVER IS SUBBING FOR SOMEONE OFF GRID")

            else:
                print("2a THE OUTGOING DRIVER IS SUBBING FOR SOMEONE ON GRID")


        else:
            print("WE ARE HERE")

        return HttpResponse(status=200)

        #incoming_driver_entry.seatDrivenBy_id = outgoing_driverId
        #outgoing_driver_entry.seatDrivenBy_id = incoming_driverId
        #incoming_driver_entry.subbedInFor_id = outgoing_driverId
        #outgoing_driver_entry.subbedInFor_id = incoming_driverId

@api_view(['POST'])
def submitManualResult(request):
    data = request.data
    userId = request.user.id
    season_calendarId = data['seasonCalendar_id']
    paddockId = data['paddock_id']

    try:
        paddock_manual_pole_driverId = manualPaddockPoleAndFastLapResults.objects.filter(
            paddock_id = paddockId,
            seasonCalendar_id = season_calendarId,
            isPoleLapResult = 1,
        ).latest('id').polePositionDriver_id
        print("!!!!!!!!!!!!!!!!!")
        print(paddock_manual_pole_driverId)
    except:
        paddock_manual_pole_driverId = None

    try:
        paddock_manual_fastest_lapId = manualPaddockPoleAndFastLapResults.objects.filter(
            paddock_id = paddockId,
            seasonCalendar_id = season_calendarId,
            isFastestLapResult = 1,
        ).latest('id').fastestLapDriver_id
        
    except:
        paddock_manual_fastest_lapId = None

    try:
        paddock_admin_list = userPaddocks.objects.filter(
            paddock_id = paddockId,
            isPaddockAdmin = 1
        ).values_list("user_id", flat = True)

        if userId not in paddock_admin_list:
            return HttpResponse(status=501)

    except Exception as e:
        print(e)
        return HttpResponse(status=500)

    print(data['results'])
    
    for i in range(0, len(data['results']), 1):

        instance = paddockDrivers.objects.get(
            id = int(data['results'][i]['Driver']['driver_id'])
        )

        if instance.isOnGrid == 0:
            continue

        has_fastest_lap = 0
        is_pole_sitter = 0

        if instance.id == paddock_manual_pole_driverId:
            is_pole_sitter = 1
        if instance.id == paddock_manual_fastest_lapId:
            has_fastest_lap = 1

        try:
            db_entry_id = manualResults.objects.get(
                year = now.year,
                driver_id = instance.id,
                seasonCalendar_id = season_calendarId,
            ).id
            save_type = " UPDATED "
        except:
            db_entry_id = None
            save_type = " SAVED "

        driverId = instance.id

        if paddockDrivers.objects.get(id=driverId).subbedInFor_id != None:
            teamId = paddockDrivers.objects.get(id=driverId).subbedInFor.currentTeam_id
        else:
            teamId = paddockDrivers.objects.get(id=driverId).currentTeam_id

        db_entry = manualResults(
            id = db_entry_id,
            year = now.year,
            position = i+1,
            positionText = str(i+1),
            #points = categoryDriverResultPoints.objects.get(
            #    position = i+1,
            #   category = data['category'],
            #).pointsForPosition,
            points = 0,
            constructor_id = teamId,
            driver_id = driverId,
            seasonCalendar_id = season_calendarId,
            paddock_id = paddockId,
            isPoleSitter = is_pole_sitter,
            hasFastestLap = has_fastest_lap,
        )
        db_entry.save()

        log_entry = manualResultLog(
            isGeneratingLeaderboard = 1,
            paddock_id = paddockId,
            user_id = request.user.id,
            seasonCalendar_id = season_calendarId
        )
        log_entry.save()

        print(save_type + " MANUAL RESULT FOR DRIVER + " + str(paddockDrivers.objects.get(id=driverId).code) + " FOR USER " + User.objects.get(id=userId).username + " RACE " + seasonCalendar.objects.get(id=season_calendarId).circuit.circuitRef)

    race_round = seasonCalendar.objects.get(id=season_calendarId).raceRound

    updateRacelyManualPredictionPoints(race_round, paddockId)
    updateManualRacelyLeaderboards(race_round, paddockId)

    return HttpResponse(status=200)

@api_view(['GET'])
def manualResultsValidation(request, pk):
    now = datetime.now()
    is_paddock_admin = 0
    generating_result = 0
    server_error = 0
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id
    userId = request.user.id
    paddockId = paddocks.objects.get(id=pk)
    
    try:
        if userPaddocks.objects.get(
            user_id = userId,
            paddock_id = paddockId
        ).isPaddockAdmin == 1:
            is_paddock_admin = 1
    except:
        server_error = 1

    generating_qset = manualResultLog.objects.filter(
        isGeneratingLeaderboard = 1,
        #seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
    )

    if generating_qset.count() > 0:
        print("and now here")
        utc=pytz.UTC
        last_generation_time_plus_5 = generating_qset.latest('timeStamp').timeStamp.replace(tzinfo=utc) + timedelta(minutes=5)
        print(last_generation_time_plus_5)
        print(now.replace(tzinfo=utc))
        if last_generation_time_plus_5 < now.replace(tzinfo=utc):
            generating_qset.update(isGeneratingLeaderboard = 0)
        else:
            generating_result = 1

    data = {
        "generatingResult" : generating_result,
        "isPaddockAdmin" : is_paddock_admin,
        "serverError" : server_error,
    }

    json_data = json_data = json.dumps(data)
    return Response(json_data)

@api_view(['GET'])
def setLeaderboardToOpen(request, pk):

    paddockId = paddocks.objects.get(id=pk)
    season_calendarId = seasonCalendar.objects.get(
        year=now.year,
        raceRound = getNextRaceRound()
    ).id

    qset = manualResultLog.objects.filter(
        isGeneratingLeaderboard = 1,
        #seasonCalendar_id = season_calendarId,
        paddock_id = paddockId,
    )

    qset.update(isGeneratingLeaderboard = 0)

    if qset.count() > 0:
        print("UNLOCKED THE LEADERBOARD FOR " + str(qset[0].paddock.paddockName))

    print("SETTING THE PADDOCK TO OPEN")

    return HttpResponse(status=200)

@api_view(['GET'])
def setLeaderboardToGenerating(request, pk):

    try:
        userId = request.user.id
        paddockId = paddocks.objects.get(id=pk).id
        season_calendarId = seasonCalendar.objects.get(
            year=now.year,
            raceRound = getNextRaceRound()
        ).id

        try:
            entry_id = manualResultLog(
                user_id = userId,
                paddock_id = pk,
                isGeneratingLeaderboard = 1,
                seasonCalendar_id = season_calendarId,
            ).id
        except:
            entry_id = None

        entry = manualResultLog(
            id = entry_id,
            user_id = userId,
            paddock_id = paddockId,
            isGeneratingLeaderboard = 1,
            seasonCalendar_id = season_calendarId,
        )
        entry.save()

        print("LOCKING LEADERBOARD GENERATION FOR " + paddocks.objects.get(id=paddockId).paddockName)

        return HttpResponse(status=200)
    
    except:
        return HttpResponse(status=201)





    




    

    




        


    
    