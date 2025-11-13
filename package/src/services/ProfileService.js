import axiosInstance from './AxiosInstance';

// 🔹 Obtener datos del perfil
export const getProfileData = async () => {
    try {
        const response = await axiosInstance.get('auth/perfil', { withCredentials: true });
        if (response.data.success) {
            return response.data.data; 
        }
        throw new Error(response.data.message || 'Error al cargar el perfil');
    } catch (err) {
        // Capturamos mensaje del backend si existe
        throw new Error(err.response?.data?.message || err.message || 'Error al cargar el perfil');
    }
};

// 🔹 Actualizar datos del perfil
export const updateProfileData = async (profileData) => {
    try {
        const response = await axiosInstance.put('auth/perfil', profileData, { withCredentials: true });
        if (response.data.success) {
            return response.data.data; // Retornamos los datos actualizados
        }
        throw new Error(response.data.message || 'Error al actualizar el perfil');
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Error al actualizar el perfil');
    }
};
