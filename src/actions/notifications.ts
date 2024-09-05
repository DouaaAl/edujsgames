"use server"

import prisma from "@/db"
import { currentUser } from "@clerk/nextjs/server"

export const getNotificationsServer = async() =>{
    const user = await currentUser();
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