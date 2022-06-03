import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from "@material-ui/core/Button";
import axios from 'axios';
import { baseUrl } from './F1HomePage'

function MidfieldPredictions() {

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    
    return cookieValue;
  }

  const csrftoken = getCookie('csrftoken');
  const [prediction, updatePrediction] = useState([]);
  const [drivers, updatedrivers] = useState([]);
  const [user, setUser] = useState(1);
  const [predictionType, setPredictionType] = useState(1);
  const [numDrivers, setNumDrivers] = useState(0);
  const [time, setTime] = useState("")
  const [submissionVaidator, setValidator] = useState(1)
  const [raceId, setRaceId] = useState(1)
  const [circuitRef, setCircuitRef] = useState("")
  const [circuitCountry, setCircuitCountry] = useState("")
  const [circuitFlag, setCircuitFlag] = useState("")
  const [circuitName, setCircuitName] = useState("")

  function createInitalPrediction(driverObject, num_drivers){
    let temp_array = [];
    for(let i=0; i<num_drivers; i++){
      let temp_dict = {};
      temp_dict["id"] = driverObject[i].id;
      temp_array.push(temp_dict);
    };
    updatePrediction(temp_array);
    setNumDrivers(num_drivers);
  }
  useEffect(() => {
    getDeadline();
    getDrivers();
  },[]);

  const getDrivers = async () => {
    await fetch(baseUrl + '/api/predictions/midfield/drivers/')
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

  const getDeadline = async () => {
    await fetch(baseUrl + '/api/predictions/deadlines/midfeild/next/')
    .then(response => response.json())
    .then(deadline => {
      let countDownDate = new Date(deadline.qualiDate + " " + deadline.qualiStartTime).getTime();
        let x = setInterval(function () {
          let now = new Date().getTime();
          let distance = countDownDate - now;
          let days = Math.floor(distance / (1000*60*60*24));
          let hours = Math.floor(
            (distance % (1000*60*60*24)) / (1000*60*60));
          let minutes = Math.floor((distance % (1000*60*60))/(1000*60))
          let seconds = Math.floor((distance % (1000*60))/(1000))
          setTime(days + "d:" + hours + "h:" + minutes + "m:" +  seconds + "s")
          if (distance < 0){
            clearInterval(x);
            setTime(deadline.qualiDate + " - " + deadline.qualiStartTime)
            setValidator(0)
          }
        },1000);
      })
  }

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(drivers);
    const predItems = Array.from(prediction);
    const [reorderedItem] = items.splice(result.source.index, 1);
    const [reorderedPrediction] = predItems.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    predItems.splice(result.destination.index, 0, reorderedPrediction);
    updatedrivers(items);
    updatePrediction(predItems);
  }

  function submitPrediction() {
    let prediction_dict = {}
    prediction_dict["user"] = user;
    prediction_dict["isFeatureRaceMidfield"] = predictionType
    prediction_dict["calendar"] = raceId.toString()
    for (let i=0; i<numDrivers; i++){
      let position_string = "position" + (i+1)
      prediction_dict[position_string] = prediction[i]["id"]
    }
    if (submissionVaidator == 1){
      fetch(baseUrl + '/api/predictions/midfield/submit/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(prediction_dict)
      })
      {alert("Your predition was submitted.")}
    }
    else{alert("Cannot submit, the deadline has passed.")}
    };

  console.log(drivers)

  return (
    <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
    <div className="App">
      <header className="App-header">
        <h2 style={{marginBottom:0}}>
          Midfield Driver Prediction
        </h2>
          <h3 style={{marginBottom:15, marginTop:15}}>
            { circuitRef } - {circuitCountry}<br></br> { circuitName }
          </h3>
          <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
            marginRight:0, marginTop:0}}>
          <p style={{
            backgroundColor:'red',
            width:"100%",
            color:'white',
            justifyContent:'center',
            alignItems:'center',
            position: "sticky",
            top:80,
            marginBottom: 20,
            padding:"2px 0px 2px 0px",
            marginTop:0,
            marginLeft:0,
            zIndex:5,
            marginRight:0}}>
            Deadline - Q1<br></br>{ time }
          </p>
          <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="drivers">
            {(provided) => (
              <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                display:'flex',
                alignItems:'center',
                position:'relative',
                right:'10px',
                padding:"0px 0px 0px 0px" 
              }}>
                {drivers.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: '10px 70px 70px 120px 70px',
                            alignItems: 'center',
                            flexDirection: "row",
                            justifyItems: 'space-between',
                            padding:"0px 0px 0px 0px"
                          }}>
                            <div className="prediction-index" style={{textAlign:'right'}}>
                                { index + 1 }.
                            </div>
                            <div className="icon" style={{textAlign:'right', marginLeft:5, paddingLeft:"3px"}}>
                              <img src={icon} alt={`${name} Thumb`} />
                            </div>
                            <div className="driver-thumb" style={{marginLeft:5}}>
                              <img src={thumb} alt={`${name} Thumb`} />
                            </div>
                            <div className="driver-code" style={{
                              justifyDirection:'column', textAlign:'center',
                              marginLeft:8, paddingLeft:'3px'
                            }}>
                              <div style={{fontSize:18}}>
                                { driverSurname }
                              </div>
                              <div style={{fontSize:12}}>
                                {constructorName}
                              </div>
                            </div>
                            <div className="driver-flag" style={{paddingLeft:'15px'
                            }}>
                              <img src={flag} alt={`${name} DriverFlag`} />
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        </div>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
          <div role="button" onClick={submitPrediction} style={{
            borderRadius:50,
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            backgroundColor:"red",
            color: 'white',
            width: 250,
            height:50,
            alignContent:'center',
            borderRadius: 50,
            fontSize:20,
            marginBottom:60
            }}>
            Submit Prediction
          </div>
        </div>
        </div>
      </header>
    </div>
    </div>
  );
}
export default MidfieldPredictions;