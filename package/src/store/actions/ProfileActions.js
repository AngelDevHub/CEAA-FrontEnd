// ProfileActions.js
import { UPDATE_PROFILE_ACTION } from './ActionTypes';
import { updateProfileData } from '../../services/ProfileService';

export const updateProfileAction = (profileData) => {
  return async (dispatch) => {
    try {
      // 🔹 Actualizar datos en el backend
      await updateProfileData(profileData);

      // 🔹 Actualizar localStorage manteniendo token y fecha de expiración
      const tokenDetailsString = localStorage.getItem('userDetails');
      if (tokenDetailsString) {
        let tokenDetails = JSON.parse(tokenDetailsString);

        tokenDetails.user = {
          ...tokenDetails.user,
          ...profileData 
        };

        localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
      }

      // 🔹 Actualizar Redux
      dispatch({
        type: UPDATE_PROFILE_ACTION,
        payload: profileData, 
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };
};
