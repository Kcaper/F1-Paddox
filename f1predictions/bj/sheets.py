import json
import lxml
import requests
import pprint

request = requests.get('https://ergast.com/api/f1/2008/constructorStandings/1.json')
request.json()
season = request.json()["MRData"]["StandingsTable"]["season"]
print(season)