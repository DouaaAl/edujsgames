import { SignIn } from '@clerk/nextjs'
import styles from "./signin.module.css"

export default function Page() {
  return  <div className={styles.signIn}>
    <SignIn />
  </div> 
}