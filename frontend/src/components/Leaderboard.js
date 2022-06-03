import React, { useState, useEffect, useCallback } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';
import { GiConsoleController } from 'react-icons/gi';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { FaLessThanEqual, FaTruckLoading, FaWindowRestore } from 'react-icons/fa';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';
import { Transition } from "react-transition-group";
import { LeaderBoardAnimation } from "./PageCover";
import * as GiIcons from 'react-icons/gi';
import { setRef } from '@material-ui/core';
import {useParams} from 'react-router-dom';
import * as BsIcons from 'react-icons/bs';

const LoadingDiv = styled.div`
    margin-top:200;
    display:'flex';
    align-items:"center";
    justify-content:'center';
    height:'100%';
    width:'100%';
    position:relative;
  `

function Leaderboard ({multiSelect = true}){

  const params = useParams()

  const [animate, setAnimate] = useState(false)
  const doAnimate = useCallback(() => {
    setAnimate(true)
    setTimeout(() => {
      setState("exited")
    }, 1000)
  }, [])

  useEffect(() => {
    setState("entered")
    doAnimate();
    getResultSubmitValidation();
  },[]);

  const [loadingError, setLoadingError] = useState(0)

  const getResultSubmitValidation = async () => {
    await fetch(baseUrl + '/api/manual-results/validation/' + params['id'] + "/")
    .then(response => response.json())
    .then(userValidation => {
      let object = JSON.parse(userValidation)
      if(object.serverError == 1){
        setLoadingError(1)
        setValidationMessage("Server error please try again later")
        setLoading(false)
      }
      else if(object.generatingResult == 1){
        setLoadingError(1)
        setValidationMessage("Another user is currently generating a leaderboard please try again soon")
        setLoading(false)
      }
      else{
        try{
          setLeaderboardToGenerating();
        } 
        catch{
          setValidationMessage("Error loading leaderboard data please try again laater")
          setLoading(false)
          setLoadingError(1)
          setLeaderboardToOpen()
        }
      }
    })
  }

  function checkForFullLoad(){
    setTimeout(() => {
    }, 1000) 
    if (midSeasonLoaded == 1 && midRoundLoaded == 1 && driverStandingLoaded == 1 && teamStandingLoaded == 1 && combinedStandingLoaded == 1){
      setLoading(false)
      setLoadingComplete(1)
      setLeaderboardToOpen()
      setTimeout(() => {
        setState("entered")
      }, 1000) 
    }
  }

  const setLeaderboardToOpen = async () => {
    await fetch(baseUrl + '/api/leaderboards/set-to-open/' + params['id'] + "/")
  }

  const [validationMessage, setValidationMessage] = useState("")

  const setLeaderboardToGenerating = async () => {
    await fetch(baseUrl + '/api/leaderboards/set-to-generating/' + params['id'] + "/")
    .then(async response => {
      if(response.status == 200){
        getLeaderBoardData();
        getMidRoundPoints();
        getDriverStandingData();
        getConstructorStandingData();
        getCombinedStandingPoints();
      }
      else{
        setValidationMessage("Error loading leaderboard data please try again later")
        setLoading(false)
        setLoadingError(1)
        setLeaderboardToOpen()
      }
    })
  }

  const getMidRoundPoints = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/midfield/' + params["id"])
    .then(response => response.json())
    .then(points => {
      var object = JSON.parse(points)
      setMidRoundLoaded(1)
      setPlayerPointsMidRoundData(object)
      setLoading(false)
      setLoadingComplete(1)
      setTimeout(() => {
        setLeaderboardToOpen()
        setState("entered")
      }, 1000) 
    })
  }

  const [ruleSetName, setRuleSetName] = useState("")
  const [isManualResult, setIsManualResult] = useState(0)
  const [lastRound, setLastRound] = useState("")

  const getLeaderBoardData = async () => {
    await fetch(baseUrl + '/api/leaderboards/' + params["id"])
    .then(response => response.json())
    .then(apiLeaderboard => {
        var object = JSON.parse(apiLeaderboard)
        var temp_circuit_array = [];
        var temp_mid_round_data_dict = {}
        var temp_mid_season_data_dict = {}
        let rule_set_name = object.racelyRuleSetName
        for(let circuit=0; circuit<object.circuitRefs.length; circuit++){
            temp_circuit_array.push({id: circuit+1, value: object.circuitRefs[circuit]})
        }
        let paddockStartRound = object.paddockRacelyStartRound

        for(let i=0; i<object.circuitRefs.length; i++){
          if(i+1 == object.circuitRefs.length){
            var temp_round = "current"
          }
          else{
            var temp_round = i + paddockStartRound
          }

          temp_mid_round_data_dict[object.circuitRefs[i]] = object.raceRound[temp_round]['midfieldRound'][object.circuitRefs[i]]
          temp_mid_season_data_dict[object.circuitRefs[i]] = object.raceRound[temp_round]['midfieldOverall'][object.circuitRefs[i]]
          
        }
        let current_midfield_array = temp_mid_season_data_dict[temp_circuit_array[(temp_circuit_array.length)-1]['value']]
        temp_circuit_array.reverse()
        setMidSeasonPlayerRoundData(object.midRoundPointsByUser)
        setMididSeasonCurrentList(current_midfield_array)
        setPaddock(object.paddockName)
        setMidRoundData(temp_mid_round_data_dict)
        setCircuitRefList(temp_circuit_array)
        setRuleSetName(rule_set_name)
        setThisRound(object.thisRound)
        setLastRound(object.lastRound)
        setIsManualResult(object.isManualResult)
        setManualResultSubmitter(object.manualResultSubmitter)
        setMidSeasonLoaded(1);
    })
  }

  const [manualResultSubmitter, setManualResultSubmitter] = useState("")
  const [thisRound, setThisRound] = useState("")

  const getDriverStandingData = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/driver-standings/' + params["id"])
    .then(response => response.json())
    .then(apiDriverStandings => {
      var object = JSON.parse(apiDriverStandings)
      var temp_user_array = []
      for (let i=0; i<object['paddockUsers'].length; i++){
        temp_user_array.push(object.paddockUsers[i])
      }
      setDriverStandingData(object.driverStandingLeaderboard)
      setPaddockDriverStandingUsers(temp_user_array)
      setDriverStandingPlayerPoints(object.predictions)
      setDriverStandingLoaded(1)
      ;
    })
  }

  const getConstructorStandingData = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/constructor-standings/' + params["id"])
    .then(response => 
      response.json())
    .then(apiConstructorStandings => {
      var object = JSON.parse(apiConstructorStandings)
      var temp_user_array = []
      for (let i=0; i<object['paddockUsers'].length; i++){
        temp_user_array.push(object.paddockUsers[i])
      }
      setConstructorStandingData(object.constructorStandingLeaderboard)
      setPaddockConstructorStandingUsers(temp_user_array)
      setConstructorStandingPlayerPoints(object.predictions)
      setTeamStandingLoaded(1)
      ;
    })
  }
  
  const [loadingComplete, setLoadingComplete] = useState(0)
  const [loading, setLoading] = useState(true)

  const [circuitRefList, setCircuitRefList] = useState([])
  const [paddock, setPaddock] = useState("")

  const [refresh, setRefresh] = useState(false)
  const [state, setState] = useState("exited")
  const [loadingCover, setLoadingCover] = useState(true)

  //mid round 
  const [midRoundOpen, setMidRoundOpen] = useState(false);
  const [midRoundSelection, setMidRoundSelection] = useState([]);

  const [midRoundData, setMidRoundData] = useState({})
  const [playerRoundData, setPlayerRoundData] = useState({})
  const [midRoundPlayerOpen, setMidRoundPlayerOpen] = useState(false)
  const [midRoundPlayerSelection, setMidRoundPlayerSelection] = useState([])

  const [playerMidRoundPointsData, setPlayerPointsMidRoundData] = useState({})
  const [midRoundPlayerPointsOpen, setMidRoundPlayerPointsOpen] = useState(false)

  function Collapse(){
    //setMidRoundSelection([])
    //setPlayerRoundData({});
    //setMidRoundPlayerOpen(false)
  }
  
  Leaderboard.handleClickOutside = () => Collapse()

  function handleOnMidGameClick(){
    if (midRoundOpen == false){
      setMidSeasonOpen(false);
      setMidRoundOpen(true);
      setDriverStandingOpen(false);
      setConstructorStandingOpen(false);
      setCombinedOpen(false)
    }
    else if (midRoundOpen == true){
      setMidRoundOpen(false);
    }
  }
    
  function handleOnMidRoundClick(item) {
    var rounds_player_dict = playerRoundData
    if (!midRoundSelection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setMidRoundSelection([item]);
        rounds_player_dict[item.value] = midRoundData[item.value]
      } else if (multiSelect) {
        setMidRoundSelection([...midRoundSelection, item]);
        rounds_player_dict[item.value] = midRoundData[item.value]
      }
    } else {
      let selectionAfterRemoval = midRoundSelection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setMidRoundSelection([...selectionAfterRemoval]);

      delete rounds_player_dict[item.value]
      setMidRoundPlayerSelection([])
    }
    setPlayerRoundData(rounds_player_dict)
    setMidRoundPlayerOpen(true)
  }

  function isItemInMidRoundSelection(item) {
    if (midRoundSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  function handleOnMidRoundPlayerClick(item) {
    if (midRoundPlayerSelection.includes(item)){
      for (let i=0; i<midRoundPlayerSelection.length; i++){
        let temp_array = midRoundPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setMidRoundPlayerSelection(temp_array)
          setRefresh(!refresh)
        }
      } 
      return
    }
    else{
      let temp_array = midRoundPlayerSelection
      temp_array.push(item)
      setMidRoundPlayerSelection(temp_array)
      setRefresh(!refresh)
      setMidRoundPlayerPointsOpen(true)
      return
    }
  }


  function isItemInMidRoundPlayerSelection(item) {
    if (midRoundPlayerSelection.some(current => current.user_id === item.user_id)) {
      return true;

    }
    return false;
  }

  //mid season
  const [midSeasonOpen, setMidSeasonOpen] = useState(false);
  const [midSeasonCurrentList, setMididSeasonCurrentList] = useState([])
  const [midSeasonPlayerSelection, setMidSeasonPlayerSelection] = useState([])

  const [midSeasonPlayerRoundData, setMidSeasonPlayerRoundData] = useState({})
  const [midSeasonPlayerRoundOpen, setMidSeasonPlayerRoundOpen] = useState(false)

  const [midSeasonPlayerRoundSelection, setMidSeasonPlayerRoundSelection] = useState([])
  const [midSeasonPlayerRoundPointsOpen, setMidSeasonPlayerRoundPointsOpen] = useState(false)

  function handleOnMidSeasonGameClick(){
    if (midSeasonOpen == false){
      setMidSeasonOpen(true);
      setMidRoundOpen(false);
      setDriverStandingOpen(false);
      setConstructorStandingOpen(false);
      setCombinedOpen(false)
    }
    else if (midSeasonOpen == true){
      setMidSeasonOpen(false);
    }
  }

  function handleOnMidSeasonPlayerClick(item){
    if (midSeasonPlayerSelection.includes(item)){
      for (let i=0; i<midSeasonPlayerSelection.length; i++){
        let temp_array = midSeasonPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setMidSeasonPlayerSelection(temp_array)
          setMidSeasonPlayerRoundSelection([])
          setRefresh(!refresh)
        }
      } 
      return
    }
    else{
      let temp_array = midSeasonPlayerSelection
      temp_array.push(item)
      setMidSeasonPlayerSelection(temp_array)
      setRefresh(!refresh)
      setMidSeasonPlayerRoundOpen(true)
      return
    }
  }

  function isItemInMidSesonPlayerSelection(item) {
    if (midSeasonPlayerSelection.some(current => current.user_id === item.user_id)) {
      return true;
    }
    return false;
  }

  function handleOnMidSeasonRoundClick(item){
    if (midSeasonPlayerRoundSelection.includes(item)){
      for (let i=0; i<midSeasonPlayerRoundSelection.length; i++){
        let temp_array = midSeasonPlayerRoundSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setMidSeasonPlayerRoundSelection(temp_array)
          setRefresh(!refresh)
        }
      } 
      return
    }
    else{
      let temp_array = midSeasonPlayerRoundSelection
      temp_array.push(item)
      setMidSeasonPlayerRoundSelection(temp_array)
      setRefresh(!refresh)
      setMidSeasonPlayerRoundPointsOpen(true)
      return
    }
  }

  function isItemInMidSesonPlayerRoundSelection(item) {
    if (midSeasonPlayerRoundSelection.some(current => current.circuitRef === item.circuitRef)) {
      return true;

    }
    return false;
  }
  
  //Driver Standings
  const [driverStandingOpen, setDriverStandingOpen] = useState(false);
  const [driverStandingData, setDriverStandingData] = useState({});
  const [driverStandingPlayerSelection, setDriverStandingPlayerSelection] = useState([]);
  const [paddockDriverStandingUsers, setPaddockDriverStandingUsers] = useState([]);

  const [driverStandingUserPredictionOpen, setDriverStandingUserPredictionOpen] = useState(false)
  const [driverStandingPlayerPoints, setDriverStandingPlayerPoints] = useState([])

  function handleOnDriverStandingGameClick(){
    if (driverStandingOpen == false){
      setMidSeasonOpen(false);
      setMidRoundOpen(false);
      setDriverStandingOpen(true);
      setConstructorStandingOpen(false);
      setCombinedOpen(false)
    }
    else if (driverStandingOpen == true){
      setDriverStandingOpen(false);
    }
  }

  function handleOnDriverStandingsPlayerClick(item){
    if (driverStandingPlayerSelection.includes(item)){
      for (let i=0; i<driverStandingPlayerSelection.length; i++){
        let temp_array = driverStandingPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setDriverStandingPlayerSelection(temp_array)
          setRefresh(!refresh)
          return
        }
      } 
    }
    else{
      let temp_array = driverStandingPlayerSelection
      temp_array.push(item)
      setDriverStandingPlayerSelection(temp_array)
      setDriverStandingUserPredictionOpen(true)
      setRefresh(!refresh)
      return
    }
  }

  function isDriverStadingPlayerSelection(item){
    if (driverStandingPlayerSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  //Constructor Standings
  const [constructorStandingOpen, setConstructorStandingOpen] = useState(false);
  const [constructorStandingData, setConstructorStandingData] = useState({});
  const [constructorStandingPlayerSelection, setConstructorStandingPlayerSelection] = useState([]);
  const [paddockconstructorStandingUsers, setPaddockConstructorStandingUsers] = useState([]);

  const [constructorStandingUserPredictionOpen, setConstructorStandingUserPredictionOpen] = useState(false)
  const [constructorStandingPlayerPoints, setConstructorStandingPlayerPoints] = useState([])

  function handleOnConstructorStandingGameClick(){
    if (constructorStandingOpen == false){
      setMidSeasonOpen(false);
      setMidRoundOpen(false);
      setDriverStandingOpen(false);
      setConstructorStandingOpen(true);
      setCombinedOpen(false)
    }
    else if (constructorStandingOpen == true){
      setConstructorStandingOpen(false);
    }
  }

  function handleOnConstructorStandingsPlayerClick(item){
    if (constructorStandingPlayerSelection.includes(item)){
      for (let i=0; i<constructorStandingPlayerSelection.length; i++){
        let temp_array = constructorStandingPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setConstructorStandingPlayerSelection(temp_array)
          setRefresh(!refresh)
          return
        }
      } 
    }
    else{
      let temp_array = constructorStandingPlayerSelection
      temp_array.push(item)
      setConstructorStandingPlayerSelection(temp_array)
      setConstructorStandingUserPredictionOpen(true)
      setRefresh(!refresh)
      return
    }
  }

  function isConstructorStadingPlayerSelection(item){
    if (constructorStandingPlayerSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  //combined standings
  const getCombinedStandingPoints = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/combined/' + params["id"])
    .then(response => response.json())
    .then(apiCombinedStandings => {
      var object = JSON.parse(apiCombinedStandings)
      setCombinedPlayerData(object)
      setCombinedStandingLoaded(1)
      
    })
  }

  const [combinedPlayerData, setCombinedPlayerData] = useState([])

  const [combinedOpen, setCombinedOpen] = useState(false)
  const [combinedPlayerOpenList, setCombinedPlayerOpenList] = useState([])
  const [combinedPlayerOpen, setCombinedPlayerOpen] = useState(false)
  const [playerConstructorPoints, setPlayerConstructorPoints] = useState(0)
  const [playerDriverPoints, setPlayerDriverPoints] = useState(0)
  const [playerDriverPointsChange, setPlayerDriverPointsChange] = useState(0)
  const [playerConstructorPointsChange, setPlayerConstructorPointsChange] = useState(0)
  const [playerDriverPointsChangeText, setPlayerDriverPointsChangeText] = useState("")
  const [playerConstructorPointsChangeText, setPlayerConstructorPointsChangeText] = useState("")

  function handleOnCombinedClick(item){
    setMidRoundOpen(false)
    setMidSeasonOpen(false)
    setConstructorStandingOpen(false)
    setDriverStandingOpen(false)
    setCombinedOpen(!combinedOpen)
    setRefresh(!refresh)
  }

  function handleOnCombinedPlayerClick(item){
    setPlayerCombinedDriverPointsReportOpen(false)
    setPlayerCombinedConstructorPointsReportOpen(false)
    if (setCombinedPlayerOpen == false){
      setCombinedPlayerOpenList([])
      setCombinedPlayerOpen(false)
      temp_array = []
      for (let i=0; i<constructorStandingData.length; i++){
        if (constructorStandingData[i].username == item.username){
          setPlayerConstructorPoints(constructorStandingData[i].currentTotalPoints)
          setPlayerConstructorPointsChangeText(constructorStandingData[i].pointsChangeText)
          break
        }
      }
      for (let i=0; i<driverStandingData.length; i++){
        if (driverStandingData[i].username == item.username){
          setPlayerDriverPoints(driverStandingData[i].currentTotalPoints)
          setPlayerDriverPointsChangeText(driverStandingData[i].pointsChangeText)
          break
        }
      }
      setCombinedPlayerOpenList(temp_array)
      setCombinedPlayerOpen(true)
      setRefresh(!refresh)
      return
    }
    else{
      if (combinedPlayerOpenList[0] == item.id){
        let temp_array = []
        setCombinedPlayerOpenList(temp_array)
        setCombinedPlayerOpen(false)
        setRefresh(!refresh)
        return
      }
      else{
        let temp_array= []
        temp_array.push(item.id)
        for (let i=0; i<constructorStandingData.length; i++){
          if (constructorStandingData[i].username == item.username){
            setPlayerConstructorPoints(constructorStandingData[i].currentRoundPoints)
            setPlayerConstructorPointsChangeText(constructorStandingData[i].pointsChangeText)
            break
          }
        }
        for (let i=0; i<driverStandingData.length; i++){
          if (driverStandingData[i].username == item.username){
            setPlayerDriverPoints(driverStandingData[i].currentRoundPoints)
            setPlayerDriverPointsChangeText(driverStandingData[i].pointsChangeText)
            break
          }
        }
        setCombinedPlayerOpenList(temp_array)
        setCombinedPlayerOpen(true)
        setRefresh(!refresh)
        return
      }
    }
  }
  
  function isCombinedPlayerInSelection(item){
    if (combinedPlayerOpenList.includes(item.id)) {
      return true;
    }
    return false;
  }

  function handleOnRefreshClick(){
    window.location.reload();
  }

  const [playerCombinedConstructorPointsReportOpen, setPlayerCombinedConstructorPointsReportOpen] = useState(false)
  const [playerCombinedDriverPointsReportOpen, setPlayerCombinedDriverPointsReportOpen] = useState(false)


  function handlePlayerCombinedConstructorStandingClick(){
    setPlayerCombinedConstructorPointsReportOpen(!playerCombinedConstructorPointsReportOpen)
  }

  function handlePlayerCombinedDriverStandingClick(){
    setPlayerCombinedDriverPointsReportOpen(!playerCombinedDriverPointsReportOpen)
  }

  const [midRoundLoaded, setMidRoundLoaded] = useState(0)
  const [midSeasonLoaded, setMidSeasonLoaded] = useState(0)
  const [driverStandingLoaded, setDriverStandingLoaded] = useState(0)
  const [teamStandingLoaded, setTeamStandingLoaded] = useState(0)
  const [combinedStandingLoaded, setCombinedStandingLoaded] = useState(0)


  console.log(constructorStandingPlayerPoints)

  //const [coverState, setCoverState] = useState=(false)
  if(loadingError == 1){
    return(
      <div style={{
        marginTop:100,
        marginLeft:"auto",
        marginRight:"auto",
        paddingRight:"8px",
        paddingLeft:"8px",
        marginBottom:80,
        maxWidth:600,
        flexDirection:"column",
        justifyContent:"center",
        }}>
        <div style={{
          display:"flex",
          justifyContent:"center",
          marginTop:0
          }}>
        <div style={{
          displayDirection:"column",
          }}>
          <div>
            <h2 style={{
              display:"flex",
              justifyContent:"center",
              textAlign:"center",
              alignItems:"center",
              marginLeft:"auto",
              marginRight:"auto",
              }}>
              Leaderboards
            </h2>
          <div style={{color:"#BD2031"}}>{ validationMessage }</div>
          <div role="button" onClick={() => handleOnRefreshClick()} style={{
            height:"40px",
            justifyContent:"center",
            textAlign:"center",
            alignItems:"center",
            width:"120px",
            fontSize:"18px",
            color:"#28282B",
            backgroundColor:"#ED944D",
            borderRadius:"12px",
            marginTop:"25px",
            cursor:"pointer",
            marginLeft:"auto",
            marginRight:"auto",
            display:"flex",
            }}>
            Refresh
          </div>
        </div>
      </div>
    </div>
  </div>
  )
  }
  else if (loading == true){
    return(
      <div>
        <Transition in={animate} timeout={0}>
        {(state) => (
          //state change: exited -> entering -> entered -> exiting -> exited
          <LeaderBoardAnimation state={state}>
          <div style={{
            marginTop:100,
            display:'flex',
            marginLeft:"auto",
            marginRight:"auto",
            paddingRight:"8px",
            paddingLeft:"8px",
            height:200,
            maxWidth:600,
            flexDirection:"column",
            justifyContent:"center",
            marginBottom: 200
            }}>
            <div style={{
              marginTop:8,
              display:'grid',
              gridTemplateColumns:"40px auto",
              justifyContent:"center",
              marginLeft:'auto',
              marginRight:'auto',
              alignItems:'center',
              display:"flex",
              flexDirection:'column',
              textAlign:'left',
              marginLeft:'auto',
              marginBottom: '11px',
              }}>
              <div style={{
                display:'flex',
                flexDirection:'row',
                alignItems:'center',
                marginLeft:'auto',
                marginRight:'auto',
                marginBottom: '11px',
                }}>
                {loadingComplete == 0
              ? <div style={{
                  }}>
                  <ClipLoader color="#BD2031" size={15}/>
                </div>
              : <div style={{
                  paddingBottom:'15px',
                  }}>
                  &#127937;
                </div>}
                <div style={{
                  }}>
                  <h3 style={{
                    marginTop:0,
                    marginLeft:5,
                  }}>
                    Generating 
                  </h3>
                </div>
              </div>
              <div style={{
                display:'flex',
                flexDirection:'column',
                height:60,
                }}>
              {isManualResult
            ? <div style={{
                display:"flex",
                justifyContent:"center",
                marginLeft:"auto",
                marginRight:"auto",
                }}>
                Manual Interim Result
              </div>
            : null
              }
              {isManualResult
            ? <div style={{
                display:"flex",
                justifyContent:"center",
                marginLeft:"auto",
                marginRight:"auto",
                }}>
                Subbmitted by: {manualResultSubmitter}
              </div>
            : null
              }
              <div style={{
                display:'grid',
                gridTemplateColumns:'22px auto',
                padding:'0px',
                alignItems:'center',
                marginBottom:"11px",
                marginTop:'11px',
                height:"23px",
                }}>
                  {combinedStandingLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color="#BD2031" size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Combined Season Points
                  </div>
                  {teamStandingLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color="#BD2031" size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Team Standing Points
                  </div>
                  {midRoundLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color="#BD2031" size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Racely Round Points
                  </div>
                  {driverStandingLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color="#BD2031" size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Driver Standing Points
                  </div>
                  {midSeasonLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color="#BD2031" size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40,
                    }}>
                    Racely Total Points
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </LeaderBoardAnimation>
          )}
        </Transition>
      </div>
    )
  }
  else{
    return(
    <div>
    <Transition in={animate} timeout={0}>
        {(state) => (
      <LeaderBoardAnimation state={state}>
      <div style={{
        marginTop:100,
        marginLeft:"auto",
        marginRight:"auto",
        paddingRight:"8px",
        paddingLeft:"8px",
        marginBottom:80,
        maxWidth:600,
        flexDirection:"column",
        justifyContent:"center",
        }}>
        <div style={{
          display:"flex",
          justifyContent:"center",
          marginTop:0
          }}>
        <div style={{
          displayDirection:"column",
          }}>
          <div>
            <h2 style={{
              display:"flex",
              justifyContent:"center",
              marginLeft:"auto",
              marginRight:"auto",
              }}>
              Leaderboards
            </h2>
          </div>
          <div style={{
            displayContent:"flex",
            justifyContent:'center'
            }}>
            <h3 style={{
              marginTop: 8,
              display:"flex",
              justifyContent:'center'
              }}>
              {paddock}
            </h3>
          </div>
          {isManualResult == 1
        ? <div style={{
            display:"flex",
            justifyContent:"center",
            marginLeft:"auto",
            marginRight:"auto",
            fontSize:"6px,",
            color:"#BD2031",
            }}>
            Manual racely result by: {manualResultSubmitter} for {thisRound}
          </div>
        : <div style={{
            display:"flex",
            justifyContent:"center",
            marginLeft:"auto",
            marginRight:"auto",
            }}>
            Offical results up to {thisRound}
          </div>
          }
        </div>
        </div>
          <div className="dd-header__action" style={{
            display:'grid',
            gridTemplateColumns:'90% 10%',
            cursor:"pointer",
            justifyContent:"center",
            textAlign:"center",
            alignItems:"center",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            color:"#FEFDFB",
            fontSize:18,
            marginLeft:8,
            marginRight:8,
            marginBottom:5,
            marginTop:20,
            width:"auto",
            padding:"25px",
            backgroundColor:"#BD2031",
            transform: "skewX(-15deg)",
            height:"auto",
            cursor:'pointer',
            }} 
            tabIndex={0}
            className="dd-header"
            role="button"
            onKeyPress={() => handleOnMidGameClick()}
            onClick={() => handleOnMidGameClick()}>
            <label style={{marginBottom:0,
              display:"flex",
              justifyContent:"center",
              textAlign:"center",
              alignItems:"center",
              }}>
                {ruleSetName} Round Points
            </label>
            {midRoundOpen == false
          ? <label><BsIcons.BsChevronDoubleDown></BsIcons.BsChevronDoubleDown></label>
          : <label><BsIcons.BsChevronDoubleUp></BsIcons.BsChevronDoubleUp></label>
            }
          </div>
        {midRoundOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            marginTop:0,
            paddingLeft:0,
            margin:0}}>
            {circuitRefList.map(roundItem => (
              <li className="dd-list-item" key={roundItem.id}>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"30px 10px auto 50px",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"#28282B",
                  color: "#BD2031",
                  padding:"15px",
                  marginBottom: 5,
                  width:"auto",
                  height:"auto",
                  marginLeft:20,
                  marginRight:20,
                  alignItems:"center",
                  cursor:"pointer",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: 33}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidRoundClick(roundItem)}>
                  <div style={{
                    marginLeft:"5px",
                    }}>
                    {roundItem.id}.
                  </div>
                  <div></div>
                  <div style={{
                    }}>
                    {roundItem.value}
                  </div>
                  {isItemInMidRoundSelection(roundItem)
                ? <label style={{
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                : <label style={{
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                    }
                </div>
                {midRoundPlayerOpen && (
                <ul style={{
                  listStyle:"none",
                  margin:0,
                  paddingLeft:0,
                  left:10
                  }}>
                  {isItemInMidRoundSelection(roundItem)
                ? playerRoundData[roundItem.value].map(playerItem => (
                    <li className="dd-list-item" key={playerItem.user_id}>
                      {playerItem.roundPoints == 0
                    ? null
                    : playerItem.gotFastLapBonusPoint
                    ? <div style={{
                        display:"grid",
                        gridTemplateColumns:"25px auto 20px 2px 30px 2px 30px 2px",
                        flexDirection: "row",
                        fontSize:12,
                        backgroundColor:"#9370DB",
                        color: "#FEFDFB",
                        padding:"5px",
                        marginBottom: 5,
                        width:"auto",
                        height:"auto",
                        marginLeft:30,
                        marginRight:30,
                        alignItems:"center",
                        borderRadius:33,
                        cursor:"pointer",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        }}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleOnMidRoundPlayerClick(playerItem) }>
                        {playerItem.position != 1
                      ? <div style={{
                          textAlign: 'right',
                          marginLeft:0}}>
                          {playerItem.positionText}
                        </div>
                      : <div style={{
                          textAlign: 'right',
                          color:"#D2BF37",
                          fontSize:18,
                          marginLeft:0}}>
                          <GiIcons.GiPodiumWinner/>
                        </div>
                        }
                        <div style={{
                          textAlign:'left',
                          paddingLeft:"15px"
                          }}>
                          {playerItem.username}
                        </div>
                        {playerItem.gotPoleLapBonusPoints == 1
                      ? <div style={{
                          textAlign:'center',
                          justifyContent:'center',
                          alignItems:'center',
                          }}>
                          &#127937;
                        </div>
                      : <div></div>
                        }
                        <div></div>
                        <div style={{
                          textAlign:'right',
                          justifyContent:'center',
                          alignItems:'center',
                          paddingRight: "10px",
                          }}>
                          {playerItem.roundPoints}
                        </div>
                        <div></div>
                        {isItemInMidRoundPlayerSelection(playerItem)
                      ? <label style={{
                          textAlign:'center',
                          alignItems:'center',
                          justifyContent:'center',
                          }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                      : <label style={{
                          textAlign:'center',
                          alignItems:'center',
                          justifyContent:'center',
                          }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                          }
                        <div></div>
                      </div>
                    : <div style={{
                        display:"grid",
                        gridTemplateColumns:"25px auto 20px 2px 30px 2px 30px 2px",
                        flexDirection: "row",
                        fontSize:12,
                        backgroundColor:"#BD2031",
                        color: "#FEFDFB",
                        padding:"5px",
                        marginBottom: 5,
                        width:"auto",
                        height:"auto",
                        marginLeft:30,
                        marginRight:30,
                        alignItems:"center",
                        borderRadius:33,
                        cursor:"pointer",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        }}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleOnMidRoundPlayerClick(playerItem) }>
                        {playerItem.position != 1
                      ? <div style={{
                          textAlign: 'right',
                          marginLeft:0}}>
                          {playerItem.positionText}
                        </div>
                      : <div style={{
                          textAlign: 'right',
                          color:"#D2BF37",
                          fontSize:18,
                          marginLeft:0}}>
                          <GiIcons.GiPodiumWinner/>
                        </div>
                        }
                        <div style={{
                          textAlign:'left',
                          paddingLeft:"15px"
                          }}>
                          {playerItem.username}
                        </div>
                        {playerItem.gotPoleLapBonusPoints == 1
                      ? <div style={{
                          textAlign:'center',
                          justifyContent:'center',
                          alignItems:'center',
                          }}>
                          &#127937;
                        </div>
                      : <div></div>
                        }
                        <div></div>
                        <div style={{
                          textAlign:'right',
                          justifyContent:'center',
                          alignItems:'center',
                          paddingRight: "10px",
                          }}>
                          {playerItem.roundPoints}
                        </div>
                        <div></div>
                        {isItemInMidRoundPlayerSelection(playerItem)
                      ? <label style={{
                          textAlign:'center',
                          alignItems:'center',
                          justifyContent:'center',
                          }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                      : <label style={{
                          textAlign:'center',
                          alignItems:'center',
                          justifyContent:'center',
                          }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                          }
                        <div></div>
                      </div>
                      }
                      {midRoundPlayerPointsOpen && (
                      <ul className="dd-list" style={{
                        listStyle:"none",
                        padding:0,
                        marginTop:0,
                        paddingLeft:10,
                        margin:0}}>
                        {isItemInMidRoundPlayerSelection(playerItem)
                      ? <li>
                          <div style={{
                            display:"grid",
                            //alignContent:"space-between",
                            gridTemplateColumns:"50% 50%",
                            //justifyContent:"space-between",
                            alignItems:"center",
                            justifyContent:'center',
                            textAlign:'center',
                            flexDirection:"row",
                            marginBottom:5,
                            width:"auto",
                            fontSize:12,
                            marginLeft:33,
                            marginRight:43,
                            marginBottom:10,
                            }}>
                            <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                            <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                          </div>
                        </li>
                      : null}
                        {isItemInMidRoundPlayerSelection(playerItem) 
                      ? playerMidRoundPointsData['userPoints'][playerItem.username][roundItem.value].map(playerRoundItem => (
                          <li className="dd-list-item" key={playerRoundItem.circuitRef}>
                            <div style={{
                              display:"grid",
                              //alignContent:"space-between",
                              gridTemplateColumns:"20px 3px 5px 2px 50px 20px auto 2px 1px 19px 1px 2px auto 20px 50px 2px 5px 2px 5px",
                              //justifyContent:"space-between",
                              alignItems:"center",
                              flexDirection:"row",
                              width:"auto",
                              fontSize:12,
                              marginLeft:33,
                              marginRight:43,
                              marginBottom:8,
                              }}>
                              {playerRoundItem.driverHasFastestLap == 1
                            ? <div style={{
                                backgroundColor:"#9370DB",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                textAlign: 'center',
                                padding:'2px',
                                borderRadius:'2px',
                                color:"#FEFDFB",
                                }}>
                                {playerRoundItem.racePosition}
                              </div>
                            : <div style={{
                                backgroundColor:"#FEFDFB",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                textAlign: 'center',
                                padding:'2px',
                                borderRadius:'2px',
                                }}>
                                {playerRoundItem.racePosition}
                              </div>
                              }
                              <div></div>
                              <div style={{
                                height:"18px",
                                backgroundColor:playerRoundItem.resultDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'1px 0px 0px 1px',
                               }}>
                              </div>
                              <div></div>
                                {playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"#D2BF37",
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>
                              : playerRoundItem.singlePointFinishingHit == 1
                              ? <div style={{
                                  display:"flex",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"silver",
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  borderColor:"black",
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>
                                }
                                {playerRoundItem.driverHasPole == 1
                              ? <div style={{display:"flex", textAlign:"center", justifyContent:'center'}}>&#127937;</div>
                              : <div style={{opacity:0, display:"flex", textAlign:"center", justifyContent:'center'}}>~</div>
                                }
                                <div></div>
                                {playerRoundItem.predictionPoints == 1
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerRoundItem.predictedDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'2px 0px 0px 2px',
                                }}>
                                </div>
                              : playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerRoundItem.resultDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'2px 0px 0px 2px',
                                }}>
                                </div>
                              : <div></div>
                                }
                                <div></div>
                                {playerRoundItem.predictionPoints == 1
                              ? <div style={{
                                  display:"flex",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"silver",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  //borderRadius:'4px',
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>
                              : playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"#D2BF37",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  //borderRadius:'4px',
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  color:"#FEFDFB",
                                  opacity:'0.0',
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>
                                }
                                <div></div>
                                {playerRoundItem.predictionPoints == 1
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerRoundItem.predictedDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'0px 2px 2px 0px',
                                }}>
                                </div>
                              : playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerRoundItem.resultDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'0px 2px 2px 0px',
                                }}>
                                </div>
                              : <div></div>
                                }
                                <div></div>
                              {playerRoundItem.userPolePrediction == 1
                            ? <div style={{display:"flex", textAlign:"center", justifyContent:'center'}}>&#127937;</div>
                            : <div style={{opacity:0, display:"flex", textAlign:"center", justifyContent:'center'}}>~</div>
                              }
                              {playerRoundItem.predictionPoints == 2
                            ? <div style={{
                                display:"flex",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                backgroundColor:"#28282B",
                                color:"#D2BF37",
                                width: 'auto',
                                minWidth: "50px",
                                paddingBottom:'2px',
                                paddingTop:'2px',
                                borderRadius:'4px 0px 0px 4px',
                                }}>
                                {playerRoundItem.positionPredictionDriverCode}
                              </div>
                            : playerRoundItem.predictionPoints == 1
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                backgroundColor:"#28282B",
                                color:"silver",
                                width: 'auto',
                                minWidth: "50px",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                paddingTop:'2px',
                                paddingBottom:'2px',
                                borderRadius:'4px 0px 0px 4px',
                                }}>
                                {playerRoundItem.positionPredictionDriverCode}
                              </div>
                            : <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                width: 'auto',
                                minWidth: "50px"
                                }}>
                                {playerRoundItem.positionPredictionDriverCode}
                              </div>
                              }
                              <div></div>
                              <div style={{
                                height:"18px",
                                backgroundColor:playerRoundItem.predictedDriverIconColor,
                                //backgroundColor:playerRoundItem.predictedDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'0px 1px 1px 0px',
                               }}>
                              </div>
                              <div></div>
                              {playerRoundItem.userFastestLapPrediction == 1
                            ? <div style={{
                                height:"18px",
                                backgroundColor:"#9370DB",
                                //backgroundColor:playerRoundItem.predictedDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'1px 1px 1px 1px',
                               }}>
                              </div>
                            : <div></div>
                              }
                            </div>
                          </li>
                          )): null}
                          {isItemInMidRoundPlayerSelection(playerItem)
                        ? <li>
                            <div>
                              <div style={{
                                fontSize:"12px",
                                textAlign:"center",
                                justifyContent:"center",
                                alignItems:'center',
                                }}>
                              </div>
                            </div>
                          </li>
                        : null}
                          {isItemInMidRoundPlayerSelection(playerItem)}
                        </ul>
                      )}
                    </li>
                  )): null}
                </ul>
              )}
              </li>
            ))}
          </ul>
        )}
      <div
        tabIndex={0}
        className="dd-header"
        role="button"
        onKeyPress={() => handleOnMidSeasonGameClick()}
        onClick={() => handleOnMidSeasonGameClick()}>
        <div className="dd-header__action" style={{
          display:'grid',
          gridTemplateColumns:'90% 10%',
          cursor:"pointer",
          justifyContent:"center",
          textAlign:"center",
          alignItems:"center",
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          color:"#FEFDFB",
          fontSize:18,
          marginLeft:8,
          marginRight:8,
          marginBottom:5,
          marginTop:20,
          width:"auto",
          padding:"25px",
          backgroundColor:"#BD2031",
          transform: "skewX(-15deg)",
          height:"auto",
          cursor:'pointer',
          }} 
          tabIndex={0}
          className="dd-header"
          role="button"
          onKeyPress={() => handleOnMidSeasonGameClick()}
          onClick={() => handleOnMidSeasonGameClick()}>
          <label style={{marginBottom:0,
            display:"flex",
            justifyContent:"center",
            textAlign:"center",
            alignItems:"center",
            }}>
              {ruleSetName} Total Points
          </label>
          {midSeasonOpen == false
        ? <label><BsIcons.BsChevronDoubleDown></BsIcons.BsChevronDoubleDown></label>
        : <label><BsIcons.BsChevronDoubleUp></BsIcons.BsChevronDoubleUp></label>
        }
          </div>
        </div>
        {midSeasonOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            marginTop:0,
            paddingLeft:0,
            margin:0}}>
            {midSeasonCurrentList.map(playerMidSeasonItem => (
              <li className="dd-list-item" key={playerMidSeasonItem.user_id}>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px auto 35px 50px 5px 30px 5px",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"#28282B",
                  color: "#BD2031",
                  padding:"15px",
                  marginBottom: 5,
                  width:"auto",
                  height:"auto",
                  marginLeft:20,
                  marginRight:20,
                  alignItems:"center",
                  cursor:"pointer",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 33}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidSeasonPlayerClick(playerMidSeasonItem)}>
                  {playerMidSeasonItem.position > 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {playerMidSeasonItem.positionText}
                  </div>
                : playerMidSeasonItem.position == 2
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'silver',
                    }}>
                    <GiIcons.GiPodiumSecond/>
                  </div>
                : playerMidSeasonItem.position == 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'#cd7f32',
                    }}>
                    <GiIcons.GiPodiumThird/>
                  </div>
                : <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    color:"#D2BF37",
                    fontSize:22,
                    }}>
                    <GiIcons.GiPodiumWinner/>
                  </div>
                  }
                  <div style={{
                    textAlign:'left',
                    paddingLeft:'15px',
                    }}>
                    {playerMidSeasonItem.username}
                  </div>
                  <div>
                  {playerMidSeasonItem.paddockDelta < 0 
                ? <div style={{display:"flex",
                    fontSize:12,
                    background:"#BD2031",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"#28282B",
                    width:'auto',
                    height:'auto',
                    borderRadius: 33,
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                : playerMidSeasonItem.paddockDelta > 0
                ? <div style={{display:"flex",
                    fontSize:12,
                    background:"#48A14D",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"#28282B",
                    width:'auto',
                    height:'auto',
                    borderRadius: 33,
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                : <div style={{display:"flex",
                    fontSize:12,
                    alignItems:"center",
                    justifyContent:'center',
                    color:"#28282B",
                    width:'auto',
                    height:'auto',
                    borderRadius: 33,
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  }
                  </div>
                  {playerMidSeasonItem.position==1 
                ? <div style={{
                    color:"#BD2031",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : playerMidSeasonItem.position==2
                ? <div style={{
                    color:"#BD2031",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : playerMidSeasonItem.position==3
                ? <div style={{
                    color:"#BD2031",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : <div style={{
                    color:"#BD2031",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                  }
                  <div></div>
                  {isItemInMidSesonPlayerSelection(playerMidSeasonItem)
                ? <label style={{
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                : <label style={{
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                    }
                  <div></div>
                </div>
                {midSeasonPlayerRoundOpen &&(
                <ul className="dd-list" style={{
                  listStyle:"none",
                  marginTop:0,
                  paddingLeft:0,
                  margin:0}}>
                  {isItemInMidSesonPlayerSelection(playerMidSeasonItem) 
                ? midSeasonPlayerRoundData[playerMidSeasonItem.username].map(playerMidSeasonRoundItem => ( 
                  <li className="dd-list-item" key={playerMidSeasonRoundItem.id}>
                    {playerMidSeasonRoundItem.gotFastestLapBonusPoint == 1
                  ? <div style={{
                      display:"grid",
                      gridTemplateColumns:"auto 25px 2px 25px 2px 25px 2px",
                      flexDirection: "row",
                      fontSize:12,
                      backgroundColor:"#9370DB",
                      color: "#FEFDFB",
                      padding:"5px",
                      marginBottom: 5,
                      width:"auto",
                      height:"auto",
                      marginLeft:30,
                      marginRight:30,
                      alignItems:"center",
                      borderRadius:33,
                      cursor:"pointer", 
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleOnMidSeasonRoundClick(playerMidSeasonRoundItem)}>
                      <div style={{
                        textAlign:'left',
                        paddingLeft:"15px"
                        }}>
                        {playerMidSeasonRoundItem.circuitRef}
                      </div>
                      {playerMidSeasonRoundItem.gotPoleLapBonusPoint == 1
                    ? <div style={{
                        textAlign:'center',
                        justifyContent:'center',
                        alignItems:'center',
                        }}>
                        &#127937;
                      </div>
                    : <div></div>
                      }
                      <div></div>
                      <div style={{
                        textAlign:'right',
                        paddingRight: "10px",
                        }}>
                        {playerMidSeasonRoundItem.roundPoints}
                      </div>
                      <div></div>
                      {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem)
                    ? <label style={{
                        textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    : <label style={{
                        textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                        }
                      <div></div>
                    </div>
                  : <div style={{
                      display:"grid",
                      gridTemplateColumns:"auto 25px 2px 25px 2px 25px 2px",
                      flexDirection: "row",
                      fontSize:12,
                      backgroundColor:"#BD2031",
                      color: "#FEFDFB",
                      padding:"5px",
                      marginBottom: 5,
                      width:"auto",
                      height:"auto",
                      marginLeft:30,
                      marginRight:30,
                      alignItems:"center",
                      borderRadius:33,
                      cursor:"pointer", 
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleOnMidSeasonRoundClick(playerMidSeasonRoundItem)}>
                      <div style={{
                        textAlign:'left',
                        paddingLeft:"15px"
                        }}>
                        {playerMidSeasonRoundItem.circuitRef}
                      </div>
                      {playerMidSeasonRoundItem.gotPoleLapBonusPoint == 1
                    ? <div style={{
                        textAlign:'center',
                        justifyContent:'center',
                        alignItems:'center',
                        }}>
                        &#127937;
                      </div>
                    : <div></div>
                      }
                      <div></div>
                      <div style={{
                        textAlign:'right',
                        paddingRight: "10px",
                        }}>
                        {playerMidSeasonRoundItem.roundPoints}
                      </div>
                      <div></div>
                      {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem)
                    ? <label style={{
                        textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        }}><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    : <label style={{
                        textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        }}><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                        }
                      <div></div>
                    </div>
                    }
                    {midSeasonPlayerRoundPointsOpen && (
                      <ul className="dd-list" style={{
                        listStyle:"none",
                        padding:0,
                        marginTop:0,
                        paddingLeft:10,
                        margin:0}}>
                        {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem)
                      ? <li>
                          <div style={{
                            display:"grid",
                            //alignContent:"space-between",
                            gridTemplateColumns:"50% 50%",
                            //justifyContent:"space-between",
                            alignItems:"center",
                            justifyContent:'center',
                            textAlign:'center',
                            flexDirection:"row",
                            marginBottom:5,
                            width:"auto",
                            fontSize:12,
                            marginLeft:33,
                            marginRight:43,
                            marginBottom:10,
                            }}>
                              <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                              <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                          </div>
                        </li>
                      : null}
                        {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem) 
                      ? playerMidRoundPointsData.userPoints[playerMidSeasonItem.username][playerMidSeasonRoundItem.circuitRef].map(playerMidSeasonRoundPointsItem => (
                          <li className="dd-list-item" key={playerMidSeasonRoundPointsItem.circuitRef}>
                            <div style={{
                              display:"grid",
                              //alignContent:"space-between",
                              gridTemplateColumns:"20px 3px 5px 2px 50px 20px auto 2px 1px 19px 1px 2px auto 20px 50px 2px 5px 2px 5px",
                              //justifyContent:"space-between",
                              alignItems:"center",
                              flexDirection:"row",
                              width:"auto",
                              fontSize:12,
                              marginLeft:33,
                              marginRight:43,
                              marginBottom:8,
                              }}>
                              {playerMidSeasonRoundPointsItem.driverHasFastestLap == 1
                            ? <div style={{
                                backgroundColor:"#9370DB",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                textAlign: 'center',
                                padding:'2px',
                                borderRadius:'2px',
                                color:"#FEFDFB",
                                }}>
                                {playerMidSeasonRoundPointsItem.racePosition}
                              </div>
                            : <div style={{
                                backgroundColor:"#FEFDFB",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                textAlign: 'center',
                                padding:'2px',
                                borderRadius:'2px',
                                }}>
                                {playerMidSeasonRoundPointsItem.racePosition}
                              </div>
                              }
                              <div></div>
                              <div style={{
                                height:"18px",
                                backgroundColor:playerMidSeasonRoundPointsItem.resultDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'1px 0px 0px 1px',
                               }}>
                              </div>
                              <div></div>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"#D2BF37",
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>
                              : playerMidSeasonRoundPointsItem.singlePointFinishingHit == 1
                              ? <div style={{
                                  display:"flex",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"silver",
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  width: 'auto',
                                  minWidth: "50px",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  borderRadius:'0px 4px 4px 0px',
                                  borderColor:"black",
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>
                                }
                                {playerMidSeasonRoundPointsItem.driverHasPole == 1
                              ? <div style={{display:"flex", textAlign:"center", justifyContent:'center'}}>&#127937;</div>
                              : <div style={{opacity:0, display:"flex", textAlign:"center", justifyContent:'center'}}>~</div>
                                }
                                <div></div>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 1
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerMidSeasonRoundPointsItem.predictedDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'2px 0px 0px 2px',
                                }}>
                                </div>
                              : playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerMidSeasonRoundPointsItem.resultDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'2px 0px 0px 2px',
                                }}>
                                </div>
                              : <div></div>
                                }
                                <div></div>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 1
                              ? <div style={{
                                  display:"flex",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"silver",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  //borderRadius:'4px',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>
                              : playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  backgroundColor:"#28282B",
                                  color:"#D2BF37",
                                  paddingTop:'2px',
                                  paddingBottom:'2px',
                                  //borderRadius:'4px',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  //borderRadius: 50,
                                  color:"#FEFDFB",
                                  opacity:'0.0',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>
                                }
                                <div></div>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 1
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerMidSeasonRoundPointsItem.predictedDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'0px 2px 2px 0px',
                                }}>
                                </div>
                              : playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  height:"18px",
                                  backgroundColor:playerMidSeasonRoundPointsItem.resultDriverIconColor,
                                  //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  borderRadius:'0px 2px 2px 0px',
                                }}>
                                </div>
                              : <div></div>
                                }
                                <div></div>
                              {playerMidSeasonRoundPointsItem.userPolePrediction == 1
                            ? <div style={{display:"flex", textAlign:"center", justifyContent:'center'}}>&#127937;</div>
                            : <div style={{opacity:0, display:"flex", textAlign:"center", justifyContent:'center'}}>~</div>
                              }
                              {playerMidSeasonRoundPointsItem.predictionPoints == 2
                            ? <div style={{
                                display:"flex",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                backgroundColor:"#28282B",
                                color:"#D2BF37",
                                width: 'auto',
                                minWidth: "50px",
                                paddingBottom:'2px',
                                paddingTop:'2px',
                                borderRadius:'4px 0px 0px 4px',
                                }}>
                                {playerMidSeasonRoundPointsItem.positionPredictionDriverCode}
                              </div>
                            : playerMidSeasonRoundPointsItem.predictionPoints == 1
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                backgroundColor:"#28282B",
                                color:"silver",
                                width: 'auto',
                                minWidth: "50px",
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                paddingTop:'2px',
                                paddingBottom:'2px',
                                borderRadius:'4px 0px 0px 4px',
                                }}>
                                {playerMidSeasonRoundPointsItem.positionPredictionDriverCode}
                              </div>
                            : <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 50,
                                width: 'auto',
                                minWidth: "50px"
                                }}>
                                {playerMidSeasonRoundPointsItem.positionPredictionDriverCode}
                              </div>
                              }
                              <div></div>
                              <div style={{
                                height:"18px",
                                backgroundColor:playerMidSeasonRoundPointsItem.predictedDriverIconColor,
                                //backgroundColor:playerMidSeasonRoundPointsItem.predictedDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'0px 1px 1px 0px',
                               }}>
                              </div>
                              <div></div>
                              {playerMidSeasonRoundPointsItem.userFastestLapPrediction == 1
                            ? <div style={{
                                height:"18px",
                                backgroundColor:"#9370DB",
                                //backgroundColor:playerMidSeasonRoundPointsItem.predictedDriverIconColor,
                                //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                borderRadius:'1px 1px 1px 1px',
                               }}>
                              </div>
                            : <div></div>
                              }
                            </div>
                          </li>
                          )): null}
                          {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem)
                        ? <li>
                            <div>
                              <div style={{
                                fontSize:"12px",
                                textAlign:"center",
                                justifyContent:"center",
                                alignItems:'center',
                                opacity:0,
                                }}>
                              </div>
                            </div>
                          </li>
                        : null}
                        </ul>
                      )}
                  </li>
                    ))
                : null}
                </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      <div>
      </div>
      {isManualResult
      ? <div style={{
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          textAlign:"center",
          marginTop:"15px",
          maxWidth:'250px',
          marginLeft:"auto",
          marginRight:"auto",
          fintSeize:"6px",
          }}>Season points leaderbaords will be updated once the official result has been released by the Ergast API.<br></br><br></br> Results up to and including {lastRound} below.
        </div>
      : null
        }
      <div className="dd-header__action" style={{
        display:'grid',
        gridTemplateColumns:'90% 10%',
        cursor:"pointer",
        justifyContent:"center",
        textAlign:"center",
        alignItems:"center",
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
        color:"#FEFDFB",
        fontSize:18,
        marginLeft:8,
        marginRight:8,
        marginBottom:5,
        marginTop:20,
        width:"auto",
        padding:"25px",
        backgroundColor:"#BD2031",
        transform: "skewX(-15deg)",
        height:"auto",
        cursor:'pointer',
        }} 
        tabIndex={0}
        className="dd-header"
        role="button"
        onKeyPress={() => handleOnDriverStandingGameClick()}
        onClick={() => handleOnDriverStandingGameClick()}>
        <label style={{marginBottom:0,
          display:"flex",
          justifyContent:"center",
          textAlign:"center",
          alignItems:"center",
          }}>
            Driver Standing Points
        </label>
        {driverStandingOpen == false
        ? <label><BsIcons.BsChevronDoubleDown></BsIcons.BsChevronDoubleDown></label>
        : <label><BsIcons.BsChevronDoubleUp></BsIcons.BsChevronDoubleUp></label>
        }
      </div>
      {driverStandingOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            marginTop:0,
            paddingLeft:0,
            margin:0}}>
            {driverStandingData.map(playerDriverStanding => (
              <li className="dd-list-item" key={playerDriverStanding.id}>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 40% auto",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"#28282B",
                  color: "#BD2031",
                  padding:"15px",
                  marginBottom: 5,
                  width:"auto",
                  height:"auto",
                  marginLeft:20,
                  marginRight:20,
                  alignItems:"center",
                  cursor:"pointer",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 33}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  {playerDriverStanding.playerPosition > 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {playerDriverStanding.positionText}
                  </div>
                : playerDriverStanding.playerPosition == 2
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'silver',
                    }}>
                    <GiIcons.GiPodiumSecond/>
                  </div>
                : playerDriverStanding.playerPosition == 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'#cd7f32',
                    }}>
                    <GiIcons.GiPodiumThird/>
                  </div>
                : <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    color:"#D2BF37",
                    fontSize:22,
                    }}>
                    <GiIcons.GiPodiumWinner/>
                  </div>
                  }
                  <div style={{
                    textAlign:'left',
                    paddingLeft:'15px',
                    }}>
                    {playerDriverStanding.username}
                  </div>
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'auto 30px auto 40px auto 30px 0px 20px',
                    alignItems:'center',
                    }}>
                    <div></div>
                    {playerDriverStanding.pointsChange > 0
                  ? <div style={{
                      color:"#48A14D",
                      fontSize:12,
                      textAlign:'right',
                      }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                  : playerDriverStanding.pointsChange < 0
                  ? <div style={{
                      color:"#BD2031",
                      fontSize:12,
                      textAlign:'right',
                    }}>
                      {playerDriverStanding.pointsChangeText}
                  </div>
                  : <div style={{
                      color:"#28282B",
                      fontSize:12,
                      textAlign:'right',
                      }}>
                        {playerDriverStanding.pointsChangeText}
                      </div>
                      }
                    <div></div>
                    {playerDriverStanding.playerDelta > 0
                  ? <div style={{
                      display:'flex',
                      justifyContent:'center',
                      }}>
                      <div style={{
                        backgroundColor: "#48A14D",
                        borderRadius:'8px',
                        fontSize:12,
                        color:"#28282B",
                        padding:"5px",
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        width:30,
                        textAlign:'center',
                        }}>
                        {playerDriverStanding.paddockDeltaText}
                      </div>
                    </div>
                  : playerDriverStanding.playerDelta < 0
                    ? <div style={{
                        display:'flex',
                        justifyContent:'center',
                        }}>
                        <div style={{
                          backgroundColor: "#BD2031",
                          borderRadius:'8px',
                          fontSize:12,
                          color:"#28282B",
                          padding:"5px",
                          paddingTop:'2px',
                          paddingBottom:'2px',
                          width:30,
                          textAlign:'center',
                          }}>
                          {playerDriverStanding.paddockDeltaText}
                        </div>
                      </div>
                  : <div style={{
                      display:'flex',
                      }}>
                      <div style={{
                        fontSize:12,
                        color:"#28282B",
                        }}>
                        {playerDriverStanding.paddockDeltaText}
                      </div>
                    </div>
                    }  
                    <div></div>
                    {playerDriverStanding.playerPosition == 1
                  ? <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031",
                      }}>
                      {playerDriverStanding.currentRoundPoints}
                    </div>
                  : playerDriverStanding.playerPosition == 2
                    ? <div style={{
                        paddingRight:'10px',
                        textAlign:"right",
                        color:"#BD2031",
                        }}>
                        {playerDriverStanding.currentRoundPoints}
                      </div>
                  : playerDriverStanding.playerPosition == 3
                  ? <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031",
                      }}>
                      {playerDriverStanding.currentRoundPoints}
                    </div>
                  : <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031"
                      }}>
                      {playerDriverStanding.currentRoundPoints}
                    </div>
                    }
                    <div></div>
                    <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      textAlign:"center",
                      }}>
                    {isDriverStadingPlayerSelection(playerDriverStanding) == false
                  ? <label><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                  : <label><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    }
                    </div>
                    </div>
                  </div>
                    {driverStandingUserPredictionOpen && (
                    <ul className="dd-list" style={{
                      listStyle:"none",
                      paddingLeft:5,
                      marginTop:5,
                      marginBottom:10,
                      marginLeft:0}}>
                      {isDriverStadingPlayerSelection(playerDriverStanding)
                    ? <li>
                        <div style={{
                          display:"grid",
                          //alignContent:"space-between",
                          gridTemplateColumns:"50% 50%",
                          //justifyContent:"space-between",
                          alignItems:"center",
                          justifyContent:'center',
                          textAlign:'center',
                          flexDirection:"row",
                          marginBottom:5,
                          width:"auto",
                          fontSize:12,
                          marginLeft:33,
                          marginRight:43,
                          marginBottom:10,
                          }}>
                            <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                            <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                        </div>
                      </li>
                    : null}
                      {isDriverStadingPlayerSelection(playerDriverStanding) 
                      ? driverStandingPlayerPoints[playerDriverStanding.username].map(driverStandingPoints => (
                        <li className="dd-list-item" key={driverStandingPoints.id}>
                          <div style={{
                            display:"grid",
                            //alignContent:"space-between",
                            gridTemplateColumns:"25px 3px 5px 2px 45px 10px 30px 10px 25px 10px auto 2px 1px 18px 1px 2px auto 45px 2px 5px",
                            //justifyContent:"space-between",
                            alignItems:"center",
                            flexDirection:"row",
                            marginBottom:8,
                            width:"auto",
                            fontSize:12,
                            marginLeft:33,
                            marginRight:43,
                            }}>
                            <div style={{
                              backgroundColor:"#FEFDFB",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              textAlign: 'center',
                              padding:'2px',
                              borderRadius:'2px',
                              }}>
                              {driverStandingPoints.currentPosition}
                            </div>
                            <div></div>
                            <div style={{
                              backgroundColor:driverStandingPoints.resultDriverIconColor,
                              height:"18px",
                              justifyContent:"center",
                              display:"flex",
                              borderRadius:"1px",
                              }}></div>
                            <div style={{
                              }}>
                            </div>
                            {driverStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              borderRadius:'0px 4px 4px 0px',
                              }}>
                              {driverStandingPoints.driverCode}
                            </div>
                          : driverStandingPoints.singlePointFinishingHit == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              borderRadius:'0px 4px 4px 0px',
                              }}>
                              {driverStandingPoints.driverCode}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {driverStandingPoints.driverCode}
                            </div>
                            }
                            <div></div>
                            <div style={{
                              //backgroundColor:"#FEFDFB",
                              //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              textAlign: 'center',
                              padding:'2px',
                              //borderRadius:'2px',
                              }}>
                              {driverStandingPoints.driverPoints}
                            </div>
                            <div style={{
                              }}>
                            </div>
                            {driverStandingPoints.driverDelta > 0
                          ? <div style={{
                              backgroundColor:"#48A14D",
                              borderRadius:'8px',
                              fontSize:"8px",
                              height:"13px",
                              justifyContent:'center',
                              display:"flex",
                              //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              textAlign:'center',
                              alignItems:"center",
                              color:"#FEFDFB",
                              }}>
                              {driverStandingPoints.driverDeltaText}
                            </div>
                          : driverStandingPoints.driverDelta < 0
                          ?  <div style={{
                              backgroundColor:"#BD2031",
                              borderRadius:'8px',
                              fontSize:"8px",
                              height:"13px",
                              justifyContent:'center',
                              display:"flex",
                              //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              textAlign:'center',
                              alignItems:"center",
                              color:"#FEFDFB",
                              }}>
                              {driverStandingPoints.driverDeltaText}
                            </div>
                          : <div style={{
                              color:"#FEFDFB",
                              opacity:"0.0",
                              textAlign:'center',
                              }}>
                              {driverStandingPoints.driverDeltaText}
                            </div>
                            }
                            <div></div>
                            <div></div>
                            {driverStandingPoints.predictionPoints == 1 || driverStandingPoints.predictionPoints == 2
                          ? <div style={{
                              height:"18px",
                              backgroundColor:driverStandingPoints.predictedDriverIconColor,
                              display:"flex",
                              borderRadius:"1px, 0px, 0px, 1px",
                              }}></div>
                          : <div></div>
                            }
                            <div></div>
                            {driverStandingPoints.predictionPoints == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {driverStandingPoints.predictionPoints}
                            </div>
                          : driverStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {driverStandingPoints.predictionPoints}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              color:"#FEFDFB",
                              opacity:'0.0',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {driverStandingPoints.predictionPoints}
                            </div>
                            }
                            <div></div>
                            {driverStandingPoints.predictionPoints == 1 || driverStandingPoints.predictionPoints == 2
                          ? <div style={{
                              height:"18px",
                              backgroundColor:driverStandingPoints.predictedDriverIconColor,
                              display:"flex",
                              borderRadius:"0px, 1px, 1px, 0px",
                              }}></div>
                          : <div></div>
                            }
                            <div></div>
                            {driverStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              borderRadius:'4px 0px 0px 4px',
                              }}>
                              {driverStandingPoints.positionPredictionDriverCode}
                            </div>
                          : driverStandingPoints.predictionPoints == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              borderRadius:'4px 0px 0px 4px',
                              }}>
                              {driverStandingPoints.positionPredictionDriverCode}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              borderRadius:'4px 0px 0px 4px',
                              }}>
                              {driverStandingPoints.positionPredictionDriverCode}
                            </div>
                            }
                            <div></div>
                            <div style={{
                              height:"18px",
                              backgroundColor:driverStandingPoints.predictedDriverIconColor,
                              display:"flex",
                              borderRadius:"1px, 0px, 0px, 1px",
                              }}></div>
                          </div>    
                        </li>
                      )): null}
                    </ul>
                   )}
                </li>
              ))}
            </ul>
            )}
          <div>
            <div className="dd-header__action" style={{
              display:'grid',
              gridTemplateColumns:'90% 10%',
              cursor:"pointer",
              justifyContent:"center",
              textAlign:"center",
              alignItems:"center",
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              color:"#FEFDFB",
              fontSize:18,
              marginLeft:8,
              marginRight:8,
              marginBottom:5,
              marginTop:20,
              width:"auto",
              padding:"25px",
              backgroundColor:"#BD2031",
              transform: "skewX(-15deg)",
              height:"auto",
              cursor:'pointer',
              }} 
              tabIndex={0}
              className="dd-header"
              role="button"
              onKeyPress={() => handleOnConstructorStandingGameClick()}
              onClick={() => handleOnConstructorStandingGameClick()}>
              <label style={{marginBottom:0,
                display:"flex",
                justifyContent:"center",
                textAlign:"center",
                alignItems:"center",
                }}>
                  Team Standing Points
              </label>
              {constructorStandingOpen == false
            ? <label><BsIcons.BsChevronDoubleDown></BsIcons.BsChevronDoubleDown></label>
            : <label><BsIcons.BsChevronDoubleUp></BsIcons.BsChevronDoubleUp></label>
            }
            </div>
        {constructorStandingOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            marginTop:0,
            paddingLeft:0,
            margin:0}}>
            {constructorStandingData.map(playerConstructorStanding => (
              <li className="dd-list-item" key={playerConstructorStanding.id}>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 40% auto",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"#28282B",
                  color: "#BD2031",
                  padding:"15px",
                  marginBottom: 5,
                  width:"auto",
                  height:"auto",
                  marginLeft:20,
                  marginRight:20,
                  alignItems:"center",
                  cursor:"pointer",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 33}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnConstructorStandingsPlayerClick(playerConstructorStanding)}>
                  {playerConstructorStanding.playerPosition > 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {playerConstructorStanding.positionText}
                  </div>
                : playerConstructorStanding.playerPosition == 2
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'silver',
                    }}>
                    <GiIcons.GiPodiumSecond/>
                  </div>
                : playerConstructorStanding.playerPosition == 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:22,
                    color:'#cd7f32', 
                    }}>
                    <GiIcons.GiPodiumThird/>
                  </div>
                : <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    color:"#D2BF37",
                    fontSize:22,
                    }}>
                    <GiIcons.GiPodiumWinner/>
                  </div>
                  }
                  <div style={{
                    textAlign:'left',
                    paddingLeft:'15px',
                    }}>
                    {playerConstructorStanding.username}
                  </div>
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'auto 30px auto 40px auto 30px 0px 20px',
                    alignItems:'center',
                    }}>
                    <div></div>
                    {playerConstructorStanding.pointsChange > 0
                  ? <div style={{
                      color:"#48A14D",
                      fontSize:12,
                      textAlign:'center',
                      }}>
                      {playerConstructorStanding.pointsChangeText}
                    </div>
                  : playerConstructorStanding.pointsChange < 0
                  ? <div style={{
                      color:"#BD2031",
                      fontSize:12,
                      textAlign:'center',
                    }}>
                      {playerConstructorStanding.pointsChangeText}
                  </div>
                  : <div style={{
                      color:"#28282B",
                      fontSize:12,
                      textAlign:'center',
                      }}>
                        {playerConstructorStanding.pointsChangeText}
                      </div>
                      }
                    <div></div>
                    {playerConstructorStanding.playerDelta > 0
                  ? <div style={{
                      display:'flex',
                      justifyContent:'center',
                      }}>
                      <div style={{
                        backgroundColor: "#48A14D",
                        borderRadius:'8px',
                        fontSize:12,
                        color:"#28282B",
                        padding:"5px",
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        width:30,
                        textAlign:'center',
                        }}>
                        {playerConstructorStanding.paddockDeltaText}
                      </div>
                    </div>
                  : playerConstructorStanding.playerDelta < 0
                    ? <div style={{
                        display:'flex',
                        justifyContent:'center',
                        }}>
                        <div style={{
                          backgroundColor: "#BD2031",
                          borderRadius:'8px',
                          fontSize:12,
                          color:"#28282B",
                          padding:"5px",
                          paddingTop:'2px',
                          paddingBottom:'2px',
                          width:30,
                          textAlign:'center',
                          }}>
                          {playerConstructorStanding.paddockDeltaText}
                        </div>
                      </div>
                  : <div style={{
                      display:'flex',
                      }}>
                      <div style={{
                        fontSize:12,
                        color:"#28282B",
                        }}>
                        {playerConstructorStanding.paddockDeltaText}
                      </div>
                    </div>
                    }  
                    <div></div>
                    {playerConstructorStanding.playerPosition == 1
                  ? <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031",
                      }}>
                      {playerConstructorStanding.currentRoundPoints}
                    </div>
                  : playerConstructorStanding.playerPosition == 2
                    ? <div style={{
                        paddingRight:'10px',
                        textAlign:"right",
                        color:"#BD2031",
                        }}>
                        {playerConstructorStanding.currentRoundPoints}
                      </div>
                  : playerConstructorStanding.playerPosition == 3
                  ? <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031",
                      }}>
                      {playerConstructorStanding.currentRoundPoints}
                    </div>
                  : <div style={{
                      paddingRight:'10px',
                      textAlign:"right",
                      color:"#BD2031"
                      }}>
                      {playerConstructorStanding.currentRoundPoints}
                    </div>
                    }
                    <div></div>
                    <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      textAlign:"center",
                      }}>
                    {isConstructorStadingPlayerSelection(playerConstructorStanding) == false
                  ? <label><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                  : <label><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    }
                    </div>
                    </div>
                  </div>
                    {constructorStandingUserPredictionOpen && (
                    <ul className="dd-list" style={{
                      listStyle:"none",
                      paddingLeft:5,
                      marginTop:5,
                      marginBottom:10,
                      marginLeft:0}}>
                      {isConstructorStadingPlayerSelection(playerConstructorStanding)
                    ? <li>
                        <div style={{
                          display:"grid",
                          //alignContent:"space-between",
                          gridTemplateColumns:"50% 50%",
                          //justifyContent:"space-between",
                          alignItems:"center",
                          justifyContent:'center',
                          textAlign:'center',
                          flexDirection:"row",
                          marginBottom:5,
                          width:"auto",
                          fontSize:12,
                          marginLeft:33,
                          marginRight:43,
                          marginBottom:10,
                          }}>
                            <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                            <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                        </div>
                      </li>
                    : null}
                      {isConstructorStadingPlayerSelection(playerConstructorStanding) 
                      ? constructorStandingPlayerPoints[playerConstructorStanding.username].map(constructorStandingPoints => (
                        <li className="dd-list-item" key={constructorStandingPoints.id}>
                          <div style={{
                            display:"grid",
                            //alignContent:"space-between",
                            gridTemplateColumns:"18px 3px 5px 2px 60px 7px 28px 7px 28px 7px auto 2px 1px 13px 1px 2px auto 7px 60px 2px 5px",
                            //justifyContent:"space-between",
                            alignItems:"center",
                            flexDirection:"row",
                            marginBottom:8,
                            width:"auto",
                            fontSize:10,
                            marginLeft:33,
                            marginRight:43,
                            }}>
                            <div style={{
                              backgroundColor:"#FEFDFB",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              textAlign: 'center',
                              padding:'1px 2px 1px 2px',
                              borderRadius:'2px',
                              }}>
                              {constructorStandingPoints.currentPosition}
                            </div>
                            <div></div>
                            <div style={{
                              height:"36px",
                              display:"flex",
                              borderRadius:"1px 0px 0px 1px",
                              justifyContent:"center",
                              alignItems:"center",
                              backgroundColor:constructorStandingPoints.resultDriverIconColor,
                              }}>
                            </div>
                            <div></div>
                            {constructorStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              borderRadius:'0px 6px 6px 0px',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.constructorCode}
                            </div>
                          : constructorStandingPoints.singlePointFinishingHit == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              borderRadius:'0px 6px 6px 0px',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.constructorCode}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignContent:'center',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.constructorCode}
                            </div>
                            }
                            <div></div>
                            <div style={{
                              textAlign: 'center',
                              padding:'2px',
                              }}>
                              {constructorStandingPoints.constructorPoints}
                            </div>
                            <div></div>
                            {constructorStandingPoints.constructorDelta > 0
                          ? <div style={{
                              backgroundColor:"#48A14D",
                              borderRadius:'8px',
                              paddingBottom:'1px',
                              paddingTop:'1px',
                              textAlign:'center',
                              color:"#FEFDFB",
                              fontSize:"8px",
                              paddingTop:"2px",
                              paddingBottom:"2px",
                              }}>
                              {constructorStandingPoints.constructorDeltaText}
                            </div>
                          : constructorStandingPoints.constructorDelta < 0
                          ? <div style={{
                              backgroundColor:"#BD2031",
                              borderRadius:'8px',
                              paddingBottom:'1px',
                              paddingTop:'1px',
                              textAlign:'center',
                              color:"#FEFDFB",
                              fontSize:"8px",
                              paddingTop:"2px",
                              paddingBottom:"2px",
                              }}>
                              {constructorStandingPoints.constructorDeltaText}
                            </div>
                          : <div style={{
                              color:"#FEFDFB",
                              opacity:"0.0",
                              textAlign:'center',
                              }}>
                              {constructorStandingPoints.constructorDeltaText}
                            </div>
                            }
                            <div></div>
                            <div></div>
                            {constructorStandingPoints.predictionPoints>0
                          ? <div style={{
                              height:"15.5px",
                              borderRadius:"0px, 1px, 1px, 0px",
                              alignItems:'center',
                              justifyContent:'center',
                              backgroundColor:constructorStandingPoints.predictedDriverIconColor,
                            }}></div>
                          : <div></div>
                            }
                            <div></div>
                            {constructorStandingPoints.predictionPoints == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {constructorStandingPoints.predictionPoints}
                            </div>
                          : constructorStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {constructorStandingPoints.predictionPoints}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              color:"#FEFDFB",
                              opacity:'0.0',
                              paddingTop:'2px',
                              paddingBottom:'2px',
                              }}>
                              {constructorStandingPoints.predictionPoints}
                            </div>
                            }
                            <div></div>
                            {constructorStandingPoints.predictionPoints>0
                          ? <div style={{
                              height:"15.5px",
                              borderRadius:"1px, 0px, 0px, 1px",
                              alignItems:'center',
                              justifyContent:'center',
                              backgroundColor:constructorStandingPoints.predictedDriverIconColor,
                            }}></div>
                          : <div></div>
                            }
                            <div></div>
                            <div></div>
                            {constructorStandingPoints.predictionPoints == 2
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:"#D2BF37",
                              borderRadius:'6px 0px 0px 6px',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.positionPredictionconstructorCode}
                            </div>
                          : constructorStandingPoints.predictionPoints == 1
                          ? <div style={{
                              textAlign:'center',
                              backgroundColor:"#28282B",
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              color:'silver',
                              borderRadius:'6px 0px 0px 6px',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.positionPredictionconstructorCode}
                            </div>
                          : <div style={{
                              textAlign:'center',
                              paddingTop:'3px',
                              paddingBottom:'3px',
                              alignItems:'center',
                              display:'flex',
                              justifyContent:'center',
                              height:30,
                              }}>
                              {constructorStandingPoints.positionPredictionconstructorCode}
                            </div>
                            }
                            <div></div>
                            <div style={{
                              height:"36px",
                              display:"flex",
                              borderRadius:"0px 1px 1px 0px",
                              justifyContent:"center",
                              alignItems:"center",
                              backgroundColor:constructorStandingPoints.predictedDriverIconColor,
                              }}>
                            </div>
                          </div> 
                        </li>
                      )): null}
                    </ul>
                   )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="dd-header__action" style={{
              display:'grid',
              gridTemplateColumns:'90% 10%',
              cursor:"pointer",
              justifyContent:"center",
              textAlign:"center",
              alignItems:"center",
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              color:"#FEFDFB",
              fontSize:18,
              marginLeft:8,
              marginRight:8,
              marginBottom:5,
              marginTop:20,
              width:"auto",
              padding:"25px",
              backgroundColor:"#BD2031",
              transform: "skewX(-15deg)",
              height:"auto",
              cursor:'pointer',
              }} 
              tabIndex={0}
              className="dd-header"
              role="button"
              onKeyPress={() => handleOnCombinedClick()}
              onClick={() => handleOnCombinedClick()}>
              <label style={{marginBottom:0,
                display:"flex",
                justifyContent:"center",
                textAlign:"center",
                alignItems:"center",
                }}>
                  Combined Standings Points
              </label>
              {combinedOpen == false
            ? <label><BsIcons.BsChevronDoubleDown></BsIcons.BsChevronDoubleDown></label>
            : <label><BsIcons.BsChevronDoubleUp></BsIcons.BsChevronDoubleUp></label>
              }
            </div>
        {combinedOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            marginTop:0,
            paddingLeft:0,
            margin:0}}>
            {combinedPlayerData['leaderboardData'].map(combinedItem => (
              <li className="dd-list-item" key={combinedItem.id}>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 10px 100px 10px auto 30px 10px auto 40px auto 10px 30px 0px 20px",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"#28282B",
                  color: "#BD2031",
                  padding:"15px",
                  marginBottom: 5,
                  width:"auto",
                  height:"auto",
                  marginLeft:20,
                  marginRight:20,
                  alignItems:"center",
                  cursor:"pointer",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: 33}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnCombinedPlayerClick(combinedItem)}>
                  {combinedItem.position == 1
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    color:"#D2BF37",
                    fontSize:20,
                    }}>
                    <GiIcons.GiPodiumWinner/> 
                  </div>
                : combinedItem.position == 2
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    color:'silver',
                    fontSize:20,
                    }}>
                    <GiIcons.GiPodiumSecond/> 
                  </div>
                : combinedItem.position == 3
                ? <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    fontSize:20,
                    color:'#cd7f32'
                    }}>
                    <GiIcons.GiPodiumThird/> 
                  </div> 
                : <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {combinedItem.positionText} 
                  </div>}
                  <div></div>
                  <div style={{
                    marginLeft:6,
                    textAlign:"left",
                    fontSize:15,
                    }}>
                    {combinedItem.username}
                  </div>
                  <div></div>
                  <div></div>
                  {combinedItem.pointsChange > 0
                ? <div style={{
                    fontSize:12,
                    textAlign:'center',
                    color:"#48A14D",
                    }}>
                    {combinedItem.pointsChangeText}
                  </div>
                : combinedItem.pointsChange < 0
                ? <div style={{
                    fontSize:12,
                    textAlign:'center',
                    color:"#BD2031",
                    }}>
                    {combinedItem.pointsChangeText}
                  </div>
                : <div style={{
                    fontSize:12,
                    textAlign:'center',
                    }}>
                    {combinedItem.pointsChangeText}
                  </div>
                  }
                  <div></div>
                  <div></div>
                  <div style={{
                    display:'flex',
                    justifyContent:'center',
                    }}>
                    {combinedItem.paddockDelta > 0
                  ? <div style={{
                      backgroundColor: "#48A14D",
                      borderRadius:'8px',
                      fontSize:12,
                      color:"#28282B",
                      padding:"5px",
                      paddingTop:'2px',
                      paddingBottom:'2px',
                      width:30,
                      textAlign:'center',
                      }}>
                      {combinedItem.paddockDeltaText}
                    </div>
                  : combinedItem.paddockDelta < 0
                  ? <div style={{
                      backgroundColor: "#BD2031",
                      borderRadius:'8px',
                      fontSize:12,
                      color:"#28282B",
                      padding:"5px",
                      paddingTop:'2px',
                      paddingBottom:'2px',
                      width:30,
                      textAlign:'center',
                      }}>
                      {combinedItem.paddockDeltaText}
                    </div>
                  : <div style={{
                      fontSize:12,
                      color:"#28282B",
                      padding:"5px",
                      paddingTop:'2px',
                      paddingBottom:'2px',
                      width:30,
                      textAlign:'center',
                      }}>
                      {combinedItem.paddockDeltaText}
                    </div>}
                  </div>
                  <div></div>
                  <div></div>
                  <div style={{
                    paddingRight:'10px',
                    textAlign:"right",
                    color:"#BD2031",
                    }}>
                    {combinedItem.playerPoints}
                  </div>
                  <div></div>
                  <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      textAlign:"center",
                      }}>
                    {isCombinedPlayerInSelection(combinedItem) == false
                  ? <label><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                  : <label><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    }
                    </div>
                    </div>
                {isCombinedPlayerInSelection(combinedItem)
              ? combinedPlayerOpen &&
                <ul className="dd-list" style={{
                  listStyle:"none",
                  paddingLeft:5,
                  marginTop:5,
                  marginBottom:10,
                  marginLeft:0}}>
                   <li className="dd-list-item" key={combinedItem.username}>
                     <div 
                      role="button" 
                      onClick={() => handlePlayerCombinedConstructorStandingClick(combinedItem)}
                      style={{
                      display:"grid",
                      gridTemplateColumns:"70% 10px auto 10px auto 10px 20px",
                      flexDirection: "row",
                      fontSize:12,
                      backgroundColor:"#BD2031",
                      color: "#FEFDFB",
                      padding:"15px",
                      marginBottom: 5,
                      width:"auto",
                      height:"auto",
                      marginLeft:23,
                      marginRight:28,
                      alignItems:"center",
                      cursor:"pointer",
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      borderRadius:"10px"}}>
                      <div style={{
                        textAlign:'left'
                        }}>
                        Contructor Standings
                      </div>
                      <div></div>
                      <div style={{
                        textAlign:'center',
                        fontSize:10,
                        }}>
                        {playerConstructorPointsChangeText}
                      </div>
                      <div></div>
                      <div style={{
                        textAlign: "right"
                        }}>
                        {playerConstructorPoints}
                      </div>
                      <div></div>
                      <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      textAlign:"center",
                      }}>
                    {playerCombinedConstructorPointsReportOpen == false
                  ? <label><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                  : <label><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    }
                    </div>
                    </div>
                    {playerCombinedConstructorPointsReportOpen && 
                    <ul className="dd-list" style={{
                      listStyle:"none",
                      paddingLeft:5,
                      marginTop:5,
                      marginBottom:10,
                      marginLeft:0}}>
                      <li>
                        <div style={{
                          display:"grid",
                          gridTemplateColumns:"50% 50%",
                          alignItems:"center",
                          justifyContent:'center',
                          textAlign:'center',
                          flexDirection:"row",
                          marginBottom:5,
                          width:"auto",
                          fontSize:12,
                          marginLeft:33,
                          marginRight:43,
                          marginBottom:10,
                          }}>
                            <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                            <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                        </div>
                      </li>
                      {constructorStandingPlayerPoints[combinedItem.username].map(constructorCombinedStandingPoints => (
                      <li className="dd-list-item" key={constructorCombinedStandingPoints.id}>
                      <div style={{
                        display:"grid",
                        gridTemplateColumns:"18px 3px 5px 2px 60px 7px 28px 7px 28px 7px auto 2px 1px 13px 1px 2px auto 7px 60px 2px 5px",
                        alignItems:"center",
                        flexDirection:"row",
                        marginBottom:8,
                        width:"auto",
                        fontSize:10,
                        marginLeft:33,
                        marginRight:43,
                        }}>
                        <div style={{
                          backgroundColor:"#FEFDFB",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          textAlign: 'center',
                          padding:'1px 2px 1px 2px',
                          borderRadius:'2px',
                          }}>
                          {constructorCombinedStandingPoints.currentPosition}
                        </div>
                        <div></div>
                        <div style={{
                          height:"36px",
                          display:"flex",
                          borderRadius:"1px 0px 0px 1px",
                          justifyContent:"center",
                          alignItems:"center",
                          backgroundColor:constructorCombinedStandingPoints.resultDriverIconColor,
                          }}>
                        </div>
                        <div></div>
                        {constructorCombinedStandingPoints.predictionPoints == 2
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:"#D2BF37",
                          borderRadius:'0px 6px 6px 0px',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.constructorCode}
                        </div>
                      : constructorCombinedStandingPoints.singlePointFinishingHit == 1
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:'silver',
                          borderRadius:'0px 6px 6px 0px',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.constructorCode}
                        </div>
                      : <div style={{
                          textAlign:'center',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignContent:'center',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.constructorCode}
                        </div>
                        }
                        <div></div>
                        <div style={{
                          textAlign: 'center',
                          padding:'2px',
                          }}>
                          {constructorCombinedStandingPoints.constructorPoints}
                        </div>
                        <div></div>
                        {constructorCombinedStandingPoints.constructorDelta > 0
                      ? <div style={{
                          backgroundColor:"#48A14D",
                          borderRadius:'8px',
                          paddingBottom:'1px',
                          paddingTop:'1px',
                          textAlign:'center',
                          color:"#FEFDFB",
                          fontSize:"8px",
                          paddingTop:"2px",
                          paddingBottom:"2px",
                          }}>
                          {constructorCombinedStandingPoints.constructorDeltaText}
                        </div>
                      : constructorCombinedStandingPoints.constructorDelta < 0
                      ? <div style={{
                          backgroundColor:"#BD2031",
                          borderRadius:'8px',
                          paddingBottom:'1px',
                          paddingTop:'1px',
                          textAlign:'center',
                          color:"#FEFDFB",
                          fontSize:"8px",
                          paddingTop:"2px",
                          paddingBottom:"2px",
                          }}>
                          {constructorCombinedStandingPoints.constructorDeltaText}
                        </div>
                      : <div style={{
                          color:"#FEFDFB",
                          opacity:"0.0",
                          textAlign:'center',
                          }}>
                          {constructorCombinedStandingPoints.constructorDeltaText}
                        </div>
                        }
                        <div></div>
                        <div></div>
                        {constructorCombinedStandingPoints.predictionPoints>0
                      ? <div style={{
                          height:"15.5px",
                          borderRadius:"0px, 1px, 1px, 0px",
                          alignItems:'center',
                          justifyContent:'center',
                          backgroundColor:constructorCombinedStandingPoints.predictedDriverIconColor,
                        }}></div>
                      : <div></div>
                        }
                        <div></div>
                        {constructorCombinedStandingPoints.predictionPoints == 1
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:'silver',
                          paddingTop:'2px',
                          paddingBottom:'2px',
                          }}>
                          {constructorCombinedStandingPoints.predictionPoints}
                        </div>
                      : constructorCombinedStandingPoints.predictionPoints == 2
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:"#D2BF37",
                          paddingTop:'2px',
                          paddingBottom:'2px',
                          }}>
                          {constructorCombinedStandingPoints.predictionPoints}
                        </div>
                      : <div style={{
                          textAlign:'center',
                          color:"#FEFDFB",
                          opacity:'0.0',
                          paddingTop:'2px',
                          paddingBottom:'2px',
                          }}>
                          {constructorCombinedStandingPoints.predictionPoints}
                        </div>
                        }
                        <div></div>
                        {constructorCombinedStandingPoints.predictionPoints>0
                      ? <div style={{
                          height:"15.5px",
                          borderRadius:"1px, 0px, 0px, 1px",
                          alignItems:'center',
                          justifyContent:'center',
                          backgroundColor:constructorCombinedStandingPoints.predictedDriverIconColor,
                        }}></div>
                      : <div></div>
                        }
                        <div></div>
                        <div></div>
                        {constructorCombinedStandingPoints.predictionPoints == 2
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:"#D2BF37",
                          borderRadius:'6px 0px 0px 6px',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.positionPredictionconstructorCode}
                        </div>
                      : constructorCombinedStandingPoints.predictionPoints == 1
                      ? <div style={{
                          textAlign:'center',
                          backgroundColor:"#28282B",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          color:'silver',
                          borderRadius:'6px 0px 0px 6px',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.positionPredictionconstructorCode}
                        </div>
                      : <div style={{
                          textAlign:'center',
                          paddingTop:'3px',
                          paddingBottom:'3px',
                          alignItems:'center',
                          display:'flex',
                          justifyContent:'center',
                          height:30,
                          }}>
                          {constructorCombinedStandingPoints.positionPredictionconstructorCode}
                        </div>
                        }
                        <div></div>
                        <div style={{
                          height:"36px",
                          display:"flex",
                          borderRadius:"0px 1px 1px 0px",
                          justifyContent:"center",
                          alignItems:"center",
                          backgroundColor:constructorCombinedStandingPoints.predictedDriverIconColor,
                          }}>
                        </div>
                      </div> 
                    </li>
                      ))}
                    </ul>
                      }
                  </li>
                  <li className="dd-list-item" key={combinedItem.username}>
                    <div role="button" 
                      onClick={() => handlePlayerCombinedDriverStandingClick(combinedItem)}
                      style={{
                      display:"grid",
                      gridTemplateColumns:"70% 10px auto 10px auto 10px 20px",
                      flexDirection: "row",
                      fontSize:12,
                      backgroundColor:"#BD2031",
                      color: "#FEFDFB",
                      padding:"15px",
                      marginBottom: 8,
                      width:"auto",
                      height:"auto",
                      marginLeft:23,
                      marginRight:28,
                      alignItems:"center",
                      cursor:"pointer",
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      borderRadius: "10px"}}>
                      <div>
                        Driver Standings
                      </div>
                      <div></div>
                      <div style={{
                        textAlign:'center',
                        fontSize:10,
                        }}>
                          {playerDriverPointsChangeText}
                        </div>
                      <div></div>
                      <div style={{
                        textAlign:'right',
                        }}>
                        {playerDriverPoints}
                      </div>
                      <div></div>
                      <div style={{
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      textAlign:"center",
                      }}>
                    {playerCombinedDriverPointsReportOpen == false
                  ? <label><BsIcons.BsChevronDown></BsIcons.BsChevronDown></label>
                  : <label><BsIcons.BsChevronUp></BsIcons.BsChevronUp></label>
                    }
                    </div>
                    </div>
                  </li>
                  {playerCombinedDriverPointsReportOpen && (
                  <ul className="dd-list" style={{
                    listStyle:"none",
                    paddingLeft:5,
                    marginTop:5,
                    marginBottom:10,
                    marginLeft:0}}>
                    <li>
                      <div style={{
                        display:"grid",
                        //alignContent:"space-between",
                        gridTemplateColumns:"50% 50%",
                        //justifyContent:"space-between",
                        alignItems:"center",
                        justifyContent:'center',
                        textAlign:'center',
                        flexDirection:"row",
                        marginBottom:5,
                        width:"auto",
                        fontSize:12,
                        marginLeft:33,
                        marginRight:43,
                        marginBottom:10,
                        }}>
                          <div style={{fontWeight:"bold"}}><BsIcons.BsArrowDownLeft/>Result</div>
                          <div style={{fontWeight:"bold"}}>Prediction<BsIcons.BsArrowDownRight/></div>
                      </div>
                    </li>
                    {driverStandingPlayerPoints[combinedItem.username].map(driverCombinedStandingPoints => (
                    <li className="dd-list-item" key={driverCombinedStandingPoints.id}>
                    <div style={{
                      display:"grid",
                      //alignContent:"space-between",
                      gridTemplateColumns:"25px 3px 5px 2px 45px 10px 30px 10px 25px 10px auto 2px 1px 18px 1px 2px auto 45px 2px 5px",
                      //justifyContent:"space-between",
                      alignItems:"center",
                      flexDirection:"row",
                      marginBottom:8,
                      width:"auto",
                      fontSize:12,
                      marginLeft:33,
                      marginRight:43,
                      }}>
                      <div style={{
                        backgroundColor:"#FEFDFB",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        textAlign: 'center',
                        padding:'2px',
                        borderRadius:'2px',
                        }}>
                        {driverCombinedStandingPoints.currentPosition}
                      </div>
                      <div></div>
                      <div style={{
                        backgroundColor:driverCombinedStandingPoints.resultDriverIconColor,
                        height:"18px",
                        justifyContent:"center",
                        display:"flex",
                        borderRadius:"1px",
                        }}></div>
                      <div style={{
                        }}>
                      </div>
                      {driverCombinedStandingPoints.predictionPoints == 2
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:"#D2BF37",
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        borderRadius:'0px 4px 4px 0px',
                        }}>
                        {driverCombinedStandingPoints.driverCode}
                      </div>
                    : driverCombinedStandingPoints.singlePointFinishingHit == 1
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:'silver',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        borderRadius:'0px 4px 4px 0px',
                        }}>
                        {driverCombinedStandingPoints.driverCode}
                      </div>
                    : <div style={{
                        textAlign:'center',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        }}>
                        {driverCombinedStandingPoints.driverCode}
                      </div>
                      }
                      <div></div>
                      <div style={{
                        //backgroundColor:"#FEFDFB",
                        //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        textAlign: 'center',
                        padding:'2px',
                        //borderRadius:'2px',
                        }}>
                        {driverCombinedStandingPoints.driverPoints}
                      </div>
                      <div style={{
                        }}>
                      </div>
                      {driverCombinedStandingPoints.driverDelta > 0
                    ? <div style={{
                        backgroundColor:"#48A14D",
                        borderRadius:'8px',
                        fontSize:"8px",
                        height:"13px",
                        justifyContent:'center',
                        display:"flex",
                        //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        textAlign:'center',
                        alignItems:"center",
                        color:"#FEFDFB",
                        }}>
                        {driverCombinedStandingPoints.driverDeltaText}
                      </div>
                    : driverCombinedStandingPoints.driverDelta < 0
                    ?  <div style={{
                        backgroundColor:"#BD2031",
                        borderRadius:'8px',
                        fontSize:"8px",
                        height:"13px",
                        justifyContent:'center',
                        display:"flex",
                        //boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        textAlign:'center',
                        alignItems:"center",
                        color:"#FEFDFB",
                        }}>
                        {driverCombinedStandingPoints.driverDeltaText}
                      </div>
                    : <div style={{
                        color:"#FEFDFB",
                        opacity:"0.0",
                        textAlign:'center',
                        }}>
                        {driverCombinedStandingPoints.driverDeltaText}
                      </div>
                      }
                      <div></div>
                      <div></div>
                      {driverCombinedStandingPoints.predictionPoints == 1 || driverCombinedStandingPoints.predictionPoints == 2
                    ? <div style={{
                        height:"18px",
                        backgroundColor:driverCombinedStandingPoints.predictedDriverIconColor,
                        display:"flex",
                        borderRadius:"1px, 0px, 0px, 1px",
                        }}></div>
                    : <div></div>
                      }
                      <div></div>
                      {driverCombinedStandingPoints.predictionPoints == 1
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:'silver',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        }}>
                        {driverCombinedStandingPoints.predictionPoints}
                      </div>
                    : driverCombinedStandingPoints.predictionPoints == 2
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:"#D2BF37",
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        }}>
                        {driverCombinedStandingPoints.predictionPoints}
                      </div>
                    : <div style={{
                        textAlign:'center',
                        color:"#FEFDFB",
                        opacity:'0.0',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        }}>
                        {driverCombinedStandingPoints.predictionPoints}
                      </div>
                      }
                      <div></div>
                      {driverCombinedStandingPoints.predictionPoints == 1 || driverCombinedStandingPoints.predictionPoints == 2
                    ? <div style={{
                        height:"18px",
                        backgroundColor:driverCombinedStandingPoints.predictedDriverIconColor,
                        display:"flex",
                        borderRadius:"0px, 1px, 1px, 0px",
                        }}></div>
                    : <div></div>
                      }
                      <div></div>
                      {driverCombinedStandingPoints.predictionPoints == 2
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:"#D2BF37",
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        borderRadius:'4px 0px 0px 4px',
                        }}>
                        {driverCombinedStandingPoints.positionPredictionDriverCode}
                      </div>
                    : driverCombinedStandingPoints.predictionPoints == 1
                    ? <div style={{
                        textAlign:'center',
                        backgroundColor:"#28282B",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:'silver',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        borderRadius:'4px 0px 0px 4px',
                        }}>
                        {driverCombinedStandingPoints.positionPredictionDriverCode}
                      </div>
                    : <div style={{
                        textAlign:'center',
                        paddingTop:'2px',
                        paddingBottom:'2px',
                        borderRadius:'4px 0px 0px 4px',
                        }}>
                        {driverCombinedStandingPoints.positionPredictionDriverCode}
                      </div>
                      }
                      <div></div>
                      <div style={{
                        height:"18px",
                        backgroundColor:driverCombinedStandingPoints.predictedDriverIconColor,
                        display:"flex",
                        borderRadius:"1px, 0px, 0px, 1px",
                        }}></div>
                    </div>    
                  </li>
                    ))}
                  </ul>
                    )}
                  </ul>
              : null}
              </li>
            ))}
          </ul>
        )}
        </div>
        </LeaderBoardAnimation>
        )}
      </Transition>
    </div>              
    );
  }
}

const clickOutsideConfig = {
  handleClickOutside: () => Leaderboard.handleClickOutside,
};

export default onClickOutside(Leaderboard, clickOutsideConfig);