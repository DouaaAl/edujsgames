"use client"
import { getUserMetaDataServer } from '@/actions/users';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const layout = ({ children }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const router = useRouter();

    const checkPermissions = async() =>{
      const role = await getUserMetaDataServer();
      if (role != "admin"){
        router.push("/");
      }
    }

    useEffect(()=>{
        checkPermissions()
    },[])
  return (
    <>
      {children}
    </>
  );
};

export default layout;