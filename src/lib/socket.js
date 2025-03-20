"use client";
import { io } from "socket.io-client";
const socket = io("https://auction-backend-7745.onrender.com", {
  transports: ["websocket"],
});

export default socket;
