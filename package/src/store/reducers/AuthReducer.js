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
        user: null,
        isAuthenticated: false,
    },
    errorMessage: '',
    successMessage: '',
    showLoading: false,
};

export function AuthReducer(state = initialState, action) {
    switch (action.type) {
        case SIGNUP_CONFIRMED_ACTION:
            return {
                ...state,
                auth: {
                    user: null,
                    isAuthenticated: false,
                },
                errorMessage: '',
                successMessage: '¡Registro exitoso! Inicia sesión para continuar.',
                showLoading: false,
            };

        case LOGIN_CONFIRMED_ACTION:
            return {
                ...state,
                auth: {
                    user: action.payload,
                    isAuthenticated: true,
                },
                errorMessage: '',
                successMessage: 'Inicio de sesión exitoso',
                showLoading: false,
            };

        case UPDATE_PROFILE_ACTION: {
            const currentUser = state.auth.user || {};
            return {
                ...state,
                auth: {
                    ...state.auth,
                    user: {
                        ...currentUser, 
                        ...action.payload,
                    },
                },
                errorMessage: '',
                successMessage: 'Perfil actualizado correctamente',
            };
        }

        case SIGNUP_FAILED_ACTION:
        case LOGIN_FAILED_ACTION:
            return {
                ...state,
                auth: {
                    user: null,
                    isAuthenticated: false,
                },
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
                ...initialState,
                successMessage: 'Sesión cerrada exitosamente',
            };

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
