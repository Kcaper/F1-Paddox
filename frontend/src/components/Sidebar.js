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
import './../../static/css/main.css';
import  './../../static/css/sidebar.css';

const Nav = styled.div``;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
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
      <IconContext.Provider value={{ color: '#F70100' }}>
        <Nav className='nav background-dark'>
          <NavIcon to='#'>
            <div className='nav-two'>
              <div className='burger-menu'>
                <FaIcons.FaBars onClick={showSidebar} />
              </div>
              <div className='image-container'>
                <img src="../static/images/logo/padoxlogo.png"/>
              </div>
              <div className='user-options-container'>
                <FaIcons.FaUserCircle className='user-icon'></FaIcons.FaUserCircle>
                {username == ""
                ? <div className='login-logout' role="button" onClick={() => window.location.href = baseUrl + "/api/logout"}>
                    Login
                  </div>
                : <div className='login-logout' role="button" onClick={() => window.location.href = baseUrl + "/"}>
                    {username}
                  </div>}
              </div>
            </div>
          </NavIcon>
        </Nav>
        <SidebarNav sidebar={sidebar} className='background-dark'>
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