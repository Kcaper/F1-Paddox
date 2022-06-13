import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import { GoHome } from 'react-icons/go';
import { baseUrl } from './F1HomePage';

const Nav = styled.div`
  background: #28282B;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: fixed;
  margin-top:0;
  width:100%;
  margin-top:0px;
  margin-left:0px;
  z-index:99;
  font-size:0rem;
  top:0;
  color:white;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;  
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
  background: #28282B;
  width: 250px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

function Sidebar({subnav, setSubnav, showSubnav}) {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  const [username, setUsername] = useState("")

  function goHome(){
    window.location.href = baseUrl
  }

  useEffect(() => {
    getUsername();
  },[]);

  const getUsername = async () => {
    await fetch(baseUrl + '/api/user/current-user')
    .then(response => response.json())
    .then(user => {
      setUsername(user.username)
    })
  }

  return (
      <IconContext.Provider value={{ color: '#BD2031' }}>
        <Nav style={{width:"100%", display:"flex", flexDirection:"row", marginTop:0}}>
          <NavIcon to='#'>
            <div style={{width:"100%", display:"flex", flexDirection:"row",}}>
              <div style={{
                marginLeft:0,
                fontSize:20,
                marginTop:10,
                }}>
                <FaIcons.FaBars onClick={showSidebar} />
              </div>
              <div style={{
                marginLeft:20,
                }}>
                <img src="../static/images/logo/padoxlogo.png" />
              </div>
              <div style={{
                display:'flex',
                flexDirection:'row',
                top: 29,
                position:"absolute",
                right:10,
                paddingRight:"10px",
                alignItems:'center'
                }}>
                <FaIcons.FaUserCircle style={{marginRight: "5px", fontSize:25}}></FaIcons.FaUserCircle>
                {username == "" 
                ? <div style={{fontFamily:"none", marginRight:0, fontSize:18, color:"white"}} role="button" onClick={() => window.location.href = baseUrl + "/api/logout"}>
                    Login
                  </div>
                : <div style={{fontFamily:"none", marginRight:0, fontSize:18, color:"white"}} role="button" onClick={() => window.location.href = baseUrl + "/"}>
                    {username}
                  </div>}
              </div>
            </div>
          </NavIcon>
        </Nav>
        <SidebarNav sidebar={sidebar} >
          <SidebarWrap>
            <NavIcon to='#'>
              <AiIcons.AiOutlineClose onClick={showSidebar} />
            </NavIcon>
            {SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index}/> ;
            })}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
  );
};

export default Sidebar;