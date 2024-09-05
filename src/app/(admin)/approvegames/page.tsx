"use client"
import React, {useState, useEffect} from 'react'
import styles from "./approve.module.css"
import Image from 'next/image'
import Minigame from '@/components/minigame/minigame'
import { getAllGamesServer } from '@/actions/games'
import { useRouter } from 'next/navigation'
import { getUserMetaDataServer } from '@/actions/users'


const page = () => {
  const [games, setGames] = useState<any>([]);
  const [allgames, setAllGames] = useState<any>([]);
  const [filter, setFilter] = useState("");
  const [infoFilter, setInfoFilter] = useState("");
  const router = useRouter();

  const checkPermissions = async() =>{
    const role = await getUserMetaDataServer();
    if (role != "admin"){
      router.push("/");
    } 

  }

  const getGames = async() =>{
    let result = await getAllGamesServer();
    result = result.map((item)=>{
      return {...item, search: item.title + item.plan+item?.category}
    })
    setGames(result);
    setAllGames(result);
  }
  useEffect(()=>{
    checkPermissions();
    getGames()
  }, [])

  useEffect(()=>{
    let filterArray = allgames;
    if (filter != "" || infoFilter != ""){
       filterArray = allgames.filter((game: any)=> (game.state == filter || filter == "") && (infoFilter == "" || game.search.includes(infoFilter)));
      setGames(filterArray);

    } else setGames(filterArray);
 
  },[filter, infoFilter])




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
        <div className={styles.topSection}>
            <input onChange={(e)=>setInfoFilter(e.target.value)} value={infoFilter} placeholder='GameInfo' type="text" />
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
        </div>
        <div className={styles.mainGrid}>
        {
            games?.map((game: any)=>{
              return <Minigame category={game.category} userId={game.userId} state={game.state} plan={game.plan} getGames={getGames} img={game.image} title={game.title} id={game.id} />
            })
          }
        </div>
      </section>
    </main>
  )
}

export default page