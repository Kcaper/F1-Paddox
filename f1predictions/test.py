

def updateDriverLeaderboard():

    now = datetime.now()

    try:
        next_race_by_date = seasonCalendar.objects.filter(year=now.year, isComplete=0, featureRaceDate__gte=now.date()).order_by('featureRaceDate')[0]
        if next_race_by_date.featureRaceDate == now.date():
            race_start_time = next_race_by_date.featureRaceStartTime
            if race_start_time < now.time():
                next_race_round = next_race_by_date.raceRound
            else:
                next_race_round = next_race_by_date.raceRound + 1
        else:
            next_race_round = next_race_by_date.raceRound
    except Exception as e:
        print(e)
        print("The season is over, see you next year!")
        return

    first_round_to_update = seasonCalendar.objects.filter(year=now.year, driverStandingsLeaderboardUpdated=0, isComplete=1).order_by('raceRound')[0].raceRound

    paddock_qset = paddocks.objects.all()
    for p in range(0, paddock_qset.count(), 1):
        paddock_user_qset = userPaddocks.objects.filter(paddock_id=paddock_qset[p].id)
        num_contructors_on_leaderboard = constructors.objects.filter(isOnGrid=1).count()
        for u in range(0, paddock_user_qset.count(), 1):
            total_constructor_points = 0
            previous_constructor_standing_points = 0
            previous_position = 1
            for r in range(first_round_to_update, next_race_round, 1):
                round_points = 0
                seasonCalendarId = seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id
                if r > 1:
                    previous_seasonCalendar_id = seasonCalendar.objects.filter(year=now.year, raceRound=r-1)[0].id
                    try:
                        previous_user_board_record = leaderboards.objects.filter(seasonCalendar_id=previous_seasonCalendar_id, paddock_id=paddock_qset[p].id, user_id=paddock_user_qset[u].user_id, isConstructorStandingsGame=1).latest('id')
                        previous_constructor_standing_points = previous_user_board_record.currentTotalPoints
                        previous_position = previous_user_board_record.currentOverallPosition
                        print("Found a previous round record for user: " + str(paddock_user_qset[u].user_id) + " Paddock: " + paddock_qset[p].paddockName + " round: " + str(r-1))
                    except:
                        print("User: " + str(paddock_user_qset[u].user.username) + " does not have a leaderboard record for round: " + str(r))
                        previous_constructor_standing_points = 0
                        previous_position = 1
                else:
                    previous_constructor_standing_points = 0
                    previous_position = 1

                try:
                    instance = leaderboards.objects.filter(seasonCalendar_id=seasonCalendarId, paddock_id=paddock_qset[p].id, user_id=paddock_user_qset[u].user_id, isConstructorStandingsGame=1).latest('id')
                    id_type = instance.id
                    save_type = "Updated on"
                except:
                    id_type = None
                    save_type = "Saved on"
                    
                points_qset = predictionPoints.objects.filter(seasonCalendar_id=seasonCalendarId, user_id=paddock_user_qset[u].user_id, isConstructorStandingPrediction=1).order_by('predictedPosition')
                for point in range(0, num_contructors_on_leaderboard, 1):
                    try:
                        round_points = round_points + points_qset[point].pointsForPrediction
      
                    except:
                        print("Constructor standing points for round:" + str(r) + ", User: " + str(paddock_user_qset[u].user.username) + " have not been captured yet")
                        return

                total_constructor_points = total_constructor_points + round_points

                db_entry = leaderboards(id=id_type, previousPosition=previous_position, seasonCalendar_id=seasonCalendarId,
                paddock_id=paddock_qset[p].id, user_id=paddock_user_qset[u].user_id, isConstructorStandingsGame=1,
                currentTotalPoints=total_constructor_points, roundPoints=round_points, previousTotalPoints=previous_constructor_standing_points)
                db_entry.save()

                print("User: " + str(paddock_user_qset[u].user.username) + " constructor points record for paddock: " + paddock_qset[p].paddockName + " Round: " + str(r) + " " + save_type + " the database")

        for r in range(first_round_to_update, next_race_round, 1):        
            if r > 1:
                
                previousSeasonCalendarId = seasonCalendar.objects.filter(year=now.year, raceRound=r-1)[0].id
                previous_sorted_paddock_leaderbaord_overall_qset = leaderboards.objects.filter(seasonCalendar_id=previousSeasonCalendarId, 
                paddock_id=paddock_qset[p].id, isConstructorStandingsGame=1).order_by('-currentTotalPoints')

            seasonCalendarId = seasonCalendar.objects.filter(year=now.year, raceRound=r)[0].id
            sorted_paddock_leaderbaord_round_qset = leaderboards.objects.filter(seasonCalendar_id=seasonCalendarId, 
            paddock_id=paddock_qset[p].id, isConstructorStandingsGame=1).order_by('-roundPoints')

            sorted_paddock_leaderbaord_overall_qset = leaderboards.objects.filter(seasonCalendar_id=seasonCalendarId, 
            paddock_id=paddock_qset[p].id, isConstructorStandingsGame=1).order_by('-currentTotalPoints')

            for i in range(0, sorted_paddock_leaderbaord_round_qset.count(), 1):
                instance = sorted_paddock_leaderbaord_round_qset[i]
                instance.roundPlayerPosition = i+1
                instance.save()

            for o in range(0, sorted_paddock_leaderbaord_overall_qset.count(), 1):
                instance = sorted_paddock_leaderbaord_overall_qset[o]
                userId = instance.user_id
                if r > 1:
                    position_delta = previous_sorted_paddock_leaderbaord_overall_qset.filter(user_id=userId)[0].currentOverallPosition - o+1
                    previous_position = previous_sorted_paddock_leaderbaord_overall_qset.filter(user_id=userId)[0].currentOverallPosition
                    previousTotalPoints = previous_sorted_paddock_leaderbaord_overall_qset.filter(user_id=userId)[0].currentTotalPoints
                else:
                    position_delta = 1 - o+1
                    previousTotalPoints = 0
                    
                instance.paddockDelta = position_delta
                instance = sorted_paddock_leaderbaord_round_qset[o]
                instance.previousPosition = previous_position
                instance.currentOverallPosition = o+1
                instance.previousTotalPoints = previousTotalPoints
                instance.save()

            seasonCalendarInstance = seasonCalendar.objects.get(id=seasonCalendarId)
            seasonCalendarInstance.constructorStandingsLeaderboardUpdated = 1
            seasonCalendarInstance.save()