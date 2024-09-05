"use client"
import styles from "./page.module.css";
import Minigame from "@/components/minigame/minigame";
import { useEffect, useState } from "react";
import { getAllGamesServer } from "@/actions/games";

export default function Home() {
  const [games, setGames] = useState<any>([]);
  const [allgames, setAllGames] = useState<any>([]);
  const [filter, setFilter] = useState({
    plan: "",
    category: ""
  });

  const getGames = async() =>{
    let result = await getAllGamesServer();
    setGames(result);
    setAllGames(result);
  }
  useEffect(()=>{
    getGames()
  }, [])

  useEffect(()=>{
    const newArray = allgames?.filter((game: any)=>{
      return (filter.plan == "" || filter.plan == game.plan) && (filter.category == "" || filter.category == game.category || game.category == "ALL")
    })
    setGames(newArray);
  },[filter])

  return (
    <main className={styles.main}>
      <article className={styles.sidebar}>
        <h1 className={styles.logo}>Filters</h1>
        <div className={styles.filter}>
          <h3 className={styles.subTitle}>Game Categories</h3>
          <article className="green">
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: ""}
            })}>All</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "RPG"}
            })}>RPG</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "ACTION"}
            })}>Action</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "ADVENTURE"}
            })}>Adventure</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "PUZZLE"}
            })}>Puzzle</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "STRATEGY"}
            })}>Strategy</span>
            <span onClick={()=> setFilter((prev: any) =>{
              return {...prev, category: "PLATFORM"}
            })}>Platform</span>
          </article>
        </div>
        <div className={styles.filter}>
          <h3 className={styles.subTitle}>Price</h3>
          <article >
          <span className={styles.yellow} onClick={()=> setFilter((prev: any) =>{
              return {...prev, plan: ""}
            })}>All</span>
            <span className={styles.yellow} onClick={()=> setFilter((prev: any) =>{
              return {...prev, plan: "PAID"}
            })}>Subscribers</span>
            <span className={styles.yellow} onClick={()=> setFilter((prev: any) =>{
              return {...prev, plan: "FREE"}
            })}>Free</span>
          </article>
        </div>
      </article>
      <section className="main">
        <div className={styles.mainGrid}>
        {
            games?.map((game: any)=>{
              return <Minigame userId={game.userId} category={game?.category} state={game.state} plan={game.plan} getGames={getGames} img={game.image} title={game.title} id={game.id} />
            })
          }
        </div>
      </section>
    </main>
  );
}
