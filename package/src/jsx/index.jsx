import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useSelector } from "react-redux";
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
