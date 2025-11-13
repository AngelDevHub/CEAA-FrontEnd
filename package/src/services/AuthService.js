import axiosInstance from './AxiosInstance';
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
 * Login - Optimizado para tu backend
 */
export function login(correo, clave) {
    const postData = { correo, clave };
    return axiosInstance.post('auth/login', postData, {
        withCredentials: true
    });
}

/**
 * Formatear errores de Axios
 */
export function formatError(errorResponse) {
    return errorResponse?.response?.data?.message || 
           errorResponse?.message || 
           'Error desconocido';
}

/**
 * Guardar usuario en localStorage
 */
export function saveUserInLocalStorage(userDetails) {
    localStorage.setItem('userDetails', JSON.stringify({
        ...userDetails,
        lastLogin: Date.now()
    }));
}

/**
 * Timer para logout automático
 */
export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        console.log('⏰ Logout automático por inactividad');
        logoutBackend(dispatch, navigate);
    }, timer);
}

/**
 * Auto login con verificación de token - OPTIMIZADO PARA APP.JSX
 */
export async function checkAutoLogin(dispatch, navigate) {
    const userDetailsString = localStorage.getItem('userDetails');
    
    if (!userDetailsString) {
        console.log('🔍 No hay usuario en localStorage');
        dispatch(Logout(navigate));
        return false;
    }

    try {
        const userDetails = JSON.parse(userDetailsString);
        console.log('🔍 Verificando sesión automática para:', userDetails.correo);
        
        // Verificar si el token es válido llamando al perfil
        const isValid = await verifyToken();
        
        if (isValid) {
            console.log('✅ Auto-login exitoso');
            dispatch(loginConfirmedAction(userDetails));
            return true;
        } else {
            console.log('❌ Token inválido, intentando refresh...');
            const refreshSuccess = await refreshAccessToken(dispatch);
            return refreshSuccess;
        }
    } catch (error) {
        console.error('💥 Error en auto-login:', error);
        dispatch(Logout(navigate));
        return false;
    }
}

/**
 * Verificar si el token es válido
 */
export async function verifyToken() {
    try {
        // Usar el endpoint de perfil para verificar el token
        const response = await axiosInstance.get('auth/perfil');
        return response.data.success;
    } catch (error) {
        console.log('🔐 Verificación de token fallida:', error.response?.data?.message || 'Token inválido');
        return false;
    }
}

/**
 * Refresh token manual
 */
export async function refreshAccessToken(dispatch) {
    try {
        console.log('🔄 Iniciando refresh manual del token...');
        
        const response = await axiosInstance.post('auth/refresh-token', {}, { 
            withCredentials: true,
            timeout: 10000
        });

        if (response.data.success) {
            console.log('✅ Refresh manual exitoso');
            
            // Actualizar timestamp en localStorage
            const currentUser = getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    lastTokenRefresh: Date.now()
                };
                saveUserInLocalStorage(updatedUser);
                if (dispatch) {
                    dispatch(loginConfirmedAction(updatedUser));
                }
            }
            
            return true;
        } else {
            throw new Error('Refresh token failed in response');
        }
    } catch (error) {
        console.error('❌ Error en refresh manual:', error);
        
        // Limpiar y redirigir
        localStorage.removeItem('userDetails');
        if (dispatch) {
            dispatch(Logout(() => {
                window.location.href = '/login';
            }));
        }
        return false;
    }
}

/**
 * Programar refresh periódico del token
 */
let refreshInterval;
export function scheduleTokenRefresh() {
    // Limpiar intervalo anterior si existe
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Refresh cada 4 minutos (240 segundos antes de que expire el accessToken)
    refreshInterval = setInterval(async () => {
        if (isLogin()) {
            console.log('🔄 Refresh periódico del token...');
            try {
                await axiosInstance.post('auth/refresh-token', {}, { 
                    withCredentials: true 
                });
                console.log('✅ Refresh periódico exitoso');
                
                // Actualizar timestamp
                const currentUser = getCurrentUser();
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        lastTokenRefresh: Date.now()
                    };
                    saveUserInLocalStorage(updatedUser);
                }
            } catch (error) {
                console.error('❌ Error en refresh periódico:', error);
                // El interceptor se encargará del manejo de errores
            }
        } else {
            // Limpiar intervalo si el usuario no está logueado
            clearInterval(refreshInterval);
        }
    }, 4 * 60 * 1000); // 4 minutos
}

/**
 * Saber si el usuario está logueado
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
        console.error('❌ Error al obtener usuario de localStorage:', error);
        return null;
    }
}

/**
 * Logout seguro - Coordinado con backend
 */
export async function logoutBackend(dispatch, navigate) {
    try {
        console.log('🚪 Iniciando logout...');
        await axiosInstance.post('auth/logout', {}, { 
            withCredentials: true 
        });
        console.log('✅ Logout backend exitoso');
    } catch (err) {
        console.error('⚠️ Error en logout backend:', err);
        // Continuar con limpieza frontend aunque falle el backend
    } finally {
        // Limpiar frontend siempre
        localStorage.removeItem('userDetails');
        
        // Limpiar intervalo de refresh
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        console.log('🧹 Frontend limpiado, redirigiendo...');
        
        if (dispatch && navigate) {
            dispatch(Logout(navigate));
        } else {
            // Redirigir directamente si no hay dispatch/navigate
            window.location.href = '/login';
        }
    }
}