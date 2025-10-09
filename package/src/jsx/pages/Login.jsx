import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // ⬅️ Usando useSelector en lugar de connect
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
// Se asume que también tienes una acción para limpiar el éxito (AuthActions)
import { 
    loadingToggleAction, 
    loginAction, 
    loginFailedAction, 
    // Suponiendo que tienes una acción para limpiar el mensaje de éxito
    // Por ejemplo: loginSuccessAction 
} from '../../store/actions/AuthActions'; 

import logo from '../../assets/images/logo3.png';
import logotext from '../../assets/images/logo4.png';

function Login() {
    // 1. Estados locales para el formulario y mensajes temporales
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [errors, setErrors] = useState({ correo: '', clave: '' });
    const [tempError, setTempError] = useState('');
    const [tempSuccess, setTempSuccess] = useState('');
    
    // 2. Hooks de Redux y Router
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 3. Obtener estados de Redux usando useSelector
    const errorMessage = useSelector(state => state.auth.errorMessage);
    const successMessage = useSelector(state => state.auth.successMessage);
    const showLoading = useSelector(state => state.auth.showLoading);

    // Manejo de Error 3s
    useEffect(() => {
        if (errorMessage) {
            setTempError(errorMessage);
            const timer = setTimeout(() => {
                setTempError('');
                // Limpiar el error en Redux
                dispatch(loginFailedAction(''));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage, dispatch]);

    // Manejo de Éxito 3s
    useEffect(() => {
        if (successMessage) {
            setTempSuccess(successMessage);
            const timer = setTimeout(() => {
                setTempSuccess('');
                // ⚠️ Se recomienda limpiar el mensaje de éxito en Redux si proviene de allí
                // dispatch(loginSuccessAction('')); 
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]); // Añadir dispatch a las dependencias por buena práctica

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { correo: '', clave: '' };
        
        // Validación
        if (correo.trim() === '') { // ⬅️ Uso de trim() para mejor validación
            errorObj.correo = 'El correo es requerido';
            error = true;
        }
        if (clave === '') {
            errorObj.clave = 'La contraseña es requerida';
            error = true;
        }
        setErrors(errorObj);
        if (error) return;

        // Limpiar errores anteriores antes de la solicitud
        setTempError('');
        dispatch(loginFailedAction(''));

        // Iniciar el proceso de login
        dispatch(loadingToggleAction(true));
        dispatch(loginAction(correo, clave, navigate));
    }

    return (
        <div className="login-form-bx">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-6 col-md-7 box-skew d-flex">
                        <div className="authincation-content">
                            <Link to="#" className="login-logo">
                                <img src={logo} alt="Logo" className="logo-icon me-2" />
                                <img src={logotext} alt="Logo Texto" className="logo-text ms-1" />
                            </Link>
                            <div className="mb-4">
                                <h3 className="mb-1 font-w600">Bienvenido a CEAA</h3>
                                <p className="">Inicie sesión ingresando la información a continuación</p>
                            </div>

                            {/* Mensaje de error (local) */}
                            {tempError && (
                                <Alert variant="danger" dismissible onClose={() => setTempError('')}>
                                    {tempError}
                                </Alert>
                            )}

                            {/* Mensaje de éxito (local) */}
                            {tempSuccess && (
                                <Alert variant="success" dismissible onClose={() => setTempSuccess('')}>
                                    {tempSuccess}
                                </Alert>
                            )}

                            <form onSubmit={onLogin}>
                                <div className="form-group">
                                    <label className="mb-2 ">
                                        <strong>Correo</strong><span className='required'>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        disabled={showLoading}
                                    />
                                    {errors.correo && <div className="text-danger fs-12">{errors.correo}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="mb-2 "><strong>Contraseña</strong><span className='required'>*</span></label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={clave}
                                        onChange={(e) => setClave(e.target.value)}
                                        disabled={showLoading}
                                    />
                                    {errors.clave && <div className="text-danger fs-12">{errors.clave}</div>}
                                </div>
                                <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox ms-1 ">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id="basic_checkbox_1" 
                                                disabled={showLoading}
                                            />
                                            <label className="form-check-label" htmlFor="basic_checkbox_1">
                                                Recordar mi preferencia
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-block"
                                        disabled={showLoading}
                                    >
                                        {showLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </button>
                                </div>
                            </form>
                            <div className="new-account mt-2">
                                <p className="mb-0">¿No tienes una cuenta?{" "}
                                    <Link className="text-primary" to="/page-register">Regístrate</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-5 d-flex box-skew1"></div>
                </div>
            </div>
        </div>
    );
}

// 4. Se exporta directamente el componente sin connect
export default Login;