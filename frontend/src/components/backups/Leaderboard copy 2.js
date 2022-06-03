import React, { useState, useEffect } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';
import { GiConsoleController } from 'react-icons/gi';
import { AiOutlineConsoleSql } from 'react-icons/ai';

function Leaderboard ({multiSelect = true}){

  useEffect(() => {
    getLeaderBoardData();
    getMidRoundPoints();
  },[]);

const getMidRoundPoints = async () => {
  await fetch(baseUrl + '/api/leaderboards/points/midfield/1')
  .then(response => response.json())
  .then(apiMidRoundPoints => {
    var object = JSON.parse(apiLeaderboard)
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
        setMidRoundData(temp_mid_round_data_dict)
        setCircuitRefList(temp_circuit_array)
    })
}
  
  const [circuitRefList, setCircuitRefList] = useState([])

  const [midRoundOpen, setMidRoundOpen] = useState(false);
  const [midRoundSelection, setMidRoundSelection] = useState([]);
  const midRoundToggle = () => setMidRoundOpen(!midRoundOpen);

  const [midRoundData, setMidRoundData] = useState({})
  const [playerRoundData, setPlayerRoundData] = useState({})
  const [midRoundPlayerOpen, setMidRoundPlayerOpen] = useState(false)
  const [midRoundPlayerSelection, setMidRoundPlayerSelection] = useState([])
  const midRoundPlayerToggle = () => setMidRoundPlayerOpen(!midRoundPlayerOpen)

  const [midRoundPointsData, setMidPointsRoundData] = useState({})
  const [playerRoundPointsData, setPlayerPointsRoundData] = useState({})
  const [midRoundPlayerPointsOpen, setMidRoundPlayerPointsOpen] = useState(false)
  const midRoundPlayerPointsToggle = () => setMidRoundPlayerPointsOpen(!midRoundPlayerPointsOpen)

  function Collapse(){
    console.log("We are Trying to collapse")
    setMidRoundSelection([])
    setPlayerRoundData({});
    setMidRoundPlayerOpen(false)
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
    }
    setPlayerRoundData(rounds_player_dict)
    if(rounds_player_dict != {}){
      console.log(rounds_player_dict)
      setMidRoundPlayerOpen(true)
    }

  }
  function handleOnMidRoundPlayerClick(item) {
    if (!midRoundPlayerSelection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setMidRoundPlayerSelection([item]);
        console.log(item)
      } else if (multiSelect) {
        setMidRoundPlayerSelection([...midRoundPlayerSelection, item]);
        console.log(item)
      }
    } else {
      let selectionAfterRemoval = midRoundPlayerSelection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setMidRoundPlayerSelection([...selectionAfterRemoval]);
      console.log(item)
    }
  }

  function isItemInMidRoundSelection(item) {
    if (midRoundSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  function isItemInMidRoundPlayerSelection(item) {
    if (midRoundPlayerSelection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

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
          <p className="dd-header__title--bold">Header</p>
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
                <span>{isItemInMidRoundSelection(roundItem) && 'Selected'}</span>
              </button>
              {midRoundPlayerOpen && (
              <ul className="dd-list">
                {isItemInMidRoundSelection(roundItem) ? playerRoundData[roundItem.value].map(playerItem => (
                  <li className="dd-list-item" key={playerItem.id}>
                    <button type="button" onClick={() => handleOnMidRoundPlayerClick(playerItem)}>
                      <span>{playerItem.position}. {playerItem.username} - {playerItem.roundPoints}</span>
                      <span>{isItemInMidRoundPlayerSelection(playerItem) && 'Selected'}</span>
                    </button>
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

const clickOutsideConfig = {
  handleClickOutside: () => Leaderboard.handleClickOutside,
};

export default onClickOutside(Leaderboard, clickOutsideConfig);