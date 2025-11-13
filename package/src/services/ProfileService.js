import axiosInstance from './AxiosInstance';

// 🔹 Obtener datos del perfil
// 🔹 Obtener datos del perfil
export const getProfileData = async () => {
  try {
    const response = await axiosInstance.get('auth/perfil');
    return response.data.data; 
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Error al cargar el perfil');
  }
};

// 🔹 Actualizar datos del perfil
export const updateProfileData = async (profileData) => {
  try {
    const response = await axiosInstance.put('auth/perfil', profileData);
    return response.data.data; // Retornamos los datos actualizados
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar el perfil');
  }
};

