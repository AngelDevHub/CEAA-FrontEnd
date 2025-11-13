// AuthSelectors.js
export const isAuthenticated = (state) => {
    return state.auth.auth.isAuthenticated;
};

export const getAuthUser = (state) => state.auth.auth.user;

export const getAuthLoading = (state) => state.auth.showLoading;

export const getAuthError = (state) => state.auth.errorMessage;

export const getAuthSuccess = (state) => state.auth.successMessage;

// Selectores adicionales útiles
export const getUserName = (state) => state.auth.auth.user?.nombre || '';

export const getUserEmail = (state) => state.auth.auth.user?.correo || '';

export const getUserId = (state) => state.auth.auth.user?.id || null;

export const hasAuthError = (state) => !!state.auth.errorMessage;

export const hasAuthSuccess = (state) => !!state.auth.successMessage;