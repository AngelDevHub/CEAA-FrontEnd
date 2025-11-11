import { lazy, Suspense, useEffect } from 'react';
/// Components
import Index from './jsx/index';
import { connect, useDispatch } from 'react-redux';
import {  Route, Routes, useLocation , useNavigate , useParams } from 'react-router-dom';
// action
import { checkAutoLogin } from './services/AuthService';
import { isAuthenticated } from './store/selectors/AuthSelectors';
/// Style
import "./assets/css/style.css";

const Register = lazy(() => import('./jsx/pages/Registration'));
const Login = lazy(() => {
    return new Promise(resolve => {
		setTimeout(() => resolve(import('./jsx/pages/Login')), 500);
	});
});

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
      let location = useLocation();
      let navigate = useNavigate();
      let params = useParams();
      
      return (
        <Component
          {...props}
          router={{ location, navigate, params }}
        />
      );
    }
  
    return ComponentWithRouterProp;
}

function App(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    checkAutoLogin(dispatch, navigate);
  }, []);

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
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas privadas */}
        {props.isAuthenticated && <Route path="/*" element={<Index />} />}

        {/* Fallback si no autenticado */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Suspense>
  );
}


const mapStateToProps = (state) => {
    return {
        isAuthenticated: isAuthenticated(state),
    };
};

export default withRouter(connect(mapStateToProps)(App)); 