
from django.urls import path, include
from .views import *
from django.contrib import admin
#from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', index),
    path('paddocks', paddocks, name='Paddocks'),
    path('create-paddock', paddockCreate, name='Create Paddock'),
    path('join-paddock', paddockJoin, name='Join Paddock'),
    path('midfield-predictions', midfield, name='Midfield Prediction'),
    path('driver-predictions/<str:pk>', drivers, name='Driver Standing Prediction'),
    path('team-predictions/<str:pk>', teams, name='Team Standing Prediction'),
    path('f1homepage', index, name='Home'),
    path('leaderboards/<str:pk>', leaderboard, name="Leaderboard"),
    path('my-paddocks', userPaddocks, name="My Paddocks"),
    path('mid-season-driver-predictions', midSeasonDriverPrediction, name="Mid Season Driver Predictions"),
    path('mid-season-team-predictions', midSeasonTeamPrediction, name="Mid Season Team Predictions"),
    path('home', home, name='Home'),
    path('my-leaderboards', myLeaderboards, name="My Leaderboards"),
    path('paddock-rules/<str:pk>', paddockRules, name="Paddock Rules"),
    path('my-constructor-predictions', myConstructorPredictions, name="Team prediction Select"),
    path('manual-result-capture/<str:pk>', manualResultCapture, name="Manaul result capture"),
    path('my-driver-standing-predictions', myDriverStandingPredictions, name="My driver standing predictions"),
    
]