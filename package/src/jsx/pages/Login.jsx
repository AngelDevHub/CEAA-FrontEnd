import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loadingToggleAction, loginAction } from '../../store/actions/AuthActions';

import logo from '../../assets/images/logo3.png';
import logotext from '../../assets/images/logo4.png';

function Login(props) {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    let errorsObj = { correo: '', clave: '' };
    const [errors, setErrors] = useState(errorsObj);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { ...errorsObj };
        if (correo === '') {
            errorObj.correo = 'El correo es requerido';
            error = true;
        }
        if (clave === '') {
            errorObj.clave = 'La contraseña es requerida';
            error = true;
        }
        setErrors(errorObj);
        if (error) {
            return;
        }
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
                                <img src={logo} alt="" className="logo-icon me-2" />
                                <img src={logotext} alt="" className="logo-text ms-1" />
                            </Link>
                            <div className="mb-4">
                                <h3 className="mb-1 font-w600">Bienvenido a CEAA</h3>
                                <p className="">Inicie sesión ingresando la información a continuación</p>
                            </div>
                            {props.errorMessage && (
                                <div className='bg-red-300 text-red-900 border border-red-900 p-1 my-2'>
                                    {props.errorMessage}
                                </div>
                            )}
                            {props.successMessage && (
                                <div className='bg-green-300 text-green-900 border border-green-900 p-1 my-2'>
                                    {props.successMessage}
                                </div>
                            )}
                            <form onSubmit={onLogin}>
                                <div className="form-group">
                                    <label className="mb-2 ">
                                        <strong className="">Correo</strong><span className='required'>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                    />
                                    {errors.correo && <div className="text-danger fs-12">{errors.correo}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="mb-2 "><strong className="">Contraseña</strong><span className='required'>*</span></label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={clave}
                                        onChange={(e) => setClave(e.target.value)}
                                    />
                                    {errors.clave && <div className="text-danger fs-12">{errors.clave}</div>}
                                </div>
                                <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox ms-1 ">
                                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                                            <label className="form-check-label" htmlFor="basic_checkbox_1">Recordar mi preferencia</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary btn-block">Iniciar Sesión</button>
                                </div>
                            </form>
                            <div className="new-account mt-2">
                                <p className="mb-0">¿No tienes una cuenta?{" "}
                                    <Link className="text-primary" to="/page-register">Regístrate</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-5 d-flex box-skew1">
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};
export default connect(mapStateToProps)(Login);