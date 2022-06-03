
from django.shortcuts import render, redirect 
from django.http import HttpResponse
from django.forms import inlineformset_factory
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# Create your views here.

def index(request, *args, **kwargs):
    return render(request, 'frontend/drivers.html')

def teams(request, *args, **kwargs):
    print("running teams view")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def drivers(request, *args, **kwargs):
    print("about to render drivers view")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def midfield(request, *args, **kwargs):
    print("about to render midfield view")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def home(request, *args, **kwargs):
    print("Going to the home page")
    print(request.user.username)
    return render(request, 'fontend/drivers.html')

def paddocks(request, *args, **kwargs):
    print("Going to the paddocks page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def paddockCreate(request, *args, **kwargs):
    print("Going to the create paddock page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def paddockJoin(request, *args, **kwargs):
    print("Going to the join paddock page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def userPaddocks(request, *args, **kwargs):
    print("Going to the join my paddocks page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def leaderboard(request, *args, **kwargs):
    print("Going to the join leaderboard page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def midSeasonDriverPrediction(request, *args, **kwargs):
    print("Going to the mid season driver prediction page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def midSeasonTeamPrediction(request, *args, **kwargs):
    print("Going to the mid season driver prediction page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def myLeaderboards(request, *args, **kwargs):
    print("Going to the Leaderboards")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def paddockRules(request, *args, **kwargs):
    print("Going to the paddock rules page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def myConstructorPredictions(request, *args, **kwargs):
    print("Going to team prediction select page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def manualResultCapture(request, *args, **kwargs):
    print("Going to the manual results capture page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')

def myDriverStandingPredictions(request, *args, **kwargs):
    print("Going to the my driver standings page")
    print(request.user.username)
    return render(request, 'frontend/drivers.html')








