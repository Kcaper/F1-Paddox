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

export const SidebarData = [
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
        id:1,
        title: 'Racely Predictions',
        path: '/midfield-predictions',
        icon: <BiIcons.BiListOl />
      },
      {
        id:2,
        title: 'Team Predictions',
        path: '/my-constructor-predictions',
        icon: <BiIcons.BiListOl />
      },
      {
        id:3,
        title: 'Driver Predictions',
        path: '/my-driver-standing=predictions/',
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
        id:4,
        title: 'My Paddocks',
        path: '/my-paddocks',
        icon: <BiIcons.BiListMinus />,
        cName: 'sub-nav'
      },
      {
        id:5,
        title: 'Create Paddock',
        path: '/create-paddock',
        icon: <IoIcons.IoIosCreate />,
        cName: 'sub-nav'
      },
      {
        id:7,
        title: 'Join Paddock',
        path: '/join-paddock',
        icon: <ImIcons.ImEnter />,
        cName: 'sub-nav'
      }
    ]
  },
  {
    title: 'Leader-boards',
    path: '/my-leaderboards',
    icon: <GoListIcons.GoListOrdered />,
  },
  {
    title: 'Season Calendar',
    icon: <RiIcons.RiCalendarEventFill />,
  }
];