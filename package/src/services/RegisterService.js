import axiosInstance from './AxiosInstance';

// 🔹 Registrar un nuevo usuario
export const registerUser = async (userData) => {
    try {
        // POST a /api/auth/registro con cookies activadas
        const response = await axiosInstance.post('auth/registro', userData, { withCredentials: true });
        
        if (response.data.success) {
            return response.data.data; // Retornamos el usuario registrado
        }

        throw new Error(response.data.message || 'Error al registrar el usuario');
    } catch (err) {
        // Capturamos el mensaje del backend si existe
        throw new Error(err.response?.data?.message || err.message || 'Error al registrar el usuario');
    }
};
