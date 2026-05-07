// utils/socket.js
import { io } from "socket.io-client";


let socket;

if (!global._socket) {
  global._socket = io("http://localhost:8000", {
    transports: ["websocket"], // 🔥 IMPORTANT
    autoConnect: true,
  });
}

socket = global._socket;

export default socket;
