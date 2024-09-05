"use server"

import prisma from "@/db";
import { currentUser } from "@clerk/nextjs/server"
import { clerkClient } from '@clerk/nextjs/server';


export const getUserIdServer = async()=>{
    const user = await currentUser();
    const loggedUser = await prisma.user.findFirst({
        where:{
            clerkId: user?.id
        }
    });
    return loggedUser?.id;
}

export const getAllUsersServer = async()=>{
    const users = await prisma.user.findMany({});
    return users;
}

export const deleteUserServer = async(userId: string) =>{
    const user = await prisma.user.delete({
        where: {
            id: userId as string
        }
    })
}

export const assignAdminRole= async (userId: string)=> {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin',
      },
    });
  }

  export const assignUserRole= async (userId: string)=> {
    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        role: 'user',
      },
    });
  }

export const getUserMetaDataServer= async () =>{
  const user = await currentUser();

  return user?.privateMetadata.role;  
}

export const isUserClerkUser = async(userId: string,) =>{
  const user = await currentUser();
  const clerkId = user?.id;

  if(userId == clerkId){
    return true;
  }
  return false
}