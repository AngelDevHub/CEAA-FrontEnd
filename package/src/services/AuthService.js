import axiosInstance from './AxiosInstance';
import { loginConfirmedAction, Logout } from '../store/actions/AuthActions';

/**
 * Registro de usuario
 */
export function signUp(nombre, correo, clave) {
    const postData = { nombre, correo, clave };
    return axiosInstance.post('/auth/registro', postData);
}

/**
 * Login
 */
export function login(correo, clave) {
    const postData = { correo, clave };
    return axiosInstance.post('/auth/login', postData);
}

/**
 * Formatear errores de Axios
 */
export function formatError(errorResponse) {
    return errorResponse?.message || 'Error desconocido';
}

/**
 * Guardar usuario en localStorage solo para info de UI, no el token
 */
export function saveUserInLocalStorage(userDetails) {
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
}

/**
 * Logout con timer
 */
export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

/**
 * Auto login basado en localStorage
 */
export function checkAutoLogin(dispatch, navigate) {
    const userDetailsString = localStorage.getItem('userDetails');
    if (!userDetailsString) {
        dispatch(Logout(navigate));
        return;
    }
    const userDetails = JSON.parse(userDetailsString);
    dispatch(loginConfirmedAction(userDetails));
}

/**
 * Saber si el usuario está logueado (solo basado en localStorage)
 */
export function isLogin() {
    return !!localStorage.getItem('userDetails');
}

/**
 * Obtener usuario actual del localStorage
 */
export function getCurrentUser() {
    try {
        const userDetailsString = localStorage.getItem('userDetails');
        if (!userDetailsString) return null;
        return JSON.parse(userDetailsString);
    } catch (error) {
        console.error('Error al obtener el usuario de localStorage:', error);
        return null;
    }
}

/**
 * Renovar accessToken automáticamente desde backend
 */
export async function refreshAccessToken(dispatch) {
    try {
        // Cambiado a POST y ruta completa relativa correcta
        const response = await axiosInstance.post('/auth/refresh-token');

        if (response.data.success) {
            const current = getCurrentUser();
            const newUserInfo = response.data.data;
            if (current) {
                saveUserInLocalStorage({ ...current, ...newUserInfo });
                dispatch(loginConfirmedAction({ ...current, ...newUserInfo }));
            }
        } else {
            dispatch(Logout(() => {}));
        }
    } catch (error) {
        console.error('Error refrescando token:', error);
        dispatch(Logout(() => {}));
    }
}

/**
 * Logout seguro
 */
export async function logoutBackend(dispatch, navigate) {
    try {
        await axiosInstance.post('/auth/logout');
    } catch (err) {
        console.error('Error cerrando sesión en backend', err);
    } finally {
        localStorage.removeItem('userDetails');
        dispatch(Logout(navigate));
    }
}
