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

import { signUp, login, formatError, saveTokenInLocalStorage, runLogoutTimer } from '../../services/AuthService';

const mapAuthResponse = (responseData) => ({
    token: responseData.token,
    user: responseData.data, // Asumiendo que 'data' contiene el objeto de usuario
    expireDate: new Date(new Date().getTime() + responseData.expiresIn * 1000),
    isAuthenticated: true,
});

export function signupAction(nombre, correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        try {
            const response = await signUp(nombre, correo, clave);
            
            // 1. Mapear y guardar token
            const authPayload = mapAuthResponse(response.data);
            saveTokenInLocalStorage(response.data, response.data.data); 
            
            runLogoutTimer(dispatch, response.data.expiresIn * 1000, navigate);
            
            // 2. Disparar con el payload limpio
            dispatch(confirmedSignupAction(authPayload));
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
            
            // 1. Mapear y guardar token
            const authPayload = mapAuthResponse(response.data);
            saveTokenInLocalStorage(response.data, response.data.data); 
            
            runLogoutTimer(dispatch, response.data.expiresIn * 1000, navigate);
            
            // 2. Disparar con el payload limpio
            dispatch(loginConfirmedAction(authPayload));
            
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
    return (dispatch) => {
        localStorage.removeItem('userDetails');
        navigate('/login');
        dispatch({ type: LOGOUT_ACTION });
    };
}

export function loginConfirmedAction(payload) {
    return { type: LOGIN_CONFIRMED_ACTION, payload };
}

export function loginFailedAction(payload) {
    return { type: LOGIN_FAILED_ACTION, payload };
}

// 💡 SIMPLIFICADO: El payload ya viene estandarizado desde el thunk
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