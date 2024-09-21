'use client'; 

import dynamic from 'next/dynamic';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import './customize.css';
import React, { useState, useEffect } from 'react';
import styles from './review.module.css';
import { useParams, useRouter } from 'next/navigation';
import { changeGameStateServer, getGameServer, updateGameServer } from '@/actions/games';
import PopUp from './popUp';
import { States } from '@prisma/client';
import { getUserMetaDataServer } from '@/actions/users';


const ControlledEditor = dynamic(() => import('react-codemirror2').then(mod => mod.Controlled), {
  ssr: false,
});

interface PopUpState {
  state: States;
  userId: string;
}

const Page: React.FC = () => {
  const [html, setHTML] = useState<string>('');
  const [css, setCSS] = useState<string>('');
  const [javascript, setJavascript] = useState<string>('');
  const [isChange, setIsChange] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [popUpState, setPopUpState] = useState<PopUpState>({
    state: 'PINDING',
    userId: ''
  });

  const id = useParams().id as string;
  const router = useRouter();

  const checkPermissions = async () => {
    const role = await getUserMetaDataServer();
    if (role !== 'admin') {
      router.push('/');
    }
  };

  const updateGame = async () => {
    await updateGameServer({ html, css, javascript, id });
  };

  const pindGame = () => {
    setPopUpState(prev => ({ ...prev, state: 'PINDING' }));
    setIsChange(true);
  };

  const approveGame = async () => {
    await changeGameStateServer({ id, state: 'APPROVED' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  const rejectGame = () => {
    setPopUpState(prev => ({ ...prev, state: 'REJECTED' }));
    setIsChange(true);
  };

  const getCurrentGame = async () => {
    const data = await getGameServer(id);
    if (data?.html) setHTML(data.html);
    if (data?.css) setCSS(data.css);
    if (data?.javascript) setJavascript(data.javascript);
    setPopUpState((prev: any) => ({ ...prev, userId: data?.userId }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getCurrentGame();
      checkPermissions();
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => updateGame(), 150);
    return () => clearTimeout(timeout); // Clean up to prevent memory leaks
  }, [html, css, javascript]);

  const handleHTML = (editor: any, data: any, value: string) => {
    setHTML(value);
  };

  const srcDoc = `
    <html>
      <body> ${html} </body>
      <style> ${css} </style>
      <script> ${javascript} </script>
    </html>
  `;

  return (
    <main className={styles.main}>
      {isChange && <PopUp gameId={id} userId={popUpState.userId} setIsChange={setIsChange} state={popUpState.state} />}
      <article className={styles.sidebar}>
        <div className={styles.sidebarWrapper}>
          <div className={styles.codeBlock}>
            <h1>HTML</h1>
            <ControlledEditor
              value={html}
              className="codeMirrorWrapper"
              onBeforeChange={handleHTML}
              options={{
                lint: true,
                mode: 'xml',
                lineNumbers: true,
                gutters: ['CodeMirror-linenumbers']
              }}
            />
          </div>
          <div className={styles.codeBlock}>
            <h1>CSS</h1>
            <ControlledEditor
              value={css}
              className="codeMirrorWrapper"
              onBeforeChange={(editor, data, value) => setCSS(value)}
              options={{
                lineWrapping: true,
                lint: true,
                mode: 'css',
                lineNumbers: true,
                gutters: ['CodeMirror-linenumbers']
              }}
            />
          </div>
          <div className={styles.codeBlock}>
            <h1>JAVASCRIPT</h1>
            <ControlledEditor
              value={javascript}
              className="codeMirrorWrapper"
              onBeforeChange={(editor, data, value) => setJavascript(value)}
              options={{
                lineWrapping: true,
                lint: true,
                mode: 'javascript',
                lineNumbers: true,
                gutters: ['CodeMirror-linenumbers']
              }}
            />
          </div>
          <div className={styles.buttons}>
            <button onClick={approveGame} className={styles.inlineBtn}>Approve</button>
            <button onClick={rejectGame} className={styles.inlineBtn}>Reject</button>
          </div>
          <button onClick={pindGame} className={styles.btn}>Pend</button>
          {success && <h1 className={styles.success}>Your game is submitted for review!!!</h1>}
        </div>
      </article>
      <section>
        <iframe className={styles.codePage} height={100} width={100} srcDoc={srcDoc} sandbox="allow-scripts" />
      </section>
    </main>
  );
};

export default Page;