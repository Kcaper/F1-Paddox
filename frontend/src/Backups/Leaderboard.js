import React, { useState, useEffect } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';
import { GiConsoleController } from 'react-icons/gi';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { FaTruckLoading } from 'react-icons/fa';
import { IoMdCloseCircleOutline } from 'react-icons/io';

function Leaderboard ({multiSelect = true}){

  useEffect(() => {
    getLeaderBoardData();
    getMidRoundPoints();
    getDriverStandingData();
  },[]);

  const getMidRoundPoints = async () => {
    await fetch(baseUrl + '/api/leaderboards/points/midfield/1')
    .then(response => response.json())
    .then(points => {
      var object = JSON.parse(points)
      setPlayerPointsMidRoundData(object)
      setLoading(false)
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
        
        setMidSeasonPlayerRoundData(object.midRoundPointsByUser)
        setMididSeasonCurrentList(current_midfield_array) 
        setPaddock(object.paddockName)
        setMidRoundData(temp_mid_round_data_dict)
        setCircuitRefList(temp_circuit_array)
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
    })
  }
  
  const [loading, setLoading] = useState(true)

  const [circuitRefList, setCircuitRefList] = useState([])
  const [paddock, setPaddock] = useState("")

  const [state, setState] = useState(false)

  //mid round 
  const [midRoundOpen, setMidRoundOpen] = useState(false);
  const [midRoundSelection, setMidRoundSelection] = useState([]);
  const midRoundToggle = () => setMidRoundOpen(!midRoundOpen);

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
    if(rounds_player_dict != {}){
      setMidRoundPlayerOpen(true)
    }
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
          setState(!state)
        }
      } 
      return
    }
    else{
      let temp_array = midRoundPlayerSelection
      temp_array.push(item)
      setMidRoundPlayerSelection(temp_array)
      setState(!state)
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
    setMidSeasonOpen(!midSeasonOpen);
  }

  function handleOnMidSeasonPlayerClick(item){
    if (midSeasonPlayerSelection.includes(item)){
      for (let i=0; i<midSeasonPlayerSelection.length; i++){
        let temp_array = midSeasonPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setMidSeasonPlayerSelection(temp_array)
          setMidSeasonPlayerRoundSelection([])
          setState(!state)
        }
      } 
      return
    }
    else{
      let temp_array = midSeasonPlayerSelection
      temp_array.push(item)
      setMidSeasonPlayerSelection(temp_array)
      setState(!state)
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
          setState(!state)
        }
      } 
      return
    }
    else{
      let temp_array = midSeasonPlayerRoundSelection
      temp_array.push(item)
      setMidSeasonPlayerRoundSelection(temp_array)
      setState(!state)
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
    setDriverStandingOpen(!driverStandingOpen)
  }

  function handleOnDriverStandingsPlayerClick(item){
    if (driverStandingPlayerSelection.includes(item)){
      for (let i=0; i<driverStandingPlayerSelection.length; i++){
        let temp_array = driverStandingPlayerSelection
        if (temp_array[i] == item){
          temp_array.splice(i, 1)
          setDriverStandingPlayerSelection(temp_array)
          setState(!state)
          return
        }
      } 
    }
    else{
      let temp_array = driverStandingPlayerSelection
      temp_array.push(item)
      setDriverStandingPlayerSelection(temp_array)
      setDriverStandingUserPredictionOpen(true)
      setState(!state)
      return
    }
  }

  function isDriverStadingPlayerSelection(item){
    if (driverStandingPlayerSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  if (loading == true){
    return(
    <p>LOADING ...</p>
    )
  }
  else{
    console.log(driverStandingData)
    return (
      <div className="dd-wrapper" style={{
        display:"grid",
        justifyContent:'center',
        flexDirection:'column'}}>
        <div className="dd-header__title">
            <h2 className="dd-header__title--bold" style={{justifyContent:"center"}}>Leaderboards - {paddock}</h2>
        </div>
        <div
          tabIndex={0}
          className="dd-header"
          role="button"
          onKeyPress={() => midRoundToggle(!midRoundOpen)}
          onClick={() => midRoundToggle(!midRoundOpen)}
        >
          <div className="dd-header__action">
            <p style={{marginBottom:0,
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              marginLeft:10,
              display:"flex",
              fontSize:24,
              color:"white",
              backgroundColor:"red",
              alignItems:"center",
              justifyContent:"center",
              transform: "skewX(-15deg)",
              width:340,
              height:75}}>Midfield Round Points</p>
          </div>
        </div>
        {midRoundOpen && (
          <ul className="dd-list">
            {circuitRefList.map(roundItem => (
              <li className="dd-list-item" key={roundItem.id}>
                <button type="button" onClick={() => handleOnMidRoundClick(roundItem)}>
                  <span>{roundItem.value}</span>
                </button>
                {midRoundPlayerOpen && (
                <ul className="dd-list">
                  {isItemInMidRoundSelection(roundItem) ? playerRoundData[roundItem.value].map(playerItem => (
                    <li className="dd-list-item" key={playerItem.user_id}>
                      <button type="button" onClick={() => handleOnMidRoundPlayerClick(playerItem)}>
                        <span>{playerItem.positionText} {playerItem.username} - {playerItem.roundPoints}</span>
                      </button>
                      {midRoundPlayerPointsOpen && (
                        <ul className="dd-list">
                          {isItemInMidRoundPlayerSelection(playerItem) ? playerMidRoundPointsData.userPoints[playerItem.username][roundItem.value].map(playerRoundItem => (
                            <li className="dd-list-item" key={playerRoundItem.circuitRef}>
                                <p>{playerRoundItem.predictedPosition} {playerRoundItem.predictedDriverCode} - {playerRoundItem.predictionPoints} - {playerRoundItem.resultDriverCode}</p>
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
          onClick={() => handleOnMidSeasonGameClick()}
        >
          <div className="dd-header__action">
            <p style={{marginBottom:0,
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              marginLeft:10,
              display:"flex",
              fontSize:24,
              color:"white",
              backgroundColor:"red",
              alignItems:"center",
              justifyContent:"center",
              transform: "skewX(-15deg)",
              width:340,
              height:75}}>Midfield Season Points</p>
          </div>
        </div>
        {midSeasonOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            padding:0,
            marginTop:0,
            paddingLeft:10}}>
            {midSeasonCurrentList.map(playerMidSeasonItem => (
              <li className="dd-list-item" key={playerMidSeasonItem.user_id}>
                {playerMidSeasonItem.position==1 ? 
                <div style={{
                  display:"grid",
                  alignContent:"space-between",
                  gridTemplateColumns:"170px 35px 35px",
                  justifyContent:"space-between",
                  alignItems:"center",
                  flexDirection:"row",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"10px",
                  margin:5,
                  marginLeft:20,
                  width:260,
                  height:35,
                  fontSize:20,
                  color: "red",
                  backgroundColor:"black",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '2px solid gold',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidSeasonPlayerClick(playerMidSeasonItem)}>
                  <div style={{marginBottom:5,
                    marginLeft:10}}>
                    {playerMidSeasonItem.positionText} {playerMidSeasonItem.username}
                  </div>
                  {playerMidSeasonItem.paddockDelta > 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  playerMidSeasonItem.paddockDelta < 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginBottom:5,
                    color:"gold"}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                </div>
                : 
                playerMidSeasonItem.position==2 ? 
                <div style={{
                  display:"grid",
                  alignContent:"space-between",
                  gridTemplateColumns:"170px 35px 35px",
                  justifyContent:"space-between",
                  alignItems:"center",
                  flexDirection:"row",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"10px",
                  margin:5,
                  marginLeft:20,
                  width:260,
                  height:35,
                  fontSize:20,
                  color: "red",
                  backgroundColor:"black",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '2px solid silver',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidSeasonPlayerClick(playerMidSeasonItem)}>
                  <div style={{marginBottom:5,
                    marginLeft:10}}>
                    {playerMidSeasonItem.positionText} {playerMidSeasonItem.username}
                  </div>
                  {playerMidSeasonItem.paddockDelta > 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  playerMidSeasonItem.paddockDelta < 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginBottom:5,
                    color:"silver"}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                </div>
                : 
                playerMidSeasonItem.position==3 ? 
                <div style={{
                  display:"grid",
                  alignContent:"space-between",
                  gridTemplateColumns:"170px 35px 35px",
                  justifyContent:"space-between",
                  alignItems:"center",
                  flexDirection:"row",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"10px",
                  margin:5,
                  marginLeft:20,
                  width:260,
                  height:35,
                  fontSize:20,
                  color: "red",
                  backgroundColor:"black",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '2px solid #cd7f32',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidSeasonPlayerClick(playerMidSeasonItem)}>
                  <div style={{marginBottom:5,
                    marginLeft:10}}>
                    {playerMidSeasonItem.positionText} {playerMidSeasonItem.username}
                  </div>
                  {playerMidSeasonItem.paddockDelta > 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  playerMidSeasonItem.paddockDelta < 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginBottom:5,
                    color:"#cd7f32"}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                </div>
                : 
                <div style={{
                  display:"grid",
                  alignContent:"space-between",
                  gridTemplateColumns:"170px 35px 35px",
                  justifyContent:"space-between",
                  alignItems:"center",
                  flexDirection:"row",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"10px",
                  margin:5,
                  marginLeft:20,
                  width:260,
                  height:35,
                  fontSize:20,
                  color: "red",
                  backgroundColor:"black",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '2px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnMidSeasonPlayerClick(playerMidSeasonItem) }>
                  <div style={{marginBottom:5,
                    marginLeft:10}}>
                    {playerMidSeasonItem.positionText} {playerMidSeasonItem.username}
                  </div>
                  {playerMidSeasonItem.paddockDelta > 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  playerMidSeasonItem.paddockDelta < 0 ?
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>
                  :
                  <div style={{display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginBottom:3,
                    marginRight:15
                    }}>
                    {playerMidSeasonItem.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginBottom:5}}>
                    {playerMidSeasonItem.currentTotalPoints}
                  </div>
                </div> }
                {midSeasonPlayerRoundOpen && (
                <ul className="dd-list" style={{
                  listStyle:"none",
                  paddingLeft:25}}>
                  {isItemInMidSesonPlayerSelection(playerMidSeasonItem) ? midSeasonPlayerRoundData[playerMidSeasonItem.username].map(playerMidSeasonRoundItem => (
                    <li className="dd-list-item" key={playerMidSeasonRoundItem.id}>
                      <div style={{
                        display:"flex",
                        alignContent:"space-between",
                        justifyContent:"space-between",
                        alignItems:"center",
                        flexDirection:"row",
                        paddingLeft:"15px",
                        paddingRight:"15px",
                        margin:5,
                        width:240,
                        height:25,
                        marginLeft:5,
                        fontSize:15,
                        color: "white",
                        backgroundColor:"red",
                        borderRadius: 50}}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleOnMidSeasonRoundClick(playerMidSeasonRoundItem) }>
                        <div style={{}}>
                          {playerMidSeasonRoundItem.circuitRef}
                        </div>
                        <div>
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
                            {isItemInMidSesonPlayerRoundSelection(playerMidSeasonRoundItem) ? playerMidRoundPointsData.userPoints[playerMidSeasonItem.username][playerMidSeasonRoundItem.circuitRef].map(playerMidSeasonRoundPointsItem => (
                              <li className="dd-list-item" key={playerMidSeasonRoundPointsItem.id}>
                              <div style={{
                                display:"grid",
                                //alignContent:"space-between",
                                gridTemplateColumns:"20px 70px 30px 90px",
                                //justifyContent:"space-between",
                                alignItems:"center",
                                flexDirection:"row",
                                marginBottom:5,
                                width:250,
                                fontSize:12,
                                marginLeft:15
                                }}>
                                  <div style={{display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    marginLeft:15}}>
                                    {playerMidSeasonRoundPointsItem.racePosition}.
                                  </div>
                                  {playerMidSeasonRoundPointsItem.predictionPoints==2 ?
                                    <div style={{
                                      display:"flex",
                                      alignItems:"center",
                                      justifyContent:"center",
                                      border: '1px solid gold',
                                      borderRadius: 50,
                                      backgroundColor:"black",
                                      color:"gold",
                                      marginLeft:20}}>
                                    {playerMidSeasonRoundPointsItem.driverCode}
                                    </div>
                                  : playerMidSeasonRoundPointsItem.singlePointFinishingHit==1 ?
                                    <div style={{
                                      display:"flex",
                                      alignItems:"center",
                                      justifyContent:"center",
                                      border: '1px solid silver',
                                      borderRadius: 50,
                                      backgroundColor:"black",
                                      color:"silver",
                                      marginLeft:20}}>
                                    {playerMidSeasonRoundPointsItem.driverCode} 
                                    </div>
                                  : <div style={{
                                    display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    marginLeft:20}}>
                                    {playerMidSeasonRoundPointsItem.driverCode} 
                                    </div>}
                                    {playerMidSeasonRoundPointsItem.predictionPoints==2 ? 
                                    <div style={{
                                      display:"flex",
                                      alignItems:"center",
                                      justifyContent:"center",
                                      border: '1px solid gold',
                                      borderRadius: 50,
                                      backgroundColor:"black",
                                      color:"gold",
                                      width:20,
                                      height:15,
                                      marginLeft:25}}>
                                      {playerMidSeasonRoundPointsItem.predictionPoints} 
                                      </div>
                                  : playerMidSeasonRoundPointsItem.predictionPoints==1 ?
                                    <div style={{
                                      display:"flex",
                                      alignItems:"center",
                                      justifyContent:"center",
                                      border: '1px solid silver',
                                      borderRadius: 50,
                                      backgroundColor:"black",
                                      color:"silver",
                                      width:20,
                                      height:15,
                                      marginLeft:25}}>
                                      {playerMidSeasonRoundPointsItem.predictionPoints} 
                                    </div>
                                    : <div style={{
                                      display:"flex",
                                      alignItems:"center",
                                      justifyContent:"center",
                                      border: '1px solid white',
                                      borderRadius: 50,
                                      backgroundColor:"white",
                                      color: "white",
                                      width:20,
                                      height:15,
                                      marginLeft:25
                                    }}>
                                      2
                                    </div>}

                                  {playerMidSeasonRoundPointsItem.predictionPoints==2 ? 
                                    <div style={{
                                    display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    border: '1px solid gold',
                                    borderRadius: 50,
                                    backgroundColor:"black",
                                    color:"gold",
                                    marginLeft:40}}>
                                    {playerMidSeasonRoundPointsItem.positionPredictionDriverCode} 
                                    </div>
                                  : playerMidSeasonRoundPointsItem.singlePointPredictionHit==1 ?
                                    <div style={{
                                    display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    border: '1px solid silver',
                                    borderRadius: 50,
                                    backgroundColor:"black",
                                    color:"silver",
                                    marginLeft:40}}>
                                    {playerMidSeasonRoundPointsItem.positionPredictionDriverCode} 
                                    </div>
                                  : 
                                  <div style={{
                                    display:"flex",
                                    alignItems:"center",
                                    justifyContent:"center",
                                    border: '1px solid white',
                                    borderRadius: 50,
                                    backgroundColor:"white",
                                    color:"black",
                                    marginLeft:40}}>
                                    {playerMidSeasonRoundPointsItem.positionPredictionDriverCode} 
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
          onKeyPress={() => handleOnDriverStandingGameClick()}
          onClick={() => handleOnDriverStandingGameClick()}>
          <div className="dd-header__action">
            <p style={{marginBottom:0,
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              marginLeft:10,
              display:"flex",
              fontSize:24,
              color:"white",
              backgroundColor:"red",
              alignItems:"center",
              justifyContent:"center",
              transform: "skewX(-15deg)",
              width:340,
              height:75}}>Driver Standing Points</p>  
          </div>
        </div>
        {driverStandingOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            padding:3,
            marginTop:0,
            paddingLeft:10,
            margin:0}}>
            {driverStandingData.map(playerDriverStanding => (
              <li className="dd-list-item" key={playerDriverStanding.id}>
                {playerDriverStanding.playerPosition==1 ? 
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"gold",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 2 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"silver",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 3 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"#cd7f32",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"red",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>}
                {driverStandingUserPredictionOpen && (
                <ul className="dd-list" style={{
                  listStyle:"none",
                  padding:0,
                  marginTop:0,
                  paddingLeft:10,
                  margin:0,
                  marginTop:20}}>
                  {isDriverStadingPlayerSelection(playerDriverStanding) ? driverStandingPlayerPoints[playerDriverStanding.username].map(driverStandingPoints => (
                    <li className="dd-list-item" key={driverStandingPoints.id}>
                    <div style={{
                      display:"grid",
                      alignContent:"space-between",
                      gridTemplateColumns:"15px 50px 25px 25px 80px 50px",
                      justifyContent:"space-between",
                      alignItems:"center",
                      flexDirection:"row",
                      marginBottom:5,
                      width:250,
                      fontSize:12,
                      marginLeft:15
                      }}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginLeft:0}}>
                          {driverStandingPoints.currentPosition}.
                        </div>
                        {driverStandingPoints.predictionPoints==2 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode}
                          </div>
                        : driverStandingPoints.singlePointFinishingHit==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>
                        : <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>}
                  
                          <div style={{marginLeft:5}}>
                            {driverStandingPoints.driverPoints}
                          </div>
                  
                          {driverStandingPoints.driverDelta > 0 ?
                          <div style={{color:"white",
                            backgroundColor:"green",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          : driverStandingPoints.driverDelta < 0 ? 
                          <div style={{color:"white",
                            backgroundColor:"red",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            height:15,
                            width:20,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          :
                          <div style={{color:"white",
                            opacity:0.0,
                            backgroundColor:"white",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            border: '2px solid white',
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>}
                  
                          {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                            </div>
                        : driverStandingPoints.predictionPoints==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                          </div>
                          : <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid white',
                            borderRadius: 50,
                            backgroundColor:"white",
                            color: "white",
                            width:20,
                            height:15,
                            marginLeft:8
                          }}>
                            2
                          </div>}
                  
                        {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid gold',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"gold",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : driverStandingPoints.singlePointPredictedHit==1 ?
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid silver',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"silver",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : <div style={{display:"flex", alignItems:"center", justifyContent:"center", margin:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>}
                      </div>    
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
          onKeyPress={() => handleOnDriverStandingGameClick()}
          onClick={() => handleOnDriverStandingGameClick()}>
          <div className="dd-header__action">
            <p style={{marginBottom:0,
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              marginLeft:10,
              display:"flex",
              fontSize:24,
              color:"white",
              backgroundColor:"red",
              alignItems:"center",
              justifyContent:"center",
              transform: "skewX(-15deg)",
              width:340,
              height:75}}>Driver Standing Points</p>  
          </div>
        </div>
        {driverStandingOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            padding:3,
            marginTop:0,
            paddingLeft:10,
            margin:0}}>
            {driverStandingData.map(playerDriverStanding => (
              <li className="dd-list-item" key={playerDriverStanding.id}>
                {playerDriverStanding.playerPosition==1 ? 
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"gold",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 2 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"silver",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 3 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"#cd7f32",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"red",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>}
                {driverStandingUserPredictionOpen && (
                <ul className="dd-list" style={{
                  listStyle:"none",
                  padding:0,
                  marginTop:0,
                  paddingLeft:10,
                  margin:0,
                  marginTop:20}}>
                  {isDriverStadingPlayerSelection(playerDriverStanding) ? driverStandingPlayerPoints[playerDriverStanding.username].map(driverStandingPoints => (
                    <li className="dd-list-item" key={driverStandingPoints.id}>
                    <div style={{
                      display:"grid",
                      alignContent:"space-between",
                      gridTemplateColumns:"15px 50px 25px 25px 80px 50px",
                      justifyContent:"space-between",
                      alignItems:"center",
                      flexDirection:"row",
                      marginBottom:5,
                      width:250,
                      fontSize:12,
                      marginLeft:15
                      }}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginLeft:0}}>
                          {driverStandingPoints.currentPosition}.
                        </div>
                        {driverStandingPoints.predictionPoints==2 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode}
                          </div>
                        : driverStandingPoints.singlePointFinishingHit==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>
                        : <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>}
                  
                          <div style={{marginLeft:5}}>
                            {driverStandingPoints.driverPoints}
                          </div>
                  
                          {driverStandingPoints.driverDelta > 0 ?
                          <div style={{color:"white",
                            backgroundColor:"green",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          : driverStandingPoints.driverDelta < 0 ? 
                          <div style={{color:"white",
                            backgroundColor:"red",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            height:15,
                            width:20,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          :
                          <div style={{color:"white",
                            opacity:0.0,
                            backgroundColor:"white",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            border: '2px solid white',
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>}
                  
                          {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                            </div>
                        : driverStandingPoints.predictionPoints==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                          </div>
                          : <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid white',
                            borderRadius: 50,
                            backgroundColor:"white",
                            color: "white",
                            width:20,
                            height:15,
                            marginLeft:8
                          }}>
                            2
                          </div>}
                  
                        {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid gold',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"gold",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : driverStandingPoints.singlePointPredictedHit==1 ?
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid silver',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"silver",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : <div style={{display:"flex", alignItems:"center", justifyContent:"center", margin:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>}
                      </div>    
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
          onKeyPress={() => handleOnDriverStandingGameClick()}
          onClick={() => handleOnDriverStandingGameClick()}>
          <div className="dd-header__action">
            <p style={{marginBottom:0,
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              marginLeft:10,
              display:"flex",
              fontSize:24,
              color:"white",
              backgroundColor:"red",
              alignItems:"center",
              justifyContent:"center",
              transform: "skewX(-15deg)",
              width:340,
              height:75}}>Driver Standing Points</p>  
          </div>
        </div>
        {driverStandingOpen && (
          <ul className="dd-list" style={{
            listStyle:"none",
            padding:3,
            marginTop:0,
            paddingLeft:10,
            margin:0}}>
            {driverStandingData.map(playerDriverStanding => (
              <li className="dd-list-item" key={playerDriverStanding.id}>
                {playerDriverStanding.playerPosition==1 ? 
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"gold",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 2 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"silver",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                playerDriverStanding.playerPosition == 3 ?
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"#cd7f32",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>
                :
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"25px 120px 30px 30px 30px",
                  flexDirection: "row",
                  fontSize:20,
                  backgroundColor:"black",
                  color: "red",
                  paddingLeft:"15px",
                  paddingRight:"15px",
                  paddingTop:"4px",
                  margin:5,
                  width:290,
                  height:45,
                  alignItems:"center",
                  //justifyContent: "space-between",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  //border: '1px solid red',
                  borderRadius: 50}}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOnDriverStandingsPlayerClick(playerDriverStanding)}>
                  <div style={{
                    marginLeft:8
                  }}>
                    {playerDriverStanding.playerPosition}.
                  </div>
                  <div style={{
                    marginLeft:3
                  }}>
                    {playerDriverStanding.username}
                  </div>
                  {playerDriverStanding.playerDelta > 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"green",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid green',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  playerDriverStanding.playerDelta < 0 ?
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"red",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid red',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>
                  :
                  <div style={{
                    display:"flex",
                    fontSize:12,
                    background:"black",
                    alignItems:"center",
                    justifyContent:'center',
                    color:"black",
                    width:30,
                    height:16,
                    border: '1px solid black',
                    borderRadius: 50,
                    marginLeft: 50
                    }}>
                    {playerDriverStanding.paddockDeltaText}
                  </div>}
                  <div style={{
                    marginLeft: 30
                  }}>
                    {playerDriverStanding.pointsChange > 0 ?
                    <div style={{
                      color:'green',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    : playerDriverStanding.pointsChange < 0 ?
                    <div style={{
                      color:'red',
                      display:'flex',
                      fontSize:12,
                      marginLeft: 30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>
                    :
                    <div style={{
                      color:'black',
                      display:'flex',
                      fontSize:12,
                      marginLeft:30
                    }}>
                      {playerDriverStanding.pointsChangeText}
                    </div>}
                  </div>
                  <div style={{
                    color:"red",
                    marginLeft:60}}>
                    {playerDriverStanding.currentRoundPoints}
                  </div>
                </div>}
                {driverStandingUserPredictionOpen && (
                <ul className="dd-list" style={{
                  listStyle:"none",
                  padding:0,
                  marginTop:0,
                  paddingLeft:10,
                  margin:0,
                  marginTop:20}}>
                  {isDriverStadingPlayerSelection(playerDriverStanding) ? driverStandingPlayerPoints[playerDriverStanding.username].map(driverStandingPoints => (
                    <li className="dd-list-item" key={driverStandingPoints.id}>
                    <div style={{
                      display:"grid",
                      alignContent:"space-between",
                      gridTemplateColumns:"15px 50px 25px 25px 80px 50px",
                      justifyContent:"space-between",
                      alignItems:"center",
                      flexDirection:"row",
                      marginBottom:5,
                      width:250,
                      fontSize:12,
                      marginLeft:15
                      }}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginLeft:0}}>
                          {driverStandingPoints.currentPosition}.
                        </div>
                        {driverStandingPoints.predictionPoints==2 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode}
                          </div>
                        : driverStandingPoints.singlePointFinishingHit==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>
                        : <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          marginLeft:5}}>
                          {driverStandingPoints.driverCode} 
                          </div>}
                  
                          <div style={{marginLeft:5}}>
                            {driverStandingPoints.driverPoints}
                          </div>
                  
                          {driverStandingPoints.driverDelta > 0 ?
                          <div style={{color:"white",
                            backgroundColor:"green",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          : driverStandingPoints.driverDelta < 0 ? 
                          <div style={{color:"white",
                            backgroundColor:"red",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            height:15,
                            width:20,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>
                          :
                          <div style={{color:"white",
                            opacity:0.0,
                            backgroundColor:"white",
                            alignItems:"center",
                            display:"flex",
                            justifyContent:"center",
                            border: '2px solid white',
                            width:20,
                            height:15,
                            marginLeft:3}}>
                            {driverStandingPoints.driverDeltaText}
                          </div>}
                  
                          {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid gold',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"gold",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                            </div>
                        : driverStandingPoints.predictionPoints==1 ?
                          <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid silver',
                            borderRadius: 50,
                            backgroundColor:"black",
                            color:"silver",
                            width:20,
                            height:15,
                            marginLeft:8}}>
                            {driverStandingPoints.predictionPoints} 
                          </div>
                          : <div style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            border: '1px solid white',
                            borderRadius: 50,
                            backgroundColor:"white",
                            color: "white",
                            width:20,
                            height:15,
                            marginLeft:8
                          }}>
                            2
                          </div>}
                  
                        {driverStandingPoints.predictionPoints==2 ? 
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid gold',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"gold",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : driverStandingPoints.singlePointPredictedHit==1 ?
                          <div style={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          border: '1px solid silver',
                          borderRadius: 50,
                          backgroundColor:"black",
                          color:"silver",
                          marginLeft:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>
                        : <div style={{display:"flex", alignItems:"center", justifyContent:"center", margin:0}}>
                          {driverStandingPoints.positionPredictionDriverCode} 
                          </div>}
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
    );
  }
}

const clickOutsideConfig = {
  handleClickOutside: () => Leaderboard.handleClickOutside,
};

export default onClickOutside(Leaderboard, clickOutsideConfig);