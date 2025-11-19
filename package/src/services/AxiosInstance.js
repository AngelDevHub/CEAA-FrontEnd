import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_URL || 'https://ceaa-backend.up.railway.app/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

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

axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/')) {
            
            
            
            if (isRefreshing) {
                
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                
                await axiosInstance.post('auth/refresh-token', {}, { 
                    withCredentials: true 
                });

                processQueue(null);
                isRefreshing = false;

                
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                
                
                processQueue(refreshError, null);
                isRefreshing = false;
                
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('userDetails');
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('userDetails');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;