import React, { useState, useEffect } from "react";
import socket from "../../../services/SocketService";
import Header from "../../layouts/nav/Header";
import "animate.css";
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBIcon,
  MDBSpinner,
} from "mdb-react-ui-kit";

const INITIAL_STATE = {
  current: { temp: 0, humidity: 0, nitrogen: 0, indiceCrecimiento: 0 },
  predictions: [],
};


export default function Dashboard() {
  const [data, setData] = useState(INITIAL_STATE);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("nuevosDatos", (payload) => {
      console.log("📡 Datos recibidos del servidor:", payload);

      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);

      if (payload?.actual) {
            setData({
            current: {
                temp: payload.actual.temperatura ?? 0,
                humidity: payload.actual.humedad ?? 0,
                nitrogen: payload.actual.nitrogeno ?? 0,
                indiceCrecimiento: payload.actual.indiceCrecimiento ?? 0,
            },
            predictions: payload.predicciones ?? [],
            });
        setLoading(false);
      }
    });

    return () => socket.off("nuevosDatos");
  }, []);

  const { current, predictions } = data;

  const renderMetricCard = (title, icon, value, unit, color) => (
    <MDBCol md="4" className="mb-4">
      <MDBCard
        className="text-center"
        style={{
          borderRadius: "15px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <MDBCardBody
          className={`animate__animated ${animate ? "animate__pulse" : ""}`}
        >
          <MDBIcon
            fas
            icon={icon}
            size="2x"
            className="mb-3"
            style={{ color }}
          />
          <h2 className="fw-bold" style={{ color }}>
            {value}
            {unit}
          </h2>
          <p className="mb-0 text-muted">{title}</p>
        </MDBCardBody>
      </MDBCard>
    </MDBCol>
  );

  const renderPredictionCard = (title, icon, dataKey, unit, color) => (
    <MDBCol md="4" className="mb-4">
      <MDBCard
        className="h-100"
        style={{
          borderRadius: "15px",
          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#FAFAFA",
        }}
      >
        <MDBCardBody>
          <h5 className="mb-3 text-primary fw-bold">{title}</h5>
          {predictions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <MDBSpinner grow color="success" size="sm" />
              <p className="mt-2">Esperando predicciones del modelo...</p>
            </div>
          ) : (
            predictions.map((p, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center border-bottom py-2"
              >
                <div className="fw-bold">{p.time}</div>
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon={icon} className="me-2" style={{ color }} />
                  <span>
                    {p[dataKey]}
                    {unit}
                  </span>
                </div>
              </div>
            ))
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBCol>
  );

  return (

    <MDBContainer className="py-4">
      <h1 className="mb-5 text-center text-primary fw-bold">
        Estado Actual y Predicciones Agrícolas
      </h1>

      {loading ? (
        <div className="text-center py-5">
          <MDBSpinner grow color="success" />
          <p className="mt-3 text-muted">
            Cargando datos desde los sensores...
          </p>
        </div>
      ) : (
        <>
          <MDBRow>
            {renderMetricCard(
              "Temperatura",
              "thermometer-half",
              current.temp,
              "°C",
              "#E65100"
            )}
            {renderMetricCard(
              "Humedad",
              "tint",
              current.humidity,
              "%",
              "#0288D1"
            )}
            {renderMetricCard(
              "Nitrógeno",
              "leaf",
              current.nitrogen,
              "mg/kg",
              "#2E7D32"
            )}
          </MDBRow>

          <MDBRow className="mt-5 mb-3">
            <MDBCol>
              <h3 className="text-secondary fw-bold">
                Predicción Horaria con Inteligencia Artificial
              </h3>
              <p className="text-muted">
                Estas proyecciones se generan en tiempo real mediante un modelo
                de aprendizaje automático entrenado con tus datos de sensores.
              </p>
            </MDBCol>
          </MDBRow>

          <MDBRow>
            {renderPredictionCard(
              "Temperatura Futura",
              "thermometer-half",
              "temp",
              "°C",
              "#E65100"
            )}
            {renderPredictionCard(
              "Humedad Futura",
              "tint",
              "humidity",
              "%",
              "#0288D1"
            )}
            {renderPredictionCard(
              "Nitrógeno Futuro",
              "leaf",
              "nitrogen",
              "mg/kg",
              "#2E7D32"
            )}
          </MDBRow>
            <MDBRow className="mt-5">
                <MDBCol md="12">
                    <MDBCard className="text-center" style={{ backgroundColor: "#FFF8E1" }}>
                        <MDBCardBody>
                            <h4 className="text-warning">📈 Índice de Crecimiento del Cultivo</h4>
                            <h2 style={{ color: "#FFA000" }}>
                            {current.indiceCrecimiento !== undefined
                                ? current.indiceCrecimiento.toFixed(1)
                                : "--"}%
                            </h2>
                            <p className="text-muted">
                            {current.indiceCrecimiento === undefined
                                ? "Esperando datos del sensor..."
                                : current.indiceCrecimiento > 0.8
                                ? "El entorno es favorable 🌱"
                                : current.indiceCrecimiento > 0.5
                                ? "Condiciones regulares, monitorear ⚠️"
                                : "Condiciones no óptimas, revisar el entorno ❌"}
                            </p>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

        </>
      )}
    </MDBContainer>
    );
  
}
