import { io } from "socket.io-client";

const socket = io("https://ceaa-backend.up.railway.app", {
  transports: ["polling", "websocket"], // 🔹 polling fallback para compatibilidad
  reconnection: true,
  reconnectionAttempts: 10,  // aumentar intentos de reconexión
  reconnectionDelay: 3000,
  withCredentials: true,      // 🔹 enviar cookies al backend
});

// Opcional: eventos de debug
socket.on("connect", () => {
  console.log("🔌 Conectado al servidor Socket.io:", socket.id);
});

socket.on("disconnect", reason => {
  console.log("❌ Desconectado del servidor Socket.io. Razón:", reason);
});

socket.on("connect_error", err => {
  console.error("⚠️ Error de conexión Socket.io:", err.message);
});

export default socket;
