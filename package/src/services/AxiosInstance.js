import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_URL || 'https://ceaa-backend.up.railway.app/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/refresh-token')) {
            
            if (originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            try {
                // ✅ Usa axiosInstance, no axios global
                await axiosInstance.post('/auth/refresh-token', {}, { 
                    withCredentials: true,
                    _skipRetry: true // Evita que este request active el interceptor
                });
                
                isRefreshing = false;
                processQueue(null);
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                
                // Limpiar cookies/localStorage en el cliente
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    sessionStorage.clear();
                }
                
                // Redirigir a login si está en el cliente
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;