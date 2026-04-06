import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_URL, { transports: ["websocket", "polling"] });
    }
    return socket;
};
