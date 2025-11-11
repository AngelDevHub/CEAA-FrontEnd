import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default socket;
