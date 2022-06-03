import React, { useState, useEffect } from "react";
import { IconContext } from 'react-icons/lib';
import Grid from "@material-ui/core/Grid";
import { baseUrl } from './F1HomePage';
import { ClipLoader } from 'react-spinners';
import * as RiIcons from 'react-icons/ri';
import * as GrIcons from 'react-icons/gr';
import * as CgIcons from 'react-icons/cg';
import * as GiIcons from 'react-icons/gi';
import * as FaIcons from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import { css } from '@emotion/react';

const loaderCss = css`
  margin: 0px;
`

export default function MyConstructorPredictions() {

  const [pageLoading, setPageLoading] = useState(true)

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

    useEffect(() => {
        getUserPaddockData();
      },[])

    const [userPaddockData, setUserPaddockData] = useState({})
    const [loggedInUserId, setLoggedInUserId] = useState(0)

    const getUserPaddockData = async () => {
        await fetch(baseUrl + '/api/paddocks/my-paddocks/')
        .then(response => response.json())
        .then(apiPaddocks => {
        var data = JSON.parse(apiPaddocks)
        setLoggedInUserId(data.user)   
        setUserPaddockData(data)
        setPageLoading(false)
      })
    }

    function goToPrediction(paddockId){
        window.location.href = baseUrl + "/team-predictions/" + paddockId
    }

    if (pageLoading == true){
        return(
            <div class="form-container" style={{
                marginTop:100,
                justifyContent:'center'
                }}>
                <div style={{
                    marginTop:80,
                    textAlign:'center'
                    }}>
                    <h2>
                        My Season Predictions
                    </h2>
                </div>
            <div style={{
                fontSize:20,
                marginBottom:"10px",
                textAlign:'center'
                }}>
                Team Predictions
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
        )
    }
    else{
        return (
            <div class="form-container" style={{
                marginTop:100,
                marginLeft:15,
                marginRight:15,
                justifyContent:'center'
                }}>
                <div style={{
                  justifyContent:'center',
                  textAlign:'center',
                  }}>
                  <h2>My Season Predictions</h2>
                  <div style={{
                        fontSize:20,
                        marginBottom:"10px",
                        }}>
                        Team Predictions
                    </div>
                    </div>
                    <ul style={{
                        listStyle:"none",
                        margin:0,
                        padding:"0px 0px 0px 0px",
                        }}>
                        {userPaddockData['paddocks'].map(paddocks => (
                        <li key={paddocks.id} style={{
                            marginBottom: 25,
                            }}>
                            <div style={{
                                display:"flex",
                                flexDirection:"column",
                                marginBottom:2,
                                borderRadius:50,
                                marginRight:15,
                                maxWidth:600,
                                justifyContent:'center',
                                marginLeft:'auto',
                                marginRight:'auto',
                                }}>
                                <div  
                                    style={{
                                    display:"grid",
                                    gridTemplateColumns: "10px auto 10px auto 10px",
                                    background: "#28282B",
                                    color:"#BD2031",
                                    flexDirecton:"row",
                                    alignItems:"center",
                                    height:"auto",
                                    padding:"10px",
                                    margin:0,
                                    fontSize:18,
                                    borderRadius: "10px 10px 0px 0px",
                                    marginBottom: 4,
                                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                    }}>
                                    <div></div>
                                    <div style={{
                                        fontSize:16,
                                        textAlign:'left',}}>
                                        {paddocks.paddockName}
                                    </div>
                                    <div></div>
                                      {paddocks.paddockName == "International"
                                    ? null
                                    : <div style={{
                                        fontSize:16,
                                        textAlign:'right'}}>
                                        {paddocks.paddockCode}
                                    </div>
                                    }
                                <div></div>
                            </div>       
                        </div>
                        <div style={{
                                display:"flex",
                                flexDirection:"column",
                                marginBottom:0,
                                borderRadius:50,
                                marginRight:15,
                                maxWidth:600,
                                justifyContent:'center',
                                marginLeft:'auto',
                                marginRight:'auto',
                                }}>
                                <div role="button"
                                    onClick={() => goToPrediction(paddocks.id)}
                                    style={{
                                    display:"flex",
                                    background: "#ED944D",
                                    color:"#28282B",
                                    flexDirecton:"row",
                                    justifyContent:"center",
                                    alignItems:"center",
                                    height:"auto",
                                    padding:"5px",
                                    margin:0,
                                    fontSize:18,
                                    borderRadius: "0px 0px 10px 10px",
                                    marginBottom: 0,
                                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                    cursor:"pointer",
                                    }}>
                                    <div>Go To Prediction</div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}