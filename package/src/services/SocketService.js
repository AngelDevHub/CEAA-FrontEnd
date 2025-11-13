import { io } from "socket.io-client";

const socket = io("https://ceaa-backend.up.railway.app", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default socket;
