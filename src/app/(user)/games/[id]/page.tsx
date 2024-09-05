"use client"
import React, { useState, useEffect } from 'react'
import { getGameServer } from '@/actions/games';
import { useParams } from 'next/navigation';
import styles from "./games.module.css"
import { getUserMetaDataServer } from '@/actions/users';
import { useRouter } from 'next/navigation';


const page = () => {

    const [html, setHTML] = useState('');
    const [css, setCSS] = useState('');
    const [javascript, setJavascript] = useState('');
    const id = useParams().id;
    const getCurrentGame = async() =>{
        const data = await getGameServer(id);
    
        if (data?.html ) setHTML(data?.html);
        if(data?.css) setCSS(data?.css);
        if(data?.javascript)  setJavascript(data?.javascript);
        
      }
      const router = useRouter();

      const checkPermissions = async() =>{
        const role = await getUserMetaDataServer();
        if (role != "admin"){
          router.push("/");
        }
      }
  
      useEffect(()=>{
        checkPermissions();
        getCurrentGame();
      }, [])
    const srcDoc = `
    <html> 
      <body> ${html} </body>
      <style> ${css} </style>
      <script> ${javascript} </script>
    </html>
  `

  return (
    <iframe className={styles.codePage} height={100} width={100} srcDoc={srcDoc} sandbox='allow-scripts' src="" ></iframe>
  )
}

export default page