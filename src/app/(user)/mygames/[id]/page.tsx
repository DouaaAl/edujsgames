"use client"
import React, { useEffect, useState } from 'react'
import styles from "../mygames.module.css"
import Image from 'next/image'
import Minigame from '@/components/minigame/minigame'
import { createGameServer, getUsersGamesServer } from '@/actions/games'
import { useParams } from 'next/navigation'

const page = () => {
  const [games, setGames] = useState<any>([]);
  const [allgames, setAllGames] = useState<any>([]);
  const [filter, setFilter] = useState("");
  const id = useParams().id;

  const getGames = async() =>{
    let result = await getUsersGamesServer(id);
    console.log("games ", result);
    setGames(result);
    setAllGames(result);
  }
  useEffect(()=>{
    getGames()
  }, [])

  useEffect(()=>{
    if (filter != ""){
      const filterArray = allgames.filter((game: any)=> game.state == filter);
      setGames(filterArray);
    } else setGames(allgames);
  },[filter])

  return (
    <main className={styles.main}>
      <article className={styles.sidebar}>
        <h1 className={styles.logo}>Filters</h1>
        <div className={styles.filter}>
        <button onClick={()=>setFilter("")}>All</button>
          <button onClick={()=>setFilter("APPROVED")}>Approved</button>
          <button onClick={()=> setFilter("PINDING")}>Pending</button>
          <button onClick={()=> setFilter("REJECTED")}>Rejected</button>
          <button onClick={()=> setFilter("ARCHIVED")}>Archived</button>
        </div>
      </article>
      <section className="main">
        <form action={createGameServer} className={styles.topSection}>
            <div></div>
            <button>
              <Image
                src="/add.png"
                width={30}
                height={30}
                alt='add'
              />
              Create A Game
            </button>
        </form>
        <div className={styles.mainGrid}>
          {
            games?.map((game: any)=>{
              return <Minigame category={game.category} state={game.state} plan={game.plan} getGames={getGames} img={game.image} title={game.title} id={game.id} />
            })
          }
        </div>
      </section>
    </main>
  )
}

export default page