import axiosInstance from './AxiosInstance';

// Registrar un nuevo usuario
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post('registro', userData, { withCredentials: true });
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Error al registrar el usuario');
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Error al registrar el usuario');
    }
};