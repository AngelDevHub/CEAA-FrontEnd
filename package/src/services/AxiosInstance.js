import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api', // URL de tu backend
    withCredentials: true, // Muy importante para enviar cookies
});

// Interceptor opcional para manejar errores globalmente
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('Error API:', error.response.data);
        } else {
            console.error('Error de red o servidor:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
