// utils/socket.js
import { io } from "socket.io-client";


let socket;

if (!global._socket) {
  global._socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
    transports: ["websocket"], // 🔥 IMPORTANT
    autoConnect: true,
  });
}

socket = global._socket;

export default socket;
