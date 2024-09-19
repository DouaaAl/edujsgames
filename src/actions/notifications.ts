"use server"

import prisma from "@/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from 'next/navigation';


export const getNotificationsServer = async() =>{
    const user = await currentUser();
    if(!user?.id){
        redirect("/sign-in");
    }
        const loggedInUser = await prisma.user.findFirst({
            where:{
                clerkId: user?.id
            }
        })
        const notifications = await prisma.notifications.findMany({
            where:{
                userId: loggedInUser?.id
            }
        })
    
        return notifications
    
}