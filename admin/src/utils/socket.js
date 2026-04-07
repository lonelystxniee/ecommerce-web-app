import { io } from "socket.io-client";
import { API_URL } from "../config/apiConfig";

let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_URL, { transports: ["websocket", "polling"] });
    }
    return socket;
};
