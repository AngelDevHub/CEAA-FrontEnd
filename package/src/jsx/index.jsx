import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useSelector } from "react-redux";
import { Alert } from 'react-bootstrap';
/// Css
import './index.css';
import './chart.css';
import './step.css';

/// Layout
import Nav from './layouts/nav';
import Footer from './layouts/Footer';

/// Perfil
import Profile from './components/Profile/Profile';

/// Dashboard
import DashboardEntry from "./components/Dashboard/DashboardEntry";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

/// Pages
import Forbidden from './pages/Forbidden';
import Tasks from './pages/Tasks';
import Devices from './pages/Devices';
import Bitacora from './pages/Bitacora';
import Staff from './pages/Staff';
import Config from './pages/Config';

/// Monitoreo
import Temperatura from "./components/Dashboard/Monitoreo/Temperatura";
import Humedad from "./components/Dashboard/Monitoreo/Humedad";
import Nitrogeno from "./components/Dashboard/Monitoreo/NivelesNitrogeno";
import Riego from "./components/Dashboard/Monitoreo/Riego";
import MonitoreoCompleto from "./components/Dashboard/Monitoreo/MonitoreoCompleto";

// Maquetado 3D
import Invernadero3D from "./components/ThreeD/Invernadero3D";

//Scroll To Top
import ScrollToTop from './layouts/ScrollToTop';

const Markup = () => {

  const EnDesarrollo = ({ titulo }) => (
    <div className="row">
      <div className="col-12">
        <Alert variant="warning" className="mt-3">
          <strong>{titulo}</strong> — en desarrollo. Próximamente disponible.
        </Alert>
      </div>
    </div>
  );

  const allroutes = [

    //Rutas del Dashboard
    { url: "/", component: <DashboardEntry /> },
    { url: "/dashboard", component: <DashboardEntry /> },
    { url: "/monitoreo-temperatura", component: <Temperatura /> },
    { url: "/monitoreo-humedad", component: <Humedad /> },
    { url: "/monitoreo-nitrogeno", component: <Nitrogeno /> },
    { url: "/monitoreo-riego", component: <Riego /> },
    { url: "/monitoreo-completo", component: (
      <ProtectedRoute requiredPermission="view:metrics">
        <MonitoreoCompleto />
      </ProtectedRoute>
    ) },
    { url: "/maquetado-3d", component: <Invernadero3D /> },

    //Rutas del Perfil
    { url: '/perfil', component: <Profile/> },

    // Rutas de control de acceso
    { url: '/forbidden', component: <Forbidden /> },

    // Bitácora de campo
    { url: '/bitacora', component: (
      <ProtectedRoute requiredAnyPermissions={['create:log', 'manage:users']}>
        <Bitacora />
      </ProtectedRoute>
    ) },
    { url: '/tareas', component: <Tasks /> },

    // Personal
    { url: '/staff-list', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Staff mode="list" />
      </ProtectedRoute>
    ) },
    { url: '/staff-add', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Staff mode="add" />
      </ProtectedRoute>
    ) },
    { url: '/staff-roles', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Staff mode="roles" />
      </ProtectedRoute>
    ) },
    { url: '/staff-turnos', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Staff mode="turnos" />
      </ProtectedRoute>
    ) },
    { url: '/staff-asistencia', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Staff mode="activity" />
      </ProtectedRoute>
    ) },

    // Configuración
    { url: '/config-sensores', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Config mode="sensors" />
      </ProtectedRoute>
    ) },
    { url: '/config-alertas', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Config mode="alerts" />
      </ProtectedRoute>
    ) },
    { url: '/config-usuarios', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Config mode="users" />
      </ProtectedRoute>
    ) },
    { url: '/config-sistema', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Config mode="system" />
      </ProtectedRoute>
    ) },

    // Dispositivos
    { url: '/dispositivos', component: (
      <ProtectedRoute requiredPermission="manage:users">
        <Devices />
      </ProtectedRoute>
    ) },
  ];

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {allroutes.map((data, i) => (
            <Route key={i} path={data.url} element={data.component} />
          ))}
        </Route>
      </Routes>
      <ScrollToTop />
    </>
  );
};

function MainLayout() {
  const sideMenu = useSelector(state => state.sideMenu);
  return (
    <div id="main-wrapper" className={`show ${sideMenu ? "menu-toggle" : ""}`}>
      <Nav />
      <div className="content-body" style={{ minHeight: window.screen.height - 15 }}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Markup;
