import { lazy, Suspense, useEffect, useState } from 'react';
import Index from './jsx/index';
import { connect, useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { checkAutoLogin } from './services/AuthService';
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

    useEffect(() => {
        const initAuth = async () => {
            await checkAutoLogin(dispatch, navigate);
            setLoadingAuth(false);
        };
        initAuth();
    }, [dispatch, navigate]);

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
                {props.isAuthenticated && <Route path="/*" element={<Index />} />}
                <Route path="*" element={<Login />} />
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
