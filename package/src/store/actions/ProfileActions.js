// ProfileActions.js
import { UPDATE_PROFILE_ACTION } from './ActionTypes';
import { updateProfileData } from '../../services/ProfileService';

export const updateProfileAction = (profileData) => {
  return async (dispatch) => {
    try {
      await updateProfileData(profileData);
      const tokenDetailsString = localStorage.getItem('userDetails');
      if (tokenDetailsString) {
        let tokenDetails = JSON.parse(tokenDetailsString);
        tokenDetails.user = {
          ...tokenDetails.user,
          ...profileData 
        };
        localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
      }
      dispatch({
        type: UPDATE_PROFILE_ACTION,
        payload: profileData, 
      });
    } catch (error) {
      throw error;
    }
  };
};
