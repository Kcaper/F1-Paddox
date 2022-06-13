import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import HomePage from "./HomePage";
import { ClipLoader } from 'react-spinners';
//export const baseUrl = 'https://8383-165-73-60-135.eu.ngrok.io'
export const baseUrl = 'https://ebbe-165-73-60-135.eu.ngrok.io'



function F1HomePage() {

  const [username, setUsername] = useState("")
  const [lastPredictionDate, setLastPredictionDate] = useState("")
  const [lastPredictionTime, setLastPredictedTime] = useState("")
  const [time, setTime] = useState("")
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    getUsername();
    getLastMidfieldPredictionDate();
    getMidSeasonDeadline();
    getDeadline();
    getPicksMade();
  },[]);

  const getUsername = async () => {
    await fetch(baseUrl + '/api/user/current-user')
    .then(response => response.json())
    .then(apiUser => {
      setUsername(apiUser.username)
    })
  }

  const [racelyPrediction, setRacelyPrediction] = useState(0)
  const [preSeasonDriverPrediction, setPreSeasonDriverPrediction] = useState(0)
  const [preSeasonConstructorPrediction, setPreSeasonConstructorPrediction] = useState(0)
  const [nextRaceName, setNextRaceName] = useState("")
  const [lastRaceName, setLastRaceName] = useState("")
  const [firstRace, setFirstRace] = useState(1)
  const [noRacelyPrediction, setNoRacelyPrediction] = useState(0)
  const [hasPolePrediction, setHasPolePrediction] = useState(0)
  const [hasFastestLapPrediction, setHasFastestLapPrediction] = useState(0)
  const [seasonPaddockData, setSeasonPaddockData] = useState([])

  const getPicksMade = async() => {
    await fetch(baseUrl + '/api/predictions/checklist')
    .then(response => response.json())
    .then(apiPredictionList => {
      setRacelyPrediction(apiPredictionList.racelyPrediction)
      setPreSeasonDriverPrediction(apiPredictionList.preSeasonDriverPrediction)
      setPreSeasonConstructorPrediction(apiPredictionList.preSeasonContructorPrediction)
      setNextRaceName(apiPredictionList.nextRaceName)
      setFirstRace(apiPredictionList.firstRace)
      setLastRaceName(apiPredictionList.lastRaceName)
      setNoRacelyPrediction(apiPredictionList.noRacelyPrediction)
      setHasPolePrediction(apiPredictionList.hasPolePick)
      setHasFastestLapPrediction(apiPredictionList.hasFastPick)
      setSeasonPaddockData(apiPredictionList.paddocks)
    })
  }

    const getLastMidfieldPredictionDate = async () => {
      await fetch(baseUrl + '/api/predictions/season/last-prediction-date/')
      .then(response => response.json())
      .then(apiPrediction => {
        let temp_time = apiPrediction.submittedTime
        let temp_time_string = temp_time.toString()
        let display_time = temp_time_string.slice(0, 5)
        setLastPredictionDate(apiPrediction.submittedDate)
        setLastPredictedTime(display_time)
      })
  }

  const [midSeasonDeadline, setMidSeasonDeadline] = useState("")

  const getMidSeasonDeadline = async () => {
    await fetch(baseUrl + '/api/predictions/deadlines/mid-season/driver-standings/')
    .then(response => response.json())
    .then(deadline => {
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
          setMidSeasonDeadline(deadline.fp1Date + " - " + deadline.fp1StartTime)
          setValidator(0)
        }
        setPageLoading(false)
      },1000);
    })
  }

  const getDeadline = async () => {
    await fetch(baseUrl + '/api/predictions/deadlines/midfeild/next/')
    .then(response => response.json())
    .then(deadline => {
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
        setTime(days + "d:" + hours + "h:" + minutes + "m:" +  seconds + "s")
        if (distance < 0){
          clearInterval(x);
          setTime(deadline.qualiDate + " - " + deadline.qualiStartTime)
        }
        setPageLoading(false)
      },1000);
    })
  }

  console.log(seasonPaddockData)


  if (pageLoading){
    return(
      <div style={{
        marginTop:300,
        display:'flex',
        alignItems:"center",
        justifyContent:'center',
        height:'100%',
        width:'100%'
      }}>
        <ClipLoader color="#BD2031" size={50}/>
      </div>
    )
  }
  else{
  return (

    <div style={{
      marginTop:100,
      flexDirection:'column',
      display:'flex',
      alignItems:'center',
      textAlign:'left',
      justifyContent:'center',
      height:'auto',
      width:'100%',
      marginLeft:15,
      marginRight:15,
      justifyContent:'center',
      }}>
      <div style={{
        display:"flex",
        flexDirection:'column',
        marginRight:10,
        marginLeft:10,
        }}>
        <div>
          <img src="./static/images/logo/padoxlogofull.png" />
        </div>
        {noRacelyPrediction == 0
      ? <div>
          <div style={{
            display:"flex",
            marginTop:16,
            fontSize:16,
            color:"#BD2031",
            fontWeight:'bold',
            }}>
            <div style={{
            }}>Last sumbitted Racely Prediction</div>
          </div>
          <div style={{
            display:"flex",
            marginBottom:16,
            }}>
            <div style={{
              fontStyle:"italic",
            }}>{ lastPredictionDate } - { lastPredictionTime }</div>
          </div>
        </div>
      : null
        }
        <div style={{
          display:"flex",
          }}>
          <div style={{
            fontSize:16,
            color:"#BD2031",
            fontWeight:'bold',
          }}>Next Racely prediction deadline - Q1 / Sprint Race:</div>
        </div>
        <div style={{
          display:"flex",
          }}>
          <div style={{
            fontStyle:"italic",
          }}>{ time }</div>
        </div>
    <div style={{
      display:"flex",
      marginTop:'16px',
      flexDirection:'column',
      }}>
      <div style={{
        display:"grid",
        gridTemplateColumns:"270px 30px",
        flexDriection:"column",
        }}>
        <div style={{
          fontSize:12,
          }}>
          Racely Prediction submitted for {nextRaceName}:
        </div>
          {racelyPrediction == 1
      ? <div style={{
          fontSize:12,
          }}>&#x2705;
        </div>
      : <div style={{
          fontSize:12,
          }}>&#10060;
        </div>
        }
      </div>
    {racelyPrediction == 1
  ? <div></div>
  : <div style={{
      fontSize:12,
      color:"#BD2031",
      }}>
      Defaulting to your {lastRaceName} racely prediction
    </div>
    }
    <div style={{
      display:"flex",
      flexDirection:'column',
      }}>
      <div style={{
        display:"grid",
        gridTemplateColumns:"200px 30px",
        flexDriection:"column",
        }}>
        <div style={{
          fontSize:12,
          }}>
          Fastest Lap For for {nextRaceName}:
        </div>
          {hasFastestLapPrediction == 1
      ? <div style={{
          fontSize:12,
          }}>&#x2705;
        </div>
      : <div style={{
          fontSize:12,
          }}>&#10060;
        </div>
        }
      </div>
    </div>
    <div style={{
      display:"flex",
      flexDirection:'column',
      }}>
      <div style={{
        display:"grid",
        gridTemplateColumns:"200px 30px",
        flexDriection:"column",
        marginRight:"20px",
        }}>
        <div style={{
          fontSize:12,
          }}>
          Pole Lap For for {nextRaceName}:
        </div>
          {hasPolePrediction == 1
      ? <div style={{
          fontSize:12,
          }}>&#x2705;
        </div>
      : <div style={{
          fontSize:12,
          }}>&#10060;
        </div>
        }
      </div>
    </div>
  </div>
  <div style={{
    color:'#BD2031',
    fontWeight:"bold",
    marginTop:16,
    }}>
    Season Predictions
  </div>
  <ul className="dd-list" style={{
    listStyle:"none",
    marginTop:0,
    paddingLeft:0,
    margin:0}}>
    {seasonPaddockData.map(userPaddock => 
      <li key={userPaddock.paddockName} style={{
        fontFamily: "Roboto, sans-serif",
        marginBottom:"20px",}}>
        <div>
          <div style={{
            display:"flex",
            flexDirection:'column',
            }}>
            <div style={{
              fontSize:14,
              marginTop:"4px",
              fontStyle:'italic',
              }}>
              {userPaddock.paddockName}
            </div>
            <div style={{
              display:"flex",
              flexDirection:'column',
              }}>
              <div style={{
                display:"grid",
                gridTemplateColumns:"180px 30px",
                flexDriection:"column",
                }}>
                <div style={{
                  fontSize:12,
                  }}>
                  Constructor standing prediction:
                </div>
                  {userPaddock.preSeasonConstructorPrediction == 1
              ? <div style={{
                  fontSize:12,
                  }}>&#x2705;
                </div>
              : <div style={{
                  fontSize:12,
                  }}>&#10060;
                </div>
                }
              </div>
            </div>
            <div style={{
              display:"flex",
              flexDirection:'column',
              }}>
              <div style={{
                display:"grid",
                gridTemplateColumns:"180px 30px",
                flexDriection:"column",
                }}>
                <div style={{
                  fontSize:12,
                  }}>
                  Driver standing prediction:
                </div>
                  {userPaddock.preSeasonDriverPrediction == 1
              ? <div style={{
                  fontSize:12,
                  }}>&#x2705;
                </div>
              : <div style={{
                  fontSize:12,
                  }}>&#10060;
                </div>
                }
              </div>
            </div>
          </div>
        </div>
      </li>
      )}
    </ul>
      </div>
    </div>
  );
  }
};
export default F1HomePage;

