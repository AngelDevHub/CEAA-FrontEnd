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

/**
 * Thunk para registro - ACTUALIZADO
 */
export function signupAction(nombre, correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        dispatch(clearAuthErrorAction());
        
        try {
            const response = await signUp(nombre, correo, clave);
            
            if (response.data.success) {
                // Guardar info del usuario para UI (sin tokens)
                const userInfo = {
                    id: response.data.data.id,
                    nombre: response.data.data.nombre,
                    correo: response.data.data.correo,
                    role: 'user' // o el role que venga de tu backend
                };
                
                saveUserInLocalStorage(userInfo);
                dispatch(confirmedSignupAction(userInfo));
                
                // Redirigir al dashboard después del registro
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
                
            } else {
                throw new Error(response.data.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            const errorMessage = formatError(error);
            dispatch(signupFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

/**
 * Thunk para login - COMPLETAMENTE ACTUALIZADO
 */
export function loginAction(correo, clave, navigate) {
    return async (dispatch) => {
        dispatch(loadingToggleAction(true));
        dispatch(clearAuthErrorAction());
        
        try {
            const response = await login(correo, clave);
            
            if (response.data.success) {
                // Tu backend devuelve los datos en response.data.data
                const userData = response.data.data;
                
                // Guardar solo la información necesaria para UI
                const userInfo = {
                    id: userData.id,
                    nombre: userData.nombre,
                    correo: userData.correo,
                    // No guardar tokens en localStorage, están en cookies HTTP-only
                    lastLogin: Date.now()
                };
                
                saveUserInLocalStorage(userInfo);
                dispatch(loginConfirmedAction(userInfo));
                
                // Redirigir al dashboard
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 500);
                
            } else {
                throw new Error(response.data.message || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login:', error);
            const errorMessage = formatError(error);
            dispatch(loginFailedAction(errorMessage));
        } finally {
            dispatch(loadingToggleAction(false));
        }
    };
}

/**
 * Logout - ACTUALIZADO para coordinación con backend
 */
export function Logout(navigate) {
    return async (dispatch) => {
        try {
            // Usar el logout seguro que coordina con backend
            await logoutBackend(dispatch, navigate);
        } catch (error) {
            console.error('Error en logout:', error);
            // Fallback: limpieza local
            localStorage.removeItem('userDetails');
            if (navigate) {
                navigate('/login', { replace: true });
            }
            dispatch({ type: LOGOUT_ACTION });
        }
    };
}

/**
 * Logout silencioso (sin redirección)
 */
export function silentLogout() {
    return async (dispatch) => {
        try {
            // Solo limpiar localStorage sin llamar al backend
            localStorage.removeItem('userDetails');
            dispatch({ type: LOGOUT_ACTION });
        } catch (error) {
            console.error('Error en logout silencioso:', error);
        }
    };
}

/**
 * Acciones simples
 */
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

/**
 * Nueva acción para auto-login exitoso
 */
export function autoLoginConfirmedAction(userData) {
    return loginConfirmedAction(userData);
}

/**
 * Acción para limpiar errores de auth
 */
export function clearAuthMessages() {
    return (dispatch) => {
        dispatch(clearAuthErrorAction());
        dispatch(clearAuthSuccessAction());
    };
}