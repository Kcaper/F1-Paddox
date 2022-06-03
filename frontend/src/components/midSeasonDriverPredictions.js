import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from "@material-ui/core/Button";
import { baseUrl } from './F1HomePage'
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react';
import { link } from 'react-router-dom';

const loaderCss = css`
  margin-top: 16px;
  width: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
`

function midSeasonDriverPredictions() {

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
  const [submissionVaidator, setValidator] = useState(0)

  const [pickCofirmation, setPickConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  
  const [isDemo, setIsDemo] = useState(false)

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
    getDrivers();
    getDeadline();
  },[]);

  const getDrivers = async () => {
    await fetch(baseUrl + '/api/predictions/mid-season/driver-standings')
    .then(response => response.json())
    .then(apiDrivers => {
      var object = JSON.parse(apiDrivers)
      updatedrivers(object.drivers)
      setUser(object.user)
      setPredictionType(object.isMidSeasonPrediction)
      createInitalPrediction(object.drivers, object.numDrivers)
      setIsDemo(object.isDemo)
    })
  }

  const getDeadline = async () => {
    await fetch(baseUrl + '/api/predictions/deadlines/mid-season/driver-standings/')
    .then(response => response.json())
    .then(deadline => {
      setValidator(1)
      let countDownString = deadline.fp1Date + " " + deadline.fp1StartTime
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
          setTime(deadline.fp1Date + " - " + deadline.fp1StartTime)
          setValidator(0)
        }
        setPageLoading(false)
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
    setLoading(true)
    let prediction_dict = {}
    prediction_dict["user"] = user;
    prediction_dict["isMidSeasonPrediction"] = 1
    for (let i=0; i<numDrivers; i++){
      let position_string = "position" + (i+1)
      prediction_dict[position_string] = prediction[i]["id"]
    }
    if (submissionVaidator == 1){
      fetch(baseUrl + '/api/predictions/mid-season/driver-standings/submit/', {
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
          setConfirmationMessage("There was an error submitting your prediction:" + error.toString())
          setPickConfirmation(true)
          setLoading(false)
          return Promise.reject(error);
        }
        else{
          setConfirmationMessage("Your prediction was submitted!!")
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

    function handleOnOkClick(){
      setLoading(true)
      window.location.href = '/'
    }

    function handleOnEditClick(){
      setLoading(false)
      setPickConfirmation(false)
    }

    function redirectToLogin(){
      setLoading(true)
      window.location.href = baseUrl + "/api/logout"
    }

    function handlePreSeasonClick(){
      window.location.href='/driver-predictions'
    }



    if (pageLoading == true){
      return(
        <div style={{
          height:"100%",
          width:"100%",
          justifyContent: 'center'
          }}>
          <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
            <div className="App">
              <header className="App-header">
                <h2 style={{marginBottom:20}}>
                  Driver Standing Prediction
                </h2>
                <div style={{
                  marginTop:200,
                  display:'flex',
                  alignItems:"center",
                  justifyContent:'center',
                  height:'100%',
                  width:'100%'
                  }}>
                  <ClipLoader color='red' size={50}/>
                </div>
              </header>
             </div>
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
            <h2 style={{marginBottom:0}}>
              Driver Standing Prediction
            </h2>
            <div style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div role="button" onClick={() => handlePreSeasonClick()}
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              cursor:'pointer',
              }}>
              Pre-Season
            </div>
            <div></div>
            <div
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              }}>
              Mid-Season
            </div>
            <div></div>
          </div>
          <div
            style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div></div>
            <div></div>
            <div  role="button" onClick={() => handlePreSeasonClick()}
              style={{
              backgroundColor:"red",
              color:"green",
              height:"8px",
              borderRadius:"3px",
              justifyContent:"center",
              padding:"0px",
              cursor:'pointer',
              }}></div>
            <div></div>
          </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0}}>
              <p style={{
                backgroundColor:'red',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:'white',
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                marginBottom: 20,
                margin:5,
                padding:"2px 0px 2px 0px",
                marginTop:20,
                marginLeft:0,
                zIndex:5,
                marginRight:0}}>
                Deadline - Q1<br></br>{ time }
              </p>
              <div style={{
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                width: "100%"
              }}>
                <div style={{
                  borderRadius:"5px",
                  flexDirection: "column",
                  display:"flex",
                  backgroundColor: "white",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  marginBottom: "5px",
                  padding:"5px",
                  justifyContent:"center",
                  marginLeft:'10px',
                  marginRight:'10px',
                  maxWidth:'400px',
                  zIndex: 5,
                  fontSize: 24}}>
                  <div>
                    {confirmationMessage}
                  </div>
                  {loading == false
                  ? <div role="button" onClick={() => handleOnOkClick()} style={{
                    display:"flex",
                    justifyContent:'center',
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    alignItems:'center',
                    backgroundColor:"red",
                    color: 'white',
                    justifyContent:'center',
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
                    OK
                  </div>
                  : <div role="button" onClick={() => handleOnOkClick()} style={{
                    display:"flex",
                    justifyContent:'center',
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    alignItems:'center',
                    backgroundColor:"red",
                    color: 'white',
                    justifyContent:'center',
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginBottom:15,
                    marginTop:15,
                    marginLeft:30,
                    marginRight:30
                    }}>
                    <ClipLoader css={loaderCss} color='white'/>
                  </div>}
                  <div role="button" onClick={() => handleOnEditClick()} style={{
                    display:"flex",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:"green",
                    color: 'white',
                    height:50,
                    alignContent:'center',
                    borderRadius: 20,
                    fontSize:18,
                    marginBottom:15,
                    marginLeft:30,
                    marginRight:30,
                    cursor:"pointer",
                    }}>
                    Edit
                  </div>
                </div>
              </div>
              </div>
            </header>
          </div>
        </div>
        </div>
      )
    }

  else if(submissionVaidator == 0){
    return (
      <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
      <div className="App">
        <header className="App-header">
          <h2 style={{marginBottom:20}}>
            Driver Standing Prediction
          </h2>
          <div style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div role="button" onClick={() => handlePreSeasonClick()}
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              cursor:'pointer',
              }}>
              Pre-Season
            </div>
            <div></div>
            <div
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              }}>
              Mid-Season
            </div>
            <div></div>
          </div>
          <div
            style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div></div>
            <div></div>
            <div  role="button" onClick={() => handlePreSeasonClick()}
              style={{
              backgroundColor:"red",
              color:"green",
              height:"8px",
              borderRadius:"3px",
              justifyContent:"center",
              padding:"0px",
              cursor:'pointer',
              }}></div>
            <div></div>
          </div>
            <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
              marginRight:0, marginTop:0}}>
            <p style={{
                backgroundColor:'red',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:'white',
                padding:0,
                margin:5,
                marginLeft:0,
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                padding:"2px 0px 2px 0px",
                }}>
                Deadline - FP1<br></br>{ time }
              </p>
              {isDemo == 0
            ? <p style={{
                backgroundColor:'green',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
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
                Your Driver Standing Prediction
              </p>
            : <p style={{
                backgroundColor:'green',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
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
                Demo Prediction
              </p>
              }
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="drivers">
              {(provided) => (
                <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                  display:'flex',
                  flexDirection:'column',
                  alignItems:'center',
                  position:'relative',
                  right:'7px',
                  padding:"0px 0px 0px 0px" 
                }}>
                  {drivers.map(({id, name, icon, flag, thumb, constructor_logo, constructorName}, index) => {
                    return (
                          <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: '10px 70px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                            }}>
                            <div className="position">
                                 { index + 1 }.
                            </div>
                            <div className="icon" style={{
                              marginLeft: "4px"
                            }}>
                              <img src={icon} alt={`${name} Icon`} />
                            </div>
                            <div className="thumb">
                              <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                               }} />
                            </div>
                            <div style={{
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center',
                              flexDirection:'column'
                            }}>
                              <div className="driver_name" style={{
                                fontSize: 18
                              }}>
                                 { name }
                              </div>
                              <div style={{
                                fontSize:12
                              }}>
                                {constructorName}
                              </div>
                            </div>
                            <div className="driver_flag">
                              <img src={flag} alt={`${name} DriverFlag`} />
                            </div>
                            </div>
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
    );
  }
  else{

  return (
    <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
    <div className="App">
      <header className="App-header">
        <h2 style={{marginBottom:20}}>
          Driver Standing Prediction
        </h2>
        <div style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div role="button" onClick={() => handlePreSeasonClick()}
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              cursor:'pointer',
              }}>
              Pre-Season
            </div>
            <div></div>
            <div
              style={{
              justifyContent:"center",
              textAlign:"center",
              padding:"0px",
              }}>
              Mid-Season
            </div>
            <div></div>
          </div>
          <div
            style={{
            display:'grid',
            flexDirection:"column",
            width:"100%",
            justifyContent:'center',
            gridTemplateColumns:"auto 120px 10px 120px auto",
            }}>
            <div></div>
            <div></div>
            <div></div>
            <div  role="button" onClick={() => handlePreSeasonClick()}
              style={{
              backgroundColor:"red",
              color:"green",
              height:"8px",
              borderRadius:"3px",
              justifyContent:"center",
              padding:"0px",
              cursor:'pointer',
              }}></div>
            <div></div>
          </div>
          <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
            marginRight:0, marginTop:0}}>
              <p style={{
                backgroundColor:'red',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                width:"100%",
                color:'white',
                padding:0,
                margin:5,
                marginLeft:0,
                justifyContent:'center',
                alignItems:'center',
                position: "sticky",
                top:80,
                padding:"2px 0px 2px 0px",
                }}>
                Deadline - FP1<br></br>{ time }
              </p>
              {isDemo == 1 && user == null
            ? <p style={{
                backgroundColor:'green',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
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
                Demo Prediction
              </p>
            : isDemo == 1 && user != null
            ? <p style={{
                backgroundColor:'green',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
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
                Create Your Prediction
              </p>
            : <p style={{
                backgroundColor:'green',
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
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
                Current Driver Standing Prediction
              </p>
              }
          <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="drivers">
            {(provided) => (
              <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                position:'relative',
                right:'7px',
                padding:"0px 0px 0px 0px" 
              }}>
                {drivers.map(({id, name, icon, flag, thumb, constructor_logo, constructorName}, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: '10px 70px 70px 120px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          }}>
                          <div className="position">
                               { index + 1 }.
                          </div>
                          <div className="icon" style={{
                              marginLeft: "4px"}}>
                            <img src={icon} alt={`${name} Icon`} />
                          </div>
                          <div className="thumb">
                            <img src={thumb} alt={`${name} Thumb`} style={{
                              borderRadius:50,
                             }} />
                          </div>
                          <div style={{
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            flexDirection:'column'
                          }}>
                            <div className="driver_name" style={{
                              fontSize:18
                            }}>
                               { name }
                            </div>
                            <div style={{
                              fontSize:12
                            }}>
                              {constructorName}
                            </div>
                          </div>
                          <div className="driver_flag">
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
          {loading == false && user != 0
          ? <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
              <div role="button" onClick={() => submitPrediction()} style={{
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
                marginBottom:60,
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                cursor:"pointer",  
                }}>
                Submit Prediction
              </div>
            </div>
          : loading == false && user == 0 
          ? <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
              <div role="button" onClick={() => redirectToLogin()} style={{
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
                backgroundColor:"red",
                color: 'white',
                width: 250,
                height:50,
                alignContent:'center',
                borderRadius: 50,
                fontSize:20,
                marginBottom:60,
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                }}>
                <ClipLoader css={loaderCss} color='white'/>
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
export default midSeasonDriverPredictions;