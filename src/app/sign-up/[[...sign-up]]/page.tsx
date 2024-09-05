import { SignUp } from '@clerk/nextjs'
import styles from "./signup.module.css"

export default function Page() {
  return <div className={styles.signUp}>
      <SignUp />
  </div> 
}