"use client"
import React, {useState, useEffect} from 'react'
import styles from "./notifications.module.css"
import Image from 'next/image'
import { getNotificationsServer } from '@/actions/notifications'

const page = () => {
  const [notifications, setNotifications] = useState<any>([]);

  const getNotifications = async() =>{
    let result = await getNotificationsServer();
    setNotifications(result);
  }

  useEffect(()=>{
    getNotifications();
  }, [])

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Notifications</h1>
      <section className={styles.notifications}>
        {
          notifications?.map((item : any)=>{
            switch (item.type) {
              case "APPROVED":
                return <article className={styles.happy}>
                <Image 
                src="/notifications/happy.png"
                  width={100}
                  height={155}
                  alt="happy"
                />
                <h1>Congrats Your Game Got Approved and is Online !!!</h1>
              </article>
                break;
              case "REJECTED":
                return <article className={styles.sad}>
                <Image 
                src="/notifications/sad.png"
                  width={96}
                  height={96}
                  alt="sad"
                />
                <div className={styles.txt}>
                  <h1>Game Rejected</h1>
                  <p>
                  {item.message} 
                  </p>
                </div>
              </article>
                break;
              case "PINDING":
                return <article className={styles.content}>
                <Image 
                  src="/notifications/content.png"
                  width={96}
                  height={96}
                  alt="happy"
                />
                <div className={styles.txt}>
                  <h1>Game pended</h1>
                  <p>
                 {item.message}
                  </p>
                </div>
              </article>
            
              default:
                break;
            }
            return item;
          })
        }
        <article className={styles.happy}>
          <Image 
          src="/notifications/happy.png"
            width={100}
            height={155}
            alt="happy"
          />
          <h1>Congrats Your Game Got Approved and is Online !!!</h1>
        </article>
        <article className={styles.sad}>
          <Image 
          src="/notifications/sad.png"
            width={96}
            height={96}
            alt="sad"
          />
          <div className={styles.txt}>
            <h1>Game Rejected</h1>
            <p>
            The game got rejected because the code is not working, fix it and submit it again.
            </p>
          </div>
        </article>
        <article className={styles.content}>
          <Image 
            src="/notifications/content.png"
            width={96}
            height={96}
            alt="happy"
          />
          <div className={styles.txt}>
            <h1>Game pended</h1>
            <p>
            Fix the issues with the third level and submit it the changes to get approved.
            </p>
          </div>
        </article>
      </section>
    </main>
  )
}

export default page