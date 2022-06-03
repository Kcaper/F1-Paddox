import styled from "styled-components"

export const LeaderBoardAnimation = styled.div`
    display:'flex';
    align-items:"center";
    justify-content:'center';
    height:'auto';
    width:'100%';
    position: relative;
    transition: 0.3s;
    transform: translateX(
        ${({ state }) => (
        state === "exiting" 
    ?   400
    :   state === "exited"
    ?   400
    :   state === "entering"
    ?   400
    :   state === "entered"
    ?   0
    :   null
        )}px
    );
  /* change color*/
  background: white
`;


