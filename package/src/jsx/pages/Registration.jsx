import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../services/RegisterService';
import { loadingToggleAction } from '../../store/actions/AuthActions';

// Define la estructura inicial de errores fuera del componente para que sea una constante estable.
const INITIAL_ERRORS_STATE = { nombre: '', correo: '', clave: '' };

function Register() { 
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        clave: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    
    // Usar la constante estable para inicializar el estado de errores
    const [errors, setErrors] = useState(INITIAL_ERRORS_STATE); 
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const showLoading = useSelector(state => state.auth.showLoading); 

    // Limpieza de errores de la API después de 5 segundos
    useEffect(() => {
        if (apiError) {
            const timer = setTimeout(() => {
                setApiError('');
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // Maneja los cambios en los inputs y limpia los errores asociados
    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpia el error del campo actual si existe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Limpia mensajes generales al empezar a escribir
        if (apiError) setApiError('');
        if (successMessage) setSuccessMessage('');
    }

    // Lógica de registro encapsulada con useCallback para estabilidad
    const onSignUp = useCallback(async (e) => {
        e.preventDefault();
        let error = false;
        // Inicializar un objeto de errores fresco usando la constante estable
        const errorObj = { ...INITIAL_ERRORS_STATE }; 

        // Validaciones
        if (formData.nombre.trim() === '') {
            errorObj.nombre = 'Nombre es requerido';
            error = true;
        }

        if (formData.correo.trim() === '') {
            errorObj.correo = 'Correo es requerido';
            error = true;
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            errorObj.correo = 'Correo electrónico no válido';
            error = true;
        }

        if (formData.clave.trim() === '') {
            errorObj.clave = 'Clave es requerida';
            error = true;
        } else if (formData.clave.length < 8) {
            errorObj.clave = 'La clave debe tener al menos 8 caracteres';
            error = true;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.clave)) {
            errorObj.clave = 'La clave debe contener al menos una mayúscula, una minúscula y un número';
            error = true;
        }

        setErrors(errorObj);
        if (error) return;
        
        dispatch(loadingToggleAction(true));
        setApiError('');
        setSuccessMessage('');

        try {
            const userData = {
                nombre: formData.nombre,
                correo: formData.correo,
                clave: formData.clave
            };

            // Llamada al servicio de registro
            await registerUser(userData);
            
            setSuccessMessage('¡Registro exitoso! Redirigiendo...');
            
            // Redirige después de 2 segundos para que el usuario vea el éxito
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al registrar el usuario';
            setApiError(errorMsg);
        } finally {
            dispatch(loadingToggleAction(false));
        }
    // Dependencias limpias: solo se incluye el estado del formulario (formData) y las funciones de navegación/Redux.
    }, [formData, dispatch, navigate]); 

    return (
        <div className='authincation meddle'> 
            <div className='container'> 
                <div className='row justify-content-center'> 
                    <div className='col-md-8 col-lg-6'>
                        <div className='authincation-content'>
                            <div className='card'>
                                <div className='card-body p-4 p-sm-5'>
                                    <div className='auth-form'>
                                        <h4 className='text-center mb-4'>Crear tu cuenta</h4>

                                        {apiError && (<div className='alert alert-danger'>{apiError}</div>)}
                                        {successMessage && (<div className='alert alert-success'>{successMessage}</div>)}
                                        
                                        <form onSubmit={onSignUp}>
                                            {/* CAMPO NOMBRE */}
                                            <div className='form-group mb-3'>
                                                <label className='form-label'><strong>Nombre</strong><span className='required text-danger'>*</span></label>
                                                <input 
                                                    type='text' 
                                                    className='form-control' 
                                                    placeholder='Ingresa tu nombre completo'
                                                    name='nombre'
                                                    value={formData.nombre}
                                                    onChange={handleInputChange}
                                                    disabled={showLoading} 
                                                />
                                                {errors.nombre && (<div className="text-danger fs-12 mt-1">{errors.nombre}</div>)}
                                            </div>

                                            {/* CAMPO CORREO */}
                                            <div className='form-group mb-3'>
                                                <label className='form-label'><strong>Correo Electrónico</strong><span className='required text-danger'>*</span></label>
                                                <input 
                                                    type="email" 
                                                    className="form-control"
                                                    placeholder="Ingresa tu correo electrónico"
                                                    name="correo"
                                                    value={formData.correo}
                                                    onChange={handleInputChange}
                                                    autoComplete="email" 
                                                    disabled={showLoading}
                                                />
                                                {errors.correo && (<div className="text-danger fs-12 mt-1">{errors.correo}</div>)}
                                            </div>

                                            {/* CAMPO CONTRASEÑA */}
                                            <div className='form-group mb-3'>
                                                <label className='form-label'><strong>Contraseña</strong><span className='required text-danger'>*</span></label>
                                                <div className="input-group">
                                                    <input 
                                                        type={showPassword ? "text" : "password"} 
                                                        className="form-control"
                                                        placeholder="Crea una contraseña"
                                                        name="clave"
                                                        value={formData.clave}
                                                        onChange={handleInputChange}
                                                        autoComplete="new-password" 
                                                        disabled={showLoading}
                                                    />
                                                    <div className="input-group-append">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            disabled={showLoading}
                                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                        >
                                                            <i className={`las ${showPassword ? 'la-eye-slash' : 'la-eye'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {errors.clave && (<div className="text-danger fs-12 mt-1">{errors.clave}</div>)}
                                            </div>

                                            <div className='text-center mt-4'>
                                                <button 
                                                    type='submit' 
                                                    className='btn btn-primary btn-block w-100'
                                                    disabled={showLoading}
                                                >
                                                    {showLoading ? 'Creando cuenta...' : 'Registrarse'}
                                                </button>
                                            </div>
                                        </form>

                                        <div className='text-center mt-4 pt-3'>
                                            <p className='mb-0'>
                                                ¿Ya tienes una cuenta?{' '}
                                                <Link className='text-primary' to='/login'>
                                                    Iniciar sesión
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
