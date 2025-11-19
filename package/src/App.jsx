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
    }, []);

    useEffect(() => {
        let timerId;
        const initializeAuth = async () => {
            try {
                
                // Primero verificar si hay usuario en localStorage
                const hasUser = isLogin();
                
                if (hasUser) {
                    await checkAutoLogin(dispatch, navigate);
                } else {
                    // Forzar limpieza de estado por seguridad
                    localStorage.removeItem('userDetails');
                }
                
                setAuthChecked(true);
            } catch {
                // Limpieza de emergencia
                localStorage.removeItem('userDetails');
                setAuthChecked(true);
            } finally {
                timerId = setTimeout(() => {
                    setLoadingAuth(false);
                }, 1000);
            }
        };

        initializeAuth();

        // Cleanup function
        return () => {
            if (timerId) clearTimeout(timerId);
            stopTokenRefresh();
        };
    }, [dispatch, navigate]);

    // Efecto para manejar el schedule de refresh cuando la autenticación cambia
    useEffect(() => {
        if (authChecked && props.isAuthenticated) {
            scheduleTokenRefresh();
        } else if (authChecked && !props.isAuthenticated) {
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
                
                {props.isAuthenticated ? (
                    <Route path="/*" element={<Index />} />
                ) : (
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

const ConnectedApp = withRouter(connect(mapStateToProps)(App));
export default ConnectedApp;