import React, { useEffect, useState } from 'react'
import styles from "./users.module.css"
import { deleteUserServer } from '@/actions/users';

const info = ({username, userId, games, getInfo}: {username: any, userId: any, games: any, getInfo: any}) => {

    const [filterGames, setFilterGames] = useState();

    const countGames = () =>{
        setFilterGames(games.filter((item: any)=> item.userId == userId).length)
    }
    const deleteUser = async() =>{
        let result = await deleteUserServer(userId);
        await getInfo();
        countGames();
    }

    useEffect(()=>{
        countGames();
    }, [])

  return <div className={styles.user}>
                <h3 className={styles.blue}>{username}</h3>
                <h3 className={styles.blue}>
                    Created {filterGames} games
                </h3>
                <a href={`/mygames/${userId}`}>
                    <h3 className={styles.blue}>View Games</h3>
                </a>
                <h3 onClick={deleteUser} className={styles.red}>Delete</h3>
            </div>
  
}


export default info