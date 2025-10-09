import React, { useState } from "react";
import { useDispatch , useSelector } from 'react-redux';
/// React router dom
import { Link } from "react-router-dom";
import { navtoggle } from "../../../store/actions/AuthActions";

/// images
import logo from "../../../assets/images/logo3.png";
import logoText from "../../../assets/images/logo4.png";

const NavHader = () => {   
   const dispatch = useDispatch();
   const sideMenu = useSelector(state => state.sideMenu);
   const handleToogle = () => {
     dispatch(navtoggle());
   };
   return (
      <div className="nav-header">
        <div className="brand-logo">
            <img className="logo-abbr" src={logo} alt="Logo abreviado" />
            <img className="logo-compact" src={logoText} alt="Logo compacto" />
            <img className="brand-title" src={logoText} alt="Título de marca" />
         </div>
         <div className="nav-control" 
            onClick={() => {              
               handleToogle()
            }}
         >
            <div className={`hamburger ${sideMenu ? "is-active" : ""}`}>
               <span className="line"></span>
               <span className="line"></span>
               <span className="line"></span>
            </div>
         </div>
      </div>
   );
};

export default NavHader;
