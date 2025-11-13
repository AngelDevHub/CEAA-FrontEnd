import axios from 'axios';

const BASE_URL = import.meta?.env?.VITE_API_URL || 'https://ceaa-backend.up.railway.app/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const { response, config } = error || {};
        const originalRequest = config || {};

        if (response && response.status === 401 && !originalRequest.__isRetry && !originalRequest.url?.includes('auth/refrescar')) {
            try {
                originalRequest.__isRetry = true;
                await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
                return axiosInstance.request(originalRequest);
            } catch (refreshErr) {
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
