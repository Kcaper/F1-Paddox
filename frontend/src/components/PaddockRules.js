import React, { useState, useEffect } from "react";
import { IconContext } from 'react-icons/lib';
import Grid from "@material-ui/core/Grid";
import { baseUrl } from './F1HomePage'
import SelectInput from "@material-ui/core/Select/SelectInput";
import { ImSleepy2 } from "react-icons/im";
import { resetServerContext } from "react-beautiful-dnd";
import * as RiIcons from 'react-icons/ri';
import * as IoIcons from 'react-icons/io';
import * as FcIcons from 'react-icons/fc';
import * as TiIcons from 'react-icons/ti';
import { ClipLoader } from 'react-spinners';
import { FaWindowRestore } from "react-icons/fa";
import { GiConsoleController } from "react-icons/gi";
import {useParams} from 'react-router-dom';

export default function PaddockRules() {

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
    const [paddockList, setPaddockList] = useState([])
    const [radioSelected, setRadioSelected] = useState(false)

    const params = useParams()

    useEffect(() => {
      getPaddockRuleData()
    },[])


    const [pageLoading, setPageLoading] = useState(true)
    const [paddockRuleData, setPaddockRuleData] = useState({})
    const [publicText, setPublicText] = useState("Public Paddock")

    const getPaddockRuleData = async () => {
        await fetch(baseUrl + '/api/paddock-rules/' + params['id'])
        .then(response => response.json())
        .then(apiPaddockRules => {
        setPaddockRuleData(apiPaddockRules.paddockRules)
        if(apiPaddockRules.paddockRules.isPublic == 1){
            setPublicText("Public")
        }
        else{
            setPublicText("Private")
        }
      })
      setPageLoading(false)
    }
    function handleGotItClick(){
        window.location.href=baseUrl + "/my-paddocks"
    }

    console.log(paddockRuleData.excludedConstructors)

    if (pageLoading == true){
        return(
        <div class="form-container" style={{
            marginTop:100,
            marginLeft:15,
            justifyContent:'center'
            }}>
            <div style={{
                marginTop:80,
                textAlign:'center'
                }}>
                <h1 style={{
                    marginBottom:5,
                    }}>
                    Paddock Rules
                </h1>
            </div>
            <div style={{
            marginTop:200,
            display:'flex',
            alignItems:"center",
            justifyContent:'center',
            height:'100%',
            width:'100%'
            }}>
            <ClipLoader color="#BD2031" size={50}/>
            </div>
        </div>
        )}
    else{
    return (
        <div style={{
        height: "auto"
            }}>
            <div class="form-container" style={{
                width: "300px",
                height: "auto",
                backgroundColor: "#FEFDFB",
                margin: "auto",
                boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
                marginTop: 120
                }}>
                <div style={{
                    margin:0,
                    backgroundColor:"#48A14D",
                    color:"#FEFDFB",
                    fontSize: 23,
                    paddingTop: "20px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    }}>Paddock Rules
                </div>
                <div style={{
                    margin:0,
                    backgroundColor:"#48A14D",
                    color:"#FEFDFB",
                    fontSize: 12,
                    paddingLeft:'20px',
                    paddingTop:"8px",
                    paddingBottom:'5px',
                    }}>
                    {paddockRuleData['paddockName']} - {publicText} paddock
                </div>
                <form class="register-form" 
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    padding: "10px",
                    marginLeft:5,
                    marginRight:5,
                    }}>
                    <div style={{
                        paddingTop:"10px",
                        marginLeft:"5px",
                        }}>
                        Points for all games are awarded as follows:
                    </div>
                    <div style={{
                        paddingTop:'20px',
                        paddingBottom:'20px',
                        }}>
                        <img src="/static/images/HowItWorks/f1thPointsEg.png" alt="" width="250" height="220"></img>
                    </div>
                    <div>
                        <div style={{
                            padding:"10px"
                            }}>
                            <div style={{
                                backgroundColor:"#ED944D",
                                color:"#28282B",
                                justfyContent:"center",
                                alignItems:'center',
                                width:"90%",
                                borderRadius:'8px',
                                padding:"10px",
                                }}>
                                1. Racely game
                            </div>
                            <div style={{
                                fontFamily:'Roboto, sans-serif',
                                fontSize:"15px",
                                marginLeft:"5px",
                                marginTop:"10px",
                                }}>
                                Game Name : {paddockRuleData['ruleSetName']}
                            </div>
                            <div style={{
                                fontFamily:'Roboto, sans-serif',
                                fontSize:"15px",
                                marginLeft:"5px",
                                marginTop:"10px",
                                }}>
                                Deadlines: 
                            </div>
                            <div style={{
                                fontFamily:'Roboto, sans-serif',
                                fontSize:"12px",
                                marginLeft:"10px",
                                }}>
                                Starting Round : {paddockRuleData.racelyStartRound} 
                            </div>
                            <div style={{
                                fontFamily:'Roboto, sans-serif',
                                fontSize:"12px",
                                marginLeft:"10px",
                                }}>
                                {paddockRuleData.midfieldDriverPredictionStartDate} - {paddockRuleData.midfieldDriverPredictionDeadlineTime} - {paddockRuleData.midfieldDriverPredictionDeadlineSession} 
                            </div>
                            <div>
                                {paddockRuleData.excludedConstructors.length>0
                            ?   <div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Drivers From:
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        }}>
                                        {paddockRuleData.excludedConstructors.map(excludedConstructors => (
                                            <div style={{
                                                fontFamily:'Roboto, sans-serif',
                                                fontSize:"12px",
                                                marginLeft:"5px",
                                                }}>
                                                {excludedConstructors.constructorName}
                                            </div>
                                        ))}
                                        are excluded.
                                    </div>
                                </div>
                            :   <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"15px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    All drivers are included in the racely predictions.
                                </div>
                                }
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"15px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Racely prediction deadline:
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"10px",
                                    }}>
                                    {paddockRuleData.midfieldDriverPredictionDeadlineSession} 
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"15px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Points Paying Predictions:
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"10px",
                                    }}>
                                    {paddockRuleData.racelyDriversOnLeaderboard}/{paddockRuleData.maxRacelyDrivers}
                                </div>
                                {paddockRuleData.racelyStartRound > 1
                            ?   <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    As this paddock only starts in round {paddockRuleData.racelyStartRound}, players' predictions and prediction points for rounds prior to round {paddockRuleData.racelyStartRound}, will not be taken into account. ie. The game start in this paddock from round {paddockRuleData.racelyStartRound}.
                                </div>
                            :   null}
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Prediction points for players joining the paddock after round {paddockRuleData.racelyStartRound}, with valid predictions prior to thier joining date, will have thier preditions and subsequent points for previous rounds included in the paddock's leaderboard at the concludsion of the following race.
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Racely predictions will pay out points round for round ... 
                                </div>
                                <div style={{
                                    marginTop:"15px"
                                    }}>
                                    <img src="/static/images/HowItWorks/racelyroundeg.png" alt="" width="250" height="285"></img>
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    ... as well as accumulate over the season on a separate leaderboard.
                                </div>
                                <div style={{
                                    marginTop:"15px"
                                    }}>
                                    <img src="/static/images/HowItWorks/racelyseasoneg.png" alt="" width="250" height="285"></img>
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Players who do not submit a prediction between races, will have their previous prediction taken into account.
                                </div>
                                <div style={{
                                    fontFamily:'Roboto, sans-serif',
                                    fontSize:"12px",
                                    marginLeft:"5px",
                                    marginTop:"10px",
                                    }}>
                                    Players who have not sumbitted at least 1 valid racely prediction before the racely deadline, will score 0 points for each round until they submit 1 prediction.
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div style={{
                                        backgroundColor:"#ED944D",
                                        color:"#28282B",
                                        justfyContent:"center",
                                        alignItems:'center',
                                        width:"90%",
                                        borderRadius:'8px',
                                        padding:"10px",
                                        marginTop:'20px',
                                        }}>
                                        2. Driver Standings
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Deadlines: 
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        Starting Round : {paddockRuleData.preSeasonDriverStartRound}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.preSeasonDriverPredictionDeadlineDate} - {paddockRuleData.preSeasonDriverPredictionDeadlineTime} - {paddockRuleData.preSeasonDriverPredictionDeadlineSession}  
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Prediction deadline:
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.preSeasonDriverPredictionDeadlineSession}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px"
                                        }}>
                                        Points Paying Predictions:
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.numDriversOnPreSeasonLeaderboard}/{paddockRuleData.maxSeasonDrivers}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Driver standing points do not accumulate, but rather, adjust as the drivers move up and down the driver standing leaderboard ... 
                                    </div>
                                    <div style={{
                                        marginTop:"15px"
                                        }}>
                                        <img src="/static/images/HowItWorks/driverstandingeg1.png" alt="" width="250" height="300"></img>
                                    </div>
                                    <div style={{
                                        marginTop:"15px"
                                        }}>
                                        <img src="/static/images/HowItWorks/driverstandingeg2.png" alt="" width="250" height="310"></img>
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        DO NOT MISS THE PREDICTION DEADLINE! Players that do not sumbit a driver standing prediction on time, will receive 0 points for this game for the season.
                                    </div>
                                </div>
                            </div>
                            <div>
                            <div>
                                    <div style={{
                                        backgroundColor:"#ED944D",
                                        color:"#28282B",
                                        justfyContent:"center",
                                        alignItems:'center',
                                        width:"90%",
                                        borderRadius:'8px',
                                        padding:"10px",
                                        marginTop:'20px',
                                        }}>
                                        3. Team Standings
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Deadlines: 
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        Starting Round : {paddockRuleData.preSeasonConstructorStartRound}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.preSeasonConstructorPredictionDeadlineDate} - {paddockRuleData.preSeasonConstructorPredictionDeadlineTime} - {paddockRuleData.preSeasonConstructorPredictionDeadlineSession}  
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Prediction deadline:
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.preSeasonConstructorPredictionDeadlineSession}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"15px",
                                        marginLeft:"5px",
                                        marginTop:"10px"
                                        }}>
                                        Points Paying Predictions:
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"10px",
                                        }}>
                                        {paddockRuleData.numConstructorsOnPreSeasonLeaderboard}/{paddockRuleData.maxSeasonConstructors}
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        Constructor standing points do not accumulate, but rather, adjust as the Constructors move up and down the Constructor standing leaderboard ... 
                                    </div>
                                    <div style={{
                                        marginTop:"15px",
                                        borderRadius:30,
                                        }}>
                                        <img src="/static/images/HowItWorks/teamstandingeg.png" alt="" width="250" height="320"></img>
                                    </div>
                                    <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                        DO NOT MISS THE PREDICTION DEADLINE! Players that do not sumbit a Constructor standing prediction on time, will receive 0 points for this game for the season.
                                    </div>
                                </div>
                                <div style={{
                                        backgroundColor:"#ED944D",
                                        color:"#28282B",
                                        justfyContent:"center",
                                        alignItems:'center',
                                        width:"90%",
                                        borderRadius:'8px',
                                        padding:"10px",
                                        marginTop:'20px',
                                        }}>
                                        4. Combined Standings
                                    </div>
                                <div style={{
                                        fontFamily:'Roboto, sans-serif',
                                        fontSize:"12px",
                                        marginLeft:"5px",
                                        marginTop:"10px",
                                        }}>
                                    There will be a combined leaderboard with a combination of points of driver standing points + constructor standing points. Points will fluctuate up and down as driver and constructor standing positions change race by race.
                                </div>
                                <div style={{
                                    marginTop:"15px"
                                    }}>
                                    <img src="/static/images/HowItWorks/combinedeg.png" alt="" width="250" height="320"></img>
                                </div>
                                <div role="button" onClick={() => handleGotItClick()} style={{
                                    color:"#FEFDFB",
                                    backgroundColor:"#48A14D",
                                    borderRadius:'10px',
                                    justifyContent:'center',
                                    alignItems:'center',
                                    textAlign:'center',
                                    marginTop:"30px",
                                    marginBottom:"30px",
                                    padding:"15px",
                                    cursor:"pointer",
                                    }}>
                                    Got it!
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        );
    }
}