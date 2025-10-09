import axios from 'axios';
import { store } from '../store/store';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api/', // Cambia la URL según tu backend
});

axiosInstance.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth.auth.token; // Asegúrate que aquí guardas el token del backend
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
