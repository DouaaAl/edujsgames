import React from 'react'
import styles from "./page.module.css"
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation' 

const Page = async () => {
  const plans = [
    {
      link: "https://buy.stripe.com/test_00g0372Np7rKeGs7ss",
      priceId: "prod_Qj3q4ZPS6BLmtP"
    },
    {
      link: "https://buy.stripe.com/test_aEUg2587JcM4gOAbIJ",
      priceId: "prod_Qj3sk0Nsf3jpys"
    },
    {
      link: "https://buy.stripe.com/test_28o9DH87J6nGaqc002",
      priceId: "prod_Qj3tdTgeGwSXhb"
    }
  ]

  let user = await currentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Plans</h1>
      <div className={styles.cards}>
        <div className={styles.midCard + ' ' + styles.card}>
          <div>
            <h1 className={styles.price}>
              <span className={styles.num}>$6.99/</span> <br />Month
            </h1>
            <span className={styles.date}>1 Month</span>
          </div>
          <ul>
            <li><h4>Access to All subscription<br />Games</h4></li>              
            <li><h4>Access to Time Constraints</h4></li>
            <li><h4>Access to Adding Study <br />Materials</h4></li>
          </ul>
          <a href={
            plans[1].link + '?prefilled_email='
            + user?.primaryEmailAddress?.emailAddress
          }>
            <button>Subscribe</button>
          </a>        
        </div>
        <div className={styles.mainCard + ' ' + styles.card}>
          <div>
            <h1 className={styles.price}>
              <span className={styles.num}>$4.99/</span><br />Month
            </h1>
            <span className={styles.date}>12 Months</span>
          </div>
          <ul>
            <li><h4>Access to All subscription<br />Games</h4></li>              
            <li><h4>Access to Time Constraints</h4></li>
            <li><h4>Access to Adding Study <br />Materials</h4></li>
          </ul>
          <a href={
            plans[0].link + '?prefilled_email='
            + user?.primaryEmailAddress?.emailAddress
          }>
            <button>Subscribe</button>
          </a>
        </div>
        <div className={styles.smCard + ' ' + styles.card}>
          <div>
            <h1 className={styles.price}>
              <span className={styles.num}>$2.99/</span><br />Month
            </h1>
            <span className={styles.date}>12 Months</span>
          </div>
          <ul>
            <li><h4>Access to All subscription<br />Games</h4></li> 
          </ul>      
          <a href={
            plans[2].link + '?prefilled_email='
            + user?.primaryEmailAddress?.emailAddress
          }>
            <button>Subscribe</button>
          </a>
        </div>
      </div>
      <div className={styles.game}>
      </div>
    </main>
  )
}

export default Page