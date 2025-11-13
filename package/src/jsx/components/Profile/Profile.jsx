import React, { Fragment, useReducer, useEffect, useCallback } from "react";
import { Button, Alert, Spinner, Card, Form } from "react-bootstrap";
import { getProfileData } from "../../../services/ProfileService";
import profileImg from "../../../assets/images/profile/profile.png";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileAction } from "../../../store/actions/ProfileActions";
import { clearAuthErrorAction } from "../../../store/actions/AuthActions";

const initialState = {
  nombre: "",
  correo: "",
  originalNombre: "",
  originalCorreo: "",
  loading: true,
  saving: false,
  error: "",
  success: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROFILE":
      // Actualiza los valores actuales y los originales para reflejar el estado más reciente
      return {
        ...state,
        nombre: action.payload.nombre,
        correo: action.payload.correo,
        originalNombre: action.payload.nombre,
        originalCorreo: action.payload.correo,
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    case "SET_ERROR":
      // Borra success cuando hay error
      return { ...state, error: action.payload, success: "" };
    case "SET_SUCCESS":
      // Borra error cuando hay success
      return { ...state, success: action.payload, error: "" };
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "CLEAR_MESSAGES":
      return { ...state, error: "", success: "" };
    case "CLEAR_SUCCESS":
      return { ...state, success: "" };
    case "CLEAR_ERROR":
      // Necesario para que el useEffect (4) borre el mensaje local
      return { ...state, error: "" };
    default:
      return state;
  }
};

const Profile = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch(); // Obtener el estado de Redux para mensajes globales y datos iniciales
  const authState = useSelector((state) => state.auth);
  const initialUserData = authState.auth?.user; // Función para obtener datos del perfil (Memorizada)

  const fetchProfile = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await getProfileData();
      dispatch({ type: "SET_PROFILE", payload: data });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Error al cargar el perfil",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []); // 1. Carga inicial del perfil al montar el componente

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // 2. Sincroniza el error de Redux al estado local y limpia Redux.

  // Esto permite que el error se muestre usando el Alert local y se limpie con el temporizador local (useEffect 4).
  useEffect(() => {
    if (authState.errorMessage) {
      // Copia el error de Redux a nuestro estado local
      dispatch({ type: "SET_ERROR", payload: authState.errorMessage });
      // Limpia Redux inmediatamente. El estado local se encargará del temporizador.
      reduxDispatch(clearAuthErrorAction());
    }
  }, [authState.errorMessage, reduxDispatch]); // 3. Efecto para limpiar mensajes de éxito local (2s)

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLEAR_SUCCESS" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success]); // 4. Efecto para limpiar mensajes de error local (2s)

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
    const currentNombre = state.nombre.trim();
    const currentCorreo = state.correo.trim();

    if (!currentNombre || !currentCorreo) {
      dispatch({
        type: "SET_ERROR",
        payload: "Nombre y correo son obligatorios",
      });
      return;
    }

    if (
      currentNombre === state.originalNombre &&
      currentCorreo === state.originalCorreo
    ) {
      dispatch({
        type: "SET_ERROR",
        payload: "No hay cambios para guardar",
      });
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });
    // Limpiar mensajes antes de intentar guardar
    dispatch({ type: "CLEAR_MESSAGES" });

    try {
      await reduxDispatch(
        updateProfileAction({
          nombre: currentNombre,
          correo: currentCorreo,
        })
      );
      // 1. Mostrar mensaje de éxito local (activará useEffect 3)
      dispatch({
        type: "SET_SUCCESS",
        payload: "Perfil actualizado correctamente",
      });

      // 2. Actualizar los campos 'originales' para reflejar los cambios guardados.
      // Esto elimina la necesidad de llamar a 'fetchProfile' (evitando una llamada API redundante).
      dispatch({
        type: "SET_PROFILE",
        payload: {
          ...state, // Mantenemos otros campos si existen
          nombre: currentNombre,
          correo: currentCorreo,
        },
      });
    } catch (err) {
      // Manejo de errores que no pasan por el store de Redux
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Error al actualizar el perfil",
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (state.loading) {
    return (
      <Fragment>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
          {" "}
          <Spinner animation="border" role="status">
            {" "}
            <span className="visually-hidden">Cargando perfil...</span>
{" "}
          </Spinner>
{" "}
        </div>
{" "}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="row">
       {" "}
        <div className="col-lg-12">
          {" "}
          <div className="profile card card-body px-3 pt-3 pb-0">
           {" "}
            <div className="profile-head">
              {" "}
              <div className="profile-info">
                {" "}
                <div className="profile-photo">
                  {" "}
                  <img
                    src={profileImg}
                    className="img-fluid rounded-circle"
                    alt="Profile"
                    width="80"
                    height="80"
                  />
                 {" "}
                </div>
                {" "}
                <div className="profile-details">
                  {" "}
                  <div className="profile-name px-3 pt-2">
                   {" "}
                    <h4 className="text-primary mb-0">{state.nombre}</h4>
                   {" "}
                    <small className="text-muted">
                      ID: {initialUserData?.id || "N/A"}
                    </small>
                    {" "}
                  </div>
                 {" "}
                  <div className="profile-email px-2 pt-2">
    {" "}
                    <h4 className="text-muted mb-0">{state.correo}</h4>
                    {" "}
                  </div>
                  {" "}
                </div>
               {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div className="col-xl-8 col-lg-10 mt-4">
          {" "}
          <Card>
            {" "}
            <Card.Body>
             {" "}
              <h4 className="text-primary mb-4">Actualizar Perfil</h4>
              {" "}
              {/* Alertas de mensajes locales (incluyen el error copiado de Redux) */}
              {" "}
              {state.error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => dispatch({ type: "CLEAR_ERROR" })}
                >
                  {state.error}
                    {" "}
                </Alert>
              )}
              {" "}
              {state.success && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => dispatch({ type: "CLEAR_SUCCESS" })}
                >
                  {state.success}
                  {" "}
                </Alert>
              )}
              {" "}
              <Form onSubmit={handleSubmit}>
                {" "}
                <Form.Group className="mb-3">
                  {" "}
                  <Form.Label htmlFor="nombre" className="fw-semibold">
                    Nombre
                    {" "}
                  </Form.Label>
                  {" "}
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
                  {" "}
                </Form.Group>
                {" "}
                <Form.Group className="mb-4">
                  {" "}
                  <Form.Label htmlFor="correo" className="fw-semibold">
                    Correo Electrónico 
                    {" "}
                  </Form.Label>
                  {" "}
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
                  {" "}
                </Form.Group>
                {" "}
                <Button
                  type="submit"
                  variant="primary"
                  disabled={state.saving}
                  className="px-4"
                >
                  {" "}
                  {state.saving ? (
                    <>
                      {" "}
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Guardando... {" "}
                    </>
                  ) : (
                    "Actualizar Perfil"
                  )}
                  {" "}
                </Button>
                {" "}
              </Form>
              {" "}
            </Card.Body>
            {" "}
          </Card>
            {" "}
        </div>
            {" "}
      </div>
                  {" "}
    </Fragment>
  );
};

export default Profile;
