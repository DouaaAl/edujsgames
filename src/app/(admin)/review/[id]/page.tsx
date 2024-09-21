"use client"
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import { Controlled as ControlledEditor} from 'react-codemirror2'
import "./customize.css"
import React, {useState, useEffect} from 'react'
import styles from "./review.module.css"
import { useParams } from 'next/navigation';
import { changeGameStateServer, getGameServer, updateGameServer } from '@/actions/games';
import PopUp from './popUp';
import { States } from '@prisma/client';
import { getUserMetaDataServer } from '@/actions/users';
import { useRouter } from 'next/navigation';

const page = () => {
  
  const [html, setHTML] = useState('');
  const [css, setCSS] = useState('');
  const [javascript, setJavascript] = useState('');
  const [isChange, setIsChange] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popUpState, setPopUpState] = useState<{
    state: "" | States,
    userId: "" | string
  }>({
    state: "",
    userId: ""
  })
  const id = useParams().id;
  const router = useRouter();

  const checkPermissions = async() =>{
    const role = await getUserMetaDataServer();
    if (role != "admin"){
      router.push("/");
    } 

  }




  const updateGame = async()=>{
    let change = await updateGameServer({html, css, javascript, id});
    console.log(change);
  }

  const pindGame = async() =>{
    setPopUpState((prev:any)=>{
      return {...prev, state: "PINDING"}
    })
    setIsChange(true);
  }
  
  const approveGame = async() =>{
    let change = await changeGameStateServer({id, state: "APPROVED"});
    setSuccess(true);
    setTimeout(()=> setSuccess(false), 5000)
  }

  const rejectGame = async() =>{
    setPopUpState((prev:any)=>{
      return {...prev, state: "REJECTED"}
    })
    setIsChange(true);
  }

  const getCurrentGame = async() =>{
    const data = await getGameServer(id);

    if (data?.html ) setHTML(data?.html);
    if(data?.css) setCSS(data?.css);
    if(data?.javascript)  setJavascript(data?.javascript);
    setPopUpState((prev: any)=>{
      return {...prev, userId: data?.userId}
    })
    
  }
  useEffect(()=>{
    if (typeof window !== 'undefined') {
      require('codemirror/lib/codemirror.css');
      require('codemirror/theme/material.css');
      require('codemirror/mode/xml/xml');
      require('codemirror/mode/javascript/javascript');
      require('codemirror/mode/css/css');
    }
    getCurrentGame();
    checkPermissions();
  }, [])

  useEffect(()=>{
    let timeout = setTimeout(()=> updateGame(), 150);
  }, [html, css, javascript])

  const handleHTML = (editor: any, data: any, value: any)=>{  
    setHTML(value);
  }

  const srcDoc = `
    <html> 
      <body> ${html} </body>
      <style> ${css} </style>
      <script> ${javascript} </script>
    </html>
  `

  return (
    <main className={styles.main}>
    {isChange && <PopUp
    gameId={id}
    userId={popUpState.userId}
    setIsChange={setIsChange}
    state={popUpState.state}
     /> }
    <article className={styles.sidebar}>
      <div className={styles.sidebarWrapper}>
      <div className={styles.codeBlock}>
            <h1>HTML</h1>
            <ControlledEditor
              value={html}
              className='codeMirrorWrapper'
              onBeforeChange={handleHTML}
              options={{
                lint: true,
                mode: 'xml',
                lineNumbers: true,
                gutters: ["CodeMirror-linenumbers"]

              }}
            />
          </div>
          <div className={styles.codeBlock}>
            <h1>CSS</h1>
            <ControlledEditor
              value={css}
              className='codeMirrorWrapper'
              onBeforeChange={(editor : any, data : any, value: any) => setCSS(value)}
              options={{
                lineWrapping: true,
                lint: true,
                mode: 'css',
                lineNumbers: true,
                gutters: ["CodeMirror-linenumbers"]

              }}
            />          </div>
          <div className={styles.codeBlock}>
            <h1>JAVASCRIPT</h1>
            <ControlledEditor
              value={javascript}
              className='codeMirrorWrapper'
              onBeforeChange={(editor : any, data : any, value: any) => setJavascript(value)}
              options={{
                lineWrapping: true,
                lint: true,
                mode: 'javascript',
                lineNumbers: true,
                gutters: ["CodeMirror-linenumbers"]

              }}
            />
          </div>
        <div className={styles.buttons}>
            <button onClick={approveGame} className={styles.inlineBtn}>Approve</button>
            <button onClick={rejectGame} className={styles.inlineBtn}>Reject</button>
        </div>
          <button onClick={pindGame} className={styles.btn}>Pend</button>
{success &&        <h1 className={styles.success}>Your game is submitted for review!!!</h1>}
      </div>
    </article>
    <section>
              <iframe className={styles.codePage} height={100} width={100} srcDoc={srcDoc} sandbox='allow-scripts' src="" ></iframe>
      </section>
  </main>
  )
}

export default page