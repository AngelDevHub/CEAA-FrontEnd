import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutLink from "./Logout";
import { useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { ThemeContext } from "../../../context/ThemeContext";
import socket from "../../../services/SocketService";
import profile from "../../../assets/images/profile/profile.png";
import "./Header.css"; // ✅ animación de parpadeo

const Header = () => {
  const { background, changeBackground } = useContext(ThemeContext);
  const authState = useSelector((state) => state.auth);
  const user = authState.auth?.user;

  const [sensorData, setSensorData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  // 🌙 Cambiar modo oscuro/claro
  const handleDarkMode = () => {
    changeBackground({
      value: background.value === "light" ? "dark" : "light",
      label: background.value === "light" ? "Dark" : "Light",
    });
  };

  // 🎧 Escucha de datos del socket
  useEffect(() => {
    socket.on("nuevosDatos", (payload) => {
      if (payload?.actual) {
        console.log("📡 Datos recibidos del sensor:", payload.actual);
        setSensorData(payload.actual);
      }
    });

    return () => {
      socket.off("nuevosDatos");
    };
  }, []);

  // 📢 Generar notificaciones dinámicas según los valores recibidos
  useEffect(() => {
    if (!sensorData || Object.keys(sensorData).length === 0) return;

    const nuevas = [];

    if (sensorData.temperatura >= 30) {
      nuevas.push({
        tipo: "danger",
        icono: "fa-thermometer-half",
        titulo: "Temperatura crítica",
        detalle: `Valor: ${sensorData.temperatura} °C`,
      });
    }

    if (sensorData.humedad < 40) {
      nuevas.push({
        tipo: "warning",
        icono: "fa-tint",
        titulo: "Humedad baja",
        detalle: `Valor: ${sensorData.humedad}%`,
      });
    }

    if (sensorData.nitrogeno < 3) {
      nuevas.push({
        tipo: "info",
        icono: "fa-flask",
        titulo: "Nitrógeno bajo",
        detalle: `Valor: ${sensorData.nitrogeno} mg/L`,
      });
    }

    if (nuevas.length === 0) {
      nuevas.push({
        tipo: "success",
        icono: "fa-leaf",
        titulo: "Condiciones normales",
        detalle: `Última lectura: ${new Date().toLocaleString()}`,
      });
    }

    setNotifications((prev) => [...nuevas, ...prev.slice(0, 10)]);
    setHasNewAlert(true);

    const timer = setTimeout(() => setHasNewAlert(false), 4000);
    return () => clearTimeout(timer);
  }, [sensorData]);

  const path = window.location.pathname.split("/");
  const finalName = path[path.length - 1].replace(/-/g, " ");

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div
                className="dashboard_bar"
                style={{ textTransform: "capitalize" }}
              >
                {finalName || "Dashboard"}
              </div>
            </div>

            <ul className="navbar-nav header-right">
              {/* 🔔 Notificaciones */}
              <Dropdown
                as="li"
                className="nav-item dropdown notification_dropdown"
              >
                <Dropdown.Toggle
                  as="div"
                  className={`nav-link ${hasNewAlert ? "blink" : ""}`}
                >
                  <i
                    className="fa fa-bell"
                    style={{ fontSize: "22px", color: "#36C95F" }}
                  />
                  {notifications.length > 0 && (
                    <span className="badge light text-white bg-primary">
                      {notifications.length}
                    </span>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="mt-1">
                  <div
                    id="DZ_W_Notification1"
                    className="widget-media dz-scroll p-3 height380"
                  >
                    <ul className="timeline">
                      {notifications.map((n, i) => (
                        <li key={i}>
                          <div className="timeline-panel">
                            <div className={`media me-2 media-${n.tipo}`}>
                              <i className={`fa ${n.icono}`} />
                            </div>
                            <div className="media-body">
                              <h6 className="mb-1">{n.titulo}</h6>
                              <small className={`text-${n.tipo}`}>
                                {n.detalle}
                              </small>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link className="all-notification" to="#">
                    Ver todas las notificaciones{" "}
                    <i className="ti-arrow-right" />
                  </Link>
                </Dropdown.Menu>
              </Dropdown>

              {/* ☀️ / 🌙 Modo oscuro */}
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link bell dz-theme-mode ${
                    background.value === "light" ? "active" : ""
                  }`}
                  onClick={handleDarkMode}
                >
                  <i className="fas fa-sun light" />
                  <i className="fas fa-moon dark" />
                </Link>
              </li>

              <Dropdown as="li" className={`nav-item header-profile `}>
                <Dropdown.Toggle className="nav-link i-false" as="a">
                  <img src={profile} width={20} alt="" />
                  <div className="header-info">
                    <span>
                      {user?.nombre ? (
                        <>
                          Hola, <strong>{user.nombre}</strong>
                        </>
                      ) : (
                        'Cargando...' // O puedes dejarlo en blanco: null
                      )}
                    </span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align={'end'} className={`dropdown-menu-right`}>
                  <Link to="/perfil" className="dropdown-item ai-icon">
                    <svg
                      id="icon-user1"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx={12} cy={7} r={4} />
                    </svg>
                    <span className="ms-2">Perfil </span>
                  </Link>
                  <LogoutLink />
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
