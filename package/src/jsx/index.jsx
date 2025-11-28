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
import Home from "./components/Dashboard/Home";

/// Monitoreo
import Temperatura from "./components/Dashboard/Monitoreo/Temperatura";
import Humedad from "./components/Dashboard/Monitoreo/Humedad";
import Nitrogeno from "./components/Dashboard/Monitoreo/NivelesNitrogeno";
import Riego from "./components/Dashboard/Monitoreo/Riego";
import MonitoreoCompleto from "./components/Dashboard/Monitoreo/MonitoreoCompleto";

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
    { url: "/", component: <Home /> },
    { url: "/dashboard", component: <Home /> },
    { url: "/monitoreo-temperatura", component: <Temperatura /> },
    { url: "/monitoreo-humedad", component: <Humedad /> },
    { url: "/monitoreo-nitrogeno", component: <Nitrogeno /> },
    { url: "/monitoreo-riego", component: <Riego /> },
    { url: "/monitoreo-completo", component: <MonitoreoCompleto /> },

    //Rutas del Perfil
    { url: '/perfil', component: <Profile/> },

    // Personal
    { url: '/staff-list', component: <EnDesarrollo titulo="Personal: Lista de personal" /> },
    { url: '/staff-add', component: <EnDesarrollo titulo="Personal: Agregar nuevo" /> },
    { url: '/staff-roles', component: <EnDesarrollo titulo="Personal: Roles" /> },
    { url: '/staff-turnos', component: <EnDesarrollo titulo="Personal: Turnos" /> },
    { url: '/staff-asistencia', component: <EnDesarrollo titulo="Personal: Reportes de asistencia" /> },

    // Configuración
    { url: '/config-sensores', component: <EnDesarrollo titulo="Configuración: Sensores" /> },
    { url: '/config-alertas', component: <EnDesarrollo titulo="Configuración: Alertas" /> },
    { url: '/config-usuarios', component: <EnDesarrollo titulo="Configuración: Usuarios" /> },
    { url: '/config-sistema', component: <EnDesarrollo titulo="Configuración: Sistema" /> },
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
