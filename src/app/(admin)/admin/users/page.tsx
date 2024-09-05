"use client"
import React, {useState, useEffect} from 'react'
import styles from "./users.module.css"
import Info from './info'
import { getAllUsersServer } from '@/actions/users'
import { getAllGamesServer } from '@/actions/games'

const page = () => {

    const [users, setUsers] = useState<any>([]);
    const [games, setGames] = useState<any>([]);
    const [allusers, setAllUsers] = useState<any>([]);
    const [search, setSearch] = useState("");

    const getInfo = async() =>{
        const usersResult = await getAllUsersServer();
        const gamesResult = await getAllGamesServer();
        const searchUsers = usersResult.map((item: any)=>{
            return {...item, search: item.username+ item.email + item.plan}
        })
        setUsers(searchUsers);
        setAllUsers(searchUsers);
        setGames(gamesResult);
    }

useEffect(()=>{
    const filterUsers = allusers.filter((item: any)=>{
        return item?.search?.includes(search);
    })
    setUsers(filterUsers)
}, [search])

useEffect(()=>{
    getInfo();
 },[])


  return (
    <main className={styles.main}>
        <h1 className={styles.title}>Users</h1>
        <input onChange={(e)=>setSearch(e.target.value)} value={search} className={styles.input} type="text" />
        <article className={styles.usersGrid}>
            {
                users.map((user: any)=>{
                    return <Info games={games} userId={user.id} username={user.username} getInfo={getInfo} />
                })
            }
        </article>
    </main>
  )
}

export default page