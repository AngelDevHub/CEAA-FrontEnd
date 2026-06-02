import React, { Fragment, useEffect, useMemo, useReducer, useState } from "react";
import {Collapse} from 'react-bootstrap';
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {MenuList} from './Menu';

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active : "",
  activeSubmenu : "",
}

const SideBar = () => {
  const dat = new Date();
  const [state, setState] = useReducer(reducer, initialState);

  const [heartBtn, setHeartBtn] = useState();
  const user = useSelector((s) => s.auth?.auth?.user);
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const role = user?.role || "user";
  const permissionsSet = useMemo(() => new Set(permissions), [permissions]);

  const filteredMenuList = useMemo(() => {
    const canManageUsers = permissionsSet.has("manage:users");
    const canViewMetrics = permissionsSet.has("view:metrics");
    const canOperateField = permissionsSet.has("view:field") || permissionsSet.has("create:log");

    return MenuList
      .map((section) => {
        if (section.title === "Personal" && !canManageUsers) return null;
        if (section.title === "Configuración" && !canManageUsers) return null;
        if (section.title === "Dispositivos" && !canManageUsers) return null;
        if (section.title === "Operación" && !canOperateField && !canManageUsers) return null;

        if (section.title === "Monitoreo" && Array.isArray(section.content)) {
          const content = section.content.filter((item) => {
            if (item.to === "monitoreo-completo") return canViewMetrics || canManageUsers;
            if (item.to === "reportes") return canOperateField || canManageUsers;
            return true;
          });
          return { ...section, content };
        }

        return section;
      })
      .filter(Boolean);
  }, [permissionsSet]);
   
    const handleMenuActive = status => {		
      setState({active : status});			
      if(state.active === status){				
        setState({active : ""});
      }   
    }
    const handleSubmenuActive = (status) => {		
      setState({activeSubmenu : status})
      if(state.activeSubmenu === status){
        setState({activeSubmenu : ""})			
      }    
    }
    // Menu dropdown list End

    /// Path
    let path = window.location.pathname;
    path = path.split("/");
    path = path[path.length - 1];

    useEffect(() => {
      filteredMenuList.forEach((data) => {
        data.content?.forEach((item) => {
          if (path === item.to) {
            setState({ active: data.title })
          }
          item.content?.forEach(ele => {
            if (path === ele.to) {
              setState({ activeSubmenu: item.title, active: data.title })
            }
          })
        })
      })
    }, [path, filteredMenuList]);

    return (
      <div className="deznav">
        <div className="deznav-scroll">
          <div className="px-3 pt-3 pb-2">
            <div className="text-muted" style={{ fontSize: 12 }}>Sesión</div>
            <div className="fw-semibold">{user?.nombre || user?.correo || "—"}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              {role === "owner" ? "Dueño / Admin" : role === "worker" ? "Agricultor / Trabajador" : "Usuario"}
            </div>
          </div>
          <ul className="metismenu" id="menu">
            {filteredMenuList.map((data, index)=>{
                let menuClass = data.classsChange;
                  if(menuClass === "menu-title"){
                    return(
                        <li className={menuClass}  key={index} >{data.title}</li>
                    )
                  }else{
                    return(				
                      <li className={`has-menu ${ state.active === data.title ? 'mm-active' : ''} ${data.to === path ? 'mm-active' : ''}`}
                        key={index} 
                      >
                        
                        {data.content && data.content.length > 0 ?
                            <Fragment>
                              <Link to={"#"} 
                                className="has-arrow ai-icon"
                                onClick={() => {handleMenuActive(data.title)}}
                              >								
                                  {data.iconStyle}{" "}
                                  <span className="nav-text">{data.title}</span>
                              </Link>                          
                              <Collapse in={state.active === data.title ? true :false}>
                                <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                  {data.content && data.content.map((data,index) => {									
                                    return(	
                                      <li key={index}
                                        className={`${ state.activeSubmenu === data.title ? "mm-active" : ""}`}                                    
                                      >
                                        {data.content && data.content.length > 0 ?
                                            <>
                                              <Link to={data.to} className={data.hasMenu ? 'has-arrow' : ''}
                                                onClick={() => { handleSubmenuActive(data.title)}}
                                              >
                                                {data.title}
                                              </Link>
                                              <Collapse in={state.activeSubmenu === data.title ? true :false}>
                                                  <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""} ${data.to === path ? 'mm-active' : ''}`}>
                                                    {data.content && data.content.map((data,index) => {
                                                      return(	                                                    
                                                        <li key={index}>
                                                          <Link className={`${path === data.to ? "mm-active" : ""}`} to={data.to}>{data.title}</Link>
                                                        </li>
                                                        
                                                      )
                                                    })}
                                                  </ul>
                                              </Collapse>
                                            </>
                                          :
                                          <Link to={data.to} className={`${data.to === path ? 'mm-active' : ''}`}>
                                            {data.title}
                                          </Link>
                                        }                                    
                                      </li>                               
                                    )
                                  })}
                                </ul>
                              </Collapse>
                            </Fragment>
                          :
                          <Link  to={data.to} >
                              {data.iconStyle}{" "}
                              <span className="nav-text">{data.title}</span>
                          </Link>
                        }
                      </li>	
                    )
                }
            })}  
          </ul>         
         
          <div className="copyright">
            <p>
              <strong>CEAA Sistema de Monitoreo</strong> © {dat.getFullYear()} All
              Derechos Reservados
            </p>
            <p>
              Hecho con{" "}
              <span
                className={`heart ${heartBtn ? 'heart-blast' : ''}`}                
                onClick={()=>setHeartBtn(!heartBtn)}
              ></span>{" "}
              por CEAA.
            </p>
          </div>
			  </div>
      </div>
    );
  
}

export default SideBar;
