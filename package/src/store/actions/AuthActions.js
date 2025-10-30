// AuthActions.js
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

import { signUp, login, formatError, saveUserInLocalStorage } from '../../services/AuthService';

/**
 * Thunk para registro
 */
export function signupAction(nombre, correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        try {
            const response = await signUp(nombre, correo, clave);
            
            // Guardar solo info del usuario para UI
            const userInfo = response.data.data;
            saveUserInLocalStorage(userInfo);
            
            dispatch(confirmedSignupAction(userInfo));
            navigate('/dashboard');
        } catch (error) {
            let errorMessage = 'Error desconocido';
            if (error.response && error.response.data) {
                errorMessage = formatError(error.response.data);
            }
            dispatch(signupFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

/**
 * Thunk para login
 */
export function loginAction(correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        try {
            const response = await login(correo, clave);
            
            const userInfo = response.data.data;
            saveUserInLocalStorage(userInfo);
            
            dispatch(loginConfirmedAction(userInfo));
            navigate('/dashboard');
        } catch (error) {
            let errorMessage = 'Error desconocido';
            if (error.response && error.response.data) {
                errorMessage = formatError(error.response.data);
            }
            dispatch(loginFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

/**
 * Logout
 */
export function Logout(navigate) {
    return (dispatch) => {
        localStorage.removeItem('userDetails');
        navigate('/login');
        dispatch({ type: LOGOUT_ACTION });
    };
}

/**
 * Acciones simples
 */
export function loginConfirmedAction(payload) {
    return { type: LOGIN_CONFIRMED_ACTION, payload };
}

export function loginFailedAction(payload) {
    return { type: LOGIN_FAILED_ACTION, payload };
}

export function confirmedSignupAction(payload) {
    return { type: SIGNUP_CONFIRMED_ACTION, payload };
}

export function signupFailedAction(payload) {
    return { type: SIGNUP_FAILED_ACTION, payload };
}

export function loadingToggleAction(status) {
    return { type: LOADING_TOGGLE_ACTION, payload: status };
}

export function clearAuthErrorAction() {
    return { type: CLEAR_AUTH_ERROR, payload: '' };
}

export function clearAuthSuccessAction() {
    return { type: CLEAR_AUTH_SUCCESS, payload: '' };
}

export const navtoggle = () => ({ type: NAVTOGGLE });
