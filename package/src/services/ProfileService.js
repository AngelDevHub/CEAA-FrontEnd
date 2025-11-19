import axiosInstance from './AxiosInstance';

export const getProfileData = async () => {
    try {
        const response = await axiosInstance.get('auth/perfil', { withCredentials: true });
        if (response.data.success) {
            return response.data.data; 
        }
        throw new Error(response.data.message || 'Error al cargar el perfil');
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Error al cargar el perfil');
    }
};

export const updateProfileData = async (profileData) => {
    try {
        const response = await axiosInstance.put('auth/perfil', profileData, { withCredentials: true });
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Error al actualizar el perfil');
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Error al actualizar el perfil');
    }
};
