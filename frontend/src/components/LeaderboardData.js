import React, {useEffect, useState} from 'react';
import * as FaIcons from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';
import * as GiIcons from 'react-icons/gi';
import * as HiIcons from 'react-icons/hi';
import * as GoListIcons from 'react-icons/go';
import * as BiIcons from 'react-icons/bi';
import * as ImIcons from 'react-icons/im';
import { baseUrl } from './F1HomePage'

function leaderboardsData(){

    useEffect(() => {
        getLeaderBoardDate();
      },[]);

    const getLeaderBoardDate = async () => {
        await fetch(baseUrl + '/api/leaderboards/1/')
        .then(response => response.json())
        .then(apiDrivers => {
            var object = JSON.parse(apiDrivers)
            setRaceId(object.seasonCalendarId)
            updatedrivers(object.drivers)
            setUser(object.user)
            setPredictionType(object.isFeatureRaceMidfield)
            createInitalPrediction(object.drivers, object.numMidfieldDrivers)
            setCircuitCountry(object.circuitInfo.country)
            setCircuitFlag(object.circuitInfo.circuitFlagImageLocation)
            setCircuitName(object.circuitInfo.circuitName)
            setCircuitRef(object.circuitInfo.circuitRef)
        })
        }

    
}

export const LeaderBoardData = [
  {
    title: 'Logout',
    path: '/api/logout',
    icon: <FaIcons.FaUserAltSlash />,
  },
  {
    title: 'Predictions',
    icon: <GiIcons.GiCrystalBall />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Midfield Predictions',
        path: '/midfield-predictions',
        icon: <BiIcons.BiListOl />
      },
      {
        title: 'Team Predictions',
        path: '/team-predictions',
        icon: <BiIcons.BiListOl />
      },
      {
        title: 'Driver Predictions',
        path: '/driver-predictions',
        icon: <BiIcons.BiListOl />
      }
    ]
  },
  {
    title: 'Paddocks',
    icon: <HiIcons.HiUserGroup />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'My Paddocks',
        path: '/my-paddocks',
        icon: <BiIcons.BiListMinus />,
        cName: 'sub-nav'
      },
      {
        title: 'Create Paddock',
        path: '/create-paddock',
        icon: <IoIcons.IoIosCreate />,
        cName: 'sub-nav'
      },
      {
        title: 'Join Paddock',
        path: '/join-paddock',
        icon: <ImIcons.ImEnter />,
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Leader-boards',
    path: '/leaderboards',
    icon: <GoListIcons.GoListOrdered />,
  },
  {
    title: 'Season Calendar',
    icon: <RiIcons.RiCalendarEventFill />,
  }
];