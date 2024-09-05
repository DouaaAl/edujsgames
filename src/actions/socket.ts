import { io } from "socket.io-client";
import { getUserIdServer } from "./users";

const socket = io("http://localhost:3001");

export const logInUserSocket = async() =>{
    let result = await getUserIdServer();
    socket.emit("newUser", result);
}


export default socket;