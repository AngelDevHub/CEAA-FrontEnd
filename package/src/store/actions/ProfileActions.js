// ProfileActions.js
import { UPDATE_PROFILE_ACTION } from './ActionTypes';
import { updateProfileData } from '../../services/ProfileService';

export const updateProfileAction = (profileData) => {
  return async (dispatch, getState) => {
    try {
      
      // Actualizar en el backend
      const response = await updateProfileData(profileData);
      
      // Actualizar localStorage
      const tokenDetailsString = localStorage.getItem('userDetails');
      if (tokenDetailsString) {
        let tokenDetails = JSON.parse(tokenDetailsString);
        
        // Mantener todos los datos existentes y actualizar solo nombre/correo
        tokenDetails.user = {
          ...tokenDetails.user, 
          nombre: profileData.nombre,
          correo: profileData.correo
        };
        
        localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
      }
      
      // Actualizar Redux con acción específica
      dispatch({
        type: UPDATE_PROFILE_ACTION,
        payload: {
          nombre: profileData.nombre,
          correo: profileData.correo
        }
      });
      
    } catch (error) {
      throw error;
    }
  };
};