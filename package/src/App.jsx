import { lazy, Suspense, useEffect, useState } from 'react';
import Index from './jsx/index';
import { connect, useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { checkAutoLogin, isLogin, scheduleTokenRefresh, stopTokenRefresh } from './services/AuthService';
import { syncSocketAuth } from './services/SocketService';
import { isAuthenticated } from './store/selectors/AuthSelectors';
import "./assets/css/style.css";
import PropTypes from 'prop-types';

const isDev = import.meta.env.DEV;
const debugLog = (...args) => {
    if (isDev) console.log(...args);
};

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
        let cancelled = false;

        const initializeAuth = async () => {
            try {
                debugLog('🔐 Inicializando autenticación...');
                
                // Primero verificar si hay usuario en localStorage
                const hasUser = isLogin();
                
                if (hasUser) {
                    debugLog('👤 Usuario encontrado en localStorage, verificando sesión...');
                    await checkAutoLogin(dispatch, navigate);
                } else {
                    debugLog('🚫 No hay usuario en localStorage');
                    // Forzar limpieza de estado por seguridad
                    localStorage.removeItem('userDetails');
                }
                
                if (!cancelled) {
                    setAuthChecked(true);
                }
            } catch (error) {
                console.error('💥 Error crítico en inicialización de auth:', error);
                // Limpieza de emergencia
                localStorage.removeItem('userDetails');
                if (!cancelled) {
                    setAuthChecked(true);
                }
            } finally {
                if (!cancelled) {
                    setLoadingAuth(false);
                    debugLog('✅ Inicialización de auth completada');
                }
            }
        };

        initializeAuth();

        // Cleanup function
        return () => {
            cancelled = true;
            stopTokenRefresh();
        };
    }, [dispatch, navigate]);

    // Efecto para manejar el schedule de refresh cuando la autenticación cambia
    useEffect(() => {
        if (authChecked && props.isAuthenticated) {
            debugLog('🔄 Programando refresh periódico de tokens...');
            scheduleTokenRefresh();
            syncSocketAuth(true);
        } else if (authChecked && !props.isAuthenticated) {
            debugLog('🧹 Usuario no autenticado, limpiando refresh...');
            stopTokenRefresh();
            syncSocketAuth(false);
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
                {props.isAuthenticated ? (
                    <Route path="/*" element={<Index />} />
                ) : (
                    <>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Login />} />
                    </>
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
