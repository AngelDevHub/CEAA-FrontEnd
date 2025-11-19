import { io } from "socket.io-client";

const socket = io("https://ceaa-backend.up.railway.app", {
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
  withCredentials: true,
});

socket.on("connect", () => {
});

socket.on("disconnect", reason => {
});

socket.on("connect_error", err => {
});

export default socket;
