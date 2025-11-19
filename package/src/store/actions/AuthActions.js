import {
    SIGNUP_CONFIRMED_ACTION,
    SIGNUP_FAILED_ACTION,
    LOGIN_CONFIRMED_ACTION,
    LOGIN_FAILED_ACTION,
    LOADING_TOGGLE_ACTION,
    LOGOUT_ACTION,
    NAVTOGGLE,
    CLEAR_AUTH_ERROR, 
    CLEAR_AUTH_SUCCESS
} from './ActionTypes';

import { 
    signUp, 
    login, 
    formatError, 
    saveUserInLocalStorage,
    logoutBackend 
} from '../../services/AuthService';

export function signupAction(nombre, correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        dispatch(clearAuthErrorAction());
        
        try {
            const response = await signUp(nombre, correo, clave);
            
            if (response.data.success) {
                const userInfo = {
                    id: response.data.data.id,
                    nombre: response.data.data.nombre,
                    correo: response.data.data.correo,
                    role: 'user'
                };
                
                saveUserInLocalStorage(userInfo);
                dispatch(confirmedSignupAction(userInfo));
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
                
            } else {
                throw new Error(response.data.message || 'Error en el registro');
            }
        } catch (error) {
            const errorMessage = formatError(error);
            dispatch(signupFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

export function loginAction(correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        dispatch(clearAuthErrorAction());
        
        try {
            const response = await login(correo, clave);
            
            if (response.data.success) {
                const userData = response.data.data;

                const userInfo = {
                    id: userData.id,
                    nombre: userData.nombre,
                    correo: userData.correo,
                    lastLogin: Date.now()
                };
                
                saveUserInLocalStorage(userInfo);
                dispatch(loginConfirmedAction(userInfo));
                
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 500);
                
            } else {
                throw new Error(response.data.message || 'Error en el login');
            }
        } catch (error) {
            const errorMessage = formatError(error);
            dispatch(loginFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

export function Logout(navigate) {
    return async (dispatch) => {
        try {
            await logoutBackend(dispatch, navigate);
            dispatch({ type: LOGOUT_ACTION });
        } catch (error) {
            localStorage.removeItem('userDetails');
            if (navigate) {
                navigate('/login', { replace: true });
            }
            dispatch({ type: LOGOUT_ACTION });
        }
    };
}

export function silentLogout() {
    return async (dispatch) => {
        try {
            
            localStorage.removeItem('userDetails');
            dispatch({ type: LOGOUT_ACTION });
        } catch (error) {
        }
    };
}

export function loginConfirmedAction(payload) {
    return { 
        type: LOGIN_CONFIRMED_ACTION, 
        payload 
    };
}

export function loginFailedAction(payload) {
    return { 
        type: LOGIN_FAILED_ACTION, 
        payload 
    };
}

export function confirmedSignupAction(payload) {
    return { 
        type: SIGNUP_CONFIRMED_ACTION, 
        payload 
    };
}

export function signupFailedAction(payload) {
    return { 
        type: SIGNUP_FAILED_ACTION, 
        payload 
    };
}

export function loadingToggleAction(status) {
    return { 
        type: LOADING_TOGGLE_ACTION, 
        payload: status 
    };
}

export function clearAuthErrorAction() {
    return { 
        type: CLEAR_AUTH_ERROR, 
        payload: '' 
    };
}

export function clearAuthSuccessAction() {
    return { 
        type: CLEAR_AUTH_SUCCESS, 
        payload: '' 
    };
}

export const navtoggle = () => ({ 
    type: NAVTOGGLE 
});

export function autoLoginConfirmedAction(userData) {
    return loginConfirmedAction(userData);
}

export function clearAuthMessages() {
    return (dispatch) => {
        dispatch(clearAuthErrorAction());
        dispatch(clearAuthSuccessAction());
    };
}