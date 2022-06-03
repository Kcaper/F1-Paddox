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
import { useParams } from 'react-router-dom';
import * as RiIcons from 'react-icons/ri';
import createTypography from '@material-ui/core/styles/createTypography';

const loaderCss = css`
  margin-top: 16px;
  width: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
`

function manualResultCapture() {

  const params = useParams()

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
    const [confirmationMessage, setConfirmationMessage] = useState("Complete all")
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
      getPaddockName()
      getDeadline()
      getResultSubmitValidation();
      getDrivers();
    },[]);

    const [paddockName, setPaddockName] = useState("")

    const [validationMessage, setValidationMessage] = useState("")
    const [userIsValid, setUserIsValid] = useState(0)

    const [validationData, setValidationData] = useState({})

    const getResultSubmitValidation = async () => {
      await fetch(baseUrl + '/api/manual-results/validation/' + params['id'] + "/")
      .then(response => response.json())
      .then(userValidation => {
        let object = JSON.parse(userValidation)
        setValidationData(object)
        
        if(object.serverError == 1){
          setValidationMessage("Server error please try again")
          setUserIsValid(0)
          setPageLoading(false)
        }
        else if(object.generatingResult == 1){
          setValidationMessage("Another user is currently generating a leaderboard please try again later")
          setUserIsValid(0)
          setPageLoading(false)
        }
        else if(object.isPaddockAdmin == 0){
          setValidationMessage("Only paddock admins can generate manual results")
          setUserIsValid(0)
          setPageLoading(false)
        }
        else if(object.isPaddockAdmin == 1 && object.generatingResult == 0){
          setUserIsValid(1)
          setPageLoading(false)
        }
      })
    }

    const getPaddockName = async () => {
      await fetch(baseUrl + '/api/paddocks/paddock-name/' + params['id'] + "/")
      .then(response => response.json())
      .then(apiPaddockName => {
        let object = JSON.parse(apiPaddockName)
        setPaddockName(object.paddockName)
      })
    }

    const [ruleSetName, setRuleSetName] = useState("")
    const [maxPickableDrivers, setMaxPickableDrivers] = useState(0)
    const [driverObject, setDriverObject] = useState([])
    const [pickThreshold, setPickThreshold] = useState(0)

    const getDrivers = async () => {
      await fetch(baseUrl + '/api/drivers/paddock-drivers/' + params['id'] + '/')
      .then(response => response.json())
      .then(apiDrivers => {
        let object = JSON.parse(apiDrivers)
        setRuleSetName(object.ruleSetName)
        setMaxPickableDrivers(object.maxPickableDrivers)
        setRaceId(object.seasonCalendarId)
        updatedrivers(object.drivers)
        setUser(object.user)
        setPredictionType(object.isFeatureRaceMidfield)
        createInitalPrediction(object.drivers, object.numDrivers)
        setCircuitCountry(object.circuitInfo.country)
        setCircuitFlag(object.circuitInfo.circuitFlagImageLocation)
        setCircuitName(object.circuitInfo.circuitName)
        setCircuitRef(object.circuitInfo.circuitRef)
        setIsDemo(object.isDemo)
        setAboveDriverCount(object.aboveCount)
        setPickThreshold(object['drivers'].length)
      })
    }

    const [subMaxPickableDrivers, setSubMaxPickableDrivers] = useState(20)

    const [subDriverData, setSubDriverData] = useState([]);
    const [subDriverPrediction, setSubDriverPrediction] = useState([])

    const getSubDrivers = async () => {
      await fetch(baseUrl + '/api/drivers/all/' + params['id'] + "/")
      .then(response => response.json())
      .then(apiDrivers => {
        let object = JSON.parse(apiDrivers)
        setMaxPickableDrivers(object.maxPickableDrivers)
        setRaceId(object.seasonCalendarId)
        setUser(object.user)
        setPredictionType("subsitutions")
        setSubDriverData(object.drivers)
        setSubDriverPrediction(object.drivers)
        createInitalPrediction(object.drivers, object.drivers.length)
        setCircuitCountry(object.circuitInfo.country)
        setCircuitFlag(object.circuitInfo.circuitFlagImageLocation)
        setCircuitName(object.circuitInfo.circuitName)
        setCircuitRef(object.circuitInfo.circuitRef)
        setIsDemo(object.isDemo)
        setPickThreshold(2)
        setOutgoingDriverId(object.drivers[0].id)
        setIncomingDriverId(object.drivers[1].id)
        setPageLoading(false)
      })
    }

    const [poleDriverData, setPoleDriverData] = useState([]);
    const [fastestLapDriverData, setFastestLapDriverData] = useState([]);

    const getFastDrivers = async () => {
      await fetch(baseUrl + '/api/drivers/paddock-drivers/' + params['id'] + '/')
      .then(response => response.json())
      .then(fastPoleDrivers => {
        let object = JSON.parse(fastPoleDrivers)

        let temp_fastest_lap_element = {}
        let fast_driver_object_list = []

        if (object.fastLapFound == 1){
          for (let i=0; i<object['drivers'].length; i++){
            if (object['drivers'][i].hasFastestLap == 1){
              temp_fastest_lap_element = object.drivers[i]
            }
            else{
              fast_driver_object_list.push(object.drivers[i])
            }
          }
          fast_driver_object_list.splice(0,0,temp_fastest_lap_element)
          setFastestLapDriverData(fast_driver_object_list);
          updatedrivers(fast_driver_object_list)
        }
        else{
          setFastestLapDriverData(object.drivers)
          updatedrivers(object.drivers)
        }
        setPageLoading(false)
      })
    }

    const getPoleDrivers = async () => {
      await fetch(baseUrl + '/api/drivers/paddock-drivers/' + params['id'] + '/')
      .then(response => response.json())
      .then(fastPoleDrivers => {
        let object = JSON.parse(fastPoleDrivers)

        let temp_pole_sitter_element = {}
        let pole_driver_object_list = []

        if(object.poleLapFound == 1){
          for (let i=0; i<object['drivers'].length; i++){
            if (object.drivers[i].hasPolePosition == 1){
              temp_pole_sitter_element = object.drivers[i]
            }
            else{
              pole_driver_object_list.push(object.drivers[i])
            }
          }
          pole_driver_object_list.splice(0,0,temp_pole_sitter_element)
          updatedrivers(pole_driver_object_list);
          setPoleDriverData(pole_driver_object_list);
        }
        else{
          setPoleDriverData(object.drivers)
          updatedrivers(object.drivers)
        }
        setPageLoading(false)
      })
    }

    const [flagData, setFlagData] = useState([])

    const getFlags = async () => {
      await fetch(baseUrl + '/api/flags/')
      .then(response => response.json())
      .then(flags => {
        setFlagData(flags)
      })
    }
      
    const [paddockId, setPaddockId] = useState(params['id'])

    const getDeadline = async () => {
      await fetch(baseUrl + '/api/predictions/deadlines/manualPickDeadline/' + paddockId + '/')
      .then(response => response.json())
      .then(deadline => {
        setValidator(1)
        let countDownString = deadline['timePlus5Mins']
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
          setTime(minutes + "m : " +  seconds + "s" + " (Submissions saved)")
          if (distance < 0){
            clearInterval(x);
            setTime("Time up")
            //window.location.href = "/my-paddocks"
            //setValidator(0);
          }
          setPageLoading(false)
        },1000);
      })
    }

    const [racelyDriverSelection, setRacelyDriverSelection] = useState(0)

    const [polePrediction, setPolePrediction] = useState(0)
    const [fastestLapPrediction, setFastestLapPrediction] = useState(0)

    const [subIsReserveDriver, setSubisReserveDriver] = useState(0)

    const [incomingDriverId, setIncomingDriverId] = useState(0)
    const [outgoingDriverId, setOutgoingDriverId] = useState(0)

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
      else if (substituteOpen == 1){
        const items = Array.from(subDriverData);
        const predItems = Array.from(subDriverPrediction);
        const [reorderedItem] = items.splice(result.source.index, 1);
        const [reorderedPrediction] = predItems.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        predItems.splice(result.destination.index, 0, reorderedPrediction);
        if (predItems[0].isReserveDriver == 1){
          return
        }
        setSubDriverData(items)
        setSubDriverPrediction(predItems);
        if (predItems[1].isReserveDriver == 1){
          setSubisReserveDriver(1)
        }
        else{
          setSubisReserveDriver(0)
        }
        setOutgoingDriverId(predItems[0].id)
        setIncomingDriverId(predItems[1].id)
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

    const [category, setCategory] = useState("Formula1")

    function submitManualResult() {
      setLoading(true)
      let manual_results_dict = {}
      manual_results_dict["seasonCalendar_id"] = raceId
      manual_results_dict['isManualResult'] = 1
      manual_results_dict['category'] = category
      manual_results_dict['paddock_id'] = params['id']
      manual_results_dict['results'] = []

      for (let i=0; i<numDrivers; i++){
        console.log(drivers[i]['id'])
        manual_results_dict['results'].push({
          "Driver" : {
            "driver_id" : drivers[i]["id"]
          }
        })
      }
      if (submissionVaidator == 1){
        fetch(baseUrl + '/api/manual-results/result/submit/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          },
          body: JSON.stringify(manual_results_dict)
        })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setConfirmationMessage("There was an error submitting your manual results:" + error.toString())
            setPickConfirmation(true)
            setLoading(false)
            setPageLoading(false)
            return Promise.reject(error);
          }
          else{
            setConfirmationMessage("Your results have been sumitted.")
            setPickConfirmation(true)
            setLoading(false)
            setPageLoading(false)
            setResultDone(1)
          }
        })
      }
      else{
        setConfirmationMessage("Cannot submit, you have run out of time. Please try again")
        setPickConfirmation(true)
        setLoading(false)
      }
      };

      function handelSubmitSubstitutionClick(){
        setLoading(true)
        setPageLoading(true)
        let sub_dict = {}
        sub_dict['paddock_id'] = paddockId;
        sub_dict['outgoingDriver_id'] = outgoingDriverId;
        sub_dict['incomingDriver_id'] = incomingDriverId;
        fetch(baseUrl + '/api/manual-results/substitution/submit/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          },
          body: JSON.stringify(sub_dict)
        })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setConfirmationMessage("There was an error submitting your substitution results:" + error.toString())
            setLoading(false)
            setPageLoading(false)
            setPickConfirmation(true)
            setSubstituteOpen(0)
            return Promise.reject(error);
          }
          else{
            setConfirmationMessage("Your driver substitution was made")
            setLoading(false)
            setPageLoading(false)
            setPickConfirmation(true)
            setSubstituteOpen(0)
          } 
        }) 
      };

      function submitPoleResult() {
        setLoading(true)
        setPoleSelection(0)
        setPickConfirmation(true)
        let prediction_dict = {}
        prediction_dict['driver_id'] = poleDriverData[0]["id"]
        prediction_dict['paddock_id'] = paddockId
        
        fetch(baseUrl + '/api/manual-results/pole-sitter/submit/', {
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
              setConfirmationMessage("There was an error submitting your pole result:" + error.toString())
              setPickConfirmation(true)
              setLoading(false)
              setPageLoading(false)
              return Promise.reject(error);
            }
            else{
              setConfirmationMessage("Your pole sitter result was submitted!!")
              setPickConfirmation(true)
              setLoading(false)
              setPageLoading(false)
              setPoleLapDone(1)
            }
          })
        };

        function submitFastestLapResult() {
          setLoading(true)
          setFastestLapSelection(0)
          setPickConfirmation(true)
          let prediction_dict = {}
          prediction_dict['driver_id'] = fastestLapDriverData[0]["id"]
          prediction_dict['paddock_id'] = paddockId
          
          fetch(baseUrl + '/api/manual-results/fastest-lap/submit/', {
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
                setConfirmationMessage("There was an error submitting your fastest lap result:" + error.toString())
                setPickConfirmation(true)
                setLoading(false)
                return Promise.reject(error);
              }
              else{
                setConfirmationMessage("Your fastest lap result was submitted!!")
                setPickConfirmation(true)
                setLoading(false)
                setFastestLapDone(1)
              }
            })
          };

    const [finalErrorMessage, setFinalErrorMessage] = useState("")

    function handleOnDoneClick(){
      if (resultDone == 0){
        setFinalErrorMessage("Please submit a result to continue")
      }
      else{
        
        //also need to manipulate the db for the manual entry and countdown etc
        window.location.href = baseUrl + "/leaderboards/" + paddockId
      }
    }

    function redirectToLogin(){
      setLoading(true)
      window.location.href = baseUrl + "/api/logout"
    }

    const [substituteOpen, setSubstituteOpen] = useState(0)
    const [poleSelection, setPoleSelection] = useState(0)
    const [fastestLapSelection, setFastestLapSelection] = useState(0)
    const [poleLapLoad, setPoleLapLoad] = useState(0)
    const [fastestLapLoad, setFastestLapLoad] = useState(0)
    const [finalResultLoad, setFinalResultLoad] = useState(0)

    function handleOnRacelyClick(){
      setPageLoading(true)

      getDrivers()

      setLoading(false)
      setPickConfirmation(false)

      setPoleLapLoad(0)
      setFastestLapLoad(0)
      setSubstituteOpen(0)
      setFinalResultLoad(1)
      setAddNewDriverLoad(0)

      setPoleSelection(0)
      setFastestLapSelection(0)
      setRacelyDriverSelection(1)
      setFinalErrorMessage("")
    }

    function handleOnSubClickClick(){
      setPageLoading(true)

      getSubDrivers()

      setLoading(false)
      setPickConfirmation(false)

      setPoleLapLoad(0)
      setFastestLapLoad(0)
      setSubstituteOpen(1)
      setFinalResultLoad(0)
      setAddNewDriverLoad(0)

      setPoleSelection(0)
      setFastestLapSelection(0)
      setRacelyDriverSelection(0)
      setFinalErrorMessage("")
    }

    function handleOnPoleSitterClick(){
      setPageLoading(true)

      getPoleDrivers();

      setLoading(false)
      setPickConfirmation(false)

      setPoleLapLoad(1)
      setFastestLapLoad(0)
      setSubstituteOpen(0)
      setFinalResultLoad(0)
      setAddNewDriverLoad(0)
      
      setPoleSelection(1)
      setFastestLapSelection(0)
      setRacelyDriverSelection(0)
      setFinalErrorMessage("")
    }

    function handleOnFastestLapClick(){
      setPageLoading(true)

      getFastDrivers();

      setLoading(false)
      setPickConfirmation(false)

      setPoleLapLoad(0)
      setFastestLapLoad(1)
      setSubstituteOpen(0)
      setFinalResultLoad(0)
      setAddNewDriverLoad(0)
      
      setPoleSelection(0)
      setFastestLapSelection(1)
      setRacelyDriverSelection(0)
      setFinalErrorMessage("")
    }

    function handlePoleLapSubmitClick(){
      setPageLoading(true)
      submitPoleResult()

      setPoleLapLoad(0)
      setFastestLapLoad(0)
      setSubstituteOpen(0)
      setFinalResultLoad(0)
      setAddNewDriverLoad(0)
      
      setPoleSelection(0)
      setFastestLapSelection(1)
      setRacelyDriverSelection(0)
    }

    function handleFastestLapSubmitClick(){
      setPageLoading(true)
      submitFastestLapResult()

      setPoleLapLoad(0)
      setFastestLapLoad(1)
      setSubstituteOpen(0)
      setFinalResultLoad(0)
      setAddNewDriverLoad(0)
      
      setPoleSelection(0)
      setFastestLapSelection(1)
      setRacelyDriverSelection(0)
    }

    function handleCancelClick(){
      window.location.href = baseUrl + "/my-paddocks"
    }

    const [fastestLapDone, setFastestLapDone] = useState(0)
    const [poleLapDone, setPoleLapDone] = useState(0)
    const [resultDone, setResultDone] = useState(0)

    const [addNewDriverLoad, setAddNewDriverLoad] = useState(0)

    function handleAddDriverClick(){
      getFlags()
      setLoading(false)
      setPageLoading(true)
      setPickConfirmation(false)
      setRacelyDriverSelection(0)
      setFastestLapSelection(0)
      setPoleSelection(0)
      setPoleLapLoad(0)
      setFastestLapLoad(0)
      setSubstituteOpen(0)
      setAddNewDriverLoad(1)
      setDriverValues({
        code: "",
        permanentNumber: "",
        firstName : "",
        surname : "",
      
      })
    }

    function handleBackClick(){
      setLoading(false)
      setPageLoading(true)
      setPickConfirmation(true)
      setRacelyDriverSelection(0)
      setFastestLapSelection(0)
      setPoleSelection(0)
      setPoleLapLoad(0)
      setFastestLapLoad(0)
      setSubstituteOpen(0)
      setAddNewDriverLoad(0)
    }

    const [driverValues, setDriverValues] = useState(
    {
        code: "",
        permanentNumber: "",
        firstName : "",
        surname : "",
    })

    const handleFirstNameChange = (event) => {
        setDriverValues({...driverValues, firstName: event.target.value})
        setNewDriverSmallError("")
        setShowNewDriverSmallError(0)
    }

    const handleSurnameChange = (event) => {
      setDriverValues({...driverValues, surname: event.target.value})
      setNewDriverSmallError("")
      setShowNewDriverSmallError(0)
    }

    const handleCodeChange = (event) => {
      setDriverValues({...driverValues, code: event.target.value})
      setNewDriverSmallError("")
      setShowNewDriverSmallError(0)
    }

    const handlePermanentNumberChange = (event) => {
      setDriverValues({...driverValues, permanentNumber: event.target.value})
      setNewDriverSmallError("")
      setShowNewDriverSmallError(0)
    }

      const [countryChanged, setCountryChanged] = useState("None")
      const [selectedCountry, updateSelectedCountry] = useState(0)

      const [newDriverSmallError, setNewDriverSmallError] = useState(0)
      const [showNewDriverSmallError, setShowNewDriverSmallError] = useState(0)

      const handleConfirmAddDriverClick = (event) => {
        setShowNewDriverSmallError(1)

        let regex = /[^A-Za-z0-9]/g
        let hasOnlyLetters = /^[a-zA-Z]+$/

        let forname_string = driverValues.firstName.toString()
        let forname_ex_whitespace_string = forname_string.replace(/\s+/g, '')
        let driver_forname_is_valid = hasOnlyLetters.test(forname_ex_whitespace_string)
        let forname_ex_numeric_string = forname_ex_whitespace_string.replace(/[0-9]/g, '')
        let forname_ex_special_string = forname_ex_numeric_string.replace(regex, "")
        let final_forname_string = forname_ex_special_string.toString().charAt(0).toUpperCase() + forname_ex_special_string.slice(1).toLowerCase()

        let surname_string = driverValues.surname.toString()
        let surname_ex_whitespace_string = surname_string.replace(/\s+/g, '')
        let driver_surname_is_valid = hasOnlyLetters.test(surname_ex_whitespace_string)
        let surname_ex_numeric_string = surname_ex_whitespace_string.replace(/[0-9]/g, '')
        let surname_ex_special_string = surname_ex_numeric_string.replace(regex, "")
        let final_surname_string = surname_ex_special_string.toString().charAt(0).toUpperCase() + surname_ex_special_string.slice(1).toLowerCase()

        let driver_code_is_valid = hasOnlyLetters.test(driverValues.code.toString())
        
        var driver_dict={};
        driver_dict["forename"] = final_forname_string;
        driver_dict["surname"] = final_surname_string
        driver_dict['code'] = driverValues.code.toString().toUpperCase();
        driver_dict['number'] = parseInt(driverValues.permanentNumber);
        driver_dict['flag'] = selectedCountry;
        driver_dict['isOnGrid'] = 0;
        driver_dict['isIncludedInPredictions'] = 0;
        driver_dict['currentTeam'] = 12;
        driver_dict['thumbImgLocation'] = "./static/images/Drivers/genericDriver.png";

        let existingDriverCodeList = []
        let existingDriverNumberList = []
        let existingDriverFullNameList = []
        let code_length_error = 0
        let existing_code_error = 0
        let number_value_error = 0
        let existing_number_error = 0
        let full_name_erorr = 0
        let first_name_length_error = 0;
        let surname_length_error = 0
        let country_changed_error = 0;
        let error = 0

        for (let i=0; i<subDriverData.length; i++){
          existingDriverCodeList.push(subDriverData[i].code)
          existingDriverNumberList.push(subDriverData[i].permanentNumber)
          existingDriverFullNameList.push(subDriverData[i].firstName.toString().toLowerCase() +  " " + subDriverData[i].driverSurname.toString().toLowerCase())
        }

        if (driver_dict["surname"] == "Roijen"){
          error = 1
          setNewDriverSmallError("Chris, you will never, ever, ever, ever, ever, ever, ever, be an F1 Driver. LOL")
        }
        else if (driver_dict['forename'].length < 2){
          first_name_length_error = 1;
          error = 1;
          setNewDriverSmallError("Driver first name is too short. ")
        }
        else if (driver_forname_is_valid == false){
          surname_length_error = 1;
          error = 1;
          setNewDriverSmallError("Driver first name is invalid. ")
        }
        else if (driver_dict['surname'].length < 2){
          surname_length_error = 1;
          error = 1;
          setNewDriverSmallError("Driver surname name is too short. ")
        }
        else if (driver_surname_is_valid == false){
          surname_length_error = 1;
          error = 1;
          setNewDriverSmallError("Driver surname is invalid. ")
        }
        else if (existingDriverFullNameList.includes(driver_dict['forename'].toString().toLowerCase() + " " +  driver_dict['surname'].toString().toLowerCase())){
          full_name_erorr = 1;
          error = 1;
          setNewDriverSmallError("A driver with this name already exists. ")
        }
        if (error == 0){
          try{
            if(driver_dict['number'] - driver_dict['number']==0){
            }
            else{
              number_value_error = 1;
              error = 1;
              setNewDriverSmallError("Please enter the driver's offical number. ")
            }
          }
          catch{
            number_value_error = 1;
            error = 1;
            setNewDriverSmallError("Please enter the driver's offical number. ")
          }
        }
        if (error == 0 && driver_dict['number'] > 99 || driver_dict['number'] < 2){
          number_value_error = 1;
          error = 1;
          setNewDriverSmallError("Driver number must be between 2 and 99. It is important that this number is correct. Lewis Hamilton's number for example is 44.")
        }
        else if (error == 0 && existingDriverNumberList.includes(driver_dict['number'])){
          existing_number_error = 1
          error = 1
          setNewDriverSmallError("Driver number " + driver_dict['number'] + " is already assigned to a driver. ")
        }
        else if (error === 0 && driver_dict['code'].length == 0){
          code_length_error = 1
          error = 1
          setNewDriverSmallError("Enter driver offical 3 letter CODE.")
        }
        else if (error === 0 && driver_code_is_valid == false){
          existing_code_error = 1
          error = 1
          setNewDriverSmallError("Invalid driver code, EG. VET, HAM, LEC.")
        }
        else if (error === 0 && driver_dict['code'].length != 3){
          code_length_error = 1
          error = 1
          setNewDriverSmallError("Driver code must be exacly 3 Characters long. EG. VET, HAM, LEC. It is important that this CODE is correct.")
        }
        else if (error === 0 && existingDriverCodeList.includes(driver_dict['code'])){
          existing_code_error = 1
          error = 1
          setNewDriverSmallError("Driver code " + driver_dict['code'] + " is already assigned to a driver. It is important that this CODE is correct.")
        }
        else if (error === 0 && countryChanged == "None"){
          country_changed_error = 1;
          error = 1;
          setNewDriverSmallError("Please select the drivers nationality. ")
        }

        if (error == 0){
          fetch(baseUrl + '/api/drivers/paddock-drivers/create/' + params['id'] + "/", {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken,
          },
              body: JSON.stringify(driver_dict)
          })
          .then(async response => {
            let isJson = response.headers.get('Content-Type')?.includes('applicataion/json');
            let data = isJson && await response.json();
    
            if(!response.ok) {
              let error = (data && data.message) || response.status;
              
              alert("There was an error creating this driver:" + response.message)
              
              return Promise.reject(error);
            }
            else{
              alert("Succesfully created driver!!")
              handleBackClick()
            }
          })      
        }
        else{
          setShowNewDriverSmallError(1)
        }
      }

    

    if (pageLoading){
      return(
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
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
      if (userIsValid == 0){
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
                Manual Result Capture
              </h2>
                <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
                <h3 style={{marginBottom:15, marginTop:15}}>
                  { circuitRef } - {circuitCountry}<br></br> { circuitName }
                </h3>
                <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                  marginRight:0, marginTop:0}}>
                
                <div style={{
                  display:"flex",
                  justifyContent:"center",
                  alignItems:"center",
                  width: "100%",
                  fontSize:"12px",
                  }}>
                  { validationMessage }
                </div>
                </div>
              </header>
            </div>
          </div>
          </div>
        )
      }
      else if (pickCofirmation == true){
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
                Manual Result Capture
              </h2>
                <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
                <h3 style={{marginBottom:15, marginTop:15}}>
                  { circuitRef } - {circuitCountry}<br></br> { circuitName }
                </h3>
                <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                  marginRight:0, marginTop:0}}>
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
                  padding:"2px 0px 2px 0px",
                  marginTop:0,
                  marginLeft:0,
                  zIndex:5,
                  marginRight:0}}>
                  Time to complete submission<br></br>{ time }
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
                    <div style={{
                      color:"red",
                      marginLeft:'20px',
                      marginRight:'20px',
                      fontSize:"12px",
                      }}>
                      {finalErrorMessage}
                    </div>
                    <div role="button" onClick={() => handleOnSubClickClick()} style={{
                      display:"flex",
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      justifyContent:'center',
                      alignItems:'center',
                      backgroundColor:"repeating-conic-gradient(#808080 0% 25%, transparent 15% 50%) 50% / 20px 20px",
                      color: "#28282B",
                      height:50,
                      backgroundColor:"#ED944D",
                      alignContent:'center',
                      borderRadius: 20,
                      fontSize:18,
                      marginBottom:15,
                      marginTop:15,
                      marginLeft:30,
                      marginRight:30,
                      cursor:"pointer",
                      }}>
                      Driver Substitutions
                    </div>
                    <div role="button" onClick={() => handleOnPoleSitterClick()} style={{
                      display:"flex",
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      justifyContent:'center',
                      alignItems:'center',
                      backgroundColor:"#FEFDFB",
                      color: "#28282B",
                      height:50,
                      alignContent:'center',
                      borderRadius: 20,
                      fontSize:18,
                      marginBottom:15,
                      marginLeft:30,
                      marginRight:30,
                      cursor:"pointer",
                      }}>
                      Pole or sprint winner
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
                    <div role="button" onClick={() => handleOnRacelyClick()} style={{
                      display:"flex",
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      justifyContent:'center',
                      alignItems:'center',
                      backgroundColor:"#28282B",
                      color: "#BD2031",
                      height:50,
                      alignContent:'center',
                      borderRadius: 20,
                      fontSize:18,
                      marginBottom:15,
                      marginLeft:30,
                      marginRight:30,
                      cursor:"pointer",
                      }}>
                      Race Results
                    </div>
                    {loading == false
                  ? <div role="button" onClick={() => handleOnDoneClick()} style={{
                      display:"grid",
                      gridTemplateColumns:"117px 6px 117px",
                      flexDirection:"row",
                      justifyContent:'center',
                      alignItems:'center',
                      justifyContent:'center',
                      alignContent:'center',
                      height:50,
                      width:"240px",
                      marginBottom: 15,
                      fontSize:18,
                      marginLeft:30,
                      marginRight:30,
                      cursor:"pointer",
                      }}>
                      <div role="button" onClick={() => handleCancelClick()} style={{
                        textAlign:"center",
                        display:"flex",
                        justifyContent:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        alignContent:'center',
                        backgroundColor:"#BD2031",
                        color: "#FEFDFB",
                        height:"50px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        borderRadius: "20px 0px 0px 20px",
                        height:"50px",
                        }}>
                          Cancel
                      </div>
                      <div></div>
                      <div role="button" onClick={() => handleOnDoneClick()} style={{
                        display:"flex",
                        textAlign:"center",
                        justifyContent:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        alignContent:'center',
                        height:"50px",
                        backgroundColor:"#48A14D",
                        color: "#FEFDFB",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        borderRadius: "0px 20px 20px 0px",
                        }}>
                          Complete
                      </div>
                    </div>
                  : <div role="button" onClick={() => handleOnDoneClick()} style={{
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

    else if (finalResultLoad == 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0}}>
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
                  padding:"2px 0px 2px 0px",
                  }}>
                  Time to complete submission<br></br>{ time }
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
                  Demo Pole Result for {circuitRef}
                </p>
              : isDemo == 1 && user != 0
              ? <p style={{
                  backgroundColor:"#28282B",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
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
                  Create Interim Result
                </p>
              : <p style={{
                  backgroundColor:"#28282B",
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
                  Create interim Result
                </p>}
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="drivers">
                {(provided) => (
                  <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                    display:'flex',
                    alignItems:'center',
                    position:'relative',
                    padding:"0px 0px 0px 0px",
                    }}>
                    {drivers.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, constructorIconColor}, index) => {
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
                                gridTemplateColumns: '20px 40px 70px 110px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", 
                                }}>
                            <div style={{
                              fontStyle:"italic"
                            }}>{ index + 1 }</div>
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
                                <img src={"." + thumb} alt={null} style={{
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
                                <img src={"." + flag} alt={null} />
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
                <div role="button" onClick={() => handleBackClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "40px",
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
                <div role="button" onClick={() => submitManualResult()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "40px",
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
                  Submit Result
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

    else if (substituteOpen == 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0}}>
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
                  padding:"2px 0px 2px 0px",
                  }}>
                  Time to complete submission<br></br>{ time }
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
                  backgroundColor:"#ED944D",
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
                  Substitute drivers
                </p>
              : <p style={{
                  backgroundColor:"#ED944D",
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
                  Substitute drivers
                </p>}
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="drivers">
                {(provided) => (
                  <ul className="drivers" {...provided.droppableProps} ref={provided.innerRef} style={{
                    display:'flex',
                    alignItems:'center',
                    position:'relative',
                    padding:"0px 0px 0px 0px",
                    }}>
                    {subDriverData.map(({id, code, icon, flag, thumb, constructorName, constructor_logo, driverSurname, constructorIconColor, isReserveDriver, subbedWith, subbedBy}, index) => {
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
                                gridTemplateColumns: '40px 80px 110px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",  
                                }}>
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
                              {index +1 == 1 && subIsReserveDriver==0
                            ? <div style={{
                                position: "relative",
                                textAlign: "center",
                                }}>
                                <div className="driver-thumb" style={{
                                  marginLeft:5}}>
                                  <img src={"." + thumb} alt={null} style={{
                                  borderRadius:50,
                                  opacity:0.2,
                                  }}/>
                                  </div>
                                  <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    color:"#BD2031",
                                    fontWeight:"bold",
                                    fontStyle:"italic",
                                  }}>
                                  Swop Teams
                                </div>
                                </div>
                            : index+1 == 1 && subIsReserveDriver==1
                            ? <div style={{
                              position: "relative",
                              textAlign: "center",
                              }}>
                                <div className="driver-thumb" style={{
                                  marginLeft:5}}>
                                  <img src={"." + thumb} alt={null} style={{
                                  borderRadius:50,
                                  opacity:0.2,
                                }}/>
                                </div>
                                <div style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  color:"#BD2031",
                                  fontWeight:"bold",
                                  fontStyle:"italic",
                                  }}>
                                  Bench
                                </div>
                              </div>
                            : index+1 == 2 && subIsReserveDriver==1
                            ? <div style={{
                              position: "relative",
                              textAlign: "center",
                              }}>
                                <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    color:"#48A14D",
                                    fontWeight:"bold",
                                    fontStyle:"italic",
                                  }}>
                                  Sub
                                </div>
                                <div className="driver-thumb" style={{
                                  marginLeft:5}}>
                                  <img src={"." + thumb} alt={null} style={{
                                  borderRadius:50,
                                  opacity:0.2,
                                }}/>
                                </div>
                              </div>
                            : index+1 == 2 && subIsReserveDriver==0
                            ? <div style={{
                              position: "relative",
                              textAlign: "center",
                              }}>
                                <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    color:"#BD2031",
                                    fontWeight:"bold",
                                    fontStyle:"italic",
                                  }}>
                                  Swop Teams
                                </div>
                                <div className="driver-thumb" style={{
                                  margin:5,
                                  }}>
                                  <img src={"." + thumb} alt={null} style={{
                                  borderRadius:50,
                                  opacity:0.2,
                                }}/>
                                </div>
                              </div>
                            : index > 1
                            ? <div className="driver-thumb" style={{
                                marginLeft:5}}>
                                <img src={"." + thumb} alt={null} style={{
                                borderRadius:50,
                              }}/>
                              </div>
                            : null}
                              <div className="driver-code" style={{
                                justifyDirection:'column', textAlign:'center',
                                marginLeft:8, paddingLeft:'3px'
                                }}>
                                {index+1 == 1
                              ? <div style={{
                                  fontWeight:"bold",
                                  fontStyle:"italic",
                                  color:"#BD2031",
                                  }}>
                                  Substitute
                                </div>
                              : index+1 == 2
                              ? <div style={{
                                  fontWeight:"bold",
                                  fontStyle:"italic",
                                  color:"#48A14D",
                                  }}>
                                  With
                                </div>
                              : null
                                } 
                                <div style={{fontSize:18}}>
                                  { driverSurname }
                                </div>
                                <div style={{fontSize:12}}>
                                  {constructorName}
                                </div>
                                {subbedWith != 0
                              ? <div style={{
                                  fontWeight:"bold",
                                  fontSize:8,
                                  color:"#48A14D",
                                  marginTop:'3px',
                                  }}>
                                  *Driving {subbedWith}'s car'
                                </div>
                              : null}
                                {subbedBy != 0
                                ? <div style={{
                                  fontWeight:"bold",
                                  fontSize:8,
                                  color:"#BD2031",
                                  marginTop:"1px",
                                  }}>
                                  *Subbed by {subbedBy}
                                </div>
                              : null}
                              </div>
                              <div className="driver-flag" style={{paddingLeft:'15px'
                                }}>
                                <img src={"." + flag} alt={null} />
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
                <div role="button" onClick={() => handelSubmitSubstitutionClick()} style={{
                  borderRadius:50,
                  display:"flex",
                  justifyContent:'center',
                  alignItems:'center',
                  backgroundColor:"#ED944D",
                  minWidth:"210px",
                  color: "#FEFDFB",
                  height:50,
                  alignContent:'center',
                  borderRadius: 50,
                  fontSize:17,
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  cursor:"pointer",  
                  }}>
                  Submit Substitution
                </div>
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
                <div role="button" onClick={() => handleBackClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "40px",
                  minWidth: "100px",
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
                <div role="button" onClick={() => handleAddDriverClick()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "40px",
                  minWidth: "100px",
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
                  Add Driver
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

    else if (fastestLapLoad === 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0}}>
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
                  padding:"2px 0px 2px 0px",
                  }}>
                  Time to complete submission<br></br>{ time }
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
                  Who recorded the fastest lap even if they were outside of the top 10?
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
                  Who recorded the fastest lap even if they were outside of the top 10?
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
                                gridTemplateColumns: '20px 20px 80px 110px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                backgroundColor:"#9370DB",
                                color: "#FEFDFB",  
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
                                <div className="driver-thumb" style={{marginLeft:5}}>
                                  <img src={"." + thumb} alt={null} style={{
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
                                  <img src={"." + flag} alt={null} />
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
                              gridTemplateColumns: '20px 20px 80px 110px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              opacity: 0.5,  
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
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={"." + thumb} alt={null} style={{
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
                                <img src={"." + flag} alt={null} />
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
                display:"flex",
                flexDirecton:"row",
                gridTemplateColumns:'auto 50px 10px 50px autp',
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                display:"flex",
                }}>
                <div></div>
                <div role="button" onClick={() => handleBackClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginLeft:'30px',
                  marginBottom:"30px",
                  }}>
                  Cancel
                </div>
                <div></div>
                <div role="button" onClick={() => handleFastestLapSubmitClick()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginRight:'30px',
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

    else if (poleLapLoad === 1){
      return (
        <div className="nav-spacer" style={{marginTop:80,width:'100%', marginLeft:0, marginRight:0}}>
        <div className="App">
          <header className="App-header">
            <h2 style={{marginBottom:0}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName }
                </div>
              <div className="sticky-deadline" style={{width:"100%", justifyContent:'center', alignItems:'center',marginLeft:0,
                marginRight:0, marginTop:0}}>
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
                  padding:"2px 0px 2px 0px",
                  }}>
                  Time to complete submission<br></br>{ time }
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
                  Who won the sprint race or was in pole on Saturday Qualifying?
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
                  Who won the sprint race or was in pole on Saturday Qualifying?
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
                              {index + 1 ===  1
                            ? <div style={{
                                display: "grid",
                                width: "auto",
                                paddingTop: "15px",
                                paddingBottom: "10px",
                                paddingLeft: "10px",
                                paddingRight:"15px",
                                gridTemplateColumns: '20px 20px 80px 110px 70px',
                                borderRadius: "10px",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyItems: 'space-between',
                                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", 
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
                                <div className="driver-thumb" style={{marginLeft:5}}>
                                  <img src={"." + thumb} alt={null} style={{
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
                                  &#127937; Pole Result &#127937;
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
                                  <img src={"." + flag} alt={null} />
                                </div>
                              </div>
                            : <div style={{
                              display: "grid",
                              width: "auto",
                              paddingTop: "15px",
                              paddingBottom: "10px",
                              paddingLeft: "10px",
                              paddingRight:"15px",
                              gridTemplateColumns: '20px 20px 80px 110px 70px',
                              borderRadius: "10px",
                              alignItems: 'center',
                              flexDirection: "row",
                              opacity:0.5,
                              justifyItems: 'space-between',
                              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                              opacity: 0.5,  
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
                              <div className="driver-thumb" style={{marginLeft:5}}>
                                <img src={"." + thumb} alt={null} style={{
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
                                <img src={"." + flag} alt={null} />
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
                display:"flex",
                flexDirecton:"row",
                gridTemplateColumns:'auto 50px 10px 50px autp',
                justifyContent:"center",
                alignItems:"center",
                textAlign:'center',
                display:"flex",
                }}>
                <div></div>
                <div role="button" onClick={() => handleBackClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginLeft:'30px',
                  marginBottom:"30px",
                  }}>
                  Cancel
                </div>
                <div></div>
                <div role="button" onClick={() => handlePoleLapSubmitClick()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginRight:'30px',
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

    else if (addNewDriverLoad == 1){
      return (
        <div style={{
          height: "700px"
        }}>
        <header className="App-header" style={{marginTop:"65px"}}>
            <h2 style={{marginBottom:0, marginTop:20}}>
              Manual Result Capture
            </h2>
            <p style={{
                  color:"#BD2031",
                  }}>
                  For {paddockName}
                </p>
              <h3 style={{marginBottom:15, marginTop:15}}>
                { circuitRef } - {circuitCountry}
              </h3>
              <div stytle = {{
                  fontSize: 8
                }}>
                { circuitName } 
                </div>
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
                  textAlign:'center',
                  top:80,
                  padding:"2px 0px 2px 0px",
                  }}>
                  Time to complete submission<br></br>{ time }
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
                  textAlign:'center',
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
                  backgroundColor:"#ED944D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
                  justifyContent:'center',
                  alignItems:'center',
                  testAlign:'center',
                  top:80,
                  marginBottom: 20,
                  padding:"2px 0px 2px 0px",
                  marginTop:0,
                  marginLeft:0,
                  zIndex:5,
                  marginRight:0}}>
                  Substitute drivers
                </p>
              : <p style={{
                  backgroundColor:"#ED944D",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width:"100%",
                  color:"#FEFDFB",
                  justifyContent:'center',
                  alignItems:'center',
                  textAlign:'center',
                  top:80,
                  marginBottom: 20,
                  padding:"2px 0px 2px 0px",
                  marginTop:0,
                  marginLeft:0,
                  zIndex:5,
                  marginRight:0}}>
                  Substitute drivers
                </p>}
              </header>
        <div class="form-container" style={{
          width: "300px",
          height: "auto",
          backgroundColor: "#FEFDFB",
          margin: "auto",
          boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
          marginTop: "10px",
          marginBottom:"50px",
          }}>
          <h1 style={{
            margin:0,
            backgroundColor:"#48A14D",
            color:"#FEFDFB",
            fontSize: 25,
            padding: "20px",
            paddingRight: 0
            }}>Add New Driver</h1>
            {showNewDriverSmallError == 1
          ? <div style={{
            color:"red",
            fontSize:"10px",
            marginTop:"20px",
            marginLeft:"20px",
            marginRight:"20px",
            }}>
              {newDriverSmallError}
            </div>
          : <div></div>
            }
            <div style={{
              display:"flex",
              flexDirection:'row',
              width:"100%",
              marginTop:"30px"
              }}>
              <div style={{
                marginLeft:"20px",
                }}>
                <img src={"../static/images/drivers/genericDriver.png"} alt={null} style={{borderRadius:50}}/>
              </div>
              <div styl={{
                display:"flex",
                flexDirection:'column',
                }}>
                <div>
                  <input
                    onChange={ handleFirstNameChange }  
                    value={driverValues.firstName}  
                    id="Driver First Name"
                    class="form-field"
                    type="text"
                    placeholder="Driver First Name"
                    name="firstName"
                    style={{
                      padding: "8px 8px 8px 8px",
                      fontSize: "11px",
                      border: 0,
                      marginLeft:"20px",
                      width:"140px",
                      fontFamily: "Roboto, sans-serif",
                      backgroundColor: "#EDF2F4",
                      marginBottom:"8px"
                    }}
                    />
                  </div>
                  <div>
                  <input
                    onChange={ handleSurnameChange }  
                    value={driverValues.driverSurname}  
                    id="Driver Surname"
                    class="form-field"
                    type="text"
                    placeholder="Driver Surname"
                    name="surname"
                    style={{
                      padding: "8px 8px 8px 8px",
                      marginLeft:'20px',
                      fontSize: "11px",
                      marginLeft:"20px",
                      border: 0,
                      width: "140px",
                      fontFamily: "Roboto, sans-serif",
                      backgroundColor: "#EDF2F4",
                    }}
                  />
                  </div>
                </div>
                <div>
              </div>
            </div>
            <div style={{
              display:"flex",
              flexDirection:'row',
              width:"100%",
              }}>
              <div>
                <input
                  onChange={ handlePermanentNumberChange }  
                  value={driverValues.permanentNumber}  
                  id="Driver Number"
                  class="form-field"
                  type="number"
                  placeholder="Permanent Number"
                  name="permanentNumber"
                  style={{
                    margin: "10px 0 10px 0",
                    padding: "13px",
                    fontSize: "11px",
                    border: 0,
                    marginLeft:"20px",
                    width:"100px",
                    fontFamily: "Roboto, sans-serif",
                    backgroundColor: "#EDF2F4",
                  }}
                  />
                </div>
                <div>
                  <input
                    onChange={ handleCodeChange }  
                    value={driverValues.code}  
                    id="Driver Code"
                    class="form-field"
                    type="text"
                    placeholder="CODE Eg. VER"
                    name="code"
                    style={{
                      margin: "10px 0 10px 0",
                      padding: "13px",
                      fontSize: "11px",
                      border: 0,
                      marginLeft:"5px",
                      width:"90px",
                      fontFamily: "Roboto, sans-serif",
                      backgroundColor: "#EDF2F4",
                    }}
                  />
              </div>
            </div>
            <div style={{
              display:"flex",
              flexDirection:'row',
              width:"100%",
              }}>
              <div style={{
                height:"30px",
                marginLeft:"33px",
                alignItems:"center",
                textAlign:"left",
                justifyContent:"center",
                paddingTop:"5px",
                fontFamily: "Roboto, sans-serif",
                }}>
                  Nationality
              </div>
              <div style={{marginLeft:"10px"}}>
                <select onChange={(event) => {
                  const selectFlag = event.target.value;
                  if (event.target.value!="None")
                  updateSelectedCountry(selectFlag)
                  setCountryChanged(1)
                  }}
                  style={{
                  width:"150px",
                  height:'30px',
                  borderRadius:'5px',
                  }}>
                  {flagData.map(flagList => 
                  <option key={flagList.id} value={flagList.id} style={{fontFamily: "Roboto, sans-serif", backgroundColor: "#EDF2F4",}}>
                    {flagList.countryName}
                  </option>
                  )}
                </select>
              </div>
            </div>
            <div sytle={{
              justifyContent:"center",
              alignItems:"center",
              textAlign:'center',
              display:"flex",
              }}>
              <div style={{
                display:"flex",
                flexDirecton:"row",
                gridTemplateColumns:'auto 50px 10px 50px auto',
                }}>
                <div></div>
                <div role="button" onClick={() => handleBackClick()} style={{
                  display:"flex",
                  backgroundColor: "#BD2031",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '15px 0px 0px 15px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginLeft:'30px',
                  marginBottom:"30px",
                  }}>
                  Cancel
                </div>
                <div></div>
                <div role="button" onClick={() => handleConfirmAddDriverClick()} style={{
                  display:"flex",
                  backgroundColor: "#48A14D",
                  color: "#FEFDFB",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  borderRadius: '0px 15px 15px 0px',
                  height: "40px",
                  width: "180px",
                  marginTop:20,
                  border: "0px",
                  marginBottom: 15,
                  justifyContent:"center",
                  alignItems:"center",
                  textAlign:'center',
                  hover:"pointer",
                  marginRight:'30px',
                  marginLeft:'5px',
                  marginBottom:"30px",
                  }}>
                  Add Driver 
                </div>
                <div></div>
              </div>
              </div>
          </div>
        </div>
      );
    }
  }
}
export default manualResultCapture;