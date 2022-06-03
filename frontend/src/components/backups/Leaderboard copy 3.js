import React, { useState, useEffect } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';
import { GiConsoleController } from 'react-icons/gi';
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { FaTruckLoading } from 'react-icons/fa';

function Leaderboard ({multiSelect = true}){

  useEffect(() => {
    getLeaderBoardData();
    getMidRoundPoints();
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
        for(let circuit=0; circuit<object.circuitRefs.length; circuit++){
            temp_circuit_array.push({id: circuit+1, value: object.circuitRefs[circuit]})
        }

        for(let midRoundData=0; midRoundData<object.circuitRefs.length; midRoundData++){
          if(midRoundData+1 == object.circuitRefs.length){
            var temp_round = "current"
          }
          else{
            var temp_round = midRoundData+1
          }
          temp_mid_round_data_dict[object.circuitRefs[midRoundData]] = object.raceRound[temp_round]['midfieldRound'][object.circuitRefs[midRoundData]]
        }
        setPaddock(object.paddockName)
        setMidRoundData(temp_mid_round_data_dict)
        setCircuitRefList(temp_circuit_array)
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
  const midRoundPlayerToggle = () => setMidRoundPlayerOpen(!midRoundPlayerOpen)

  const [playerMidRoundPointsData, setPlayerPointsMidRoundData] = useState({})
  const [midRoundPlayerPointsOpen, setMidRoundPlayerPointsOpen] = useState(false)

  //mid season
  const [midSeasonOpen, setMidSeasonOpen] = useState(false);
  const [midSeasonSelection, setMidSeasonSelection] = useState([]);
  const midSeasonToggle = () => setMidSeasonOpen(!midSeasonOpen);

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
          console.log("Removed")
        }
      } 
      return
    }
    else{
      let temp_array = midRoundPlayerSelection
      temp_array.push(item)
      setMidRoundPlayerSelection(temp_array)
      console.log("Added")
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
  
  if (loading == true){
    return(
    <p>LOADING ...</p>
    )
  }
  else{

    console.log(playerMidRoundPointsData.userPoints.Joshua.Bahrain[0])
    return (
      <div className="dd-wrapper">
        <div
          tabIndex={0}
          className="dd-header"
          role="button"
          onKeyPress={() => midRoundToggle(!midRoundOpen)}
          onClick={() => midRoundToggle(!midRoundOpen)}
        >
          <div className="dd-header__title">
            <h3 className="dd-header__title--bold">Leaderboards - {paddock}</h3>
          </div>
          <div className="dd-header__action">
            <p>Midfield Round Points</p>
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
                            <li className="dd-list-item" key={playerRoundItem.predictedPosition}>
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
          onKeyPress={() => midSeasonToggle(!midSeasonOpen)}
          onClick={() => midSeasonToggle(!midSeasonOpen)}
        >
          <div className="dd-header__action">
            <p>Midfield Season Points</p>
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
                            <li className="dd-list-item" key={playerRoundItem.predictedPosition}>
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
      </div>
    );
  }
}

const clickOutsideConfig = {
  handleClickOutside: () => Leaderboard.handleClickOutside,
};

export default onClickOutside(Leaderboard, clickOutsideConfig);