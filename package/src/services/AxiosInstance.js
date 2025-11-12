import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:3000/api', 
    withCredentials: true, 
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
