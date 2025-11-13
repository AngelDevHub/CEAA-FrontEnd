import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://ceaa-backend.up.railway.app/api', 
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
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Token guardado al login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export default axiosInstance;
