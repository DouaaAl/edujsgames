"use client"
import {SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import styles from "./navbar.module.css"
import Image from 'next/image'
import socket, { logInUserSocket } from '@/actions/socket'
import { getUserMetaDataServer } from '@/actions/users'


const links = () => {
  const [isSignal, setIsSignal] = useState(false);
  const [role, setRole] = useState<any>("");

  const getUserMetaData = async() =>{
    const result = await getUserMetaDataServer();
    setRole(result);
  }

  useEffect(()=>{
    logInUserSocket();
    getUserMetaData();
  },[])

  useEffect(() => {
    socket.on("message", (data: any) => {
      setIsSignal(true);
    });
  }, [socket]); 

  return (
    <ul>
    <li>
      <a href="/subscriptions">Subscriptions</a>
      <a href="/mygames">MyGames</a>
      {(role == 'admin') && <a href="/admin">Admin</a>}
    <SignedOut>
          <a href="/sign-in">SignIn</a>
          <a href="/sign-up">LogIn</a>
    </SignedOut>
      <a className={styles.bell} href="/notifications">
      {
        isSignal && <div className={styles.red}></div>
      }
      
      <Image
        src="/notifications/bell.png"
        height={40}
        width={40}
        alt='bell'
      /></a>
    <SignedIn>
          <UserButton />
    </SignedIn>
    </li>
  </ul>
  )
}

export default links