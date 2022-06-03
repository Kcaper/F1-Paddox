import React, { useState, useEffect } from "react";
import { IconContext } from 'react-icons/lib';
import Grid from "@material-ui/core/Grid";
import { baseUrl } from './F1HomePage'

export default function PaddockJoin() {

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
    const [publicPaddockList, setPublicPaddockList] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    const [valid, setValid] = useState(false);

    useEffect(() => {
        getAllPaddockList();
        getPaddockPublicList();
        getUserPaddocksJoinable();
        getUserJoinedPaddocks();
        getBannedList();
        getUserPaddockData();
    },[])

    const getPaddockPublicList = async () => {
        await fetch(baseUrl + '/api/paddocks/public/')
        .then(response => response.json())
        .then(apiPaddocks => {
        var temp_array = []
        for (let i=0; i<apiPaddocks.length; i++){
          var object = {
            "id": apiPaddocks[i].id,
            "paddockName": apiPaddocks[i].paddockName,
            "paddockCode": apiPaddocks[i].paddockCode,
            "numPaddockPlayers": apiPaddocks[i].numPlayers,
            "maxPaddockPlayers": apiPaddocks[i].paddockUserStatusMaxUsers,
          }
          temp_array.push(object)
        }    
        setPublicPaddockList(temp_array)
        })
    }

    const [logggedInUserId, setLoggedInUserId] = useState(0)

    const getUserPaddockData = async () => {
      await fetch(baseUrl + '/api/paddocks/my-paddocks/')
      .then(response => response.json())
      .then(apiPaddocks => {
      var data = JSON.parse(apiPaddocks)
      setLoggedInUserId(data.user)
    })
  }

    const [publicPaddocksJoinable, setPublicPaddocksJoinable] = useState(0)
    const [privatePaddocksJoinable, setPrivatePaddocksJoinable] = useState(0)

    const getUserPaddocksJoinable = async () => {
      await fetch(baseUrl + '/api/paddock/joinable/')
      .then(response => response.json())
      .then(apiPaddocksJoinable => {
      setPublicPaddocksJoinable(apiPaddocksJoinable[0].publicPaddocksJoinable)
      setPrivatePaddocksJoinable(apiPaddocksJoinable[0].privatePaddocksJoinable)
      })
    }

    const [bannedListData, setBannedListData] = useState({})

    const getBannedList = async () => {
      await fetch(baseUrl + '/api/paddock/banned-list/')
      .then(response => response.json())
      .then(apiBannedData => {
      setBannedListData(apiBannedData)
      })
    }

    const getAllPaddockList = async () => {
      await fetch(baseUrl + '/api/paddocks/')
      .then(response => response.json())
      .then(apiPaddocks => {
      var temp_array = []
      for (let i=0; i<apiPaddocks.length; i++){
        temp_array.push(apiPaddocks[i].paddockCode)
      }   
      setPaddockList(temp_array)
      })
    }

    const [userPaddockCodes, setUserPaddockCodes] = useState([])
    const [showSmallError, setShowSmallError] = useState(0)
    const [userPaddockData, setUserPaddockDate] = useState({})

    const getUserJoinedPaddocks = async () => {
      await fetch(baseUrl + '/api/user/paddock-codes/')
      .then(response => response.json())
      .then(apiPaddocks => {
      setUserPaddockDate(apiPaddocks)
      var temp_array = []
      for (let i=0; i<apiPaddocks.length; i++){
        temp_array.push(apiPaddocks[i].paddockCode)
      }
      setUserPaddockCodes(temp_array)
      })
    }

    const [values, setValues] = useState(
        {
            paddockCode: "",
        })

    const handlePaddockCodeChange = (event) => {
        setValues({...values, paddockCode: event.target.value})
        setSmallErrorMessage("")
    }

    const [submitted, setSubmitted] = useState(false);
    const [showDonationPage, setShowDonationPage] = useState(false)

    const [smallErrorMessage, setSmallErrorMessage] = useState("")

    const handleSubmit = (event) => {
      event.preventDefault();
      setShowSmallError(0)

      var paddock_dict={};
      paddock_dict["paddockCode"] = values.paddockCode

      let isPublicPaddock = false
      let isPrivatePaddock = true

      for (let i=0; i<publicPaddockList.length; i++){
        if (publicPaddockList[i]['paddockCode'] == values.paddockCode){
          isPublicPaddock = true
          isPrivatePaddock = false

        }
      }

      let publicPadddocksExceded = true
      let privatePaddocksExceded = true
      
      if (isPublicPaddock == true && publicPaddocksJoinable > 0){
        publicPadddocksExceded=false
      }
      else if (isPrivatePaddock == true && privatePaddocksJoinable > 0){
        privatePaddocksExceded=false
      }
      console.log(publicPaddocksJoinable)
      console.log(privatePaddocksJoinable)
      console.log(publicPadddocksExceded)
      console.log(privatePaddocksExceded)
      if (publicPadddocksExceded == false || privatePaddocksExceded == false){
        fetch(baseUrl + '/api/paddocks/add-user/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
            body: JSON.stringify(paddock_dict)
        })
        .then(async response => {
          console.log(response)
          let isJson = response.headers.get('Content-Type')?.includes('applicataion/json');
          let data = isJson && await response.json();
  
          if(!response.ok) {
            let error = (data && data.message) || response.status;
            if (response.status==403){
              setSmallErrorMessage("* You have been banned from this paddock for the season")
              setShowSmallError(1)
            }
            else if(response.status==400){
              setSmallErrorMessage("* Invalid paddock code")
              setShowSmallError(1)
            }
            else if(response.status==405){
              setSmallErrorMessage("* You have already joined this paddock")
              setShowSmallError(1)
            }
            else if(response.status==409){
              setSmallErrorMessage("* This paddock is Full")
              setShowSmallError(1)
            }
            else{
              alert("There was an error joining this paddock:" + response.message)
            }
            return Promise.reject(error);
          }
          else{
            setSubmitted(true);
            alert("Succesfully Joined Paddock!!")
            window.location.href = baseUrl + "/my-paddocks"
          }
        })      
      }
      else{
        if (isPublicPaddock == true){
          setErrorMessage("You have exceeded the number of public paddocks you can join. Please leave a public paddock before joining another, or you can make a donation to access additional public paddocks.")
          setShowDonationPage(true)
        }
        else if (isPrivatePaddock == true){
          setErrorMessage("You have exceeded the number of private paddocks you can join. Please leave a private paddock before joining another, or you can make a donation to access additional private paddocks.")
          setShowDonationPage(true)
        }
      }
    }
  

    function handleDonateClick(){
      window.location.href = 'https://www.gofundme.com/f/expand-the-f1-tinfoil-hat-development-team?utm_source=customer&utm_medium=copy_link&utm_campaign=p_cf+share-flow-1'
    }

    function handleManagePaddocksClick(){
      window.location.href = baseUrl + "/my-paddocks"
    }
    
  if (showDonationPage == true){
    return (
      <div style={{
        height: "500px"
      }}>
      <div class="form-container" style={{
        width: "300px",
        height: "auto",
        backgroundColor: "#FEFDFB",
        margin: "auto",
        boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
        marginTop: 120
        }}>
        <h1 style={{
          margin:0,
          backgroundColor:"#48A14D",
          color:"#FEFDFB",
          fontSize: 23,
          padding: "20px",
          paddingRight: 0
        }}>Join a Paddock</h1>
        <form class="register-form" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          padding: "10px",
          marginLeft:5,
          marginRight:5,
          }}>
          <div style={{
            margin:'20px',
            }}>
            {errorMessage}
          </div>
          <div role="button"
            onClick={() => handleManagePaddocksClick()}
            style={{
            backgroundColor:"#BD2031",
            color:"#FEFDFB",
            padding:'10px',
            alignItems:'center',
            justifyContent:'center',
            textAlign:'center',
            borderRadius:'8px',
            boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
            cursor:'Pointer',
            margin:'10px'
            }}>
            Manage Paddocks
          </div>
          <div role="button"
            onClick={() => handleDonateClick()}
            style={{
            backgroundColor:"#ED944D",
            color:"#28282B",
            padding:'10px',
            alignItems:'center',
            justifyContent:'center',
            textAlign:'center',
            borderRadius:'8px',
            boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
            cursor:'Pointer',
            marginLeft:'10px',
            marginRight:'10px',
            marginBottom:'15px',
            }}>
            Donate
          </div>
        </form>
        </div>
      </div>
    )
  }
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
        <h1 style={{
          margin:0,
          backgroundColor:"#48A14D",
          color:"#FEFDFB",
          fontSize: 25,
          padding: "20px",
          paddingRight: 0
        }}>Join a Paddock</h1>
        <form class="register-form" onSubmit={handleSubmit} style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          padding: "10px",
          marginLeft:5
        }}>
          {submitted && valid ? <div class="success-message">Succesfully Joined Paddock!</div> : null}
          <Grid>
          <input
            onChange={ handlePaddockCodeChange }  
            value={values.paddockName}  
            id="paddockCode"
            class="form-field"
            type="text"
            placeholder="Paddock Code"
            name="paddockCode"
            style={{
              margin: "10px 0 10px 0",
              padding: "15px",
              fontSize: "16px",
              border: 0,
              fontFamily: "Roboto, sans-serif",
              backgroundColor: "#EDF2F4",
              marginLeft: 5
            }}
          />
          <Grid>
            {showSmallError
          ? <span id="paddock-error">{smallErrorMessage}</span>
          : null}
          </Grid>
          <Grid>
          <button class="form-field" type="submit" style={{
            backgroundColor: "#BD2031",
            color: "#FEFDFB",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            borderRadius: 10,
            height: "40px",
            width: "180px",
            marginTop:20,
            border: "0px",
            marginBottom: 15,
            marginLeft: 5
          }}>
            Join Paddock
          </button>
          </Grid>
          </Grid>
        </form>
      </div>
      <Grid>
      {publicPaddockList.length > 0
    ? <div class="form-container" style={{
        width: "300px",
        height: "auto",
        backgroundColor: "#FEFDFB",
        margin: "auto",
        marginTop: 15
        }}>
        <h3 style={{marginTop:20, marginBottom: 2, marginLeft: 12}}>Public Paddocks</h3>
          <div style={{dislpay:"flex",
            flexDirection:"column",
            justifyContent:"center",
            margin:"auto"}}>
            <div style={{width:"280px",
              display:"grid",
              fontSize:'12px',
              gridTemplateColumns:"150px 60px 60px",
              padding:"3px",
              marginLeft: 14}}>
              <div>Paddock Name</div>
              <div>Players</div>
              <div>Code</div>
            </div>
            {publicPaddockList.map(({paddockName, paddockCode, maxPaddockPlayers, numPaddockPlayers}, index) => (
            <div>
              {numPaddockPlayers < maxPaddockPlayers
            ? <div style={{width:"280px",
                display:"grid",
                fontSize:'12px',
                gridTemplateColumns:"150px 60px 60px",
                padding:"3px",
                fontFamily:"Roboto, sans-serif",
                marginLeft: 14}}>
                <div key={index} style={{
                  }}>
                  { paddockName }
                </div>
                <div key={index}>
                  {numPaddockPlayers}/{maxPaddockPlayers}
                </div>
                <div key={index}>
                  { paddockCode }
                </div>
              </div>
            : null}
            </div>
            ))}
          </div>
        </div>
      :  <Grid>
        <h3 style={{margin:"auto", color:"#FEFDFB", marginTop:"20px"}}>No Public Paddocks</h3>
        </Grid>}
      </Grid>
      </div>
    );
  }
}