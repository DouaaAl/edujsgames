"use client"
import React, {useEffect, useState} from 'react'
import styles from "./minigame.module.css"
import Image from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { changeGameCategory, changeGameInfoServer, changeGamePlan, deleteGameServer, uploadFiletoS3 } from '@/actions/games';
import { gamePlan, States, CategoriesEnum } from '@prisma/client';
import { getUserMetaDataServer, isUserClerkUser } from '@/actions/users';

interface imageInterface {
    img: string | StaticImport;
    title: string;
    id: string;
    getGames: Function;
    plan: gamePlan;
    state: States;
    category: CategoriesEnum
    userId: string
}

const minigame = ({img, title, id, getGames, plan, state, category, userId}:imageInterface) => {
  const [isChange, setIsChange] = useState<Boolean>(false);
  const [newname, setNewname] = useState<string | "">("")
  const [file, setFile] = useState< undefined | File>(undefined);
  const [categoryState, setCategory] = useState("");
  const [planState, setPlanState] = useState<string | "">(plan);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const checkPermissions = async() =>{
    const role = await getUserMetaDataServer();
    if (role == "admin"){
      setIsAdmin(true);
    } 

    const checkUser = await isUserClerkUser(userId);
    setIsUser(checkUser);
  }

  useEffect(()=>{
    checkPermissions();
  },[])

  const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const deleteGame = async() =>{
    const res = await deleteGameServer(id);
    await getGames();
  }
 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
          const result = await uploadFiletoS3(base64Data, id).then(async()=>{
            await getGames();
          })
        };
        reader.readAsDataURL(file);
      }
      
      if(newname){
        const result = await changeGameInfoServer({id, newname});
      }
      if(categoryState) {
        const result = await changeGameCategory({gameId: id, category: categoryState})
      }
      
      if(planState !== plan){
        const result = await changeGamePlan({gameId: id, plan: planState})
      }
      
      setFile(undefined);
      setPlanState("");
      setCategory("");
      setNewname("");
      await getGames();
      
    } catch (error) {
      console.error('Error processing the file:', error);
    }
    setIsChange(false);
  };

  return (
    <div className={styles.card}>
    <a href={`games/${id}`}>
     <Image 
      className={styles.icon}
      src={img}
      width={200}
      height={100}
      alt="first website"
    />
    </a>
    {(isUser || isAdmin) && <a href={`create/${id}`}>
           <Image 
      src="/code.png"
      width={30}
      height={30}
      alt="first website"
    />
    </a>}
    
   
    <h2>{title}</h2>
    {
      (plan == "PAID") &&  <Image
      className={styles.star}
      src="/star.png"
      height={40}
      width={40}
      alt="stars" />
    }
    
      {(!isChange && (isUser || isAdmin)) && (<>
      <button onClick={()=>setIsChange(true)} className={styles.btn+ ' ' + styles.edit}>Edit</button>
      <button onClick={deleteGame} className={styles.btn+ ' ' + styles.delete}>Delete</button>
      </>)}
      

      {
        (isChange && (isUser || isAdmin)) && (<>
        <form onSubmit={handleSubmit}>
        <label htmlFor="fileUpload" className={styles.customFileUpload}>
        <Image
          height={20}
          width={20}
          src="/file.png"
          alt='upload image'
        />
    </label>
    <div className={styles.selectTags}>
      <select className={styles.select} value={categoryState} onChange={(e)=>setCategory(e.target.value)} name="" id="">
        <option value="ALL">ALL</option>
        <option value="ACTION">ACTION</option>
        <option value="PUZZLE">PUZZLE</option>
        <option value="STRATEGY">STRATEGY</option>
        <option value="ADVENTURE">ADVENTURE</option>
        <option value="PLATFORM">PLATFORM</option>
      </select>
      <select className={styles.select} value={planState} onChange={(e)=>setPlanState(e.target.value)} name="" id="">
        <option value="">ALL</option>
        <option value="FREE">FREE</option>
        <option value="PAID">PAID</option>
      </select>
    </div>
      <input onChange={handleFileChange} id="fileUpload" className={styles.files} type="file" />
      <input value={newname} onChange={(e)=>setNewname(e.target.value)} className={styles.input} type="text" />
      <button className={styles.btn + ' ' +styles.submit}>Submit</button>
      </form>
        </>)
      }
      
  </div>
  )
}

export default minigame