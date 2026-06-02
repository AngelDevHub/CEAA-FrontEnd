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
 * Auto login con verificación de token - MEJORADO
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
        const verify = await verifyToken();
        
        if (verify.ok) {
            console.log('✅ Auto-login exitoso');
            const syncedUser = getCurrentUser() || userDetails;
            dispatch(loginConfirmedAction(syncedUser));
            return true;
        } else {
            if (verify.rateLimited) {
                console.log('⏳ Rate limit activo. Manteniendo sesión local y reintentando más tarde.');
                dispatch(loginConfirmedAction(getCurrentUser() || userDetails));
                return true;
            }
            console.log('❌ Token inválido, intentando refresh...');
            const refresh = await refreshAccessToken(dispatch);
            if (refresh.ok) {
                return true;
            }
            if (refresh.rateLimited) {
                console.log('⏳ Rate limit activo durante refresh. Manteniendo sesión local y reintentando más tarde.');
                dispatch(loginConfirmedAction(getCurrentUser() || userDetails));
                return true;
            }
            if (!refresh.ok) {
                console.log('🚪 Refresh fallido, haciendo logout...');
                dispatch(Logout(navigate));
            }
            return refresh.ok;
        }
    } catch (error) {
        console.error('💥 Error en auto-login:', error);
        dispatch(Logout(navigate));
        return false;
    }
}

/**
 * Verificar si el token es válido - MEJORADO
 */
export async function verifyToken() {
    try {
        // Usar el endpoint de perfil para verificar el token
        const response = await axiosInstance.get('auth/perfil', {
            timeout: 8000
        });
        if (response.data.success && response.data.data) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    role: response.data.data.role ?? currentUser.role,
                    roles: response.data.data.roles ?? currentUser.roles,
                    permissions: response.data.data.permissions ?? currentUser.permissions,
                    lastProfileSync: Date.now()
                };
                saveUserInLocalStorage(updatedUser);
            }
        }
        return { ok: Boolean(response.data.success), rateLimited: false };
    } catch (error) {
        const status = error.response?.status;
        console.log('🔐 Verificación de token fallida:', status, error.response?.data?.message || 'Token inválido');

        if (status === 429) {
            return { ok: false, rateLimited: true };
        }
        
        // Si es error 401, intentar refresh automáticamente
        if (status === 401) {
            console.log('🔄 Intentando refresh automático desde verifyToken...');
            try {
                const refreshResponse = await axiosInstance.post('auth/refresh-token', {}, {
                    withCredentials: true,
                    timeout: 8000
                });
                return { ok: Boolean(refreshResponse.data.success), rateLimited: false };
            } catch (refreshError) {
                const refreshStatus = refreshError.response?.status;
                console.log('❌ Refresh automático fallido:', refreshStatus);
                if (refreshStatus === 429) return { ok: false, rateLimited: true };
                return { ok: false, rateLimited: false };
            }
        }
        
        return { ok: false, rateLimited: false };
    }
}

/**
 * Refresh token manual - MEJORADO
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
            
            return { ok: true, rateLimited: false };
        } else {
            throw new Error('Refresh token failed in response');
        }
    } catch (error) {
        const status = error.response?.status;
        console.error('❌ Error en refresh manual:', status, error.response?.data?.message);

        if (status === 429) {
            return { ok: false, rateLimited: true };
        }
        
        // Limpiar y redirigir solo si es error de autenticación
        if (status === 401) {
            localStorage.removeItem('userDetails');
            if (dispatch) {
                dispatch(Logout(() => {
                    window.location.href = '/login';
                }));
            }
        }
        return { ok: false, rateLimited: false };
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
        console.log('🧹 Intervalo anterior limpiado');
    }
    
    // Refresh cada 4 minutos (240 segundos antes de que expire el accessToken)
    refreshInterval = setInterval(async () => {
        if (isLogin()) {
            console.log('🔄 Refresh periódico del token...');
            try {
                const response = await axiosInstance.post('auth/refresh-token', {}, { 
                    withCredentials: true,
                    timeout: 8000
                });
                
                if (response.data.success) {
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
                }
            } catch (error) {
                console.error('❌ Error en refresh periódico:', error.response?.status);
                // No hacer logout aquí, el interceptor se encargará
            }
        } else {
            // Limpiar intervalo si el usuario no está logueado
            console.log('👤 Usuario no logueado, limpiando intervalo...');
            clearInterval(refreshInterval);
        }
    }, 4 * 60 * 1000); // 4 minutos
    
    console.log('⏰ Refresh periódico programado cada 4 minutos');
}

/**
 * Detener refresh periódico
 */
export function stopTokenRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log('🛑 Refresh periódico detenido');
    }
}

/**
 * Saber si el usuario está logueado
 */
export function isLogin() {
    const userDetails = localStorage.getItem('userDetails');
    return !!userDetails;
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
            withCredentials: true,
            timeout: 5000
        });
        console.log('✅ Logout backend exitoso');
    } catch (err) {
        console.error('⚠️ Error en logout backend:', err.response?.status, err.message);
        // Continuar con limpieza frontend aunque falle el backend
    } finally {
        // Limpiar frontend siempre
        localStorage.removeItem('userDetails');
        
        // Limpiar intervalo de refresh
        stopTokenRefresh();
        
        console.log('🧹 Frontend limpiado, redirigiendo...');
        
       if (navigate) {
            navigate('/login', { replace: true });
        } else {
            window.location.href = '/login';
        }
    }
}

/**
 * Verificar estado de salud del backend
 */
export async function healthCheck() {
    try {
        const response = await axiosInstance.get('/health', {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('❌ Health check fallido:', error.message);
        throw error;
    }
}
