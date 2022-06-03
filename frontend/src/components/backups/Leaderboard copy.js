import React, { useState, useEffect } from 'react';
import { baseUrl } from './F1HomePage';
import onClickOutside from 'react-onclickoutside';

function Leaderboard ({multiSelect = true}){

  useEffect(() => {
    getLeaderBoardData();
  },[]);

const getLeaderBoardData = async () => {
    await fetch(baseUrl + '/api/leaderboards/1')
    .then(response => response.json())
    .then(apiLeaderboard => {
        var object = JSON.parse(apiLeaderboard)
        var temp_circuit_array = [];
        for(let circuit=0; circuit<object.circuitRefs.length; circuit++){
            temp_circuit_array.push({id: circuit+1, value: object.circuitRefs[circuit]})
            temp_circuit_array.reverse()
        setCircuitRefList(temp_circuit_array)
        }
    })
}
  const [circuitRefList, setCircuitRefList] = useState([])
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const toggle = () => setOpen(!open);
  Leaderboard.handleClickOutside = () => setOpen(false);

  function handleOnClick(item) {
    if (!selection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setSelection([item]);
      } else if (multiSelect) {
        setSelection([...selection, item]);
      }
    } else {
      let selectionAfterRemoval = selection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setSelection([...selectionAfterRemoval]);
    }
  }

  function isItemInSelection(item) {
    if (selection.some(current => current.id === item.id)) {
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
        onKeyPress={() => toggle(!open)}
        onClick={() => toggle(!open)}
      >
        <div className="dd-header__title">
          <p className="dd-header__title--bold">Header</p>
        </div>
        <div className="dd-header__action">
          <p>Midfield Round Points</p>
        </div>
      </div>
      {open && (
        <ul className="dd-list">
          {circuitRefList.map(item => (
            <li className="dd-list-item" key={item.id}>
              <button type="button" onClick={() => handleOnClick(item)}>
                <span>{item.value}</span>
                <span>{isItemInSelection(item) && 'Selected'}
              </span>
              </button>
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