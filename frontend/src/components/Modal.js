import React from 'react';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md'
import { useState } from 'react';

const Background = styled.div`
    height: 360px;
    width: 500px;
    position: fixed;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: rgba(0, 0, 0, 0.8)
    color: red;
`

const ModalWrapper = styled.div`
    border-radios: 4px;
    width: 100%;
    height: 100%;
    background: #fff;
    color: #000;
    display: flex;
    z-index: 50,
    border-radius: 10px;
    border: 1px solid black;
    postion: relative;
    flex-driection: column;
`

const ModalImg = styled.img`
    width: auto;
    height: auto;
    border-radius: 10px 0 0 10px;
    background: #000;
` 

const ModalContent = styled.div`
    display:flex;
    flex-driection: column;
    justify-content: center;
    align-items: center;
    line-height: 1.8;
    color: #141414;

    p {
        margin-bottom: 1rem
    }

    button {
        padding: 10px, 24px;
        background: #141414;
        color: #fff;
        border:none;
    }
`

function Modal(){

    function showOkModal(){
        setShowModal(true)
    }

    const [showModal, setShowModal] = useState(false)

    return( 
        <div style={{flex: "1"}}>
        {showModal
        ?   <div>
                <ModalWrapper showModal={showModal}>
                    <ModalImg src={'./static/images/AppImages/F1Logo.png'} alt="F1"/>
                        <ModalContent>
                            <h1>
                                Are You Ready
                            </h1>
                            <p>get exclusive</p>
                            <button>OK</button>
                    </ModalContent>
                </ModalWrapper>
            </div>
        :   null}
        </div>
    )
}

export default Modal

