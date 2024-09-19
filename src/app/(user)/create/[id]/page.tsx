"use client"
import React, { useState, useEffect } from 'react'
import styles from "./create.module.css"
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import { Controlled as ControlledEditor} from 'react-codemirror2'
import "./customize.css"
import { changeGameStateServer, getGameServer, updateGameServer } from '@/actions/games'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getUserMetaDataServer } from '@/actions/users'

const page = () => {

  const [html, setHTML] = useState('');
  const [css, setCSS] = useState('');
  const [javascript, setJavascript] = useState('');
  const [success, setSuccess] = useState(false);
  const id = useParams().id;
  const router = useRouter();

  const checkPermissions = async() =>{
    const role = await getUserMetaDataServer();
    if (role == "admin"){
      router.push("/review/"+ id);
    }
  }

  checkPermissions();
  const updateGame = async()=>{
    let change = await updateGameServer({html, css, javascript, id});
    console.log(change);
  }

  const submitGame = async() =>{
    let change = await changeGameStateServer({id, state: "PINDING"});
    setSuccess(true);
    let timeout = setTimeout(()=> setSuccess(false), 3000);
    
  }

  const getCurrentGame = async() =>{
    const data = await getGameServer(id);

    if (data?.html ) setHTML(data?.html);
    if(data?.css) setCSS(data?.css);
    if(data?.javascript)  setJavascript(data?.javascript);
    
  }
  useEffect(()=>{
    
    getCurrentGame();
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
          <form action={submitGame}>
          <button type='submit' className={styles.btn}>Submit</button>
          </form>
          {
            success && <h1 className={styles.success}>Your project got submitted for review!!!</h1>
          }
          
        </div>
      </article>
      <section>
              <iframe className={styles.codePage} height={100} width={100} srcDoc={srcDoc} sandbox='allow-scripts' src="" ></iframe>
      </section>
    </main>
  )
}

export default page