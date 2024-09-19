"use server"
import prisma from '@/db';
import { currentUser } from '@clerk/nextjs/server';
import { States, CategoriesEnum , gamePlan } from '@prisma/client';
import { redirect } from 'next/navigation';
import sharp from 'sharp';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';


export const createGameServer = async() =>{
    "use server"
const user = await currentUser();
const loggedInUser = await prisma.user.findFirst({
    where:{
        clerkId: user?.id
    }
})
    const newGame = await prisma.game.create({
        data:{
            userId: loggedInUser?.id || "fix",
            state: "ARCHIVED"
        }
    })

    return redirect(`/create/${newGame.id}`);
}

interface updateCode {
    html: string,
    css: string,
    javascript: string,
    id: any 
}

export const updateGameServer = async({html, css, javascript, id}: updateCode) =>{
    "use server"
    const updatedGame = await prisma.game.update({
        where:{
            id: id
        },
        data:{
            html: html,
            css: css,
            javascript: javascript
        }
    })

    return updatedGame;
}

const s3Client = new S3Client({
    region: process.env.NEXT_AWS_S3_REGION,
    credentials: {
      accessKeyId:process.env.NEXT_AWS_S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY as string,
    }
  })


export const uploadFiletoS3 = async (base64String: string, gameId: string) => {
    try {
    const buffer = Buffer.from(base64String, 'base64');
    let fileId = await uuidv4();

    const fileBuffer = await sharp(buffer)
        .jpeg({ quality: 80 })
        .resize(500, 400)
        .toBuffer();
    const params = {
        Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME,
        Key: fileId,
        Body: fileBuffer,
        ContentType: "image/jpg"
    }
  
    const command = new PutObjectCommand(params);

    try {
        const response = await s3Client.send(command);
        let imageLink = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_AWS_S3_REGION}.amazonaws.com/${fileId}`;
        const updateImage = await prisma.game.update({
            where: {
                id: gameId
            },
            data: {
                image: imageLink
            }
        }) 
        return response;
    } catch (e) {
        console.log(e);
    }

    return fileBuffer;
    } catch (error) {
      console.error('Error processing image with sharp:', error);
      throw error; 
    }
  };


interface changeGameState {
    id:  any,
    state: States,
    message?: string,
    userId?: string 
}


export const changeGameStateServer = async({id, state, message, userId}: changeGameState) => {
    const updatedGame = await prisma.game.update({
        where:{
            id
        },
        data: {
            state: state
        }
    })

    if (message && userId){
        const createNotification = await prisma.notifications.create({
            data:{
                type: state,
                message: message,
                userId: userId
            }
        })
    
        return createNotification;
    }

    return updatedGame;
}


export const getGameServer = async(id: any) => {
    let game = await prisma.game.findFirst({
        where:{
            id: id
        }
    })

    return game;
}

interface updateGameInfo {
    id: string;
    newname: string;
}

export const changeGameInfoServer = async({id, newname}: updateGameInfo) =>{
    let changes : any = {};
    if(newname) changes.name = newname;

    let updatedGame = await prisma.game.update({
        where:{
            id: id
        },
        data:{
            title: newname
        }
    })

    return updatedGame;
}

export const getCurrentUserGamesServer = async() =>{
    const user = await currentUser();
    if(!user?.id){
        redirect("/sign-in");
    }
    const loggedInUser = await prisma.user.findFirst({
    where:{
        clerkId: user?.id
    }
    })
    if(loggedInUser){
        const games = await prisma.game.findMany({
            where: {
                userId: loggedInUser.id as string
            }
        });
        console.log(games, user);
        return games;
    }

}

export const deleteGameServer = async(id: string) =>{
    const deleteGame = await prisma.game.delete({
        where: {
            id
        }
    })

    return deleteGame;
}

export const getAllGamesServer = async() =>{
    const getGames = await prisma.game.findMany({})
    return getGames
}


export const getAllGamesStateServer = async(state: States) =>{
    const getGames = await prisma.game.findMany({
        where:{
            state: state
        }
    })
    return getGames;
}

export const getUsersGamesServer = async(userId: string | string[])=>{
    const getGames = await prisma.game.findMany({
        where:{
            userId: userId as string
        }
    })

    return getGames;
}

interface newGameCat {
    gameId: string;
    category: CategoriesEnum 
}

export const changeGameCategory = async({gameId, category}: newGameCat) =>{
    const updateGame = await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            category: category
        }
    })
    return updateGame
}

interface newGamePlan{
    gameId: string;
    plan: string
}

export const changeGamePlan = async({gameId, plan}: newGamePlan) =>{
    const updateGame = await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
           plan: plan as gamePlan
        }
    })
    return updateGame
}

