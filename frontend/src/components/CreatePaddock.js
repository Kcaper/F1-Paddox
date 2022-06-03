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

export default function PaddockCreate() {

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
    const [errorMessage, setErrorMessage] = useState("")
    const [publicPaddock, setPublicPaddock] = useState(false)
    const [privatePaddock, setPrivatePaddock] = useState(false)
    const [radioSelected, setRadioSelected] = useState(false)

    useEffect(() => {
      getPaddockList();
      getNumPaddocks();
      getPaddockRules();
      getSeasonCalendar();
      getConstructors();
      getDefaultMidfieldExcludedConstructors();
      updateConstructorList();
      getUserStatus();
    },[])

    const [userMaxPlayers, setUserMaxPlayers] = useState(0)
    const [editedPaddockMaxPlayers, setEditedPaddockMaxPlayers] = useState(0)

    const [pageLoading, setPageLoading] = useState(true)

    const getUserStatus = async () => {
      await fetch(baseUrl + '/api/user/status/')
      .then(response => response.json())
      .then(apiMaxPlayers => {
        let temp_var= JSON.parse(apiMaxPlayers)
        setUserMaxPlayers(temp_var[0].userMaxPlayers)
        setEditedPaddockMaxPlayers(temp_var[0].userMaxPlayers)
     })
     setPageLoading(false)
    }

    const getPaddockList = async () => {
        await fetch(baseUrl + '/api/paddocks/')
        .then(response => response.json())
        .then(apiPaddocks => {
        var temp_array = []
        for (let i=0; i<apiPaddocks.length; i++){
          temp_array.push(apiPaddocks[i].paddockName)
        }
        setPaddockList(temp_array)
      })
    }

    const [numUserPaddocks, setNumUserPaddocks] = useState(0)
    const [canCreatePublicPaddock, setCanCreatePublicPaddock] = useState(true)
    const [canCreatePrivatePaddock, setCanCreatePrivatePaddock] = useState(true)
    const [userNeedsUpgrade, setUserNeedsUpgrade] = useState(false)

    const getNumPaddocks = async () => {
      await fetch(baseUrl + '/api/paddocks/my-paddocks/')
      .then(response => response.json())
      .then(apiUserPaddocks => {
      let data = JSON.parse(apiUserPaddocks)
      let temp = data.numUserPaddocks
      let numPublic = data.userRestrictions[0].publicPaddocksCreatable
      let numPrivate = data.userRestrictions[0].privatePaddocksCreatable
      setNumUserPaddocks(temp)

      if(numPublic < 1){
        setCanCreatePublicPaddock(0)
        if(numPrivate < 1){
          setCanCreatePrivatePaddock(0)
          setCanCreateAnyPaddock(0)
        }
      }
      if(numPrivate < 1){
        setCanCreatePrivatePaddock(0)
      }
    })
  }

    const [constructorList, setConstructorsList] = useState({})
    const [numActiveConstructors, setNumActiveContructors] = useState(0)

    const getConstructors = async () => {
      await fetch(baseUrl + '/api/constructors/')
      .then(response => response.json())
      .then(apiTeams => {
      setConstructorsList(apiTeams)
      setNumActiveContructors(apiTeams.length)
    })
  }

    const [defaultMidfieldExcludedTeams, setDefaultMidfieldExcludedTeams] = useState({})
    const [initialDefaultMidfieldExcludedTeams, setInitialDefaultMidfieldExcludedTeams] = useState({})
    const [customMidfieldExcludedTeams, setCustomMidfieldExcludedTeams] = useState({})

    const getDefaultMidfieldExcludedConstructors = async () => {
      await fetch(baseUrl + '/api/default-midfield-exclusions/')
      .then(response => response.json())
      .then(apiTeams => {
      let temp_array = (apiTeams)
      setDefaultMidfieldExcludedTeams(temp_array)
      setInitialDefaultMidfieldExcludedTeams(temp_array)
      setCustomMidfieldExcludedTeams(temp_array)
    })
  }

    const [paddockRules, setPaddockRules] = useState([])
    const [midfieldRuleSets, setMidfieldRuleSets] = useState([])
    const [editedMidfieldDriverValue, setEditedMidfieldDriverValue] = useState(14)
    const [currentDefaultPaddockRules, setCurretDefaultPaddockRules] = useState({})
    const [presetRuleSets, setPresetRuleSets] = useState([])


    const getPaddockRules = async () => {
      await fetch(baseUrl + '/api/paddock-rules/')
      .then(response => response.json())
      .then(apiRules => {
        let temp_array = {}
        for (let i=0; i<apiRules.length; i++){
          if (apiRules[i].ruleSetName == "Midfield"){
            temp_array = apiRules[i]
          }
        }

        let temp_rulesets = apiRules;
        let temp_default_ruleset;
        let temp_ruleset_names = [];
        setPaddockRules(temp_array)
        setCurretDefaultPaddockRules(temp_array)
        for (let i=0; i<temp_rulesets.length; i++){
          try{
            if (temp_rulesets[i].ruleSetName == "Midfield"){
              temp_default_ruleset = temp_rulesets[i]
            }
            if (temp_ruleset_names.includes(temp_rulesets[i].ruleSetName)){
              temp_ruleset_names.push(temp_rulesets[i].ruleSetName)
              temp_rulesets.splice(i, 1)
            }
            else{
              temp_ruleset_names.push(temp_rulesets[i].ruleSetName)
            }
          }
          catch{
            continue
          }
        }

        setPresetRuleSets(temp_ruleset_names)
        setMidfieldRuleSets(temp_rulesets)
        setSelectedRuleset(temp_default_ruleset)
      })
    }

    const [calendarData, setCalendarData] = useState([])

    const getSeasonCalendar = async () => {
      await fetch(baseUrl + '/api/calendar/')
      .then(response => response.json())
      .then(apiCalendar => {
        setCalendarData(apiCalendar)
      })
    }

    const [values, setValues] = useState({
            paddockName: "",
      })

    const handlePaddockNameChange = (event) => {
      setValues({...values, paddockName: event.target.value})
      setErrorMessage("")
    }

    const [submitted, setSubmitted] = useState(false);

    const handleRadioChange = (event) => {
      if (event.target.value.toString() == "Public"){
        setPublicPaddock(false);
        setPrivatePaddock(true);
        setRadioSelected(true);
      }
      else if (event.target.value.toString() == "Private"){
        setPrivatePaddock(false);
        setPublicPaddock(true);
        setRadioSelected(true);
      }
    }

    const [paddockEditedRules, setPaddockEditedRules] = useState({
      ruleSetName: "",

    })

    const [ruleSetError, setRuleSetError] = useState(0)

    const handleRuleSetNameChange = (event) => {
      if (event.target.length < 4){
        setRuleSetError(1)
        setErrorMessage("Please use a longer name for your rule set")
      }
      else{
        setErrorMessage("")
        setRuleSetError(0)
        setPaddockEditedRules({...paddockEditedRules, ruleSetName: event.target.value})
      }
    }

    const [selectedMidfieldStartRound, setSelectedMidfieldStartRound] = useState(1)

    const handleSubmit = (event) => {
        console.log("START")
        event.preventDefault();
        window.scrollTo(0, 0)
        var paddockRulesDict={};
        let rule_set_name = null
        if (midfieldRulesEditable == false){
          rule_set_name = selectedRuleset.ruleSetName;
        }
        else if(paddockEditedRules.ruleSetName.length == 0){
          rule_set_name = null;
        }
        else if(paddockEditedRules.ruleSetName.length < 4){
          rule_set_name = 0;
        }
        else if (presetRuleSets.includes(paddockEditedRules.ruleSetName)){
          rule_set_name = 1
        }
        else if (paddockEditedRules.ruleSetName.length > 25){
          rule_set_name = 2
        }
        else{
          rule_set_name = paddockEditedRules.ruleSetName
        }
        if(paddockList.includes(values.paddockName)){
            setValid(false);
            setErrorMessage("This paddock name already exists, please enter another name");
            setSubmitted(true);
        }
        else if (rule_set_name == null){
            setValid(false);
            if (midRulesOpen == false){
              setMidRulesOpen(true)
            }
            setErrorMessage("Please name your Ruleset. ");
            setSubmitted(true);
        }
        else if (rule_set_name == 0){
          setValid(false);
          if (midRulesOpen == false){
            setMidRulesOpen(true)
          }
          setErrorMessage("Your ruleset name is too short. ");
          setSubmitted(true);
        }
        else if (rule_set_name == 2){
          setValid(false);
          if (midRulesOpen == false){
            setMidRulesOpen(true)
          }
          setErrorMessage("Your ruleset name is too long. ");
          setSubmitted(true);
        }
        else if (rule_set_name == 1){
          setValid(false);
          if (midRulesOpen == false){
            setMidRulesOpen(true)
          }
          setErrorMessage("This ruleset name already exists, please choose another. ");
          setSubmitted(true);
        }
        else if (values.paddockName.length<4){
          setValid(false);
          setErrorMessage("Paddock Name is too short. ");
          setSubmitted(true);
        }
        else if (publicPaddock==false && privatePaddock==false){
            setValid(false);
            setErrorMessage("Please select private or public Paddock. ");
            setSubmitted(true);
        }
        else if (radioSelected == false){
          setValid(false);
          setErrorMessage("Please select private or public paddock. ")
        }
        else if (values.paddockName.length>30){
          setValid(false);
          setErrorMessage("Paddock Name is too long. (Max 30 characters)");
          setSubmitted(true);
        }
        else if (radioSelected == true && publicPaddock == 0 && canCreatePublicPaddock == 0){
          setValid(false);
          setErrorMessage("You have reached your public Paddock Limit. Please exit a public paddock to create a new one, or make a donation to access more paddocks");
          setSubmitted(true);
        }
        else if (radioSelected == true && publicPaddock == 1 && canCreatePrivatePaddock == 0){
          setValid(false);
          setErrorMessage("You have reached your private Paddock Limit. Please exit a private paddock to create a new one, or make a donation to access more paddocks");
          setSubmitted(true);
        }
        else{
          console.log("WEGOT HERE")
          try{
            setErrorMessage("");
            var paddock_dict={};
            paddock_dict["paddockRules"] = {}
            paddock_dict['paddockRules']['paddockMaxPlayers'] = editedPaddockMaxPlayers
            if (midfieldRulesEditable == false){
              paddock_dict["paddockRules"]['ruleSetName'] = selectedRuleset.ruleSetName
              paddock_dict["paddockRules"]['numRacelyDrivers'] = selectedRuleset.numDriversOnMidfieldLeaderBoard
              paddock_dict['paddockRules']['midfieldSessionDeadline'] = selectedRuleset.midfieldDriverPredictionDeadlineSession
              paddock_dict['paddockRules']['midfieldStartRound'] = selectedMidfieldStartRound
            }
            else{
              paddock_dict["paddockRules"]['ruleSetName'] = paddockEditedRules.ruleSetName
              paddock_dict["paddockRules"]['numRacelyDrivers'] = editedMidfieldDriverValue
              paddock_dict['paddockRules']['midfieldSessionDeadline'] = selectedRacelySessionStartSelection
              paddock_dict['paddockRules']['midfieldStartRound'] = selectedMidfieldStartRound
            }
            
            paddockRulesDict['excludedTeams'] = []
            let temp_array = [];
            for(let i=0; i<defaultMidfieldExcludedTeams.length; i++){
              temp_array.push(defaultMidfieldExcludedTeams[i]['constructorId'])
            }
            paddock_dict['excludedTeams']=temp_array
          
            if (preSeasonDriverGameDefaultSelected){
              paddock_dict["paddockRules"]['numPreSeasonDrivers'] = currentDefaultPaddockRules.numDriversOnPreSeasonLeaderboard
              paddock_dict['paddockRules']['preSeasonDriverSessionDeadline'] = currentDefaultPaddockRules.preSeasonDriverStandingDeadlineSession
              paddock_dict['paddockRules']['preSeasonDriverStartRound'] = 1
            }
            else if (preSeasonDriverGameDefaultSelected == false){
              paddock_dict["paddockRules"]['numPreSeasonDrivers'] = editedPreSeasonDriverValue
              paddock_dict['paddockRules']['preSeasonDriverSessionDeadline'] = selectedPreSeasonDriverSessionSelection
              paddock_dict['paddockRules']['preSeasonDriverStartRound'] = selectedPreSeasonDriverRoundStartSelection
            }

            if (preSeasonConstructorGameDefaultSelected){
              paddock_dict["paddockRules"]['numPreSeasonConstructors'] = currentDefaultPaddockRules.numConstructorsOnPreSeasonLeaderboard
              paddock_dict['paddockRules']['preSeasonConstructorSessionDeadline'] = currentDefaultPaddockRules.preSeasonConstructorStandingDeadlineSession
              paddock_dict['paddockRules']['preSeasonConstructorStartRound'] = 1
            }
            else if (preSeasonConstructorGameDefaultSelected == false){
              paddock_dict["paddockRules"]['numPreSeasonConstructors'] = editedPreSeasonConstructorValue
              paddock_dict['paddockRules']['preSeasonConstructorSessionDeadline'] = selectedPreSeasonConstructorSessionSelection
              paddock_dict['paddockRules']['preSeasonConstructorStartRound'] = selectedPreSeasonConstructorRoundStartSelection
            }

            paddock_dict['paddockMaxPlayers'] = editedPaddockMaxPlayers
            paddock_dict["paddockName"] = values.paddockName;
            paddock_dict["numPlayers"] = 1;
            if (publicPaddock == true){
              paddock_dict["isPublic"] = 0;
            }
            else if (publicPaddock == false){
              paddock_dict["isPublic"] = 1;
            }
            
            fetch(baseUrl + '/api/paddocks/create/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
                body: JSON.stringify(paddock_dict)
            })
            .then(async response => {
              let isJson = response.headers.get('content-type')?.includes('applicataion/json');
              let data = isJson && await response.json();
      
              if(!response.ok) {
                let error = (data && data.message) || response.status;
                alert("There was an error creating your paddock:" + error.toString())
                return Promise.reject(error);
              }
              else{
                setValid(true);
                setSubmitted(true);
                setTimeout(2000)
                window.location.href = baseUrl + "/my-paddocks"
              }
          })
        }
        catch{
          setErrorMessage("There was a problem creating your paddock. Please try again later.")
        }
      }
    }

    const [valid, setValid] = useState(false);
    const [midRulesOpen, setMidRulesOpen] = useState(false)
    const [midfieldGameDefaultSelected, setMidfieldGameDefaultSelected] = useState(1)
    const [midfieldGameCustomSelected, setMidfieldGameCustomSelected] = useState(0)

    function handleMidfieldDefaultClick(){
      setShowExcludedDropDown(false)
      getDefaultMidfieldExcludedConstructors()
      setMidfieldGameDefaultSelected(1)
      setMidfieldGameCustomSelected(0)
      setEditedMidfieldDriverValue(paddockRules.numDriversOnMidfieldLeaderBoard)
      if (midRulesOpen == true && midfieldRulesEditable == true){
        setMidfieldRulesEditable(false)
      }
      else if(midRulesOpen == true && midfieldRulesEditable == false){
        setMidRulesOpen(false)
      }
      else if (midRulesOpen == false){
        setMidfieldRulesEditable(false)
        setMidRulesOpen(true)
      }
    }

    const [midSeasonRulesEditable, setMidSeasonRulesEditable] = useState(false)
    const [editedMidSeasonDriverValue ,setEditedMidSeasonDriverValue] = useState(20)
    const [midSeasonDriverRulesOpen, setMidSeasonDriverRulesOpen] = useState(false)

    function handleMidSeasonDefaultClick(){
      setMidSeasonConstructorGameDefaultSelected(1)
      setMidSeasonConstructorGameCustomSelected(0)
      if (midSeasonDriverRulesOpen == true && midSeasonRulesEditable == true){
        setMidSeasonRulesEditable(false)
        setEditedMidSeasonDriverValue(20)
      }
      else if(midSeasonDriverRulesOpen == true && midSeasonRulesEditable == false){
        setMidSeasonDriverRulesOpen(false)
      }
      else if (midSeasonDriverRulesOpen == false){
        setMidSeasonDriverRulesOpen(true)
        setMidSeasonRulesEditable(false)
        setEditedMidSeasonDriverValue(20)
      }
    }

    const [editedPreSeasonDriverValue, setEditedPreSeasonDriverValue] = useState(20)
    const [preSeasonDriverGameDefaultSelected, setPreSeasonDriverGameDefaultSelected] = useState(1)
    const [preSeasonDriverGameCustomSelected, setPreSeasonDriverGameCustomSelected] = useState(0)

    function handlePreSeasonDefaultClick(){
      setPreSeasonDriverGameDefaultSelected(1)
      setPreSeasonDriverGameCustomSelected(0)
      if (preSeasonRulesOpen == true && preSeasonRulesEditable == true){
        setPreSeasonRulesEditable(false)
        setEditedPreSeasonDriverValue(20)
      }
      else if(preSeasonRulesOpen == true && preSeasonRulesEditable == false){
        setPreSeasonRulesOpen(false)
      }
      else if (preSeasonRulesOpen == false){
        setPreSeasonRulesOpen(true)
        setPreSeasonRulesEditable(false)
        setEditedPreSeasonDriverValue(20)
      }
    }

    const [editedPreSeasonConstructorValue, setEditedPreSeasonConstructorValue] = useState(10)
    const [preSeasonConstructorRulesOpen, setPreSeasonConstructorRulesOpen] = useState(false)
    const [preSeasonConstructorGameDefaultSelected, setPreSeasonConstructorGameDefaultSelected] = useState(1)
    const [preSeasonConstructorGameCustomSelected, setPreSeasonConstructorGameCustomSelected] = useState(0)

    function handlePreSeasonConstructorDefaultClick(){
      setPreSeasonConstructorGameDefaultSelected(1)
      setPreSeasonConstructorGameCustomSelected(0)
      if (preSeasonConstructorRulesOpen == true && preSeasonConstructorRulesEditable == true){
        setPreSeasonConstructorRulesEditable(false)
        setEditedPreSeasonConstructorValue(10)
      }
      else if(preSeasonConstructorRulesOpen == true && preSeasonConstructorRulesEditable == false){
        setPreSeasonConstructorRulesOpen(false)
      }
      else if (preSeasonConstructorRulesOpen == false){
        setPreSeasonConstructorRulesOpen(true)
        setPreSeasonConstructorRulesEditable(false)
        setEditedPreSeasonConstructorValue(10)
      }
    }

    const [editedMidSeasonConstructorValue, setEditedMidSeasonConstructorValue] = useState(10)
    const [midSeasonConstructorRulesOpen, setMidSeasonConstructorRulesOpen] = useState(false)
    const [midSeasonConstructorGameDefaultSelected, setMidSeasonConstructorGameDefaultSelected] = useState(1)
    const [midSeasonConstructorGameCustomSelected, setMidConstructorSeasonGameCustomSelected] = useState(0)

    function handleMidSeasonConstructorDefaultClick(){
      setMidSeasonConstructorGameDefaultSelected(1)
      setMidConstructorSeasonGameCustomSelected(0)
      if (midSeasonConstructorRulesOpen == true && midSeasonConstructorRulesEditable == true){
        setMidSeasonConstructorRulesEditable(false)
        setEditedMidSeasonConstructorValue(10)
      }
      else if(midSeasonConstructorRulesOpen == true && midSeasonConstructorRulesEditable == false){
        setMidSeasonConstructorRulesOpen(false)
      }
      else if (midSeasonConstructorRulesOpen == false){
        setMidSeasonConstructorRulesOpen(true)
        setMidSeasonConstructorRulesEditable(false)
        setEditedMidSeasonConstructorValue(10)
      }
    }

    function handleMidfieldHeaderClick(){
      if (midRulesOpen == true){
        setMidRulesOpen(false)
      }
      else{
        setMidRulesOpen(true)
      }
    }

    const [preSeasonRulesOpen, setPreSeasonRulesOpen] = useState(false)

    function handlePreSeasonHeaderClick(){
      if (preSeasonRulesOpen == true){
        setPreSeasonRulesOpen(false)
      }
      else{
        setPreSeasonRulesOpen(true)
      }
    }

    function handleMidSeasonHeaderClick(){
      if (midSeasonDriverRulesOpen == true){
        setMidSeasonDriverRulesOpen(false)
      }
      else{
        setMidSeasonDriverRulesOpen(true)
      }
    }

    function handleMidSeasonConstructorHeaderClick(){
      if (midSeasonConstructorRulesOpen == true){
        setMidSeasonConstructorRulesOpen(false)
      }
      else{
        setMidSeasonConstructorRulesOpen(true)
      }
    }

    function handlePreSeasonConstructorHeaderClick(){
      if (preSeasonConstructorRulesOpen == true){
        setPreSeasonConstructorRulesOpen(false)
      }
      else{
        setPreSeasonConstructorRulesOpen(true)
      }
    }

    const [midfieldRulesEditable, setMidfieldRulesEditable] = useState(false)

    function handleMidfieldCustomClick(){
      setEditedMidfieldDriverValue(paddockRules.numDriversOnMidfieldLeaderBoard)
      getDefaultMidfieldExcludedConstructors()
      setMidfieldGameCustomSelected(1)
      setMidfieldGameDefaultSelected(0)
      if (midRulesOpen == false){
        setMidRulesOpen(true)
        setMidfieldRulesEditable(true)
      }
      else if (midRulesOpen == true && midfieldRulesEditable == true){
        setMidRulesOpen(false)
      }
      else if (midfieldRulesEditable == false){
        setMidfieldRulesEditable(true)
      }
    }

    const [preSeasonRulesEditable, setPreSeasonRulesEditable] = useState(false)

    function handlePreSeasonCustomClick(){
      setPreSeasonDriverGameCustomSelected(1)
      setPreSeasonDriverGameDefaultSelected(0)
      if (preSeasonRulesOpen == false){
        setPreSeasonRulesOpen(true)
        setPreSeasonRulesEditable(true)
      }
      else if (preSeasonRulesOpen == true && preSeasonRulesEditable == true){
        setPreSeasonRulesOpen(false)
      }
      else if (preSeasonRulesOpen == false){
        setPreSeasonRulesEditable(true)
      }
      else if (preSeasonRulesOpen == true && preSeasonRulesEditable == false){
        setPreSeasonRulesEditable(true)
      }
    }

    function handleMidSeasonCustomClick(){
      setMidSeasonConstructorGameDefaultSelected(1)
      setMidSeasonConstructorGameDefaultSelected(0)
      if (midSeasonDriverRulesOpen == false){
        setMidSeasonDriverRulesOpen(true)
        setMidSeasonRulesEditable(true)
      }
      else if (midSeasonDriverRulesOpen == true && midSeasonRulesEditable == true){
        setMidSeasonDriverRulesOpen(false)
      }
      else if (midSeasonDriverRulesOpen == false){
        setMidSeasonRulesEditable(true)
      }
      else if (midSeasonDriverRulesOpen == true && midSeasonRulesEditable == false){
        setMidSeasonRulesEditable(true)
      }
    }

    const [preSeasonConstructorRulesEditable, setPreSeasonConstructorRulesEditable] = useState(false)

    function handlePreSeasonConstructorCustomClick(){
      setPreSeasonConstructorGameDefaultSelected(0)
      setPreSeasonConstructorGameCustomSelected(1)
      if (preSeasonConstructorRulesOpen == false){
        setPreSeasonConstructorRulesOpen(true)
        setPreSeasonConstructorRulesEditable(true)
      }
      else if (preSeasonConstructorRulesOpen == true && preSeasonConstructorRulesEditable == true){
        setPreSeasonConstructorRulesOpen(false)
      }
      else if (preSeasonConstructorRulesOpen == false){
        setPreSeasonConstructorRulesEditable(true)
      }
      else if (preSeasonConstructorRulesOpen == true && preSeasonConstructorRulesEditable == false){
        setPreSeasonConstructorRulesEditable(true)
      }
    }

    const [midSeasonConstructorRulesEditable, setMidSeasonConstructorRulesEditable] = useState(false)

    function handleMidSeasonConstructorCustomClick(){
      setMidSeasonConstructorGameDefaultSelected(0)
      setMidSeasonConstructorGameDefaultSelected(1)
      if (midSeasonConstructorRulesOpen == false){
        setMidSeasonConstructorRulesOpen(true)
        setMidSeasonConstructorRulesEditable(true)
      }
      else if (midSeasonConstructorRulesOpen == true && midSeasonConstructorRulesEditable == true){
        setMidSeasonConstructorRulesOpen(false)
      }
      else if (midSeasonConstructorRulesOpen == false){
        setMidSeasonConstructorRulesEditable(true)
      }
      else if (midSeasonConstructorRulesOpen == true && midSeasonConstructorRulesEditable == false){
        setMidSeasonConstructorRulesEditable(true)
      }
    }

    const [refresh, setRefresh] = useState(false)

    function handleChangeNumMidfieldDrivers(direction){
      if (direction == "up" && editedMidfieldDriverValue < numActiveConstructors * 2 - defaultMidfieldExcludedTeams.length * 2){
        setEditedMidfieldDriverValue(editedMidfieldDriverValue + 1)
      }
      else if (direction == "down" && editedMidfieldDriverValue > 1){
        setEditedMidfieldDriverValue(editedMidfieldDriverValue - 1)
      }
    }

    function handleChangeNumPreSeasonDrivers(direction){
      if (direction == "up" && editedPreSeasonDriverValue < numActiveConstructors * 2){
        setEditedPreSeasonDriverValue(editedPreSeasonDriverValue + 1)
      }
      else if (direction == "down" && editedPreSeasonDriverValue > 1){
        setEditedPreSeasonDriverValue(editedPreSeasonDriverValue - 1)
      }
    }

    function handleChangeNumMidSeasonDrivers(direction){
      if (direction == "up" && editedMidSeasonDriverValue < numActiveConstructors * 2){
        setEditedMidSeasonDriverValue(editedMidSeasonDriverValue + 1)
      }
      else if (direction == "down" && editedMidSeasonDriverValue > 1){
        setEditedMidSeasonDriverValue(editedMidSeasonDriverValue - 1)
      }
    }

    function handleChangeNumPreSeasonConstructor(direction){
      if (direction == "up" && editedPreSeasonConstructorValue < numActiveConstructors){
        setEditedPreSeasonConstructorValue(editedPreSeasonConstructorValue + 1)
      }
      else if (direction == "down" && editedPreSeasonConstructorValue > 1){
        setEditedPreSeasonConstructorValue(editedPreSeasonConstructorValue - 1)
      }
    }

    function handleChangeNumMidSeasonConstructor(direction){
      if (direction == "up" && editedMidSeasonConstructorValue < numActiveConstructors){
        setEditedMidSeasonConstructorValue(editedMidSeasonConstructorValue + 1)
      }
      else if (direction == "down" && editedMidSeasonConstructorValue > 1){
        setEditedMidSeasonConstructorValue(editedMidSeasonConstructorValue - 1)
      }
    }

    function handleRemoveConstructorClick(constId){
      let temp_constructor_list = constructorList
      let temp_array = defaultMidfieldExcludedTeams
      for (let i=0; i<defaultMidfieldExcludedTeams.length; i++){
        if (defaultMidfieldExcludedTeams[i].constructorId == constId){
          temp_constructor_list.push({
            name:defaultMidfieldExcludedTeams[i].constructorName,
            id:defaultMidfieldExcludedTeams[i].constructorId,
          })
          temp_array.splice(i, 1)
          break
        }
      }
      setCustomMidfieldExcludedTeams(temp_array)
      setConstructorsList(temp_constructor_list)
      setRefresh(!refresh)
    }

    const [showExcludedDropDown, setShowExcludedDropDown] = useState(false)

    function handleAddExcludedConstructorClick(){
      updateConstructorList()
      if (showExcludedDropDown == false){
        setShowExcludedDropDown(true)
        setTickClickable(false)
      }
      else{
        setShowExcludedDropDown(false)
      }
    }

    function updateConstructorList(){
      let temp_array = constructorList
      for (let i=0; i<constructorList.length; i++){
        for (let h=0; h<defaultMidfieldExcludedTeams.length; h++){
          if (constructorList[i].id == defaultMidfieldExcludedTeams[h].constructorId){
            temp_array.splice(i, 1)
          }
        }
      }
      setConstructorsList(temp_array)
    }

    const [selectedConstructor, setSelectedConstructor] = useState("None")
    const [tickClickable, setTickClickable] = useState(false)

    function handleConfirmExcludedConstructorClick(){
      if (editedMidfieldDriverValue + 2 > numActiveConstructors * 2 - defaultMidfieldExcludedTeams.length * 2){
        setEditedMidfieldDriverValue(editedMidfieldDriverValue - 2)
      }
      let temp_array = defaultMidfieldExcludedTeams
      for (let i=0; i<constructorList.length; i++){
        if (constructorList[i].name == selectedConstructor){
          let temp_object = {
            constructorName: constructorList[i].name,
            constructorId: constructorList[i].id
          }
          temp_array.push(temp_object)
          setDefaultMidfieldExcludedTeams(temp_array)
          setCustomMidfieldExcludedTeams(temp_array)
          updateConstructorList()
          setShowExcludedDropDown(false)
          break
        }
      }
    }
  
  const [canCreateAnyPaddock, setCanCreateAnyPaddock] = useState(1)

  function handleManagePaddocksClick(){
    window.location.href = baseUrl + "/my-paddocks"
  }

  function handleDonateClick(){
    window.location.href = 'https://www.gofundme.com/f/expand-the-f1-tinfoil-hat-development-team?utm_source=customer&utm_medium=copy_link&utm_campaign=p_cf+share-flow-1'
  }

  const [selectedRuleset, setSelectedRuleset] = useState({})
  const [freezeDefaultMidfieldSession, setFreezeDefaultMidfieldSession] = useState(1)
  
  function updateExcludedConstructors(ruleSetName){
    let temp_array=[]
    let temp_int=0
    let duplicate_array = []
    for (let i=0; i<midfieldRuleSets.length; i++){
      if (midfieldRuleSets[i].ruleSetName == ruleSetName){
        if(duplicate_array.includes(ruleSetName)){
          continue
        }
        else{
          duplicate_array.push(ruleSetName)
          temp_array = midfieldRuleSets[i].excludedConstructors
          temp_int = midfieldRuleSets[i].numDriversOnMidfieldLeaderBoard
          setSelectedRuleset(midfieldRuleSets[i])
        }
      }
    }
    setDefaultMidfieldExcludedTeams(temp_array)
    setEditedMidfieldDriverValue(temp_int)
  }

  function handleChangeNumPaddockUsers(direction){
    if (direction == "down" && editedPaddockMaxPlayers > 1){
      setEditedPaddockMaxPlayers(editedPaddockMaxPlayers - 1)
    }
    else if (direction == "up" && editedPaddockMaxPlayers < userMaxPlayers){
      setEditedPaddockMaxPlayers(editedPaddockMaxPlayers + 1)
    }
  }

  const [selectedRacelySessionStartSelection, setSelectedRacelySessionStartSelection] = useState("Q1/Sprint Race")

  const [selectedPreSeasonDriverRoundStartSelection, setSelectedPreSeasonDriverRoundStartSelection] = useState(1)
  const [selectedPreSeasonDriverSessionSelection, setSelectedPreSeasonDriverSessionSelection] = useState("FP1")

  const [selectedMidSeasonDriverRoundStartSelection, setSelectedMidSeasonDriverRoundStartSelection] = useState(1)
  const [selectedMidSeasonDriverSessionSelection, setSelectedMidSeasonDriverSessionSelection] = useState("FP1")

  const [selectedMidSeasonConstructorRoundStartSelection, setSelectedMidSeasonConstructorRoundStartSelection] = useState(1)
  const [selectedMidSeasonConstructorSessionSelection, setSelectedMidSeasonConstructorSessionSelection] = useState("FP1")

  const [selectedPreSeasonConstructorRoundStartSelection, setSelectedPreSeasonConstructorRoundStartSelection] = useState(1)
  const [selectedPreSeasonConstructorSessionSelection, setSelectedPreSeasonConstructorSessionSelection] = useState("FP1")

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
            Create Paddock
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

  else if (canCreateAnyPaddock == 0){
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
        }}>Create a Paddock</h1>
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
            You have reached your paddock Limit. Please exit a paddock to create a new one, or make a donation to access more paddocks. Note that paddocks you have created previously with other players still in them, will still count on your record until all players have left the paddock.
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
        fontSize: 23,
        padding: "20px",
        paddingRight: 0
      }}>Create a Paddock</h1>
      <form class="register-form" onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        padding: "10px",
        marginLeft:5,
        marginRight:5,
        }}>
        {submitted && valid ? <div class="success-message">Paddock Created!</div> : null}
        <input
          onChange={handlePaddockNameChange}  
          value={values.paddockName}  
          id="paddockName"
          class="form-field"
          type="text"
          placeholder="Paddock Name"
          name="paddockName"
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
        {submitted && !values.paddockName 
      ? <span style={{
          display:'flex',
          marginLeft:5,
          }}id="paddock-name-error"><br></br>Please enter a paddock name. </span> : null}
        <div style={{
          display:'flex',
          marginLeft:5,
          }}>
          <span id="paddock-error "> {errorMessage}</span>
        </div>
        <div style={{
          marginTop:0,
          marginLeft: 5
          }}>
          <input type="radio" value="Private" name="paddock-type" defaultChecked={privatePaddock} onChange={handleRadioChange} /> Private
          <input type="radio" value="Public" name="paddock-type" defaultChecked={publicPaddock} onChange={handleRadioChange}/> Public
        </div>
        {midRulesOpen
      ? <div role="button"
          onClick={() => handleMidfieldHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"14px",
            paddingTop:"12px",
            paddingBottom:'12px',
            
            }}>
              Racely Driver Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowUpSFill/>
          </div>
        </div>
      : <div role="button"
          onClick={() => handleMidfieldHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"14px",
            paddingTop:"12px",
            paddingBottom:'12px',
            }}>
              Racely Driver Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowDownSFill/></div>
        </div>
        }
        <div style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          alignItems:"center",
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            <div role="button"
              onClick={() => handleMidfieldDefaultClick()}
              style={{
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Default
            </div>
            <div></div>
            <div role="button" 
              onClick={() => handleMidfieldCustomClick()}
              style={{
              borderRadius:5,
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Custom
            </div>
          </div>
        </div>
        <div style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          marginTop:0,
          alignItems:"center",
          flexDirection:'row',
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            {midfieldRulesEditable == false
          ? <div role="button"
              onClick={() => handleMidfieldDefaultClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px',
              }}>
            </div>
          : <div role="button"
              onClick={() => handleMidfieldDefaultClick()}
              style={{
              height:5,
              }}>
            </div>
            }
            <div></div>
            {midfieldRulesEditable
          ? <div role="button" 
              onClick={() => handleMidfieldCustomClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px',
              width:"100%",
              }}>
            </div>
          : <div role="button" 
              onClick={() => handleMidfieldCustomClick()}
              style={{
              height:5,
              }}>
            </div>
            }
          </div>
        </div>
        {midRulesOpen
      ? <div style={{
          fontSize:15,
          fontFamily:"none",
          marginLeft:10,
          }}>
          <div style={{
            textDecoration:'underline',
            fontFamily: "Roboto, sans-serif",
            marginTop:'12px',
            marginBottom:'12px',
            }}>
            Season: {paddockRules.year}
          </div>
          {midfieldGameDefaultSelected
        ? <div style={{
            display:"grid",
            gridTemplateColumns:"60px 175px",
            alignItems:"center",
            textAlign:'left',
            justifyContent:'left',
            marginTop:'8px',
            marginBottom:'8px',
            }}>
            <div style={{
                marginTop:"10px",
                fontStyle:"italic",
                fontWeight:"bold",}}>
                  Ruleset:
              </div>
              <select onChange={(event) => {
                const selectedRuleSet = event.target.value;
                if (event.target.value!="None")
                updateExcludedConstructors(selectedRuleSet)
                }}
                style={{
                marginLeft:'5px',
                width:"170px",
                height:'30px',
                borderRadius:'5px',
                marginTop:'10px',
                }}>
                {midfieldRuleSets.map(ruleSet => 
                <option key={ruleSet.id} value={ruleSet.ruleSetName} style={{fontFamily: "Roboto, sans-serif",}}>
                  {ruleSet.ruleSetName}
                </option>
                )}
              </select>
          </div>
        : midfieldGameCustomSelected
        ? <div style={{
            display:"flex",
            alignItems:"left",
            textAlign:'left',
            justifyContent:'left',
            marginLeft:"-5px",
            marginTop:'12px',
            marginBottom:'12px',
            marginRight:'5px',
            }}>
            <input
              onChange={handleRuleSetNameChange}  
              value={paddockEditedRules.ruleSetName}  
              id="ruleSetName"
              class="form-field"
              type="text"
              placeholder="Name your Ruleset"
              name="paddockName"
              style={{
                marginLeft:"0px",
                padding: "10px",
                fontSize: "16px",
                height:'25px',
                width:'250px',
                border: 0,
                fontFamily: "Roboto, sans-serif",
                backgroundColor: "#EDF2F4",
                marginLeft: 5,
              }}>
            </input>
          </div>
        : null}
          {defaultMidfieldExcludedTeams.length > 0 || midfieldRulesEditable
        ? <div style={{
            marginTop:"20px",
            fontStyle:"italic",
            fontWeight:"bold",
            }}>
            Drivers from:
          </div>
        : null}
          <ul style={{
            listStyle:"none",
            margin:0,
            padding:"0px 0px 0px 0px",
            marginTop:'8px',
            marginBottom:'4px',
            }}>
              {defaultMidfieldExcludedTeams.map(defaultConstructors=>(
                <li key={defaultConstructors.constructorId} style = {{fontFamily: "Roboto, sans-serif",}}>
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'30px 0px auto',
                    flexDirection:'row',
                    alignItems:'center',
                    }}>
                    {midfieldRulesEditable
                  ? <div role='button'
                      onClick={() => handleRemoveConstructorClick(defaultConstructors.constructorId)}
                      style={{
                      color:"#BD2031",
                      textAlign:'left',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:'25px',
                      cursor:'pointer',
                      }}><IoIcons.IoIosRemoveCircle/>
                    </div>
                  : <div></div>
                    }
                    <div></div>
                    <div stle={{
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      textAlign:'center',
                      }}>
                        {defaultConstructors.constructorName}</div>
                  </div>
                </li>
              ))}
          </ul>
          <div style={{
            display:'grid',
            gridTemplateColumns:'30px 0px auto auto',
            flexDirection:'row',
            alignItems:'center',
            }}>
            {showExcludedDropDown && midfieldRulesEditable
          ? <div role="button"
              onClick={() => handleAddExcludedConstructorClick()}
              style={{
              color:"#48A14D",
              textAlign:'left',
              alignItems:'center',
              fontSize:'25px',
              cursor:'pointer',
              }}><FcIcons.FcCancel/>
            </div>
          : midfieldRulesEditable
          ? <div role="button"
              onClick={() => handleAddExcludedConstructorClick()}
              style={{
              color:"#48A14D",
              textAlign:'center',
              justifyContent:'center',
              alignItems:'center',
              fontSize:'25px',
              cursor:'pointer',
              }}><IoIcons.IoIosAddCircle/>
            </div>
          : <div></div>}
            <div></div>
            {showExcludedDropDown
          ? <div>
              <select onChange={(event) => {
                const selectedConstructor = event.target.value;
                if (event.target.value!="None")
                setTickClickable(true)
                setSelectedConstructor(selectedConstructor)
                if (event.target.value=="None")
                setTickClickable(false)
                }}
                style={{
                width:"185px",
                height:'35px',
                borderRadius:'5px',
                }}>
                <option value="None" style={{fontFamily: "Roboto, sans-serif",}}>Select constructor</option>
                {constructorList.map(constructor => (
                  <option key={constructor.id} value={constructor.name} style={{fontFamily: "Roboto, sans-serif",}}>
                    {constructor.name}
                  </option>
                  ))}
              </select>
            </div>
          : midfieldRulesEditable
          ? <div style={{fontFamily: "Roboto, sans-serif",}}>
              Add Constructor
            </div>
          : <div></div>}
            {showExcludedDropDown && tickClickable
          ? <div role="button"
              onClick={() => handleConfirmExcludedConstructorClick()}
              style={{
              color:"#48A14D",
              fontSize:25,
              cursor:'pointer',
              }}><TiIcons.TiTick/>
            </div>
          : showExcludedDropDown && tickClickable == false
          ? <div
              style={{
              color:'grey',
              fontSize:25,
              cursor:'pointer',
              }}><TiIcons.TiTick/>
            </div>
          : <div></div>
            }
            </div>
          <div></div>
          {defaultMidfieldExcludedTeams.length > 0 || midfieldRulesEditable
        ? <div style={{
            fontStyle:"italic",
            fontWeight:"bold",
            marginTop:'4px',
            marginBottom:'12px',
            }}>
            are excluded
          </div>
        : null}
          <div style={{
            fontStyle:"italic",
            fontWeight:"bold",
            marginTop:'20px',
            marginBottom:'12px',
            }}>
            Points paying predictions:
          </div>
          <div style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            textAlign:'center',
            fontSize:20,
            marginTop:"12px",
            marginBottom:'4px',
            }}>
            {midfieldRulesEditable
          ? <div role="button"
              onClick={() => handleChangeNumMidfieldDrivers("down")}
              style={{
              marginRight:5,
              marginLeft:5,
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              margin:"4px 5px 8px 5px",
              }}>-</div>
          : null}
            {midfieldRulesEditable
          ? <div style={{margin:"4px 8px 8px 8px"}}>
              {editedMidfieldDriverValue} / {numActiveConstructors * 2 - defaultMidfieldExcludedTeams.length * 2}
            </div>
          : <div style={{margin:"4px 8px 8px 8px"}}>
              {editedMidfieldDriverValue} / {numActiveConstructors * 2 - defaultMidfieldExcludedTeams.length * 2}
            </div>
            }
              {midfieldRulesEditable
          ? <div  role="button"
              onClick={() => handleChangeNumMidfieldDrivers("up")}
              style={{
              margin:"4px 5px 8px 5px",
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              }}>+</div>
          : null}
          </div>
          <div>
            <div style={{
              marginTop:8,
              fontStyle:"italic",
              fontWeight:"bold",
              marginTop:'20px',
              }}>
              Start Round:
            </div>
            <div>
              <select onChange={(event) => {
                const selectedMidStartRound = event.target.value;
                setSelectedMidfieldStartRound(selectedMidStartRound)
                }}
                style={{
                width:"242px",
                height:'35px',
                borderRadius:'5px',
                marginTop:'3px',
                fontSize:'12px',
                }}>
                {calendarData.map(calendar =>(
                  <option key={calendar.id} value={calendar.raceRound} style={{fontFamily: "Roboto, sans-serif",}}>
                    Round {calendar.raceRound} : {calendar.fp1Date} - {calendar.featureRaceDate}
                  </option>
                  ))}
              </select>
            </div>
          </div>
          <div style={{
            marginTop:8,
            fontStyle:"italic",
            fontWeight:"bold",
            marginTop:'8px',
            }}>
            Session Prediction Deadline: 
          </div>
          <div>
            <select
              onChange={(event) => {
                const selectedRacelyOption = event.target.value;
                if (event.target.value!="None")
                setSelectedRacelySessionStartSelection(selectedRacelyOption)
                }}
              style={{
              width:"242px",
              height:'35px',
              borderRadius:'5px',
              marginTop:'3px',
              fontSize:'12px',
              }}>
              <option>{selectedRuleset.midfieldDriverPredictionDeadlineSession}</option>
              <option disabled>FP1</option>
              <option disabled>FP2</option>
              <option>Q1/Sprint Race</option>
              <option disabled>Feature Race</option>
            </select>
          </div>
        </div>
      : null}
        {preSeasonRulesOpen
      ? <div role="button"
          onClick={() => handlePreSeasonHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"14px",
            paddingTop:"12px",
            paddingBottom:'12px',
            }}>
              Driver Standing Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowUpSFill/></div>
        </div>
      : <div role="button"
          onClick={() => handlePreSeasonHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"14px",
            paddingTop:"12px",
            paddingBottom:'12px',
            }}>
              Driver Standing Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowDownSFill/></div>
        </div>
        }
        <div style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          alignItems:"center",
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            <div role="button"
              onClick={() => handlePreSeasonDefaultClick()}
              style={{
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Default
            </div>
            <div></div>
            <div role="button" 
              onClick={() => handlePreSeasonCustomClick()}
              style={{
              borderRadius:5,
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Custom
            </div>
          </div>
        </div>
        <div style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          marginTop:0,
          alignItems:"center",
          flexDirection:'row',
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            {preSeasonRulesEditable == false
          ? <div role="button"
              onClick={() => handlePreSeasonDefaultClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px'
              }}>
            </div>
          : <div role="button"
              onClick={() => handlePreSeasonDefaultClick()}
              style={{
              height:5,
              }}>
            </div>
            }
            <div></div>
            {preSeasonRulesEditable
          ? <div role="button" 
              onClick={() => handlePreSeasonCustomClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px',
              width:"100%",
              }}>
            </div>
          : <div role="button" 
              onClick={() => handlePreSeasonCustomClick()}
              style={{
              height:5,
              }}>
            </div>
            }
          </div>
        </div>
        {preSeasonRulesOpen
      ? <div style={{
          fontSize:15,
          fontFamily:"none",
          marginLeft:10,
          marginTop:8,
          }}>
          <div style={{
            textDecoration:'underline',
            fontFamily: "Roboto, sans-serif",
            }}>
            Season: {paddockRules.year}
          </div>
          <div style={{
            marginTop:8,
            fontStyle:"italic",
            fontWeight:"bold",
            }}>
            Points paying predictions:
          </div>
          <div style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            textAlign:'center',
            fontSize:20,
            marginTop:8,
            }}>
            {preSeasonRulesEditable
          ? <div role="button"
              onClick={() => handleChangeNumPreSeasonDrivers("down")}
              style={{
              marginRight:5,
              marginLeft:5,
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              }}>-</div>
          : null}
            <div style={{margin:8}}>
              {editedPreSeasonDriverValue} / 20
            </div>
              {preSeasonRulesEditable
          ? <div  role="button"
              onClick={() => handleChangeNumPreSeasonDrivers("up")}
              style={{
              marginRight:5,
              marginLeft:5,
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              }}>+</div>
          : null}
            </div>
            <div>
            <div style={{
              marginTop:8,
              fontStyle:"italic",
              fontWeight:"bold",
              }}>
              Race Prediction Deadline:
            </div>
            {preSeasonRulesEditable
          ? <div>
              <select onChange={(event) => {
                const selectedPreSeasonDriverRoundStartOption = event.target.value;
                if (event.target.value!="None")
                setSelectedPreSeasonDriverRoundStartSelection(selectedPreSeasonDriverRoundStartOption)
                }}
                style={{
                width:"242px",
                height:'35px',
                borderRadius:'5px',
                marginTop:'3px',
                fontSize:'12px',
                }}>
                {calendarData.map(calendar =>(
                  <option key={calendar.id} value={calendar.raceRound} style={{fontFamily: "Roboto, sans-serif",}}>
                    Round {calendar.raceRound} : {calendar.fp1Date} - {calendar.featureRaceDate}
                  </option>
                  ))}
                </select>
            </div>
          : <div>
              <select 
                onChange={(event) => {
                  const selectedPreSeasonDriverRoundStartOption = event.target.value;
                  if (event.target.value!="None")
                  setSelectedPreSeasonDriverRoundStartSelection(selectedPreSeasonDriverRoundStartOption)
                  }}
                style={{
                width:"242px",
                height:'35px',
                borderRadius:'5px',
                marginTop:'3px',
                fontSize:'12px',
                }}>
                  <option>
                    Round {calendarData[0].raceRound} : {calendarData[0].fp1Date} - {calendarData[0].featureRaceDate}
                  </option>
              </select>
            </div>
          }
          </div>
          <div style={{
            marginTop:8,
            fontStyle:"italic",
            fontWeight:"bold",
            }}>
            Session Prediction Deadline: 
          </div>
          {preSeasonRulesEditable
        ? <div>
            <select 
              onChange={(event) => {
                const selectedPreSeasonDriverSessionOption = event.target.value;
                if (event.target.value!="None")
                setSelectedPreSeasonDriverSessionSelection(selectedPreSeasonDriverSessionOption)
                }}
              style={{
              width:"242px",
              height:'35px',
              borderRadius:'5px',
              marginTop:'3px',
              fontSize:'12px',
              }}>
              <option>FP1</option>
              <option disabled>FP2</option>
              <option disabled>Q1/Sprint Race</option>
              <option disabled>Feature Race</option>
            </select>
          </div>
        : <div>
            <select style={{
              width:"242px",
              height:'35px',
              borderRadius:'5px',
              marginTop:'3px',
              fontSize:'12px',
              }}>
              <option>FP1</option>
            </select>
          </div>
          }
        </div>
      : null}
        {preSeasonConstructorRulesOpen
      ? <div role="button"
          onClick={() => handlePreSeasonConstructorHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"12px",
            paddingTop:"12px",
            paddingBottom:'12px',
            }}>
              Constructor Standing Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowUpSFill/></div>
        </div>
      : <div role="button"
          onClick={() => handlePreSeasonConstructorHeaderClick()}
          style={{
          display:'grid',
          flexDirection:"row",
          gridTemplateColumns:'230px 30px',
          marginLeft: 5,
          marginTop:15,  
          fontFamily:"none",
          cursor:"pointer",
          backgroundColor:"#ED944D",
          color:"#28282B",
          borderRadius:'7px',
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          }}>
          <div style={{
            display:'flex',
            padding:'5px',
            marginLeft:"5px",
            fontFamily: "Roboto, sans-serif",
            fontSize:"12px",
            paddingTop:"12px",
            paddingBottom:'12px',
            }}>
              Constructor Standing Predictions
          </div>
          <div style={{
            display:"flex",
            justifyContent:'center',
            alignItems:'center',
            }}><RiIcons.RiArrowDownSFill/></div>
        </div>
        }
        <div
          style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          alignItems:"center",
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            <div role="button"
              onClick={() => handlePreSeasonConstructorDefaultClick()}
              style={{
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Default
            </div>
            <div></div>
            <div role="button" 
              onClick={() => handlePreSeasonConstructorCustomClick()}
              style={{
              borderRadius:5,
              color:"#28282B",
              fontSize:15,
              cursor:'pointer',
              textAlign:'center',
              }}>
              Custom
            </div>
          </div>
        </div>
        <div style={{
          display:'flex',
          marginTop:5,
          marginLeft: 5,
          marginTop:0,
          alignItems:"center",
          flexDirection:'row',
          }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'70px 30px 70px',
            }}>
            {preSeasonConstructorRulesEditable == false
          ? <div role="button"
              onClick={() => handlePreSeasonConstructorDefaultClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px'
              }}>
            </div>
          : <div role="button"
              onClick={() => handlePreSeasonConstructorDefaultClick()}
              style={{
              height:5,
              }}>
            </div>
            }
            <div></div>
            {preSeasonConstructorRulesEditable
          ? <div role="button" 
              onClick={() => handlePreSeasonConstructorCustomClick()}
              style={{
              height:5,
              backgroundColor:"#BD2031",
              cursor:'pointer',
              borderRadius:'3px',
              width:"100%",
              }}>
            </div>
          : <div role="button" 
              onClick={() => handlePreSeasonConstructorCustomClick()}
              style={{
              height:5,
              }}>
            </div>
            }
          </div>
        </div>
        {preSeasonConstructorRulesOpen
      ? <div style={{
          fontSize:15,
          fontFamily:"none",
          marginLeft:10,
          marginTop:8,
        }}>
          <div style={{
            textDecoration:'underline',
            fontFamily: "Roboto, sans-serif",
            }}>
            Season: {paddockRules.year}
          </div>
          <div style={{
            marginTop:8,
            fontStyle:"italic",
            fontWeight:"bold",
            }}>
            Points paying predictions:
          </div>
          <div style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            textAlign:'center',
            fontSize:20,
            marginTop:8,
            }}>
            {preSeasonConstructorRulesEditable
          ? <div role="button"
              onClick={() => handleChangeNumPreSeasonConstructor("down")}
              style={{
              marginRight:5,
              marginLeft:5,
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              }}>-</div>
          : null}
            <div style={{margin:8}}>
              {editedPreSeasonConstructorValue} / 10
            </div>
              {preSeasonConstructorRulesEditable
          ? <div  role="button"
              onClick={() => handleChangeNumPreSeasonConstructor("up")}
              style={{
              marginRight:5,
              marginLeft:5,
              backgroundColor:"#88BBEE",
              borderRadius:'5px',
              padding:1,
              width:50,
              cursor:'pointer',
              alignItems:'center',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
              }}>+</div>
          : null}
          </div>
          <div>
            <div style={{
              marginTop:8,
              fontStyle:"italic",
              fontWeight:"bold",
              }}>
              Race Prediction Deadline:
            </div>
            {preSeasonConstructorRulesEditable
          ? <div>
              <select onChange={(event) => {
                const selectedPreSeasonConstructorRoundStartOption = event.target.value;
                if (event.target.value!="None")
                setSelectedPreSeasonConstructorRoundStartSelection(selectedPreSeasonConstructorRoundStartOption)
                }}
                style={{
                width:"242px",
                height:'35px',
                borderRadius:'5px',
                marginTop:'3px',
                fontSize:'12px',
                }}>
                {calendarData.map(calendar =>(
                  <option key={calendar.id} value={calendar.raceRound} style={{fontFamily: "Roboto, sans-serif",}}>
                    Round {calendar.raceRound} : {calendar.fp1Date} - {calendar.featureRaceDate}
                  </option>
                  ))}
                </select>
            </div>
          : <div>
              <select style={{
                width:"242px",
                height:'35px',
                borderRadius:'5px',
                marginTop:'3px',
                fontSize:'12px',
                }}>
                <option>
                    Round {calendarData[0].raceRound} : {calendarData[0].fp1Date} - {calendarData[0].featureRaceDate}
                  </option>
              </select>
            </div>
            }
          </div>
          <div style={{
            marginTop:8,
            fontStyle:"italic",
            fontWeight:"bold",
            }}>
            Session Prediction Deadline: 
          </div>
          {preSeasonConstructorRulesEditable
        ? <div>
            <select onChange={(event) => {
                const selectedPreSeasonConstructorSessionOption = event.target.value;
                if (event.target.value!="None")
                setSelectedPreSeasonConstructorSessionSelection(selectedPreSeasonConstructorSessionOption)
                }}
              style={{
              width:"242px",
              height:'35px',
              borderRadius:'5px',
              marginTop:'3px',
              fontSize:'12px',
              }}>
              <option>FP1</option>
              <option disabled>FP2</option>
              <option disabled>Q1/Sprint Race</option>
              <option disabled>Feature Race</option>
            </select>
          </div>
        : <div>
            <select style={{
              width:"242px",
              height:'35px',
              borderRadius:'5px',
              marginTop:'3px',
              fontSize:'12px',
              }}>
              <option>FP1</option>
            </select>
          </div>
          }
        </div>
      : null}
        <div style={{
            marginTop:'30px',
            textAlign:'center',
            justifyContent:'center',
            alignItems:'center',
          }}>
          Maximum Players
        </div>
        <div>
          <div style={{
            marginTop:'5px',
            display:'grid',
            flexDirection:'row',
            gridTemplateColumns:'60px 60px 60px',
            textAlign:'center',
            justifyContent:'center',
            alignItems:'center',
            }}>
            <div role="button"
                onClick={() => handleChangeNumPaddockUsers("down")}
                style={{
                marginRight:5,
                marginLeft:5,
                backgroundColor:"#88BBEE",
                borderRadius:'5px',
                padding:1,
                width:50,
                cursor:'pointer',
                alignItems:'center',
                textAlign:'center',
                justifyContent:'center',
                boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
                }}>
              <label>-</label>
            </div>
            <div style={{
              textAlign:'center',
              justifyContent:'center',
              alignItems:'center',
              }}>
              {editedPaddockMaxPlayers}
            </div>
            <div role="button"
                onClick={() => handleChangeNumPaddockUsers("up")}
                style={{
                marginRight:5,
                marginLeft:5,
                backgroundColor:"#88BBEE",
                borderRadius:'5px',
                padding:1,
                width:50,
                cursor:'pointer',
                alignItems:'center',
                textAlign:'center',
                justifyContent:'center',
                boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
                }}>
              <label>+</label>
            </div>
          </div>
        </div>
        <div style={{
          alignItems:'center',
          display:'flex',
          justifyContent:'center',
          marginTop:'20px',
          }}>
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
            marginLeft: 5,
            textAlign:'center',
            }}>
            Register Paddock
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
}