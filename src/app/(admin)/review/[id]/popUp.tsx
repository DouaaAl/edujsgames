"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from "./review.module.css";
import { States } from '@prisma/client';
import { changeGameStateServer } from '@/actions/games';
import Image from 'next/image';
import socket from '@/actions/socket';

interface PopUpProps {
    state: States | "";
    gameId: String | string[];
    userId: string;
    setIsChange: Function;
}

const PopUp = ({ state, gameId, userId, setIsChange }: PopUpProps) => {
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState({
        reject: false,
        pend: false
    })

    const changeState = async () => {
        if (state) {
            const result = await changeGameStateServer({ id: gameId, state, message, userId });
            if (socket) {
                socket.emit("message", { message: "received message" , receiverId: userId});
            }
            if(state == "REJECTED"){
                setSuccess((prev)=>{
                    return {...prev, reject: true}
                })
            }
            if(state == "PINDING"){
                setSuccess((prev)=>{
                    return {...prev, pend: true}
                })
            }

            setTimeout(()=> setSuccess({pend: false, reject: false}), 3000)
        }
    }


    return (
        <article className={styles.popUp + " " + (state === "PINDING" ? styles.pinding : styles.reject)}>
            <div>
                <Image 
                    onClick={() => setIsChange(false)}
                    src="/close.png"
                    height={50}
                    width={50}
                    alt="delete"
                />
            </div>
            <h1>{state === "PINDING" ? "Stop" : "Reject"}</h1>
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Write a message'
                type="text"
            />
            <div>
                <button onClick={changeState}>{state}</button>
                {success.reject &&        <h2 style={{color: "#f9547a", fontSize: "21px"}} >The Game is rejected</h2>}
                {success.pend &&        <h2 style={{color: "#fcd6b4", fontSize: "21px"}}>The game is pending for rereview</h2>}
            </div>
        </article>
    );
}

export default PopUp;