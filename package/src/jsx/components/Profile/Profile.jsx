import React, { Fragment, useReducer, useEffect, useCallback } from "react";
import { Button, Alert, Spinner, Card, Form } from "react-bootstrap";
import { getProfileData } from "../../../services/ProfileService";
import PageTitle from "../../layouts/PageTitle";
import profileImg from "../../../assets/images/profile/profile.png";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileAction } from "../../../store/actions/ProfileActions";
import { clearAuthErrorAction } from "../../../store/actions/AuthActions";

const initialState = {
    nombre: "",
    correo: "",
    loading: true,
    saving: false,
    error: "",
    success: ""
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_PROFILE":
            return { 
                ...state, 
                nombre: action.payload.nombre, 
                correo: action.payload.correo, 
                loading: false 
            };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_SAVING":
            return { ...state, saving: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, success: "" };
        case "SET_SUCCESS":
            return { ...state, success: action.payload, error: "" };
        case "UPDATE_FIELD":
            return { ...state, [action.field]: action.value };
        case "CLEAR_MESSAGES":
            return { ...state, error: "", success: "" };
        case "CLEAR_SUCCESS": 
            return { ...state, success: "" };
        case "CLEAR_ERROR":
            return { ...state, error: "" };
        default:
            return state;
    }
};

const Profile = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const reduxDispatch = useDispatch();
    
    // Obtener el estado de Redux para mensajes globales y datos iniciales
    const authState = useSelector(state => state.auth);
    const initialUserData = authState.auth?.user;

    // Función para obtener datos del perfil (Memorizada)
    const fetchProfile = useCallback(async () => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });
            const data = await getProfileData();
            dispatch({ type: "SET_PROFILE", payload: data });
        } catch (err) {
            dispatch({ 
                type: "SET_ERROR", 
                payload: err.message || "Error al cargar el perfil" 
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []);

    // 1. Carga inicial del perfil
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); // Dependencia: fetchProfile

    // 2. Efecto para mostrar y limpiar mensajes de error de Redux
    useEffect(() => {
        if (authState.errorMessage) {
            // 🔴 Muestra el error de Redux en el estado local
            dispatch({ type: "SET_ERROR", payload: authState.errorMessage });
            
            // ✅ LIMPIA el error del store de Redux
            reduxDispatch(clearAuthErrorAction()); 
        }
    }, [authState.errorMessage, reduxDispatch]);

    // 3. Efecto para limpiar mensajes de éxito local (2s)
    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                dispatch({ type: "CLEAR_SUCCESS" });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.success]);

    // 4. Efecto para limpiar mensajes de error local (2s)
    useEffect(() => {
        if (state.error) {
            const timer = setTimeout(() => {
                dispatch({ type: "CLEAR_ERROR" });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "UPDATE_FIELD", field: name, value: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica
        if (!state.nombre.trim() || !state.correo.trim()) {
            dispatch({ 
                type: "SET_ERROR", 
                payload: "Nombre y correo son obligatorios" 
            });
            return;
        }

        // Verificar si realmente hay cambios
        if (initialUserData && state.nombre === initialUserData.nombre && state.correo === initialUserData.correo) {
            dispatch({ 
                type: "SET_ERROR", 
                payload: "No hay cambios para guardar" 
            });
            return;
        }

        dispatch({ type: "SET_SAVING", payload: true });
        dispatch({ type: "CLEAR_MESSAGES" });

        try {
            // Llama a la acción Redux
            await reduxDispatch(updateProfileAction({ 
                nombre: state.nombre.trim(), 
                correo: state.correo.trim() 
            }));
            
            // ÉXITO DIRECTO
            dispatch({ type: "SET_SUCCESS", payload: "Perfil actualizado correctamente" });
            
            // ✅ Recargar datos del perfil sin setTimeout
            await fetchProfile();
            
        } catch (err) {
            dispatch({ 
                type: "SET_ERROR", 
                payload: err.message || "Error al actualizar el perfil" 
            });
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    if (state.loading) {
        return (
            <Fragment>
                <PageTitle activeMenu="Profile" motherMenu="App" />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando perfil...</span>
                    </Spinner>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <PageTitle activeMenu="Profile" motherMenu="App" />
            <div className="row">
                <div className="col-lg-12">
                    <div className="profile card card-body px-3 pt-3 pb-0">
                        <div className="profile-head">
                            <div className="profile-info">
                                <div className="profile-photo">
                                    <img 
                                        src={profileImg} 
                                        className="img-fluid rounded-circle" 
                                        alt="Profile" 
                                        width="80"
                                        height="80"
                                    />
                                </div>
                                <div className="profile-details">
                                    <div className="profile-name px-3 pt-2">
                                        <h4 className="text-primary mb-0">{state.nombre}</h4>
                                        <small className="text-muted">ID: {initialUserData?.id || 'N/A'}</small>
                                    </div>
                                    <div className="profile-email px-2 pt-2">
                                        <h4 className="text-muted mb-0">{state.correo}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-8 col-lg-10 mt-4">
                    <Card>
                        <Card.Body>
                            <h4 className="text-primary mb-4">Actualizar Perfil</h4>
                            
                            {/* Alertas de mensajes */}
                            {state.error && (
                                <Alert variant="danger" dismissible onClose={() => dispatch({ type: "CLEAR_ERROR" })}>
                                    {state.error}
                                </Alert>
                            )}
                            
                            {state.success && (
                                <Alert variant="success" dismissible onClose={() => dispatch({ type: "CLEAR_SUCCESS" })}>
                                    {state.success}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="nombre" className="fw-semibold">
                                        Nombre
                                    </Form.Label>
                                    <Form.Control
                                        id="nombre"
                                        type="text"
                                        name="nombre"
                                        value={state.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingresa tu nombre completo"
                                        disabled={state.saving}
                                        required
                                        minLength={2}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label htmlFor="correo" className="fw-semibold">
                                        Correo Electrónico
                                    </Form.Label>
                                    <Form.Control
                                        id="correo"
                                        type="email"
                                        name="correo"
                                        value={state.correo}
                                        onChange={handleChange}
                                        placeholder="Ingresa tu correo electrónico"
                                        disabled={state.saving}
                                        required
                                    />
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    disabled={state.saving}
                                    className="px-4"
                                >
                                    {state.saving ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Actualizar Perfil"
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Fragment>
    );
};

export default Profile;