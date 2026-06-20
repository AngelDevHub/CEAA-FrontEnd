import { io } from "socket.io-client";

const rawBaseUrl = import.meta?.env?.VITE_API_URL || "https://ceaa-backend.up.railway.app/api";
const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, "");
const SOCKET_URL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl.slice(0, -4)
  : normalizedBaseUrl;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
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

export function syncSocketAuth(isAuthenticated) {
  if (isAuthenticated) {
    if (!socket.connected) {
      socket.connect();
    }
    return;
  }

  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
