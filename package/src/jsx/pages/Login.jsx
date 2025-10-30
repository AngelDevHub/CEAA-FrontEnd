import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { 
    loginAction, 
    loadingToggleAction, 
    loginFailedAction, 
    clearAuthSuccessAction 
} from '../../store/actions/AuthActions';
import logo from '../../assets/images/logo3.png';
import logotext from '../../assets/images/logo4.png';

function Login() {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [errors, setErrors] = useState({ correo: '', clave: '' });
    const [tempError, setTempError] = useState('');
    const [tempSuccess, setTempSuccess] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const errorMessage = useSelector(state => state.auth.errorMessage);
    const successMessage = useSelector(state => state.auth.successMessage);
    const showLoading = useSelector(state => state.auth.showLoading);

    // Manejo de errores 3s
    useEffect(() => {
        if (errorMessage) {
            setTempError(errorMessage);
            const timer = setTimeout(() => {
                setTempError('');
                dispatch(loginFailedAction(''));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage, dispatch]);

    // Manejo de éxito 3s
    useEffect(() => {
        if (successMessage) {
            setTempSuccess(successMessage);
            const timer = setTimeout(() => {
                setTempSuccess('');
                dispatch(clearAuthSuccessAction());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    const onLogin = (e) => {
        e.preventDefault();
        let hasError = false;
        const errorObj = { correo: '', clave: '' };

        if (!correo.trim()) {
            errorObj.correo = 'El correo es requerido';
            hasError = true;
        }
        if (!clave) {
            errorObj.clave = 'La contraseña es requerida';
            hasError = true;
        }
        setErrors(errorObj);
        if (hasError) return;

        setTempError('');
        dispatch(loginFailedAction(''));

        dispatch(loadingToggleAction(true));
        dispatch(loginAction(correo, clave, navigate));
    };

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
                                <p>Inicie sesión ingresando la información a continuación</p>
                            </div>

                            {tempError && (
                                <Alert variant="danger" dismissible onClose={() => setTempError('')}>
                                    {tempError}
                                </Alert>
                            )}

                            {tempSuccess && (
                                <Alert variant="success" dismissible onClose={() => setTempSuccess('')}>
                                    {tempSuccess}
                                </Alert>
                            )}

                            <form onSubmit={onLogin}>
                                <div className="form-group">
                                    <label className="mb-2"><strong>Correo</strong><span className="required">*</span></label>
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
                                    <label className="mb-2"><strong>Contraseña</strong><span className="required">*</span></label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={clave}
                                        onChange={(e) => setClave(e.target.value)}
                                        disabled={showLoading}
                                    />
                                    {errors.clave && <div className="text-danger fs-12">{errors.clave}</div>}
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
                                <p>¿No tienes una cuenta?{" "}
                                    <Link className="text-primary" to="/register">Regístrate</Link>
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

export default Login;
