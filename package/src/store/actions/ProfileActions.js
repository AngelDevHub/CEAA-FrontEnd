// ProfileActions.js
import { UPDATE_PROFILE_ACTION } from './ActionTypes';
import { updateProfileData } from '../../services/ProfileService';

export const updateProfileAction = (profileData) => {
  return async (dispatch, getState) => {
    try {
      // 🔹 Actualizar datos en el backend
      const response = await updateProfileData(profileData);

      // 🔹 Actualizar localStorage manteniendo token y fecha de expiración
      const tokenDetailsString = localStorage.getItem('userDetails');
      if (tokenDetailsString) {
        let tokenDetails = JSON.parse(tokenDetailsString);

        tokenDetails.user = {
          ...tokenDetails.user,
          ...profileData // actualiza solo los campos enviados (nombre, correo, etc.)
        };

        localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
      }

      // 🔹 Actualizar Redux
      dispatch({
        type: UPDATE_PROFILE_ACTION,
        payload: profileData, // payload solo con los campos modificados
      });

    } catch (error) {
      // Lanzamos el error para manejarlo en el componente
      throw error;
    }
  };
};
