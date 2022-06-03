import React, { useState, useEffect, useCallback } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';
import { GiConsoleController } from 'react-icons/gi';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { FaTruckLoading } from 'react-icons/fa';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';
import { Transition } from "react-transition-group"
import { LeaderBoardAnimation } from "./PageCover"

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

  const [animate, setAnimate] = useState(false)
  const doAnimate = useCallback(() => {
    setAnimate(true)
    setTimeout(() => {
      setState("exited")
    }, 500)
  }, [])

  useEffect(() => {
    setState("entered")
    doAnimate();
    getLeaderBoardData();
    getMidRoundPoints();
    getDriverStandingData();
    getConstructorStandingData();
  },[]);

  const getMidRoundPoints = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/midfield/1')
    .then(response => response.json())
    .then(points => {
      var object = JSON.parse(points)
      setLoadingComplete(1)
      setMidSeasonLoaded(1)
      setPlayerPointsMidRoundData(object)
      setTimeout(() => {
        setLoading(false)
        setState("entered")
        doAnimate();
      }, 1000) 
    })
  }

  const getLeaderBoardData = async () => {
    await fetch(baseUrl + '/api/leaderboards/1')
    .then(response => response.json())
    .then(apiLeaderboard => {
        var object = JSON.parse(apiLeaderboard)
        var temp_circuit_array = [];
        var temp_mid_round_data_dict = {}
        var temp_mid_season_data_dict = {}
        for(let circuit=0; circuit<object.circuitRefs.length; circuit++){
            temp_circuit_array.push({id: circuit+1, value: object.circuitRefs[circuit]})
        }
        for(let i=0; i<object.circuitRefs.length; i++){
          if(i+1 == object.circuitRefs.length){
            var temp_round = "current"
          }
          else{
            var temp_round = i+1
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
        setMidRoundLoaded(1);

    })
  }

  const getDriverStandingData = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/driver-standings/1')
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
    })
  }

  const getConstructorStandingData = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/constructor-standings/1')
    .then(response => response.json())
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

  const [midRoundLoaded, setMidRoundLoaded] = useState(0)
  const [midSeasonLoaded, setMidSeasonLoaded] = useState(0)
  const [driverStandingLoaded, setDriverStandingLoaded] = useState(0)
  const [teamStandingLoaded, setTeamStandingLoaded] = useState(0)
  const [combinedLoaded, setCombinedLoaded] = useState(0)

  //const [coverState, setCoverState] = useState=(false)

  if (loading == true){
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
            marginBottom:80,
            height:300,
            maxWidth:600,
            flexDirection:"column",
            justifyContent:"center",
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
                  <ClipLoader color='red' size={15}/>
                </div>
              : <div>
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
              <div style={{
                display:'grid',
                gridTemplateColumns:'22px auto',
                padding:'0px',
                alignItems:'center',
                marginBottom:"11px",
                marginTop:'11px',
                height:"23px",
                }}>
                  {teamStandingLoaded == 1
                ? <div style={{
                    paddingBottom:"25px",
                    }}>
                    &#127937;
                  </div>
                : <div style={{
                    paddingBottom:'3px',
                    }}>
                    <ClipLoader color='red' size={10}/>
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
                    <ClipLoader color='red' size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Midfield Round Points
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
                    <ClipLoader color='red' size={10}/>
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
                    <ClipLoader color='red' size={10}/>
                  </div>
                  }
                  <div style={{
                    height: 40
                    }}>
                    Midfield Season Points
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
              margin:0
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
        </div>
        </div>
        <div className="dd-header__action" style={{
          cursor:"pointer",
          }} 
          tabIndex={0}
          className="dd-header"
          role="button"
          onKeyPress={() => handleOnMidGameClick()}
          onClick={() => handleOnMidGameClick()}>
          <p style={{marginBottom:0,
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            display:"flex",
            fontSize:18,
            textAlign:'center',
            color:"white",
            padding:"25px",
            marginLeft:8,
            marginRight:8,
            backgroundColor:"red",
            alignItems:"center",
            justifyContent:"center",
            transform: "skewX(-15deg)",
            width:"auto",
            marginBottom:5,
            marginTop:5,
            height:"auto",
            }}>
              Midfield Round Points
          </p>
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
                  gridTemplateColumns:"25px auto",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"black",
                  color: "red",
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
                  onClick={() => handleOnMidRoundClick(roundItem)}>
                  <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {roundItem.id}.
                  </div>
                  <div style={{
                    textAlign:'left',
                    paddingLeft:'15px',
                    }}>
                    {roundItem.value}
                  </div>
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
                    : <div style={{
                        display:"grid",
                        gridTemplateColumns:"25px auto 30px",
                        flexDirection: "row",
                        fontSize:12,
                        backgroundColor:"red",
                        color: "white",
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
                        <div style={{
                          textAlign: 'right',
                          marginLeft:0}}>
                          {playerItem.positionText}
                        </div>
                        <div style={{
                          textAlign:'left',
                          paddingLeft:"15px"
                          }}>
                          {playerItem.username}
                        </div>
                        <div style={{
                          textAlign:'right',
                          paddingRight: "10px",
                          }}>
                          {playerItem.roundPoints}
                        </div>
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
                      ? playerMidRoundPointsData['userPoints'][playerItem.username][roundItem.value].map(playerRoundItem => (
                          <li className="dd-list-item" key={playerRoundItem.circuitRef}>
                            <div style={{
                              display:"grid",
                              //alignContent:"space-between",
                              gridTemplateColumns:"20px auto 70px",
                              //justifyContent:"space-between",
                              alignItems:"center",
                              flexDirection:"row",
                              marginBottom:5,
                              width:"auto",
                              fontSize:12,
                              marginLeft:28,
                              marginRight:38,
                              }}>
                              <div style={{display:"flex",
                                alignItems:"center",
                                textAlign:'left',
                                marginLeft:0}}>
                                {playerRoundItem.racePosition}.
                              </div>
                              <div style={{
                                display:'grid',
                                gridTemplateColumns:'70px auto 30px auto',
                                marginLeft:2,
                                }}>
                                {playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid gold',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"gold",
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>
                              : playerRoundItem.singlePointFinishingHit == 1
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid silver',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"silver",
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerRoundItem.driverCode}
                                </div>}
                                <div></div>
                                {playerRoundItem.predictionPoints == 1
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid silver',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"silver",
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>
                              : playerRoundItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid gold',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"gold",
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  color:'white',
                                  opacity:'0.0',
                                  }}>
                                  {playerRoundItem.predictionPoints}
                                </div>}
                                <div></div>
                              </div>
                              {playerRoundItem.predictionPoints == 2
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                border: '1px solid gold',
                                borderRadius: 50,
                                backgroundColor:"black",
                                color:"gold",
                                width: 'auto',
                                minWidth: "50px"
                                }}>
                                {playerRoundItem.positionPredictionDriverCode}
                              </div>
                            : playerRoundItem.predictionPoints == 1
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                border: '1px solid silver',
                                borderRadius: 50,
                                backgroundColor:"black",
                                color:"silver",
                                width: 'auto',
                                minWidth: "50px"
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
                              </div>}
                            </div>
                          </li>
                          )): null}
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
        <div className="dd-header__action">
          <p style={{marginBottom:0,
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            display:"flex",
            fontSize:18,
            textAlign:'center',
            color:"white",
            padding:"25px",
            marginLeft:8,
            marginRight:8,
            backgroundColor:"red",
            alignItems:"center",
            justifyContent:"center",
            transform: "skewX(-15deg)",
            width:"auto",
            marginBottom:5,
            height:"auto",
            }}>
              Midfield Season Points
          </p>
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
                  gridTemplateColumns:"25px auto 35px 50px",
                  flexDirection: "row",
                  fontSize:15,
                  backgroundColor:"black",
                  color: "red",
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
                  <div style={{
                    marginLeft:6,
                    textAlign:"right",
                    }}>
                    {playerMidSeasonItem.positionText}
                  </div>
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
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:'auto',
                    height:'auto',
                    borderRadius: 33,
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                : playerMidSeasonItem.paddockDelta > 0
                ? <div style={{display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
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
                    color:"black",
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
                    color:"gold",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : playerMidSeasonItem.position==2
                ? <div style={{
                    color:"silver",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : playerMidSeasonItem.position==3
                ? <div style={{
                    color:"#cd7f32",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                : <div style={{
                    color:"red",
                    textAlign:"right",
                    marginRight:'10px',}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>}
                </div>
                {midSeasonPlayerRoundOpen && (
                <ul className="dd-list" style={{
                  listStyle:"none",
                  marginTop:0,
                  paddingLeft:0,
                  margin:0}}>
                  {isItemInMidSesonPlayerSelection(playerMidSeasonItem) 
                ? midSeasonPlayerRoundData[playerMidSeasonItem.username].map(playerMidSeasonRoundItem => (
                  <li className="dd-list-item" key={playerMidSeasonRoundItem.id}>
                    <div style={{
                      display:"grid",
                      gridTemplateColumns:"auto 25px",
                      flexDirection: "row",
                      fontSize:12,
                      backgroundColor:"red",
                      color: "white",
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
                      onClick={() => handleOnMidSeasonRoundClick(playerMidSeasonRoundItem) }>
                      <div style={{
                        textAlign:'left',
                        paddingLeft:"15px"
                        }}>
                        {playerMidSeasonRoundItem.circuitRef}
                      </div>
                      <div style={{
                        textAlign:'right',
                        paddingRight: "10px",
                        }}>
                        {playerMidSeasonRoundItem.roundPoints}
                      </div>
                    </div>
                    {midSeasonPlayerRoundPointsOpen && (
                      <ul className="dd-list" style={{
                        listStyle:"none",
                        padding:0,
                        marginTop:0,
                        paddingLeft:10,
                        margin:0}}>
                        {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem) 
                      ? playerMidRoundPointsData.userPoints[playerMidSeasonItem.username][playerMidSeasonRoundItem.circuitRef].map(playerMidSeasonRoundPointsItem => (
                          <li className="dd-list-item" key={playerMidSeasonRoundPointsItem.id}>
                            <div style={{
                              display:"grid",
                              //alignContent:"space-between",
                              gridTemplateColumns:"20px auto 70px",
                              //justifyContent:"space-between",
                              alignItems:"center",
                              flexDirection:"row",
                              marginBottom:5,
                              width:"auto",
                              fontSize:12,
                              marginLeft:28,
                              marginRight:38,
                              }}>
                              <div style={{display:"flex",
                                alignItems:"center",
                                textAlign:'left',
                                marginLeft:0}}>
                                {playerMidSeasonRoundPointsItem.racePosition}.
                              </div>
                              <div style={{
                                display:'grid',
                                gridTemplateColumns:'70px auto 30px auto',
                                marginLeft:2,
                                }}>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid gold',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"gold",
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>
                              : playerMidSeasonRoundPointsItem.singlePointFinishingHit == 1
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid silver',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"silver",
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  width: 'auto',
                                  minWidth: "50px"
                                  }}>
                                  {playerMidSeasonRoundPointsItem.driverCode}
                                </div>}
                                <div></div>
                                {playerMidSeasonRoundPointsItem.predictionPoints == 1
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid silver',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"silver",
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>
                              : playerMidSeasonRoundPointsItem.predictionPoints == 2
                              ? <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  border: '1px solid gold',
                                  borderRadius: 50,
                                  backgroundColor:"black",
                                  color:"gold",
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>
                              : <div style={{
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  borderRadius: 50,
                                  color:'white',
                                  opacity:'0.0',
                                  }}>
                                  {playerMidSeasonRoundPointsItem.predictionPoints}
                                </div>}
                                <div></div>
                              </div>
                              {playerMidSeasonRoundPointsItem.predictionPoints == 2
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                border: '1px solid gold',
                                borderRadius: 50,
                                backgroundColor:"black",
                                color:"gold",
                                width: 'auto',
                                minWidth: "50px"
                                }}>
                                {playerMidSeasonRoundPointsItem.positionPredictionDriverCode}
                              </div>
                            : playerMidSeasonRoundPointsItem.predictionPoints == 1
                            ? <div style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                border: '1px solid silver',
                                borderRadius: 50,
                                backgroundColor:"black",
                                color:"silver",
                                width: 'auto',
                                minWidth: "50px"
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
                              </div>}
                            </div>
                          </li>
                          )): null}
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