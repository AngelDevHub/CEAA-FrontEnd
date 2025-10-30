import axiosInstance from './AxiosInstance';
import swal from "sweetalert";
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';

/**
 * Registro de usuario
 */
export function signUp(nombre, correo, clave) {
    const postData = { nombre, correo, clave };
    return axiosInstance.post('auth/registro', postData);
}

/**
 * Login
 */
export function login(correo, clave) {
    const postData = { correo, clave };
    return axiosInstance.post('auth/login', postData);
}

/**
 * Formatear errores de Axios
 */
export function formatError(errorResponse) {
    return errorResponse?.message || 'Error desconocido';
}

/**
 * 🔥 Guardar usuario en localStorage solo para info de UI, no el token
 */
export function saveUserInLocalStorage(userDetails) {
    // userDetails viene de response.data.data
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
}

/**
 * Logout
 */
export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

/**
 * Comprobar login automático basado en info de localStorage (UI)
 */
export function checkAutoLogin(dispatch, navigate) {
    const userDetailsString = localStorage.getItem('userDetails');
    if (!userDetailsString) {
        dispatch(Logout(navigate));
        return;
    }

    const userDetails = JSON.parse(userDetailsString);
    dispatch(loginConfirmedAction({ user: userDetails }));
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
        return null;
    }
}
