import axiosInstance from './AxiosInstance';
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';


export function signUp(nombre, correo, clave) {
    const postData = { nombre, correo, clave };
    return axiosInstance.post('auth/registro', postData);
}

export function login(correo, clave) {
    const postData = { correo, clave };
    return axiosInstance.post('auth/login', postData, {
        withCredentials: true
    });
}

export function formatError(errorResponse) {
    return errorResponse?.response?.data?.message || 
           errorResponse?.message || 
           'Error desconocido';
}

export function saveUserInLocalStorage(userDetails) {
    localStorage.setItem('userDetails', JSON.stringify({
        ...userDetails,
        lastLogin: Date.now()
    }));
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        logoutBackend(dispatch, navigate);
    }, timer);
}

export async function checkAutoLogin(dispatch, navigate) {
    const userDetailsString = localStorage.getItem('userDetails');
    
    if (!userDetailsString) {
        dispatch(Logout(navigate));
        return false;
    }

    try {
        const userDetails = JSON.parse(userDetailsString);
        
        const isValid = await verifyToken();
        
        if (isValid) {
            dispatch(loginConfirmedAction(userDetails));
            return true;
        } else {
            const refreshSuccess = await refreshAccessToken(dispatch);
            if (!refreshSuccess) {
                dispatch(Logout(navigate));
            }
            return refreshSuccess;
        }
    } catch (error) {
        dispatch(Logout(navigate));
        return false;
    }
}

export async function verifyToken() {
    try {
        const response = await axiosInstance.get('auth/perfil', {
            timeout: 8000
        });
        return response.data.success;
    } catch (error) {
        if (error.response?.status === 401) {
            
            try {
                const refreshResponse = await axiosInstance.post('auth/refresh-token', {}, {
                    withCredentials: true,
                    timeout: 8000
                });
                return refreshResponse.data.success;
            } catch (refreshError) {
                return false;
            }
        }
        
        return false;
    }
}

/**
 * Refresh token manual - MEJORADO
 */
export async function refreshAccessToken(dispatch) {
    try {
        
        const response = await axiosInstance.post('auth/refresh-token', {}, { 
            withCredentials: true,
            timeout: 10000
        });

        if (response.data.success) {
            
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
        
        
        // Limpiar y redirigir solo si es error de autenticación
        if (error.response?.status === 401) {
            localStorage.removeItem('userDetails');
            if (dispatch) {
                dispatch(Logout(() => {
                    window.location.href = '/login';
                }));
            }
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
            try {
                const response = await axiosInstance.post('auth/refresh-token', {}, { 
                    withCredentials: true,
                    timeout: 8000
                });
                
                if (response.data.success) {
                    
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
                // No hacer logout aquí, el interceptor se encargará
            }
        } else {
            clearInterval(refreshInterval);
        }
    }, 4 * 60 * 1000);
}

/**
 * Detener refresh periódico
 */
export function stopTokenRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
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
        
        return null;
    }
}

/**
 * Logout seguro - Coordinado con backend
 */
export async function logoutBackend(dispatch, navigate) {
    try {
        await axiosInstance.post('auth/logout', {}, { 
            withCredentials: true,
            timeout: 5000
        });
    } catch (err) {
        // Continuar con limpieza frontend aunque falle el backend
    } finally {
        // Limpiar frontend siempre
        localStorage.removeItem('userDetails');
        
        // Limpiar intervalo de refresh
        stopTokenRefresh();
        
        
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
        throw error;
    }
}