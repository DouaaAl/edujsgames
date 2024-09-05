import React from 'react'
import Styles from "./navbar.module.css"
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import Links from './links'
import prisma from '@/db'


const navbar = async() => {
  const user = await currentUser()


  if (user) {
    const email = user?.primaryEmailAddress?.emailAddress;
    const newUser = await prisma.user.findFirst({
      where: {
        clerkId: user.id,
      }
    });
  
    if( !newUser || !newUser.id){
      const createUser = await prisma.user.create({
        data: {
          username: user.firstName || "",
          clerkId: user.id,
          email: email
        }
      })
    }
    else {
      const createUser = await prisma.user.update({
        where:{
          clerkId: user.id
        },
        data: {
          username: user.firstName || "",
          clerkId: user.id,
          email: email
        }
      })
    }
  }

  return (
    <nav className={Styles.nav}>
      <a className={Styles.logo} href="/">
        <Image
          src="/logo.png"
          height={110.4}
          width={90.4}
          alt='logo'
        />
      </a>
      <Links />
    </nav>
  )
}

export default navbar