import { lazy, Suspense, useEffect, useState } from 'react';
import Index from './jsx/index';
import { connect, useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { checkAutoLogin, isLogin, scheduleTokenRefresh, stopTokenRefresh } from './services/AuthService';
import { isAuthenticated } from './store/selectors/AuthSelectors';
import "./assets/css/style.css";
import PropTypes from 'prop-types';

const Register = lazy(() => import('./jsx/pages/Registration'));
const Login = lazy(() => new Promise(resolve => {
    setTimeout(() => resolve(import('./jsx/pages/Login')), 500);
}));

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        
        return <Component {...props} router={{ location, navigate, params }} />;
    }
    return ComponentWithRouterProp;
}

function App(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        console.log('🔍 Debug de entorno:');
        console.log('🌐 Frontend URL:', window.location.origin);
        console.log('🍪 Cookies visibles:', document.cookie);
        console.log('👤 Usuario en localStorage:', localStorage.getItem('userDetails'));
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('🔐 Inicializando autenticación...');
                
                // Primero verificar si hay usuario en localStorage
                const hasUser = isLogin();
                
                if (hasUser) {
                    console.log('👤 Usuario encontrado en localStorage, verificando sesión...');
                    await checkAutoLogin(dispatch, navigate);
                } else {
                    console.log('🚫 No hay usuario en localStorage');
                    // Forzar limpieza de estado por seguridad
                    localStorage.removeItem('userDetails');
                }
                
                setAuthChecked(true);
            } catch (error) {
                console.error('💥 Error crítico en inicialización de auth:', error);
                // Limpieza de emergencia
                localStorage.removeItem('userDetails');
                setAuthChecked(true);
            } finally {
                // Siempre quitar loading después de un tiempo razonable
                const timer = setTimeout(() => {
                    setLoadingAuth(false);
                    console.log('✅ Inicialización de auth completada');
                }, 1000);

                return () => clearTimeout(timer);
            }
        };

        initializeAuth();

        // Cleanup function
        return () => {
            stopTokenRefresh();
        };
    }, [dispatch, navigate]);

    // Efecto para manejar el schedule de refresh cuando la autenticación cambia
    useEffect(() => {
        if (authChecked && props.isAuthenticated) {
            console.log('🔄 Programando refresh periódico de tokens...');
            scheduleTokenRefresh();
        } else if (authChecked && !props.isAuthenticated) {
            console.log('🧹 Usuario no autenticado, limpiando refresh...');
            stopTokenRefresh();
        }
    }, [authChecked, props.isAuthenticated]);

    // Mostrar loading mientras se verifica la autenticación
    if (loadingAuth) {
        return (
            <div id="preloader">
                <div className="sk-three-bounce">
                    <div className="sk-child sk-bounce1"></div>
                    <div className="sk-child sk-bounce2"></div>
                    <div className="sk-child sk-bounce3"></div>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div id="preloader">
                <div className="sk-three-bounce">
                    <div className="sk-child sk-bounce1"></div>
                    <div className="sk-child sk-bounce2"></div>
                    <div className="sk-child sk-bounce3"></div>
                </div>
            </div>
        }>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rutas protegidas */}
                {props.isAuthenticated ? (
                    <Route path="/*" element={<Index />} />
                ) : (
                    // Redirigir a login si no está autenticado
                    <Route path="*" element={<Login />} />
                )}
            </Routes>
        </Suspense>
    );
}

App.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
});

export default withRouter(connect(mapStateToProps)(App));
