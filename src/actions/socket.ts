import { io } from "socket.io-client";
import { getUserIdServer } from "./users";

const socket = io("https://edujsgamessocket.vercel.app/");

export const logInUserSocket = async() =>{
    let result = await getUserIdServer();
    socket.emit("newUser", result);
}


export default socket;