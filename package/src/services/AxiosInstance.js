import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_URL || 'https://ceaa-backend.up.railway.app/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Estado para controlar refresh concurrentes
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
        console.log(`🔄 ${config.method?.toUpperCase()} a ${config.url}`);
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
        
        // Solo manejar 401 y excluir endpoints de auth
        if (error.response?.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/')) {
            
            console.log('🔐 Detectado error 401, intentando refresh token...');
            
            if (isRefreshing) {
                console.log('⏳ Refresh en curso, encolando request...');
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
                console.log('🔄 Solicitando nuevo token de acceso...');
                
                // Llamar al endpoint de refresh token
                await axiosInstance.post('auth/refresh-token', {}, { 
                    withCredentials: true 
                });

                console.log('✅ Token refrescado exitosamente');
                
                // Procesar cola de requests pendientes
                processQueue(null);
                isRefreshing = false;
                
                // Reintentar request original
                console.log('🔄 Reintentando request original...');
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                console.error('❌ Error crítico refrescando token:', refreshError);
                
                processQueue(refreshError, null);
                isRefreshing = false;
                
                // Limpiar frontend y redirigir a login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('userDetails');
                    console.log('🚪 Redirigiendo a login...');
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        // Para otros errores 401 (incluyendo endpoints de auth)
        if (error.response?.status === 401) {
            console.log('🔒 Error de autenticación no recuperable');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('userDetails');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;