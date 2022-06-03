import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from "@material-ui/core/Button";
import axios from 'axios';
import { baseUrl } from './F1HomePage';
import styled from 'styled-components';
import Modal from './Modal';
import { FaWindowRestore } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react'

const loaderCss = css`
  margin-top: 16px;
  width: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
`

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
    const [time, setTime] = useState("");
    const [submissionVaidator, setValidator] = useState(0);
    const [raceId, setRaceId] = useState(1);
    const [circuitRef, setCircuitRef] = useState("");
    const [circuitCountry, setCircuitCountry] = useState("");
    const [circuitFlag, setCircuitFlag] = useState("");
    const [circuitName, setCircuitName] = useState("");

    const [pickCofirmation, setPickConfirmation] = useState(true)
    const [confirmationMessage, setConfirmationMessage] = useState("Select a prediction")
    const [state, setState] = useState(false)

    const [pageLoading, setPageLoading] = useState(true)
    const [loading, setLoading] = useState(false)

    const [isDemo, setIsDemo] = useState(false)
    
    function createInitalPrediction(driverObject, num_drivers){
      let temp_array = [];
      for(let i=0; i<driverObject.length; i++){
        let temp_dict = {};
        temp_dict["id"] = driverObject[i].id;
        temp_array.push(temp_dict);
      };
      updatePrediction(temp_array);
      setNumDrivers(num_drivers);
    }

    useEffect(() => {
      getDeadline();
      getPoleFastDrivers();
      getDrivers();
    },[]);

    const [ruleSetName, setRuleSetName] = useState("")
    const [maxPickableDrivers, setMaxPickableDrivers] = useState(0)
    const [driverObject, setDriverObject] = useState([])
    const [pickThreshold, setPickThreshold] = useState(0)

    const getDrivers = async () => {
      await fetch(baseUrl + '/api/predictions/midfield/drivers/')
      .then(response => response.json())
      .then(apiDrivers => {
        let object = JSON.parse(apiDrivers)
        setRuleSetName(object.ruleSetName)
        setMaxPickableDrivers(object.maxPickableDrivers)
        setRaceId(object.seasonCalendarId)
        updatedrivers(object.drivers)
        setUser(object.user)
        setPredictionType(object.isFeatureRaceMidfield)
        createInitalPrediction(object.drivers, object.drivers.length)
        setCircuitCountry(object.circuitInfo.country)
        setCircuitFlag(object.circuitInfo.circuitFlagImageLocation)
        setCircuitName(object.circuitInfo.circuitName)
        setCircuitRef(object.circuitInfo.circuitRef)
        setIsDemo(object.isDemo)
        setAboveDriverCount(object.aboveCount)
        setPickThreshold(object.pickThreshold)
      })
    }

    const [poleDriverData, setPoleDriverData] = useState([]);
    const [fastestLapDriverData, setFastestLapDriverData] = useState([]);

    const getPoleFastDrivers = async () => {
      await fetch(baseUrl + '/api/predictions/racely/pole-fast-drivers/')
      .then(async response => response.json())
      .then(fastPoleDrivers => {
        let object = JSON.parse(fastPoleDrivers)
        setPoleDriverData(object.poleDrivers);
        setFastestLapDriverData(object.fastDrivers);
        setFastestLapPrediction(object.fastDrivers);
        setPolePrediction(object.poleDrivers)
        setPageLoading(false)
      })
    }

    const getDeadline = async () => {
      await fetch(baseUrl + '/api/predictions/deadlines/midfeild/next/')
      .then(response => response.json())
      .then(deadline => {
        setValidator(1)
        let countDownString = deadline.qualiDate + " " + deadline.qualiStartTime
        let CountDownDate = new Date(countDownString.replace(/-/g, '/')).getTime();
        
        let x = setInterval(function () {
          let nowString = new Date().toString();
          let now = new Date(nowString.replace(/-/g, '/')).getTime();
          let distance = CountDownDate - now;
          let days = Math.floor(distance / (1000*60*60*24));
          let hours = Math.floor(
            (distance % (1000*60*60*24)) / (1000*60*60));
          let minutes = Math.floor((distance % (1000*60*60))/(1000*60))
          let seconds = Math.floor((distance % (1000*60))/(1000))
          setTime(days + "d : " + hours + "h : " + minutes + "m : " +  seconds + "s")
          if (distance < 0){
            clearInterval(x);
            setTime(deadline.qualiDate + " - " + deadline.qualiStartTime)
            setValidator(0);
          }
          setPageLoading(false)
        },1000);
      })
    }

    const [racelyDriverSelection, setRacelyDriverSelection] = useState(0)

    const [polePrediction, setPolePrediction] = useState(0)
    const [fastestLapPrediction, setFastestLapPrediction] = useState(0)

    function handleOnDragEnd(result) {
      if (!result.destination) return;
      if (racelyDriverSelection == 1){
        const items = Array.from(drivers);
        const predItems = Array.from(prediction);
        const [reorderedItem] = items.splice(result.source.index, 1);
        const [reorderedPrediction] = predItems.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        predItems.splice(result.destination.index, 0, reorderedPrediction);
        updatedrivers(items);
        countExcludedDrivers(items);
        updatePrediction(predItems);
        setRefresh(!refresh)
      }
      else if (poleSelection == 1){
        const items = Array.from(poleDriverData);
        const predItems = Array.from(polePrediction);
        const [reorderedItem] = items.splice(result.source.index, 1);
        const [reorderedPrediction] = predItems.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        predItems.splice(result.destination.index, 0, reorderedPrediction);
        setPoleDriverData(items)
        setPolePrediction(predItems);
      }
      else if (fastestLapSelection == 1){
        const items = Array.from(fastestLapDriverData);
        const predItems = Array.from(fastestLapPrediction);
        const [reorderedItem] = items.splice(result.source.index, 1);
        const [reorderedPrediction] = predItems.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        predItems.splice(result.destination.index, 0, reorderedPrediction);
        setFastestLapDriverData(items)
        setFastestLapPrediction(predItems);
      }
    }

    const [refresh, setRefresh] = useState(false)
    const [aboveDriverCount, setAboveDriverCount] = useState(0)
    const [pickableCount, setPickableCount] = useState(0)

    function countExcludedDrivers(driverObject){
      let temp_above_num = 0
      let temp_threshold_index = maxPickableDrivers
      let temp_pickable_count = 0
      for (let i=0; i<driverObject.length; i++){
        if (i + 1 <= pickThreshold && driverObject[i].pickableDriver === 0){
          temp_above_num = temp_above_num + 1
          temp_threshold_index = temp_threshold_index + 1
        }
        else{
          temp_pickable_count = temp_pickable_count + 1
        }
      }
      setPickThreshold(temp_threshold_index)
      setPickableCount(temp_pickable_count)
      setAboveDriverCount(temp_above_num)
      setRefresh(!refresh)
    }

    const [validationMessage, setValidationMessage] = useState("")

    function submitPrediction() {
      setLoading(true)
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
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setConfirmationMessage("There was an error submitting your racely prediction:" + error.toString())
            setPickConfirmation(true)
            setLoading(false)
            return Promise.reject(error);
          }
          else{
            setConfirmationMessage("Your racely prediction was submitted!!")
            setPickConfirmation(true)
            setLoading(false)
          }
        })
      }
      else{
        setConfirmationMessage("Cannot submit, the deadline has passed.")
        setPickConfirmation(true)
        setLoading(false)
      }
      };

      function submitPolePrediction() {
        setLoading(true)
        setPoleSelection(0)
        setPickConfirmation(true)
        let prediction_dict = {}
        prediction_dict["user"] = user;
        prediction_dict["isPolePrediction"] = 1
        prediction_dict["seasonCalendar"] = raceId.toString()
        prediction_dict['driver'] = poleDriverData[0]["id"]
        
        fetch(baseUrl + '/api/predictions/racely/pole-sitter/submit/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          },
          body: JSON.stringify(prediction_dict)
          })
          .then(async response => {
            let isJson = response.headers.get('content-type')?.includes('applicataion/json');
            let data = isJson && await response.json();
  
            if(!response.ok) {
              let error = (data && data.message) || response.status;
              setConfirmationMessage("There was an error submitting your pole prediction:" + error.toString())
              setPickConfirmation(true)
              setLoading(false)
              return Promise.reject(error);
            }
            else{
              setConfirmationMessage("Your pole sitter prediction was submitted!!")
              setPickConfirmation(true)
              setLoading(false)
            }
          })
        };

        function submitFastestLapPrediction() {
          setLoading(true)
          setFastestLapSelection(0)
          setPickConfirmation(true)
          let prediction_dict = {}
          prediction_dict["user"] = user;
          prediction_dict["isFastestLapPrediction"] = 1
          prediction_dict["seasonCalendar"] = raceId.toString()
          prediction_dict['driver'] = fastestLapDriverData[0]["id"]
          
          fetch(baseUrl + '/api/predictions/racely/fastest-lap/submit/', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(prediction_dict)
            })
            .then(async response => {
              let isJson = response.headers.get('content-type')?.includes('applicataion/json');
              let data = isJson && await response.json();
    
              if(!response.ok) {
                let error = (data && data.message) || response.status;
                setConfirmationMessage("There was an error submitting your fastest lap prediction:" + error.toString())
                setPickConfirmation(true)
                setLoading(false)
                return Promise.reject(error);
              }
              else{
                setConfirmationMessage("Your fastest lap prediction was submitted!!")
                setPickConfirmation(true)
                setLoading(false)
              }
            })
          };

    function handleOnOkClick(){
      setLoading(true)
      window.location.href = baseUrl
    }

    function handleOnEditClick(){
      setRacelyDriverSelection(1)
      setFastestLapSelection(0)
      setPoleSelection(0)
      setFastestLapSelection(0)
      setPoleSelection(0)
      getDrivers()
      setLoading(false)
      setPickConfirmation(false)
    }

    function redirectToLogin(){
      setLoading(true)
      window.location.href = baseUrl + "/api/logout"
    }

    function handleOnFastestLapClick(){
      setLoading(false)
      setPageLoading(true)
      getPoleFastDrivers()
      setPickConfirmation(false)
      setRacelyDriverSelection(0)
      setFastestLapSelection(1)
      setPoleSelection(0)
    }

    function handleOnPoleSitterClick(){
      setLoading(false)
      setPageLoading(true)
      getPoleFastDrivers()
      setPickConfirmation(false)
      setRacelyDriverSelection(0)
      setFastestLapSelection(0)
      setPoleSelection(1)
    }

    function onCancelClick(){
      setLoading(false)
      setPageLoading(false)
      setPickConfirmation(true)
      setRacelyDriverSelection(0)
      setFastestLapSelection(0)
      setPoleSelection(0)
    }

    const [poleSelection, setPoleSelection] = useState(0)
    const [fastestLapSelection, setFastestLapSelection] = useState(0)

    if (pageLoading){
      return(
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Racely Driver Prediction
            </h2>
        <div style={{
          marginTop:200,
          display:'flex',
          alignItems:"center",
          justifyContent:'center',
          height:'100%',
          width:'100%'
        }}>
          <ClipLoader size={50} color="#BD2031"/>
        </div>
        </header>
        </div>
        </div>
      )
    }
    else{
    if (pickCofirmation == true){

      return (
        <div style={{
          height:"100%",
          width:"100%",
          justifyContent: 'center'
        }}>
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:15,
              marginTop:15,}}>
              Racely Driver Prediction
            </h2>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}<br></br> { circuitName }
              </h3>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0, paddingTop:"5px", paddingBottom:"5px"}}>
              <p style={{
                backgroundColor:"#BD2031",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                marginBottom: 20,
                marginTop:0,
                marginLeft:0,
                zIndex:5,
                paddingTop:"5px",
                paddingBottom:"5px",
                marginRight:0}}>
                Deadline: Q1 / Sprint Race<br></br>{ time }
              </p>
              <div style={{
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                width: "100%"
                }}>
                <div style={{
                  minWidth:"300px",
                  borderRadius:"5px",
                  flexDirection: "column",
                  display:"flex",
                  backgroundColor: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  marginBottom: "5px",
                  padding:"5px",
                  marginLeft:'10px',
                  marginRight:'10px',
                  maxWidth:'300px',
                  justifyContent:"center",
                  zIndex: 5,
                  fontSize: 24}}>
                  <div style={{
                    marginTop:12,
                  }}>
                    {confirmationMessage}
                  </div>
                  <div role="button" onClick={() => handleOnPoleSitterClick()} style={{
                    display:"flex",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:"repeating-conic-gradient(#808080 0% 25%, transparent 15% 50%) 50% / 20px 20px",
                    color: "#28282B",
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginBottom:15,
                    marginTop:15,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    Pole Sitter
                  </div>
                  <div role="button" onClick={() => handleOnFastestLapClick()} style={{
                    display:"flex",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:"#9370DB",
                    color: "#FEFDFB",
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginBottom:15,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    Fastest Lap
                  </div>
                  <div role="button" onClick={() => handleOnEditClick()} style={{
                    display:"flex",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:"#48A14D",
                    color: "#FEFDFB",
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginBottom:15,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    Racely Picks
                  </div>
                  {loading == false
                ? <div role="button" onClick={() => handleOnOkClick()} style={{
                    display:"flex",
                    justifyContent:'center',
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    alignItems:'center',
                    backgroundColor:"#BD2031",
                    color: "#FEFDFB",
                    justifyContent:'center',
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    marginBottom: 15,
                    fontSize:18,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    Done
                  </div>
                : <div role="button" onClick={() => handleOnOkClick()} style={{
                    display:"flex",
                    justifyContent:'center',
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    alignItems:'center',
                    backgroundColor:"#BD2031",
                    color: "#FEFDFB",
                    justifyContent:'center',
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    <ClipLoader css={loaderCss} color="#FEFDFB"/>
                  </div>}
                </div>
              </div>
              </div>
            </header>
          </div>
        </div>
        </div>
      )
    }

    else if (submissionVaidator == 0){
      return(
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
            Racely Driver Prediction
            </h2>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <p stytle = {{
                fontSize: 5
              }}>
              { circuitName }
              </p>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0, paddingTop:"5px", paddingBottom:"5px"}}>
              <p style={{
                backgroundColor:"#BD2031",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
                padding:0,
                margin:5,
                marginLeft:0,
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                paddingTop:"5px",
                paddingBottom:"5px",
                }}>
                Deadline: Q1 / Sprint Race<br></br>{ time }
              </p>
              {isDemo == 1 || user == 0
            ? <p style={{
                backgroundColor:"#48A14D",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
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
                Demo prediction for {circuitRef}
              </p>
            : <p style={{
                backgroundColor:"#48A14D",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
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
                Your prediction for {circuitRef}
              </p>
              }
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="drivers">
                {(provided) => (
                  <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                    display:'flex',
                    alignItems:'center',
                    position:'relative',
                    right:'7px',
                    padding:"0px 0px 0px 0px" 
                  }}>
                    {drivers.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, pickableDriver, isFastestLapDriver, isPoleLapDriver, constructorIconColor}, index) => {
                      return (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            {pickableDriver === 0 && isFastestLapDriver == 0 || index + 1 > pickThreshold && isFastestLapDriver == 0
                          ? <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              opacity:0.5,
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'right', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10pxlol",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : pickableDriver === 0 && isFastestLapDriver == 1 || index + 1 > pickThreshold && isFastestLapDriver == 1
                          ? <div style={{
                              display: "grid",
                              backgroundColor: "#9370DB",
                              color: "#FEFDFB",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              opacity:0.5,
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'left', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : isFastestLapDriver == 1
                          ? <div style={{
                              display: "grid",
                              backgroundColor: "#9370DB",
                              color: "#FEFDFB",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'left', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#FEFDFB",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                            }}>
                            <div className="prediction-index" style={{textAlign:'left'}}>
                                {index + 1}
                            </div>
                            <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                            <div className="driver-thumb" style={{marginLeft:5}}>
                              <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                            </div>
                            {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                            <div className="driver-flag" style={{paddingLeft:'15px'
                            }}>
                              <img src={flag} alt={`${name} DriverFlag`} />
                            </div>
                          </div>
                          }
                          </li>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
            </div>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
            </div>
            </div>
          </header>
        </div>
        </div>
      )
    }

    else if (fastestLapSelection === 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
            Racely Driver Prediction
            </h2>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0, paddingTop:"5px", paddingBottom:"5px"}}>
              <p style={{
                  backgroundColor:"#BD2031",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
                  padding:0,
                  margin:5,
                  marginLeft:0,
                  justifyContent:'center',
                  alignItems:'center',
                  position: "sticky",
                  top:80,
                  paddingTop:"5px",
                  paddingBottom:"5px",
                  }}>
                  Deadline: Q1 / Sprint Race<br></br>{ time }
                </p>
                {isDemo == 1 && user == 0
              ? <p style={{
                  backgroundColor:"#9370DB",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
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
                  Demo Pole Prediction for {circuitRef}
                </p>
              : isDemo == 1 && user != 0
              ? <p style={{
                  backgroundColor:"#9370DB",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
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
                  Fastest lap for {circuitRef}?
                </p>
              : <p style={{
                  backgroundColor:"#9370DB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
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
                  Fastest lap for {circuitRef}?
                </p>}
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="drivers">
                {(provided) => (
                  <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                    display:'flex',
                    alignItems:'center',
                    position:'relative',
                    right:'7px',
                    padding:"0px 0px 0px 0px"
                  }}>
                    {fastestLapDriverData.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, constructorIconColor}, index) => {
                      return (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided) => (
                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              {index + 1 ===  1
                            ? <div style={{
                                display: "grid",
                                width: "auto",
                                paddingTop: "15px",
                                paddingBottom: "10px",
                                paddingLeft: "10px",
                                paddingRight:"15px",
                                gridTemplateColumns: 'auto 40px 70px 120px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                backgroundColor:"#9370DB",
                                color: "#FEFDFB",  
                              }}>
                                <div className="prediction-index" style={{textAlign:'right', opacity:0}}>
                                    {}
                                </div>
                                <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                                <div className="driver-thumb" style={{marginLeft:5}}>
                                  <img src={thumb} alt={`${name} Thumb`} style={{
                                borderRadius:50,
                               }}/>
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
                            : <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              opacity:0.5,
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              opacity: 0.5,  
                            }}>
                              <div className="prediction-index" style={{textAlign:'right'}}>
                                  {}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                                borderRadius:50,
                               }}/>
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
                            }
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
            {loading == false && user != null
            ? <div sytle={{
              justifyContent:"center",
              alignItems:"center",
              textAlign:'center',
              display:"flex",
              }}>
              <div style={{
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                display:"flex",
                fontSize:15,
                }}>
                <div></div>
                <div role="button" onClick={() => onCancelClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "50px",
                  minWidth: "150px",
                  marginTop:10,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginBottom:"30px",
                  }}>
                  Cancel
                </div>
                <div></div>
                <div role="button" onClick={() => submitFastestLapPrediction()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "50px",
                  minWidth: "150px",
                  marginTop:10,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginLeft:'5px',
                  marginBottom:"30px",
                  }}>
                  Submit
                </div>
                <div></div>
              </div>
              </div>
            : loading == false && user == null 
            ? <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                <div role="button" onClick={() => redirectToLogin()} style={{
                  borderRadius:50,
                  display:"flex",
                  justifyContent:'center',
                  alignItems:'center',
                  backgroundColor:"#BD2031",
                  color: "#FEFDFB",
                  width: 250,
                  height:50,
                  alignContent:'center',
                  borderRadius: 50,
                  fontSize:20,
                  marginBottom:60,
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  cursor:"pointer",  
                  }}>
                  Login To Submit
                </div>
              </div>
            : <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                <div role="button" onClick={() => redirectToLogin()} style={{
                  borderRadius:50,
                  display:"flex",
                  justifyContent:'center',
                  alignItems:'center',
                  backgroundColor:"#BD2031",
                  color: "#FEFDFB",
                  width: 250,
                  height:50,
                  alignContent:'center',
                  borderRadius: 50,
                  fontSize:20,
                  marginBottom:60,
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                  }}>
                  <ClipLoader css={loaderCss} color="#FEFDFB"/>
                </div>
              </div>}
            </div>
          </header>
        </div>
        </div>
      );
    }

    else if (poleSelection === 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
            Racely Driver Prediction
            </h2>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0, paddingTop:"5px", paddingBottom:"5px"}}>
              <p style={{
                  backgroundColor:"#BD2031",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
                  padding:0,
                  margin:5,
                  marginLeft:0,
                  justifyContent:'center',
                  alignItems:'center',
                  position: "sticky",
                  top:80,
                  paddingTop:"5px",
                  paddingBottom:"5px",
                  }}>
                  Deadline: Q1 / Sprint Race<br></br>{ time }
                </p>
                {isDemo == 1 && user == 0
              ? <p style={{
                  backgroundColor:"#9370DB",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
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
                  Demo Pole Prediction for {circuitRef}
                </p>
              : isDemo == 1 && user != 0
              ? <p style={{
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#28282B",
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
                  Who will be on pole for {circuitRef}?
                </p>
              : <p style={{
                  backgroundColor:"repeating-conic-gradient(#808080 0% 25%, transparent 50% 50%) 50% / 20px 20px",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#28282B",
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
                  Who Will be on pole for {circuitRef}?
                </p>}
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="drivers">
                {(provided) => (
                  <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                    display:'flex',
                    alignItems:'center',
                    position:'relative',
                    right:'7px',
                    padding:"0px 0px 0px 0px"
                  }}>
                    {poleDriverData.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, constructorIconColor}, index) => {
                      return (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided) => (
                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              {index + 1 === 1
                            ? <div style={{
                                display: "grid",
                                width: "auto",
                                paddingTop: "15px",
                                paddingBottom: "10px",
                                paddingLeft: "10px",
                                paddingRight:"15px",
                                gridTemplateColumns: 'auto 40px 70px 120px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", 
                              }}>
                                <div className="prediction-index" style={{textAlign:'right', opacity:0}}>
                                    {}
                                </div>
                                <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                                <div className="driver-thumb" style={{marginLeft:5}}>
                                  <img src={thumb} alt={`${name} Thumb`} style={{
                                borderRadius:50,
                               }}/>
                                </div>
                                <div className="driver-code" style={{
                                  justifyDirection:'column', textAlign:'center',
                                  marginLeft:8, paddingLeft:'3px'
                                }}>
                                  <div style={{
                                    fontSize:11,
                                    color:"#BD2031",
                                    fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                  </div>
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
                            : <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              opacity:0.5,
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              opacity: 0.5,  
                            }}>
                              <div className="prediction-index" style={{textAlign:'right'}}>
                                  {}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                                borderRadius:50,
                               }}/>
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
                            }
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
            {loading == false && user != null
            ? <div sytle={{
              justifyContent:"center",
              alignItems:"center",
              textAlign:'center',
              display:"flex",
              }}>
              <div style={{
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                display:"flex",
                fontSize:15,
                }}>
                <div></div>
                <div role="button" onClick={() => onCancelClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "50px",
                  minWidth: "150px",
                  marginTop:10,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginBottom:"30px",
                  }}>
                  Cancel
                </div>
                <div></div>
                <div role="button" onClick={() => submitPolePrediction()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "50px",
                  minWidth: "150px",
                  marginTop:10,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginLeft:'5px',
                  marginBottom:"30px",
                  }}>
                  Submit
                </div>
                <div></div>
              </div>
              </div>
            : loading == false && user == null 
            ? <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                <div role="button" onClick={() => redirectToLogin()} style={{
                  borderRadius:50,
                  display:"flex",
                  justifyContent:'center',
                  alignItems:'center',
                  backgroundColor:"#BD2031",
                  color: "#FEFDFB",
                  width: 250,
                  height:50,
                  alignContent:'center',
                  borderRadius: 50,
                  fontSize:20,
                  marginBottom:60,
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  cursor:"pointer",  
                  }}>
                  Login To Submit
                </div>
              </div>
            : <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                <div role="button" onClick={() => redirectToLogin()} style={{
                  borderRadius:50,
                  display:"flex",
                  justifyContent:'center',
                  alignItems:'center',
                  backgroundColor:"#BD2031",
                  color: "#FEFDFB",
                  width: 250,
                  height:50,
                  alignContent:'center',
                  borderRadius: 50,
                  fontSize:20,
                  marginBottom:60,
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                  }}>
                  <ClipLoader css={loaderCss} color="#FEFDFB"/>
                </div>
              </div>}
            </div>
          </header>
        </div>
        </div>
      );
    }

    else{
    return (
      <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
      <div className="App">
        <header className="App-header">
          <h2 style={{marginBottom:0}}>
          Racely Driver Prediction
          </h2>
            <h3 style={{marginBottom:15, marginTop:15}}>
              { circuitRef } - {circuitCountry}
            </h3>
            <div stytle = {{
                fontSize: 8
              }}>
              { circuitName }
              </div>
            <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
              marginRight:0, marginTop:0, paddingTop:"5px", paddingBottom:"5px"}}>
            <p style={{
                backgroundColor:"#BD2031",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
                padding:0,
                margin:5,
                marginLeft:0,
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                paddingTop:"5px",
                paddingBottom:"5px",
                }}>
                Deadline: Q1 / Sprint Race<br></br>{ time }
              </p>
              {isDemo == 1 && user == 0
            ? <p style={{
                backgroundColor:"#48A14D",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
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
                Demo Prediction for {circuitRef}
              </p>
            : isDemo == 1 && user != 0
            ? <p style={{
                backgroundColor:"#48A14D",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
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
                Create prediction for {circuitRef}
              </p>
            : <p style={{
                background: "#48A14D",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:"#FEFDFB",
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
                Current Prediction for {circuitRef}
              </p>}
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="drivers">
              {(provided) => (
                <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                  display:'flex',
                  alignItems:'center',
                  position:'relative',
                  right:'7px',
                  padding:"0px 0px 0px 0px"
                }}>
                  {drivers.map(({id, isFastestLapDriver, isPoleLapDriver, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, pickableDriver, constructorIconColor}, index) => {
                    return (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided) => (
                          <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            {pickableDriver === 0 && isFastestLapDriver == 0 || index + 1 > pickThreshold && isFastestLapDriver == 0
                          ? <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              opacity:0.5,
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'left', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : pickableDriver === 0 && isFastestLapDriver == 1 || index + 1 > pickThreshold && isFastestLapDriver == 1
                          ? <div style={{
                              display: "grid",
                              backgroundColor: "#9370DB",
                              color: "#FEFDFB",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              opacity:0.5,
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'left', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : isFastestLapDriver == 1
                          ? <div style={{
                              display: "grid",
                              backgroundColor: "#9370DB",
                              color: "#FEFDFB",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                              }}>
                              <div className="prediction-index" style={{textAlign:'left', opacity:1}}>
                                  {index + 1}
                              </div>
                              <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                              </div>
                              {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#FEFDFB",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                              <div className="driver-flag" style={{paddingLeft:'15px'
                              }}>
                                <img src={flag} alt={`${name} DriverFlag`} />
                              </div>
                            </div>
                          : <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: 'auto 40px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                            }}>
                            <div className="prediction-index" style={{textAlign:'left'}}>
                                {index + 1}
                            </div>
                            <div style={{
                              display:"flex",
                              flexDriection:"row",
                              }}>
                              <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor,
                                  }}>
                                </div>
                                <div style={{
                                  marginLeft:"10px",
                                  width:"10px",
                                  height:"70px",
                                  transform: "skewX(-15deg)",
                                  justifyContent:"right",
                                  justifyItems:"right",
                                  alignItems:"center",
                                  backgroundColor:constructorIconColor
                                  }}>
                                </div>
                              </div>
                            <div className="driver-thumb" style={{marginLeft:5}}>
                              <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }}/>
                            </div>
                            {isPoleLapDriver
                            ? <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                <div style={{
                                  fontSize:11,
                                  color:"#BD2031",
                                  fontStyle:"italic",
                                  }}>
                                  &#127937; Pole Pick &#127937;
                                </div>
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                              </div>
                            : <div className="driver-code" style={{
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
                              }
                            <div className="driver-flag" style={{paddingLeft:'15px'
                            }}>
                              <img src={flag} alt={`${name} DriverFlag`} />
                            </div>
                          </div>
                          }
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
          {loading == false && user != null
          ? <div sytle={{
            justifyContent:"center",
            alignItems:"center",
            textAlign:'center',
            display:"flex",
            }}>
            <div style={{
              justifyContent:"center",
              alignItems:"center",
              textAlign:'center',
              display:"flex",
              fontSize:15,
              }}>
              <div></div>
              <div role="button" onClick={() => onCancelClick()} style={{
                display:"flex",
                backgroundColor: "#BD2031",
                color: "#FEFDFB",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                borderRadius: '15px 0px 0px 15px',
                height: "50px",
                minWidth: "150px",
                marginTop:10,
                border: "0px",
                marginBottom: 15,
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                hover:"pointer",
                marginBottom:"30px",
                }}>
                Cancel
              </div>
              <div></div>
              <div role="button" onClick={() => submitPrediction()} style={{
                display:"flex",
                backgroundColor: "#48A14D",
                color: "#FEFDFB",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                borderRadius: '0px 15px 15px 0px',
                height: "50px",
                minWidth: "150px",
                marginTop:10,
                border: "0px",
                marginBottom: 15,
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                hover:"pointer",
                marginLeft:'5px',
                marginBottom:"30px",
                }}>
                Submit
              </div>
              <div></div>
            </div>
            </div>
          : loading == false && user == null 
          ? <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
              <div role="button" onClick={() => redirectToLogin()} style={{
                borderRadius:50,
                display:"flex",
                justifyContent:'center',
                alignItems:'center',
                backgroundColor:"#BD2031",
                color: "#FEFDFB",
                width: 250,
                height:50,
                alignContent:'center',
                borderRadius: 50,
                fontSize:20,
                marginBottom:60,
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                cursor:"pointer",  
                }}>
                Login To Submit
              </div>
            </div>
          : <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
              <div role="button" onClick={() => redirectToLogin()} style={{
                borderRadius:50,
                display:"flex",
                justifyContent:'center',
                alignItems:'center',
                backgroundColor:"#BD2031",
                color: "#FEFDFB",
                width: 250,
                height:50,
                alignContent:'center',
                borderRadius: 50,
                fontSize:20,
                marginBottom:60,
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                }}>
                <ClipLoader css={loaderCss} color="#FEFDFB"/>
              </div>
            </div>}
          </div>
        </header>
      </div>
      </div>
    );
  }
}
}
export default MidfieldPredictions;