// AuthReducer.js
import {
    SIGNUP_CONFIRMED_ACTION,
    SIGNUP_FAILED_ACTION,
    LOGIN_CONFIRMED_ACTION,
    LOGIN_FAILED_ACTION,
    LOADING_TOGGLE_ACTION,
    LOGOUT_ACTION,
    UPDATE_PROFILE_ACTION,
    CLEAR_AUTH_ERROR,   
    CLEAR_AUTH_SUCCESS, 
} from '../actions/ActionTypes';

const initialState = {
    auth: {
        token: '',
        user: null,
        expireDate: null,
        isAuthenticated: false,
    },
    errorMessage: '',
    successMessage: '',
    showLoading: false,
};

export function AuthReducer(state = initialState, action) {
    switch (action.type) {
        case SIGNUP_CONFIRMED_ACTION:
        case LOGIN_CONFIRMED_ACTION:
            return {
                ...state,
                // ✅ Sobrescribe auth con el payload limpio, asegurando isAuthenticated: true
                auth: action.payload, 
                errorMessage: '',
                successMessage: action.type === SIGNUP_CONFIRMED_ACTION ? '!Registro exitoso¡' : 'Inicio de sesión exitoso',
                showLoading: false,
            };
        case UPDATE_PROFILE_ACTION: 
            // Usamos un fallback seguro por si state.auth.user es null
            const currentUser = state.auth.user || {};
            return {
                ...state,
                auth: {
                    ...state.auth,
                    user: {
                        ...currentUser, 
                        ...action.payload // Aplica solo los cambios
                    }
                },
                errorMessage: '',
                successMessage: 'Perfil actualizado correctamente',
            };
        case SIGNUP_FAILED_ACTION:
        case LOGIN_FAILED_ACTION:
            return {
                ...state,
                errorMessage: action.payload,
                successMessage: '',
                showLoading: false,
            };
        case LOADING_TOGGLE_ACTION:
            return {
                ...state,
                showLoading: action.payload,
            };
        case LOGOUT_ACTION:
            return {
                ...state,
                // ✅ Reseteo completo del estado de autenticación (isAuthenticated: false)
                auth: initialState.auth, 
                errorMessage: '',
                successMessage: '',
            };
        
        // ✅ NUEVOS CASES para limpieza de mensajes
        case CLEAR_AUTH_ERROR:
            return {
                ...state,
                errorMessage: '',
            };
        case CLEAR_AUTH_SUCCESS:
            return {
                ...state,
                successMessage: '',
            };

        default:
            return state;
    }
}
