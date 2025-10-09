// AuthActions.js
import {
    SIGNUP_CONFIRMED_ACTION,
    SIGNUP_FAILED_ACTION,
    LOGIN_CONFIRMED_ACTION,
    LOGIN_FAILED_ACTION,
    LOADING_TOGGLE_ACTION,
    LOGOUT_ACTION,
    NAVTOGGLE
} from './ActionTypes';

import { signUp, login, formatError, saveTokenInLocalStorage, runLogoutTimer } from '../../services/AuthService';

export function signupAction(nombre, correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        try {
            const response = await signUp(nombre, correo, clave);
            saveTokenInLocalStorage(response.data, response.data.data); // ← mismo fix
            runLogoutTimer(dispatch, response.data.expiresIn * 1000, navigate);
            dispatch(confirmedSignupAction(response.data)); // ← pasa response.data
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

export function loginAction(correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        try {
            const response = await login(correo, clave);
            
            // Pasa response.data (que contiene token, expiresIn Y data.user)
            saveTokenInLocalStorage(response.data, response.data.data); // ← user está en response.data.data
            runLogoutTimer(dispatch, response.data.expiresIn * 1000, navigate);
            
            // Pasa response.data que contiene toda la estructura
            dispatch(loginConfirmedAction(response.data));
            
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

export function Logout(navigate) {
    localStorage.removeItem('userDetails');
    navigate('/login');
    return { type: LOGOUT_ACTION };
}

export function loginConfirmedAction(payload) {
    // Si el payload ya tiene la estructura correcta (con user), úsalo directamente
    if (payload.user) {
        return { 
            type: LOGIN_CONFIRMED_ACTION, 
            payload: payload
        };
    }
    
    // Si viene la estructura completa del response, extrae los datos
    return { 
        type: LOGIN_CONFIRMED_ACTION, 
        payload: {
            token: payload.token,
            user: payload.data, // ← Extraer de data
            expireDate: new Date(new Date().getTime() + payload.expiresIn * 1000)
        }
    };
}

export function loginFailedAction(payload) {
    return { type: LOGIN_FAILED_ACTION, payload };
}

export function confirmedSignupAction(payload) {
    return { 
        type: SIGNUP_CONFIRMED_ACTION, 
        payload: {
            token: payload.token,
            user: payload.data, // ← mismo patrón
            expireDate: new Date(new Date().getTime() + payload.expiresIn * 1000)
        }
    };
}

export function signupFailedAction(payload) {
    return { type: SIGNUP_FAILED_ACTION, payload };
}

export function loadingToggleAction(status) {
    return { type: LOADING_TOGGLE_ACTION, payload: status };
}

export const navtoggle = () => ({ type: NAVTOGGLE });
