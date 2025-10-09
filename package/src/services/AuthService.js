import axiosInstance from './AxiosInstance';
import swal from "sweetalert";
import {
    loginConfirmedAction,
    Logout,
} from '../store/actions/AuthActions';

export function signUp(nombre, correo, clave) {
    const postData = {
        nombre,
        correo,
        clave,
    };
    return axiosInstance.post(
        'register',
        postData,
    );
}

export function login(correo, clave) {
    const postData = {
        correo,
        clave,
    };
    return axiosInstance.post(
        'login',
        postData,
    );
}

export function formatError(errorResponse) {
    // errorResponse es error.response.data de Axios
    return errorResponse.message || 'Error desconocido';
}


// 🔥 CAMBIO PRINCIPAL: Corregir saveTokenInLocalStorage
export function saveTokenInLocalStorage(tokenDetails, user) {
    
    const dataToStore = {
        token: tokenDetails.token,
        user: tokenDetails.data, // ← Asegúrate de que esto tenga {id, nombre}
        expireDate: new Date(new Date().getTime() + tokenDetails.expiresIn * 1000),
    };

    localStorage.setItem('userDetails', JSON.stringify(dataToStore));
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

// 🔥 CAMBIO: Corregir checkAutoLogin para usar la estructura correcta
export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('userDetails');
    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
        return;
    }

    const tokenDetails = JSON.parse(tokenDetailsString);
    
    const expireDate = new Date(tokenDetails.expireDate);
    const todaysDate = new Date();

    if (todaysDate > expireDate) {
        dispatch(Logout(navigate));
        return;
    }

    dispatch(loginConfirmedAction({
        token: tokenDetails.token,
        user: tokenDetails.user, 
        expireDate: tokenDetails.expireDate
    }));

    const timer = expireDate.getTime() - todaysDate.getTime();
    runLogoutTimer(dispatch, timer, navigate);
}

export function isLogin() {
    const tokenDetailsString = localStorage.getItem('userDetails');
    
    if (!tokenDetailsString) {
        return false;
    }

    try {
        const tokenDetails = JSON.parse(tokenDetailsString);
        const expireDate = new Date(tokenDetails.expireDate);
        const todaysDate = new Date();
        
        return todaysDate <= expireDate;
    } catch (error) {
        return false;
    }
}

// 🔥 NUEVO: Función para obtener el usuario del localStorage
export function getCurrentUser() {
    try {
        const tokenDetailsString = localStorage.getItem('userDetails');
        if (!tokenDetailsString) return null;
        
        const tokenDetails = JSON.parse(tokenDetailsString);
        return tokenDetails.user;
    } catch (error) {
        return null;
    }
}