export const isAuthenticated = (state) => {
    if (state.auth.auth.token) return true;
    return false;
};
