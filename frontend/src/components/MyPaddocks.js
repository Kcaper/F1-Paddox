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

export default function MyPaddocks() {

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
    const [userPaddockData, setUserPaddockData] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [valid, setValid] = useState(false);
    const [exitClickedList, setExitClickedList] = useState([]);
    const [state, setState] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [loggedInUserId, setLoggedInUserId] = useState(0)
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [isUserSuperAdmin, setIsUserSuperAdmin] = useState(false)

    function isInExitClickSelection(id){
      if (exitClickedList.includes(id)){
        return true;
      }
      return false;
    }

    function addItemToExitSelection(paddockId, paddockName){
      let temp_array = exitClickedList;
      temp_array.push(paddockId);
      setExitClickedList(temp_array);
      setState(!state)
      setAssignSuperUserClicked(false)
      setPaddockHasNoBackupSuperAdmins(false)
      setAssignSuperAdminAdminError(false)
      countPaddockUsers(paddockName)
      countPaddockAdmins(paddockName)
      countPaddockSuperAdmins(paddockName)
      for (let s=0; s<userPaddockData.paddockUsers[paddockName].length; s++){
        if (userPaddockData.paddockUsers[paddockName][s].isSuperAdmin == 1){
          if (userPaddockData.paddockUsers[paddockName][s].userId == loggedInUserId){
            if (userPaddockData.paddockUsers[paddockName][0].numUsers > 1 && userPaddockData.paddockUsers[paddockName][0].numAdmins < 2){
              setUserAdminLevelByPaddock(paddockName)
              let temp_array = []
              temp_array.push(paddockId)
              setUserBanAddedList([])
              setUserAdminAddedList([])
              setUserRemoveAddedList([])
              setUserUnadminAddedList([])
              setUserAdminLevelByPaddock(paddockName)
              setManagePaddockClickedSelection(temp_array)
              //setPaddockHasNoAdmins(true)
              setPaddockExitNoAdminError(true);
              flashAssignAdminError()
              setTimeout(function(){
                setExitClickedList([])
              }, 1000)
            }
            else if (userPaddockData.paddockUsers[paddockName][0].numUsers > 1 && userPaddockData.paddockUsers[paddockName][0].numSuperAdmins > 1){
              setUserAdminLevelByPaddock(paddockName)
              let temp_array = []
              temp_array.push(paddockId)
              setUserBanAddedList([])
              setUserAdminAddedList([])
              setUserRemoveAddedList([])
              setUserUnadminAddedList([])
              setUserAdminLevelByPaddock(paddockName)
              setManagePaddockClickedSelection(temp_array)
              setPaddockHasNoBackupSuperAdmins(true);
              setPaddockExitNoSuperAdminError(true);
              //setPaddockHasNoAdmins(false)
              flashAssignSuperAdminError()
              setTimeout(function(){
                setExitClickedList([])
              }, 1000)
            }
          }
        }
      }
    }

    const [paddockExitNoAdminError, setPaddockExitNoAdminError] = useState(false)
    const [paddockExitNoSuperAdminError, setPaddockExitNoSuperAdminError] = useState(false)    

    function removeItemFromExitSelection(id){
      if (exitClickedList.includes(id)){
        let temp_array = exitClickedList
        for (let i=0; i<exitClickedList.length; i++){
          if (temp_array[i] == id){
            temp_array.splice(i, 1);
            setExitClickedList(temp_array)
            setState(!state)
            setPaddockExitNoSuperAdminError(false);
            setPaddockExitNoAdminError(false);
            return
          }
        }
      }
    }

    useEffect(() => {
      getUserPaddockData();
    },[])

    function removeUsersFromPaddock(paddockId, paddockName){
      setPageLoading(true);
      var paddock_dict={};
      paddock_dict["paddockId"] = paddockId;
      paddock_dict['removeUserIdList'] = [];
      for(let i=0; i<userRemoveAddedList.length; i++){
        paddock_dict['removeUserIdList'].push(userRemoveAddedList[i]);
      }
      
      fetch(baseUrl + '/api/paddocks/remove-user/' + paddockId + "/", {
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
            alert("There was an error removing users from this paddock:" + error.toString())
            setPageLoading(false)
            return ('Something went wrong removing users from this paddock');
          }
          else{
            getUserPaddockData();
            countPaddockAdmins(selectedPaddockName)
            countPaddockUsers(selectedPaddockName)
            return
          }
        })
        getUserPaddockData();
        countPaddockAdmins(selectedPaddockName)
        countPaddockUsers(selectedPaddockName)
      }

    const getUserPaddockData = async () => {
        await fetch(baseUrl + '/api/paddocks/my-paddocks/')
        .then(response => response.json())
        .then(apiPaddocks => {
        var data = JSON.parse(apiPaddocks)
        setLoggedInUserId(data.user)   
        setUserPaddockData(data)
        setPageLoading(false)
      })
      if(selectedPaddockName != ""){
        countPaddockAdmins(selectedPaddockName)
        countPaddockSuperAdmins(selectedPaddockName)
        console.log("FINIShED HETTING THE DATA")
        console.log(paddockHasNoAdmins)
      }
    }
  
  const [totalRolesSelected, setTotalRolesSelected] = useState(0)

  function countRolesClicked(){
    let total_roles = userAdminAddedList.length + userBanAddedList.length + userUnadminAddedList.length + userRemoveAddedList.length;
    setTotalRolesSelected(total_roles)
  }

  const [managePaddockClickedSelection, setManagePaddockClickedSelection] = useState([])
  const [selectedPaddockId, setSelectedPaddockId] = useState(null)

  function handleManagePaddockButtonClick(id, paddockName){
    //setPaddockHasNoAdmins(false)
    setAssignSuperUserClicked(false)
    setPaddockHasNoBackupSuperAdmins(false)
    setAssignSuperAdminAdminError(false)
    countPaddockUsers(paddockName)
    countPaddockAdmins(paddockName)
    countPaddockSuperAdmins(paddockName)
    if (managePaddockClickedSelection[0] == id){
      setManagePaddockClickedSelection([])
      setUserBanAddedList([])
      setUserAdminAddedList([])
      setUserRemoveAddedList([])
      setUserUnadminAddedList([])
      setIsUserAdmin(false)
      setIsUserSuperAdmin(false)
      setSelectedPaddockName("")
      setSelectedPaddockId(null)
    }
    else{
      setUserAdminLevelByPaddock(paddockName)
      setSelectedPaddockName(paddockName)
      setSelectedPaddockId(id)
      let temp_array = []
      temp_array.push(id)
      setUserBanAddedList([])
      setUserAdminAddedList([])
      setUserRemoveAddedList([])
      setUserUnadminAddedList([])
      setIsUserAdmin(false)
      setIsUserSuperAdmin(false)
      setUserAdminLevelByPaddock(paddockName)
      setManagePaddockClickedSelection(temp_array)
    }
  }

  const [numPaddockAnyUsers, setNumPaddockAnyUsers] = useState([])
  const [numPaddockSuperAdmins, setNumPaddockSuperAdmins] = useState(0)
  const [numPaddockAdmins, setNumPaddockAdmins] = useState(0)
  const [paddockHasNoBackupSuperAdmins, setPaddockHasNoBackupSuperAdmins] = useState(false)
  const [paddockHasNoAdmins, setPaddockHasNoAdmins] = useState(false)

  async function countPaddockSuperAdmins(paddockName){
    let count = 0
    for (let i=0; i<userPaddockData.paddockUsers[paddockName].length; i++){
      if (userPaddockData.paddockUsers[paddockName][i].isSuperAdmin == 1){
        count = count + 1
      }
    }
    if (count < 2){
      setPaddockHasNoBackupSuperAdmins(true)
    }
    else{
      setPaddockHasNoBackupSuperAdmins(false)
    }
    setNumPaddockSuperAdmins(count)
  }

  async function countPaddockAdmins(paddockName){
    let count = 0
    console.log("COUNTING ADMINS")
    for (let i=0; i<userPaddockData.paddockUsers[paddockName].length; i++){
      if (userPaddockData.paddockUsers[paddockName][i].isAdmin == 1){
        count = count + 1
        console.log("THE COUNT IS " + count.toString())
      }
    }
    if (count == 1){
      setPaddockHasNoAdmins(true)
    }
    else{
      setPaddockHasNoAdmins(false)
    }
    setNumPaddockAdmins(count)
  }

  async function countPaddockUsers(paddockName){
    setNumPaddockAnyUsers(userPaddockData.paddockUsers[paddockName].length)
  }

  function setUserAdminLevelByPaddock(paddockName){
    for (let i=0; i<userPaddockData.paddockUsers[paddockName].length; i++){
      if (userPaddockData.paddockUsers[paddockName][i].userId == userPaddockData.user){
        if (userPaddockData.paddockUsers[paddockName][i].isAdmin == 1){
          setIsUserAdmin(true)
        }
        if (userPaddockData.paddockUsers[paddockName][i].isSuperAdmin == 1){
          setIsUserSuperAdmin(true)
          setIsUserAdmin(true)
        }
      }
    }
  }

  function isInPaddockManageClickSelection(id){
    if (managePaddockClickedSelection.includes(id)){
      return true
    }
    return false
  }

  const [userAdminAddedList, setUserAdminAddedList] = useState([])
  const [refresh, setRefresh] = useState(false)

  function addUserToAdminSelection(paddockId, userId){
    let temp_array = []
    if (loggedInUserId == userId){
      setUserBanAddedList([])
      setUserUnadminAddedList([])
      setUserRemoveAddedList([])
      if (userAdminAddedList.length == 1){
        if (userAdminAddedList[0] != userId){
          temp_array.push(userId)
        }
        else{
          temp_array = []
        }
      }
      else{
        if (userAdminAddedList.includes(userId)){
          temp_array = []
        }
        else{
          temp_array.push(userId)
        }
      }
      setUserAdminAddedList(temp_array)
      countRolesClicked()
      setRefresh(!refresh)
      return
    }
    else{
      removeUserRoleSelections();
      if (userAdminAddedList.includes(userId)){
        let temp_array = userAdminAddedList;
        let index = userAdminAddedList.indexOf(userId);
        temp_array.splice(index, 1);
        setUserAdminAddedList(temp_array);
        countRolesClicked()
        setRefresh(!refresh)
        return
      }
      
      else if (userBanAddedList.includes(userId)){
        let temp_array = userBanAddedList
        let index = userBanAddedList.indexOf(userId);
        temp_array.splice(index, 1);
        setUserBanAddedList(temp_array);
      }
      else if (userRemoveAddedList.includes(userId)){
        let temp_array = userRemoveAddedList
        let index = userRemoveAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserRemoveAddedList(temp_array)
      }
      else if (userUnadminAddedList.includes(userId)){
        let temp_array = userUnadminAddedList
        let index = userUnadminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserUnadminAddedList(temp_array)
      }
    }
    if (userAdminAddedList == []){
      let temp_array = []
      temp_array.push(userId)
      setUserAdminAddedList(temp_array)
    }
    else if (!userAdminAddedList.includes(userId)){
      let temp_array = userAdminAddedList
      temp_array.push(userId)
      setUserAdminAddedList(temp_array)
    }
    countRolesClicked()
    setRefresh(!refresh)
  }

  function isUserInAdminSelection(userId){
    if (userAdminAddedList == []){
      return false
    }
    for (let i=0; i<userAdminAddedList.length; i++){
      if (userAdminAddedList[i] == userId){
        return true
      }
    }
    return false
  }

  const [userRemoveAddedList, setUserRemoveAddedList] = useState([])


  //flash
  function addUserToRemoveSelection(paddockId, userId){
    if (numPaddockAnyUsers > 1 && isUserSuperAdmin && userId == loggedInUserId){
      if (paddockHasNoAdmins){
        flashAssignAdminError()
        return
      }
      else if (paddockHasNoBackupSuperAdmins){
        flashAssignSuperAdminError()
        return
      }
    }
    let temp_array = []
    if (loggedInUserId == userId){
      setUserAdminAddedList([])
      setUserUnadminAddedList([])
      setUserBanAddedList([])
      if (userRemoveAddedList.length == 1){
        if (userRemoveAddedList[0] != userId){
          temp_array.push(userId)
        }
        else{
          temp_array = []
        }
      }
      else{
        if (userRemoveAddedList.includes(userId)){
          temp_array = []
        }
        else{
          temp_array.push(userId)
        } 
      }
      setUserRemoveAddedList(temp_array)
      countRolesClicked()
      setRefresh(!refresh)
      return
    }
    else{
      removeUserRoleSelections();
      if (userRemoveAddedList.includes(userId)){
        let temp_array = userRemoveAddedList;
        let index = userRemoveAddedList.indexOf(userId);
        temp_array.splice(index, 1);
        setUserRemoveAddedList(temp_array);
        countRolesClicked()
        setRefresh(!refresh)
        return
      }
      
      if (userBanAddedList.includes(userId)){
        let temp_array = userBanAddedList
        let index = userBanAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserBanAddedList(temp_array)
      }
      else if (userAdminAddedList.includes(userId)){
        let temp_array = userAdminAddedList
        let index = userAdminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserAdminAddedList(temp_array)
      }
      else if (userUnadminAddedList.includes(userId)){
        let temp_array = userUnadminAddedList
        let index = userUnadminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserUnadminAddedList(temp_array)
      }
    }
    if (userRemoveAddedList == []){
      let temp_array = []
      temp_array.push(userId)
      setUserRemoveAddedList(temp_array)
    }
    else if (userRemoveAddedList.includes(userId)){
      let temp_array = userRemoveAddedList
      for (let i=0; i<temp_array.length; i++){
        if (temp_array[i] == userId){
          temp_array.splice(i, 1)
          setUserRemoveAddedList(temp_array)
          break
        }
      }
    }
    else{
      let temp_array = userRemoveAddedList
      temp_array.push(userId)
      setUserRemoveAddedList(temp_array)
    }
    countRolesClicked()
    setRefresh(!refresh)
  }

  function isUserInRemoveSelection(paddockId, userId){
    if (userRemoveAddedList == []){
      return false
    }
    for (let i=0; i<userRemoveAddedList.length; i++){
      if (userRemoveAddedList[i] == userId){
        return true
      }
    }
    return false
  }

  const [userUnadminAddedList, setUserUnadminAddedList] = useState([])

  function addUserToUnadminSelection(paddockId, userId){
    let temp_array = []
    if (loggedInUserId == userId){
      setUserBanAddedList([])
      setUserAdminAddedList([])
      setUserRemoveAddedList([])
      if (userUnadminAddedList.length == 1){
        if (userUnadminAddedList[0] != userId){
          temp_array.push(userId)
        }
        else{
          temp_array = []
        }
      }
      else{
        if (userUnadminAddedList.includes(userId)){
          temp_array = []
        }
        else{
          temp_array.push(userId)
          
        }
      }
      setUserUnadminAddedList(temp_array)
      countRolesClicked()
      setRefresh(!refresh)
      return
    }
    else{
      removeUserRoleSelections();
      if (userUnadminAddedList.includes(userId)){
        let temp_array = userUnadminAddedList;
        let index = userUnadminAddedList.indexOf(userId);
        temp_array.splice(index, 1);
        setUserUnadminAddedList(temp_array);
        countRolesClicked()
        setRefresh(!refresh)
        return
      }
      
      if (userBanAddedList.includes(userId)){
        let temp_array = userBanAddedList
        let index = userBanAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserBanAddedList(temp_array)
      }
      else if (userAdminAddedList.includes(userId)){
        let temp_array = userAdminAddedList
        let index = userAdminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserAdminAddedList(temp_array)
      }
      else if (userRemoveAddedList.includes(userId)){
        let temp_array = userRemoveAddedList
        let index = userRemoveAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserRemoveAddedList(temp_array)
      }
    }
    if (userRemoveAddedList == []){
      let temp_array = []
      temp_array.push(userId)
      setUserRemoveAddedList(temp_array)
    }
    else if (userUnadminAddedList.includes(userId)){
      let temp_array = userUnadminAddedList
      for (let i=0; i<temp_array.length; i++){
        if (temp_array[i] == userId){
          temp_array.splice(i, 1)
          setUserUnadminAddedList(temp_array)
          break
        }
      }
    }
    else{
      let temp_array = userUnadminAddedList
      temp_array.push(userId)
      setUserUnadminAddedList(temp_array)
    }
    countRolesClicked()
    setRefresh(!refresh)
  }

  function isUserInUnadminSelection(paddockId, userId){
    if (userUnadminAddedList == []){
      return false
    }
    for (let i=0; i<userUnadminAddedList.length; i++){
      if (userUnadminAddedList[i] == userId){
        return true
      }
    }
    return false
  }

  const [noSuperAdminErrorFlashOn, setNoSuperAdminErrorFlashOn] = useState(false)
  const [noAdminErrorFlashOn, setNoAdminErrorFlashOn] = useState(false)

  function flashAssignSuperAdminError(){
    setUserAdminAddedList([])
    setUserUnadminAddedList([])
    setUserRemoveAddedList([])
    setUserBanAddedList([])

    setTimeout(function(){
      setNoSuperAdminErrorFlashOn(false)
    }, 1000)
    setNoSuperAdminErrorFlashOn(true)
  }

  function flashAssignAdminError(){
    setUserAdminAddedList([])
    setUserUnadminAddedList([])
    setUserRemoveAddedList([])
    setUserBanAddedList([])

    setTimeout(function(){
      setNoAdminErrorFlashOn(false)
    }, 1000)
    
    setNoAdminErrorFlashOn(true)
  }

  const [userBanAddedList, setUserBanAddedList] = useState([])

  function addUserToBanSelection(paddockId, userId){
    if (numPaddockAnyUsers > 1 && isUserSuperAdmin && userId == loggedInUserId){
      if (paddockHasNoAdmins){
        flashAssignAdminError()
        return
      }
      else if (paddockHasNoBackupSuperAdmins){
        flashAssignSuperAdminError()
        return
      }
    }
    let temp_array = []
    if (loggedInUserId == userId){
      setUserAdminAddedList([])
      setUserUnadminAddedList([])
      setUserRemoveAddedList([])
      if (userBanAddedList.length == 1){
        if (userBanAddedList[0] != userId){
          temp_array.push(userId)
        }
        else{
          temp_array = []
        }
      }
      else{
        if (userBanAddedList.includes(userId)){
          temp_array = []
        }
        else{
          temp_array.push(userId)
        } 
      }
      setUserBanAddedList(temp_array)
      countRolesClicked()
      setRefresh(!refresh)
      return
    }
    else{
      removeUserRoleSelections();
      if (userBanAddedList.includes(userId)){
        let temp_array = userBanAddedList;
        let index = userBanAddedList.indexOf(userId);
        temp_array.splice(index, 1);
        setUserBanAddedList(temp_array);
        countRolesClicked()
        setRefresh(!refresh)
        return
      }
      else if (userRemoveAddedList.includes(userId)){
        let temp_array = userRemoveAddedList
        let index = userRemoveAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserRemoveAddedList(temp_array)
      }
      else if (userAdminAddedList.includes(userId)){
        let temp_array = userAdminAddedList
        let index = userAdminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserAdminAddedList(temp_array)
      }
      else if (userUnadminAddedList.includes(userId)){
        let temp_array = userUnadminAddedList
        let index = userUnadminAddedList.indexOf(userId);
        temp_array.splice(index, 1)
        setUserUnadminAddedList(temp_array)
      }
    }
    if (userBanAddedList == []){
      let temp_array = []
      temp_array.push(userId)
      setUserBanAddedList(temp_array)
    }
    else if (userBanAddedList.includes(userId)){
      let temp_array = userBanAddedList
      for (let i=0; i<temp_array.length; i++){
        if (temp_array[i] == userId){
          temp_array.splice(i, 1)
          setUserBanAddedList(temp_array)
          break
        }
      }
    }
    else{
      let temp_array = userBanAddedList
      temp_array.push(userId)
      setUserBanAddedList(temp_array)
    }
    countRolesClicked()
    setRefresh(!refresh)
    return
  }

  function isUserInBanSelection(paddockId, userId){
    if (userBanAddedList == []){
      return false
    }
    for (let i=0; i<userBanAddedList.length; i++){
      if (userBanAddedList[i] == userId){
        return true
      }
    }
    return false
  }

  function removeUserRoleSelections(){
    if (userAdminAddedList.includes(loggedInUserId)){
      let temp_array = userAdminAddedList
      let index = userAdminAddedList.indexOf(loggedInUserId);
      temp_array.splice(index, 1);
      setUserAdminAddedList(temp_array)
    }
    if (userUnadminAddedList.includes(loggedInUserId)){
      let temp_array = userUnadminAddedList
      let index = userUnadminAddedList.indexOf(loggedInUserId);
      temp_array.splice(index, 1);
      setUserUnadminAddedList(temp_array)
    }
    if (userRemoveAddedList.includes(loggedInUserId)){
      let temp_array = userRemoveAddedList
      let index = userRemoveAddedList.indexOf(loggedInUserId);
      temp_array.splice(index, 1);
      setUserRemoveAddedList(temp_array)
    }
    if (userBanAddedList.includes(loggedInUserId)){
      let temp_array = userBanAddedList
      let index = userBanAddedList.indexOf(loggedInUserId);
      temp_array.splice(index, 1);
      setUserBanAddedList(temp_array)
    }
  }
   
  const [affectedPaddockName, setAffectedPaddockName] = useState("")
  const [affectedPaddockId, setAffectedPaddockId] = useState(0)
  const [executeUserChangesPage, setExecuteUserChangesPage] = useState(false)

  const [banList, setBanList] = useState([])

  function handleUpdateUsersClick(paddockName, paddockId){
    
    setBanError(false)
    setBanningsConfirmed(false)
    setRemoveError(false)
    setRemovedConfirmed(false)
    if (userAdminAddedList.length > 0){
      makePaddockAdmin(paddockId, loggedInUserId)
      setUserAdminAddedList([])
    }
    if (userUnadminAddedList.length > 0){
      removePaddockAdmin(paddockId, loggedInUserId, selectedPaddockName)
      setUserUnadminAddedList([])
    }
    if (exitClickedList.length > 0){
      let temp_array = []
      let remove_list = []
      temp_array.push(loggedInUserId)
      setUserRemoveAddedList(temp_array)
      for (let u=0; u<temp_array.length; u++){
        for (let user=0; user<userPaddockData.paddockUsers[paddockName].length; user++){
          if (userPaddockData.paddockUsers[paddockName][user].userId == temp_array[u]){
            remove_list.push({
              "username":userPaddockData.paddockUsers[paddockName][user].username.toString() + " (Yourself)",
              "id":userPaddockData.paddockUsers[paddockName][user].userId
            })
          }
        }
      }
      setRemoveList(remove_list)
      setAffectedPaddockId(paddockId)
      setAffectedPaddockName(paddockName)
      setExecuteUserChangesPage(true)
      return
    }
    if (userBanAddedList.length == 0 && userRemoveAddedList.length == 0){
      return
    }
    if (userBanAddedList.length > 0){
      let ban_list = []
      for (let u=0; u<userBanAddedList.length; u++){
        for (let user=0; user<userPaddockData.paddockUsers[paddockName].length; user++){
          if (userPaddockData.paddockUsers[paddockName][user].userId == userBanAddedList[u]){
            if (userPaddockData.paddockUsers[paddockName][user].userId == loggedInUserId){
              ban_list.push({
                "username":userPaddockData.paddockUsers[paddockName][user].username.toString() + " (Yourself)",
                "id":userPaddockData.paddockUsers[paddockName][user].userId
              })
            }
            else{
              ban_list.push({
                "username":userPaddockData.paddockUsers[paddockName][user].username,
                "id":userPaddockData.paddockUsers[paddockName][user].userId
              })
            }
          }
        }
      }
      setBanList(ban_list) 
    }
    if (userRemoveAddedList.length > 0){
      let remove_list = []
      for (let u=0; u<userRemoveAddedList.length; u++){
        for (let user=0; user<userPaddockData.paddockUsers[paddockName].length; user++){
          if (userPaddockData.paddockUsers[paddockName][user].userId == userRemoveAddedList[u]){
            if (userPaddockData.paddockUsers[paddockName][user].userId == loggedInUserId){
              remove_list.push({
                "username":userPaddockData.paddockUsers[paddockName][user].username.toString() + " (Yourself)",
                "id":userPaddockData.paddockUsers[paddockName][user].userId
              })
            }
            else{
              remove_list.push({
                "username":userPaddockData.paddockUsers[paddockName][user].username,
                "id":userPaddockData.paddockUsers[paddockName][user].userId
              })
            }
          }
        }
      }
      setRemoveList(remove_list) 
    }
    setAffectedPaddockId(paddockId)
    setAffectedPaddockName(paddockName)
    setExecuteUserChangesPage(true)
  }

  async function banUsersFromPaddock(paddockId){
    let ban_dict = {}
    ban_dict['userBanList'] = userBanAddedList;
    ban_dict['paddock_id'] = paddockId;

    fetch(baseUrl + '/api/paddocks/ban-user/' + paddockId + "/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(ban_dict)
      })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setBanErrorMessage(response.statusText.toString())
            return "failed"
          }
          else{
            return "success"
          }
        })
        getUserPaddockData();
        countPaddockAdmins(selectedPaddockName);
        countPaddockUsers(selectedPaddockName)
      }  
  
  const [banErrorMessage, setBanErrorMessage] = useState("")
  const [banError, setBanError] = useState(false)    
  const [banningsConfirmed, setBanningsConfirmed] = useState(false)
  const [banningsConfirmClicked, setBanningsConfirmClicked] = useState(false)

  function confirmBannings(){
    setServerBusy(true)
    setBanningsConfirmClicked(true)
    banUsersFromPaddock(affectedPaddockId, selectedPaddockName)
    setTimeout(function(){
      setUserBanAddedList([])
      setBanningsConfirmClicked(false)
      setBanningsConfirmed(true)
      checkOutstandingUserChanges("bannings")
      setServerBusy(false)
      setExitClickedList([])
    }, 1500)
  }

  function cancelBannings(){
    setUserBanAddedList([])
    setBanList([])
    setExitClickedList([])
    setExecuteUserChangesPage(false)
  }

  function checkOutstandingUserChanges(string){
    if (string == "bannings"){
      if (userAdminAddedList.length == 0 && userUnadminAddedList.length == 0 && userRemoveAddedList.length == 0){
        setExecuteUserChangesPage(false)
      }
    }
    else if (string == "removed"){
      if (userAdminAddedList.length == 0 && userUnadminAddedList.length == 0 && userBanAddedList.length == 0){
        setExecuteUserChangesPage(false)
      }
    }
  }

  const [removeList, setRemoveList] = useState([])

  async function makePaddockAdmin(paddockId, UserId){
    let executingUserId = UserId
    let affectedPaddock = paddockId
    let make_admin_dict = {}
    make_admin_dict["executingUserId"] = executingUserId;
    make_admin_dict['affectedUserIdList'] = userAdminAddedList
    make_admin_dict['paddockId'] = affectedPaddock

    fetch(baseUrl + '/api/paddock/make-admin/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(make_admin_dict)
      })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setRemoveErrorMessage(response.statusText.toString())
            return "failed"
          }
          else{
            console.log("WE ARE UPDATEING DATA")
            getUserPaddockData()
            countPaddockAdmins(selectedPaddockName)
            countPaddockUsers(selectedPaddockName)
            //setPaddockHasNoAdmins(false)
            return "success"
          }
        })
      }

  async function removePaddockAdmin(paddockId, UserId, paddockName){
    let executingUserId = UserId;
    let affectedPaddock = paddockId;
    let remove_admin_dict = {};
    remove_admin_dict["executingUserId"] = executingUserId;
    remove_admin_dict['affectedUserIdList'] = userUnadminAddedList;
    remove_admin_dict['paddockId'] = affectedPaddock;

    fetch(baseUrl + '/api/paddock/remove-admin/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(remove_admin_dict)
      })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setRemoveErrorMessage(response.statusText.toString())
            return "failed"
          }
          else{
            getUserPaddockData()
            countPaddockAdmins(selectedPaddockName)
            countPaddockUsers(selectedPaddockName)
            return "success"
          }
        })
      }
  async function makePaddockSuperAdmin(paddockId, UserId){
    let executingUserId = UserId
    let affectedPaddock = paddockId
    let make_super_admin_dict = {}
    make_super_admin_dict["executingUserId"] = executingUserId;
    make_super_admin_dict['affectedUserIdList'] = userSuperAdminAddedList
    make_super_admin_dict['paddockId'] = affectedPaddock

    fetch(baseUrl + '/api/paddock/make-superadmin/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(make_super_admin_dict)
      })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setRemoveErrorMessage(response.statusText.toString())
            return "failed"
          }
          else{
            getUserPaddockData()
            countPaddockAdmins(selectedPaddockName)
            countPaddockUsers(selectedPaddockName)
            setAssignSuperUserClicked(false)
            setUserBanAddedList([])
            setSuperUserAddedList([])
            setUserSuperAdminAddedList([])
            //setPaddockHasNoAdmins(false)
            return "success"
          }
        })
      }

  async function removePaddockSuperAdmin(paddockId, UserId){
    let executingUserId = UserId;
    let affectedPaddock = paddockId;
    let remove_super_admin_dict = {};
    remove_super_admin_dict["executingUserId"] = executingUserId;
    remove_super_admin_dict['affectedUserIdList'] = userSuperAdminAddedList;
    remove_super_admin_dict['paddockId'] = affectedPaddock;

    fetch(baseUrl + '/api/paddock/remove-superadmin/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(remove_super_admin_dict)
      })
        .then(async response => {
          let isJson = response.headers.get('content-type')?.includes('applicataion/json');
          let data = isJson && await response.json();

          if(!response.ok) {
            let error = (data && data.message) || response.status;
            setRemoveErrorMessage(response.statusText.toString())
            return "failed"
          }
          else{
            getUserPaddockData()
            countPaddockAdmins(selectedPaddockName)
            setAssignSuperUserClicked(false)
            setUserBanAddedList([])
            setSuperUserAddedList([])
            setUserSuperAdminAddedList([])
            return "success"
          }
        })
      }
  const [selectedPaddockName, setSelectedPaddockName] = useState("");

  const [removeErrorMessage, setRemoveErrorMessage] = useState("")
  const [removeError, setRemoveError] = useState(false)    
  const [removedConfirmed, setRemovedConfirmed] = useState(false)
  const [removedConfirmClicked, setRemovedConfirmClicked] = useState(false)

  const [serverBusy, setServerBusy] = useState(false)

  function confirmRemoved(){
    setServerBusy(true)
    setRemovedConfirmClicked(true)
    removeUsersFromPaddock(affectedPaddockId)
    setTimeout(function(){
      setUserRemoveAddedList([])
      setRemovedConfirmClicked(false)
      setRemovedConfirmed(true)
      checkOutstandingUserChanges("removed")
      setServerBusy(false)
      setExitClickedList([])
    }, 1500)
  }

  function cancelRemoved(){
    setUserRemoveAddedList([])
    setRemoveList([])
    setExitClickedList([])
    setExecuteUserChangesPage(false)
  }

  function checkOutstandingUserChanges(string){
    if (string == "removed"){
      if (userBanAddedList.length == 0){
        setRemoveList([])
        setBanList([])
        setExecuteUserChangesPage(false)
      }
      else{
        return
      }
    }
    
    if (string == "bannings"){
      if (userRemoveAddedList.length == 0){
        setBanList([])
        setRemoveList([])
        setExecuteUserChangesPage(false)
      }
      else{
        return
      }
    }
  }

  function handleSuperAdminCancelClick(){
    handleClearSelectionClick()
    setAssignSuperUserClicked(false)
  }

  function handleClearSelectionClick(){
    setUserBanAddedList([])
    setUserAdminAddedList([])
    setUserRemoveAddedList([])
    setUserUnadminAddedList([])
    setUserSuperAdminAddedList([])
  }

  const [superUserClicked, setAssignSuperUserClicked] = useState(false)
  const [superUserAddedList, setSuperUserAddedList] = useState([])
  const [assignSuperAdminAdminError, setAssignSuperAdminAdminError] = useState(false)

  async function handleAssignSuperUserClick(){
    handleClearSelectionClick()
    await countPaddockAdmins(selectedPaddockName)
    .then(hasadmins => {
      if (paddockHasNoAdmins){
        setAssignSuperAdminAdminError(true)
        flashAssignAdminError()
        setAssignSuperAdminAdminError(false)
        return
      }
      if (superUserClicked == false){
        setAssignSuperUserClicked(true)
      }
      else{
        setAssignSuperUserClicked(false)
      }
    })
  }

  const [userSuperAdminAddedList, setUserSuperAdminAddedList] = useState([])

  function addUserToSuperAdminSelection(userId, paddockId){
    let temp_array = userSuperAdminAddedList
    if (userSuperAdminAddedList.includes(userId)){
      let index = temp_array.indexOf(userId)
      temp_array.splice(index, 1)
    }
    else{
      temp_array.push(userId)
    }
    setUserSuperAdminAddedList(temp_array)
    setRefresh(!refresh)
  }

  function isUserInSuperAdminSelection(userId){
    if (userSuperAdminAddedList.includes(userId)){
      return true
    }
    return false
  }

  function goToLeaderBoard(paddockId){
    window.location.href = baseUrl + "/leaderboards/" + paddockId
  }

  function goToPaddockRules(paddockId){
    window.location.href = baseUrl + "/paddock-rules/" + paddockId
  }

  function goToManualResult(paddockId){
    window.location.href = baseUrl + "/manual-result-capture/" + paddockId
  }
    
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
            My Paddocks
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

  else if (executeUserChangesPage){
    return(
      <div style={{
        justifyContent:"center",
        maxWidth:600,
        marginLeft:'auto',
        marginRight:'auto',
        }}>
        <div style={{
          display:'flex',
          flexDirection:'column',
          justifyContent:'center',
          }}>
          <div style={{
            marginTop:80,
            textAlign:'center'
            }}>
            <h1 style={{
              marginBottom:5,
              }}>
              My Paddocks
            </h1>
          </div>
          <div style={{
            textAlign:'center',
            marginTop:0,
            }}>
            <h3 style={{
              marginBottom:0,
              }}>
              {affectedPaddockName} Paddock
            </h3>
          </div>
          {banList.length > 0
        ? <div style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"8px 8px 0px 0px",
            backgroundColor:"#BD2031",
            color:"#FEFDFB",
            margin:"18px 15px 0px 15px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}>
            Ban Users:
          </div>
        : null}
          {banError && banList.length > 0
        ? <div style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            color:"#28282B",
            padding:'10px 10px 6px 0px',
            margin:"0px 15px 5px 0px",
            justifyContent:'center',
            }}>
            {banErrorMessage}
          </div>
        : <ul style={{
            listStyle:'none',
            marginLeft:'20px',
            padding:'0px',
            }}>
            {banList.map(usersToBan => (
            <li id={usersToBan.id}
              style={{
              marginLeft:0,
              marginBottom:5,   
              }}>
              <div style={{
                display:'flex',
                flexDirection:'row',
                }}>
                <div style={{
                  display:'flex',
                  textAlign:"center",
                  width:'auto',
                  color:"#28282B",
                  padding:'10px 0px 6px 10px',
                  margin:"0px 15px 5px 15px",
                  justifyContent:'center',
                  }}>
                  <FaIcons.FaUserCircle style={{fontSize:20}}></FaIcons.FaUserCircle>
                </div>
                <div style={{
                  display:'flex',
                  textAlign:"center",
                  width:'auto',
                  color:"#28282B",
                  padding:'10px 10px 6px 0px',
                  margin:"0px 15px 5px 0px",
                  justifyContent:'center',
                  }}>
                  {usersToBan.username}
                </div>
              </div>
            </li>
            ))}
          </ul>
          }
          {banningsConfirmClicked || serverBusy && banList.length > 0
        ? <div style={{
            display:'grid',
            gridTemplateColumns:'50% 50%',
            marginBottom:'30px',
            }}>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"8px 0px 0px 8px",
              backgroundColor:"#BD2031",
              color:"#FEFDFB",
              margin:"0px 2px 4px 15px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              }}>
              <ClipLoader css={loaderCss} size={18} color="#FEFDFB"/>
            </div>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"0px 8px 8px 0px",
              backgroundColor:"#48A14D",
              color:"#FEFDFB",
              margin:"0px 15px 4px 2px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              }}>
              <ClipLoader css={loaderCss} size={18} color="#FEFDFB"/>
            </div>
          </div>
        : banningsConfirmed && banList.length > 0
        ? <div style={{
            display:'grid',
            gridTemplateColumns:'50% 50%',
            marginBottom:'30px',
            }}>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"8px 0px 0px 8px",
              backgroundColor:"grey",
              color:"#FEFDFB",
              margin:"0px 2px 4px 15px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              cursor:"pointer",
              }}>
              Confirm
            </div>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"0px 8px 8px 0px",
              backgroundColor:"grey",
              color:"#FEFDFB",
              margin:"0px 15px 4px 2px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              cursor:"pointer",
              }}>
              Cancel
            </div>
          </div>
        : banList.length > 0
        ? <div style={{
          display:'grid',
          gridTemplateColumns:'50% 50%',
          marginBottom:'30px',
          }}>
          <div role="button"
            onClick={() => confirmBannings()} 
            style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"8px 0px 0px 8px",
            backgroundColor:"#BD2031",
            color:"#FEFDFB",
            margin:"0px 2px 4px 15px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            cursor:"pointer",
            }}>
            Confirm
          </div>
          <div role="button"
            onClick={() => cancelBannings()} 
            style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"0px 8px 8px 0px",
            backgroundColor:"#48A14D",
            color:"#FEFDFB",
            margin:"0px 15px 4px 2px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            cursor:"pointer",
            }}>
            Cancel
          </div>
        </div>
      : null}
        {removeList.length > 0
      ? <div style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"8px 8px 0px 0px",
            backgroundColor:"#BD2031",
            color:"#FEFDFB",
            margin:"18px 15px 0px 15px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            }}>
            Remove Users:
          </div>
        : null}
          {removeError && removeList.length > 0
        ? <div style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            color:"#28282B",
            padding:'10px 10px 6px 0px',
            margin:"0px 15px 5px 0px",
            justifyContent:'center',
            }}>
            {removeErrorMessage}
          </div>
        : <ul style={{
            listStyle:'none',
            marginLeft:'20px',
            padding:'0px',
            }}>
            {removeList.map(usersToRemove => (
            <li id={usersToRemove.id}
              style={{
              marginLeft:0,
              marginBottom:5,   
              }}>
              <div style={{
                display:'flex',
                flexDirection:'row',
                }}>
                <div style={{
                  display:'flex',
                  textAlign:"center",
                  width:'auto',
                  color:"#28282B",
                  padding:'10px 0px 6px 10px',
                  margin:"0px 15px 5px 15px",
                  justifyContent:'center',
                  }}>
                  <FaIcons.FaUserCircle style={{fontSize:20}}></FaIcons.FaUserCircle>
                </div>
                <div style={{
                  display:'flex',
                  textAlign:"center",
                  width:'auto',
                  color:"#28282B",
                  padding:'10px 10px 6px 0px',
                  margin:"0px 15px 5px 0px",
                  justifyContent:'center',
                  }}>
                  {usersToRemove.username}
                </div>
              </div>
            </li>
            ))}
          </ul>
          }
          {removedConfirmClicked || serverBusy && removeList.length > 0
        ? <div style={{
            display:'grid',
            gridTemplateColumns:'50% 50%',
            marginBottom:'30px',
            }}>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"8px 0px 0px 8px",
              backgroundColor:"#BD2031",
              color:"#FEFDFB",
              margin:"0px 2px 4px 15px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              }}>
              <ClipLoader css={loaderCss} size={18} color="#FEFDFB"/>
            </div>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"0px 8px 8px 0px",
              backgroundColor:"#48A14D",
              color:"#FEFDFB",
              margin:"0px 15px 4px 2px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              }}>
              <ClipLoader css={loaderCss} size={18} color="#FEFDFB"/>
            </div>
          </div>
        : removedConfirmed && removeList.length > 0
        ? <div style={{
            display:'grid',
            gridTemplateColumns:'50% 50%',
            marginBottom:'30px',
            }}>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"8px 0px 0px 8px",
              backgroundColor:"grey",
              color:"#FEFDFB",
              margin:"0px 2px 4px 15px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              cursor:"pointer",
              }}>
              Confirm
            </div>
            <div style={{
              display:'flex',
              textAlign:"center",
              width:'auto',
              borderRadius:"0px 8px 8px 0px",
              backgroundColor:"grey",
              color:"#FEFDFB",
              margin:"0px 15px 4px 2px",
              padding:'6px 10px',
              textAlign:'center',
              justifyContent:'center',
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              cursor:"pointer",
              }}>
              Cancel
            </div>
          </div>
        : removeList.length > 0
        ? <div style={{
          display:'grid',
          gridTemplateColumns:'50% 50%',
          marginBottom:'30px',
          }}>
          <div role="button"
            onClick={() => confirmRemoved()} 
            style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"8px 0px 0px 8px",
            backgroundColor:"#BD2031",
            color:"#FEFDFB",
            margin:"0px 2px 4px 15px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            cursor:"pointer",
            }}>
            Confirm
          </div>
          <div role="button"
            onClick={() => cancelRemoved()} 
            style={{
            display:'flex',
            textAlign:"center",
            width:'auto',
            borderRadius:"0px 8px 8px 0px",
            backgroundColor:"#48A14D",
            color:"#FEFDFB",
            margin:"0px 15px 4px 2px",
            padding:'6px 10px',
            textAlign:'center',
            justifyContent:'center',
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            cursor:"pointer",
            }}>
            Cancel
          </div>
        </div>
      : null}
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
        <h1>My Paddocks</h1>
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
                marginBottom:7,
                borderRadius:50,
                marginRight:15,
                maxWidth:600,
                justifyContent:'center',
                marginLeft:'auto',
                marginRight:'auto',
                }}>
                  <div style={{
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
                    <div style={{
                        fontSize:16,
                        textAlign:'right'}}>
                        {paddocks.paddockCode}
                      </div>
                      <div></div>
                    </div>
                    {isInExitClickSelection(paddocks.id) && noAdminErrorFlashOn
                  ? <div style={{
                      display:'grid',
                      gridTemplateColumns:"50% 50%"}}>
                      <div style={{
                        display:"flex",
                        backgroundColor:"#48A14D",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        borderRadius: "0px 0px 0px 10px",
                        marginRight:'2px',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}}>
                        First Add Admin
                      </div>
                      <div role="button" 
                        onClick={() => handleManagePaddockButtonClick(paddocks.id, paddocks.paddockName)}
                        style={{
                        display:'grid',
                        gridTemplateColumns:'8px 6px 10px auto auto auto 8px',
                        backgroundColor:"#ED944D",
                        color:"#28282B",
                        alignItems:"center",
                        padding:7,
                        marginLeft:'2px',
                        borderRadius: "0px 0px 10px 0px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        fontSize:14}}>
                        <div></div>
                        {exitClickedList.length>0 || managePaddockClickedSelection[0] == paddocks.id
                      ? <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropup/>
                        </div>
                      : <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropdown/>
                        </div>
                        }
                        <div></div>
                        <div></div>
                        <div style={{
                          display:'flex',
                          justifyContent:'center',
                          textAlign:'right',
                          cursor:"pointer",
                          }}>
                          Manage
                        </div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  : isInExitClickSelection(paddocks.id) && noSuperAdminErrorFlashOn
                  ? <div style={{
                      display:'grid',
                      gridTemplateColumns:"50% 50%"}}>
                      <div style={{
                        display:"flex",
                        backgroundColor:"#48A14D",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        borderRadius: "0px 0px 0px 10px",
                        marginRight:'2px',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}}>
                        First Add Super
                      </div>
                      <div role="button" 
                        onClick={() => handleManagePaddockButtonClick(paddocks.id, paddocks.paddockName)}
                        style={{
                        display:'grid',
                        gridTemplateColumns:'6px 6px 4px auto auto auto 8px',
                        backgroundColor:"#ED944D",
                        color:"#28282B",
                        alignItems:"center",
                        padding:7,
                        marginLeft:'2px',
                        borderRadius: "0px 0px 10px 0px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        fontSize:14}}>
                        <div></div>
                        {exitClickedList.length>0 || managePaddockClickedSelection[0] == paddocks.id
                      ? <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropup/>
                        </div>
                      : <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropdown/>
                        </div>
                        }
                        <div></div>
                        <div></div>
                        <div style={{
                          display:'flex',
                          justifyContent:'center',
                          left:"12px",
                          cursor:"pointer",
                          }}>
                          Manage
                        </div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  : isInExitClickSelection(paddocks.id)
                  ? <div style={{
                      display:'grid',
                      gridTemplateColumns:"50% 50%"}}>
                      <div role="button" style={{
                        display:"flex",
                        backgroundColor:"#48A14D",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        borderRadius: "0px 0px 0px 10px",
                        marginRight:'2px',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}} onClick={() => removeItemFromExitSelection(paddocks.id)}>
                        Cancel Exit
                      </div>
                      <div role="button" style={{
                        display:"flex",
                        backgroundColor:"#BD2031",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        marginLeft:'2px',
                        borderRadius: "0px 0px 10px 0px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}} onClick={() => handleUpdateUsersClick(paddocks.paddockName, paddocks.id)}>
                        Confirm Exit
                      </div>
                    </div>
                  : paddocks.isAdmin == 1 || paddocks.isSuperAdmin == 1
                  ? <div style={{
                      display: "grid",
                      gridTemplateColumns: "50% 50%"}}>
                      <div role="button" style={{
                        display:"flex",
                        backgroundColor:"#BD2031",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        marginRight:'2px',
                        borderRadius: '0px 0px 0px 10px',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}} onClick={() => addItemToExitSelection(paddocks.id, paddocks.paddockName)}>
                        Exit Paddock
                      </div>
                      <div role="button" 
                        onClick={() => handleManagePaddockButtonClick(paddocks.id, paddocks.paddockName)}
                        style={{
                        display:'grid',
                        gridTemplateColumns:'6px 6px 4px auto auto auto 8px',
                        backgroundColor:"#ED944D",
                        color:"#28282B",
                        alignItems:"center",
                        padding:7,
                        marginLeft:'2px',
                        borderRadius: "0px 0px 10px 0px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        fontSize:14}}>
                        <div></div>
                        {exitClickedList.length>0 || managePaddockClickedSelection[0] == paddocks.id
                      ? <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropup/>
                        </div>
                      : <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropdown/>
                        </div>
                        }
                        <div></div>
                        <div></div>
                        <div style={{
                          display:'flex',
                          justifyContent:'center',
                          textAlign:'right',
                          cursor:"pointer",
                          }}>
                          Manage
                        </div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  : <div style={{
                      display: "grid",
                      gridTemplateColumns: "50% 50%"}}>
                      <div role="button" style={{
                        display:"flex",
                        backgroundColor:"#BD2031",
                        color:"#FEFDFB",
                        alignItems:"center",
                        justifyContent:"center",
                        padding:7,
                        marginRight:'2px',
                        borderRadius: '0px 0px 0px 10px',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        cursor:"pointer",
                        fontSize:14}} onClick={() => addItemToExitSelection(paddocks.id, paddocks.paddockName)}>
                        Exit Paddock
                      </div>
                      <div role="button" 
                        onClick={() => handleManagePaddockButtonClick(paddocks.id, paddocks.paddockName)}
                        style={{
                        display:'grid',
                        gridTemplateColumns:'6px 6px 4px auto auto auto 8px',
                        backgroundColor:"#ED944D",
                        color:"#28282B",
                        alignItems:"center",
                        padding:7,
                        marginLeft:'2px',
                        borderRadius: "0px 0px 10px 0px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        fontSize:14}}>
                        <div></div>
                        {exitClickedList.length>0 || managePaddockClickedSelection[0] == paddocks.id
                      ? <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropup/>
                        </div>
                      : <div style={{
                          fontSize:14,
                          cursor:"pointer",
                          }}>
                          <IoIcons.IoMdArrowDropdown/>
                        </div>
                        }
                        <div></div>
                        <div></div>
                        <div style={{
                          display:'flex',
                          justifyContent:'center',
                          textAlign:'right',
                          cursor:"pointer", 
                          }}>
                          Details
                        </div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                    }
                    {isInPaddockManageClickSelection(paddocks.id)
                  ? <div>
                      <div style={{
                        display:'flex',
                        flexDirection:'column'
                        }}>
                        <div style={{
                          display:'grid',
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          gridTemplateColumns:'20px 20px 0px 60px auto 10px auto 60px 10px auto 25px 10px 25px 10px 30px',
                          fontSize:15,
                          marginBottom:8,
                          marginLeft:10,
                          marginRight:10,
                          fontFamily:'sans-serif',
                          borderRadius:'5px',
                          marginTop:"10px",
                          }}>
                          <div></div>
                          <div>
                            Player
                          </div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div style={{
                            textAlign:'left',
                          }}>
                            Login
                          </div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div>{paddocks.numUsers}/{paddocks.maxUsers}</div>
                          <div>
                            
                          </div>
                          <div></div>
                        </div>
                      </div>
                      <ul className="dd-list" style={{
                        listStyle:"none",
                        marginTop:0,
                        paddingLeft:0,
                        marginBottom:8,}}>
                        {userPaddockData.paddockUsers[paddocks.paddockName].map(paddockUsers => (
                        <li style={{
                          marginBottom:10,
                          }}>
                          <div style={{
                            display:'flex',
                            flexDirection:'column',
                            }}>
                            <div style={{
                              display:'grid',
                              gridTemplateColumns:'20px 20px 0px 60px auto 10px auto 60px 10px auto 25px 10px 25px 10px 30px',
                              flexDirection:'row',
                              fontSize:12,
                              alignItems:'center',
                              marginRight:20,
                              marginLeft:0,
                              fontFamily:'sans-serif',
                              height:'auto',
                              paddingTop:'10px',
                              paddingBottom:'10px',
                              color:"#6b717e",
                              }}>
                              {paddockUsers.isSuperAdmin == 1 || noSuperAdminErrorFlashOn
                            ? <div style={{
                                textAlign:'center',
                                color:'#6b717e',
                                fontSize:12,
                                }}>
                                <GiIcons.GiFullMotorcycleHelmet/>
                              </div>
                            : isUserInSuperAdminSelection(paddockUsers.userId)
                            ? <div style={{
                                textAlign:'center',
                                color:'#6b717e',
                                backgroundColor:"#ED944D",
                                fontSize:12,
                                paddingTop:'2px',
                                borderRadius:'2px',
                                }}>
                                <GiIcons.GiFullMotorcycleHelmet/>
                              </div>
                            : <div></div>
                              }
                              {paddockUsers.isAdmin == 1 && isUserInUnadminSelection(paddockUsers.paddockId, paddockUsers.userId) == false
                            ? <div style={{
                                textAlign:'center',
                                color:"#48A14D",
                                marginRight:'3px',
                                fontSize:12,
                                }}>
                                <RiIcons.RiAdminLine/>
                              </div>
                            : paddockUsers.isAdmin == 1 && isUserInUnadminSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                            ? <div style={{
                                textAlign:'center',
                                color:"#FEFDFB",
                                background:"#BD2031",
                                borderRadius:'2px',
                                marginRight:'3px',
                                fontSize:12,
                                }}>
                                <RiIcons.RiAdminLine/>
                              </div>
                            : noAdminErrorFlashOn || paddockUsers.isAdmin == 0 && isUserInAdminSelection(paddockUsers.userId) && superUserClicked == false
                            ? <div style={{
                                textAlign:'center',
                                color:"#FEFDFB",
                                background:"#48A14D",
                                borderRadius:'2px',
                                marginRight:'3px',
                                fontSize:12,
                                }}>
                                <RiIcons.RiAdminLine/>
                              </div>
                            : <div></div>
                              }
                              <div></div>
                              {isUserInRemoveSelection(paddockUsers.paddockId, paddockUsers.userId) || isUserInBanSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                            ? <div style={{
                                textAlign:'left',
                                textDecoration: 'line-through',
                                color:"#BD2031",
                                }}>
                                {paddockUsers.username}
                              </div>
                            : <div style={{
                                textAlign:'left',
                                }}>
                                {paddockUsers.username}
                              </div>
                              } 
                              <div></div>
                              <div></div>
                              <div></div>
                              <div style={{
                                }}>
                                {paddockUsers.lastLogin}
                              </div>
                              <div></div>
                              <div></div>
                              {isUserSuperAdmin && paddockUsers.isAdmin == 0
                            ? <div role="button" onClick={() => addUserToAdminSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {noAdminErrorFlashOn || isUserInAdminSelection(paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#48A14D",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                              : superUserClicked
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#48A14D",
                                  fontSize:15,
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                                }
                              </div>
                            : paddockUsers.isSuperAdmin == 1
                            ? <div></div>
                            : isUserSuperAdmin && paddocks.isAdmin == 1 && paddockUsers.isSuperAdmin == 0
                            ? <div role="button" onClick={() => addUserToUnadminSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInUnadminSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                              : superUserClicked
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                                }
                              </div>
                            : isUserAdmin && paddockUsers.isAdmin == 0 && paddockUsers.isSuperAdmin == 0
                            ? <div role="button" onClick={() => addUserToAdminSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInAdminSelection(paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#48A14D",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                              : superUserClicked
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#48A14D",
                                  fontSize:15,
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                                }
                                </div>
                            : isUserAdmin && paddockUsers.userId == loggedInUserId && paddockUsers.isSuperAdmin == 0
                            ? <div role="button" onClick={() => addUserToUnadminSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInUnadminSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                              : superUserClicked
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  }}>
                                  <RiIcons.RiAdminLine/>
                                </div>
                                }
                              </div>
                            : <div></div>
                              }
                              <div></div>
                              {isUserSuperAdmin || loggedInUserId == paddockUsers.userId
                            ? <div role="button" onClick={() => addUserToRemoveSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInRemoveSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <CgIcons.CgUserRemove/>
                                </div>
                              : superUserClicked
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  }}>
                                  <CgIcons.CgUserRemove/>
                                </div>
                                }
                              </div>
                            : isUserAdmin && paddockUsers.isAdmin == 0
                            ? <div role="button" onClick={() => addUserToRemoveSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInRemoveSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <CgIcons.CgUserRemove/>
                                </div>
                              : superUserClicked || paddockUsers.isSuperAdmin == true
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  }}>
                                  <CgIcons.CgUserRemove/>
                                </div>
                                }
                              </div>
                            : isUserAdmin == false
                            ? <div></div>
                            : <div></div>
                              }
                              <div></div>
                              {isUserSuperAdmin || loggedInUserId == paddockUsers.userId
                            ? <div role="button" onClick={() => addUserToBanSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInBanSelection(paddockUsers.paddockId, paddockUsers.userId) && superUserClicked == false
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:'3px 2px 2px 2px',
                                  marginBottom:'2px',
                                  cursor:'pointer',
                                  }}>
                                  Ban
                                </div>
                              : superUserClicked && paddockUsers.isAdmin == 1 && paddockUsers.userId != loggedInUserId && isUserInSuperAdminSelection(paddockUsers.userId) == true
                              ? <div role="button"
                                  onClick={() => addUserToSuperAdminSelection(paddockUsers.userId, paddockUsers.paddockId)}
                                  style={{
                                  textAlign:'center',
                                  color:"grey",
                                  backgroundColor:"#ED944D",
                                  borderRadius:'3px',
                                  paddingTop:"3px",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <GiIcons.GiFullMotorcycleHelmet/>
                                </div>
                              : superUserClicked && paddockUsers.isAdmin == 1 && paddockUsers.userId != loggedInUserId && isUserInSuperAdminSelection(paddockUsers.userId) == false && paddockUsers.isSuperAdmin == false
                              ? <div role="button"
                                  onClick={() => addUserToSuperAdminSelection(paddockUsers.userId, paddockUsers.paddockId)}
                                  style={{
                                  textAlign:'center',
                                  color:"grey",
                                  borderRadius:'3px',
                                  paddingTop:"3px",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  fontSize:15,
                                  padding:"10px, 0px, 0px, 2px",
                                  cursor:'pointer',
                                  }}>
                                  <GiIcons.GiFullMotorcycleHelmet/>
                                </div>
                              : superUserClicked || paddockUsers.isSuperAdmin == true
                              ? null
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:"10px, 0px, 0px, 2px",
                                  borderRadius:'3px',
                                  padding:'3px 2px 2px 2px',
                                  marginBottom:'2px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  }}>
                                  Ban
                                </div>
                                }
                              </div>
                            : isUserAdmin && paddockUsers.isAdmin == 0
                            ? <div role="button" onClick={() => addUserToBanSelection(paddockUsers.paddockId, paddockUsers.userId)}>
                                {isUserInBanSelection(paddockUsers.paddockId, paddockUsers.userId)
                              ? <div style={{
                                  textAlign:'center',
                                  color:"#FEFDFB",
                                  backgroundColor:"#BD2031",
                                  borderRadius:'3px',
                                  alignItems:'center',
                                  alignContent:'center',
                                  textAlign:'center',
                                  justifyContent:'center',
                                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                                  fontSize:15,
                                  padding:'3px 2px 2px 2px',
                                  marginBottom:'2px',
                                  cursor:'pointer',
                                  }}>
                                  Ban
                                </div>
                              : <div style={{
                                  textAlign:'center',
                                  color:"#BD2031",
                                  alignItems:'center',
                                  alignContent:'center',
                                  textAlign:'center',
                                  justifyContent:'center',
                                  borderColor: "1px solid green",
                                  padding:'3px 2px 2px 2px',
                                  borderRadius:'3px',
                                  fontSize:15,
                                  cursor:'pointer',
                                  marginBottom:'2px',
                                  }}>
                                  Ban
                                </div>
                                }
                              </div>
                            : <div></div>
                            }             
                            </div>
                          </div>
                        </li>
                        ))}
                      </ul>
                    {superUserClicked
                  ? null
                  : userAdminAddedList.length > 0 || userUnadminAddedList.length > 0 || userBanAddedList.length > 0 || userRemoveAddedList.length > 0 
                  ? <div 
                      role="button"
                      onClick={() => handleUpdateUsersClick(paddocks.paddockName, paddocks.id)}
                      style={{
                      display:'flex',
                      position:'relative',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#BD2031",
                      cursor:"pointer",

                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Update Paddock
                      </div>
                    </div>
                  : <div 
                      //role="button"
                      //onClick={() => handleUpdateUsersClick(paddocks.paddockName)}
                      style={{
                      display:'flex',
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      marginBottom :8,
                      backgroundColor:'grey',
                      cursor:"not-allowed",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"not-allowed",
                        }}>
                        Update Paddock
                      </div>
                    </div>
                    }
                    <div>
                    {userAdminAddedList.length > 0 || userUnadminAddedList.length > 0 || userBanAddedList.length > 0 || userRemoveAddedList.length > 0 
                  ? <div 
                      role="button"
                      onClick={() => handleClearSelectionClick()}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#48A14D",
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Clear Selection
                      </div>
                    </div>
                  : <div 
                      role="button"
                      //onClick={() => submitPaddockRoleChanges(paddocks.paddockName)}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:'grey',
                      cursor:"not-allowed",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"not-allowed",
                        }}>
                        Clear Selection
                      </div>
                    </div>
                    }
                    {assignSuperAdminAdminError || noAdminErrorFlashOn
                  ? <div 
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#48A14D",
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        First Assign Admin
                      </div>
                    </div>
                  : noSuperAdminErrorFlashOn
                  ? <div 
                    style={{
                    display:'flex',
                    marginBottom :8,
                    borderRadius:'10px',
                    alignItems:'center',
                    justifyContent:'center',
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    color:"#FEFDFB",
                    backgroundColor:"#48A14D",
                    cursor:"pointer",
                    }}>
                    <div 
                      style={{
                      display:'flex',
                      padding:'10px',
                      cursor:"pointer",
                      }}>
                      Must Assign Super Admin
                    </div>
                  </div>
                  : isUserSuperAdmin && superUserClicked == false
                  ? <div 
                      role="button"
                      onClick={() => handleAssignSuperUserClick()}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#ED944D",
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Assign Super Admin
                      </div>
                    </div> 
                  : superUserClicked && userSuperAdminAddedList.length == 0
                  ? <div 
                      role="button"
                      onClick={() => handleSuperAdminCancelClick()}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#48A14D",
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Cancel
                      </div>
                    </div>
                  : superUserClicked && userSuperAdminAddedList.length > 0
                  ? <div 
                      role="button"
                      onClick={() => makePaddockSuperAdmin(selectedPaddockId, loggedInUserId)}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:"#ED944D",
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Confirm Super Admin(s)
                      </div>
                    </div>
                  : <div 
                      role="button"
                      onClick={() => goToManualResult(paddocks.id)}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:'#387490',
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Go To Leaderboard
                      </div>
                    </div>
                    }
                    {paddocks.isAdmin == 1
                  ? <div 
                      role="button"
                      onClick={() => goToManualResult(paddocks.id)}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:'#387490',
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Manual Result
                      </div>
                    </div>
                  : null
                    }
                    {isUserSuperAdmin && superUserClicked == false
                  ? <div 
                      role="button"
                      onClick={() => goToLeaderBoard(paddocks.id)}
                      style={{
                      display:'flex',
                      marginBottom :8,
                      borderRadius:'10px',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      color:"#FEFDFB",
                      backgroundColor:'#387490',
                      cursor:"pointer",
                      }}>
                      <div 
                        style={{
                        display:'flex',
                        padding:'10px',
                        cursor:"pointer",
                        }}>
                        Go to leaderboard
                      </div>
                      </div>
                    : null}
                      </div>
                      {superUserClicked == false
                    ? <div 
                        role="button"
                        onClick={() => goToPaddockRules(paddocks.id)}
                        style={{
                        display:'flex',
                        marginBottom :8,
                        borderRadius:'10px',
                        alignItems:'center',
                        justifyContent:'center',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:"#FEFDFB",
                        backgroundColor:'#89B374',
                        cursor:"pointer",
                        }}>
                        <div 
                          style={{
                          display:'flex',
                          padding:'10px',
                          cursor:"pointer",
                          }}>
                          Paddock Rules
                        </div>
                      </div>
                    : null}
                      {superUserClicked == false
                    ? <div 
                        role="button"
                        onClick={() => goToPaddockRules(paddocks.id)}
                        style={{
                        display:'flex',
                        marginBottom :8,
                        borderRadius:'10px',
                        alignItems:'center',
                        justifyContent:'center',
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        color:"#FEFDFB",
                        backgroundColor:'#7289DA',
                        cursor:"pointer",
                        }}>
                        <div 
                          style={{
                          display:'flex',
                          padding:'10px',
                          cursor:"pointer",
                          }}>
                          Discord
                        </div>
                      </div>
                    : null}
                    </div>
                  : null}
                </div>
            </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
