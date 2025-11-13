import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://ceaa-backend.up.railway.app/api',
    withCredentials: true, 
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('Error API:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
