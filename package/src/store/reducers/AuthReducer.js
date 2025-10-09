// AuthReducer.js
import {
    SIGNUP_CONFIRMED_ACTION,
    SIGNUP_FAILED_ACTION,
    LOGIN_CONFIRMED_ACTION,
    LOGIN_FAILED_ACTION,
    LOADING_TOGGLE_ACTION,
    LOGOUT_ACTION,
    UPDATE_PROFILE_ACTION
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
            return {
                ...state,
                auth: action.payload,
                errorMessage: '',
                successMessage: '!Registro exitoso¡',
                showLoading: false,
            };
        case LOGIN_CONFIRMED_ACTION:
            return {
                ...state,
                auth: action.payload,
                errorMessage: '',
                successMessage: 'Inicio de sesión exitoso',
                showLoading: false,
            };
        case UPDATE_PROFILE_ACTION:            
            return {
                ...state,
                auth: {
                    ...state.auth,
                    user: {
                        ...state.auth.user, 
                        ...action.payload
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
                auth: { token: '', user: null, expireDate: null },
                errorMessage: '',
                successMessage: '',
            };
        default:
            return state;
    }
}
