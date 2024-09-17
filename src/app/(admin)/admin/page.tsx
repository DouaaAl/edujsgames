"use client"
import React, {useState, useEffect} from 'react'
import styles from "./admin.module.css"
import { getAllGamesStateServer } from '@/actions/games';
import { getAllUsersServer } from '@/actions/users';
import socket from '@/actions/socket';

const page = () => {
    const [liveUsers, setLiveUsers] = useState(0);
    const [submittedGames, setSubmittedGames] = useState(0)
    const [registeredUsers, setRegisteredUsers] = useState(0)

    const getInfo = async() =>{
        const games: any = await getAllGamesStateServer("PINDING");
        const users = await getAllUsersServer();
        setSubmittedGames(games?.length);
        setRegisteredUsers(users.length);
        socket.emit("connectedUsers");
    }

    useEffect(()=>{
        getInfo();
    },[])

    useEffect(()=>{
        socket.on("getAllLiveUsers", (data: any)=>{
            setLiveUsers(data.length);
        })
    },[socket])

  return (
    <main className={styles.main}>
        <h1 className={styles.title}>Admin</h1>
        <div className={styles.mid}>
            <a href="/admin/users">
                <button>View Users</button>
            </a>
            <a href="/approvegames">
                <button>Approve Games</button>
            </a>
        </div>
        <section className={styles.cardsGrid}>
            <div className={styles.card}>
                <h1>{submittedGames}</h1>
                <h3>Submitted Game</h3>
            </div>
            <div className={styles.card}>
                <h1>{liveUsers}</h1>
                <h3>Live Users</h3>
            </div>
            <div className={styles.card}>
                <h1>{registeredUsers}</h1>
                <h3>Registered Users</h3>
            </div>
        </section>
    </main>
  )
}

export default page