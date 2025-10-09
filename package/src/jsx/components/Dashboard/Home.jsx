import React, { useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBIcon,
} from "mdb-react-ui-kit";

// Estructura de datos inicial para simular la data que vendrá del backend
const INITIAL_DASHBOARD_DATA = {
    current: {
        temp: 23,
        humidity: 65,
        nitrogen: 40,
        unitTemp: '°C',
        unitHumidity: '%',
        unitNitrogen: 'mg/kg'
    },
    // Usamos un array de objetos para manejar las predicciones de forma más limpia
    predictions: [
        { time: "12:00", temp: 24, humidity: 65, nitrogen: 40 },
        { time: "13:00", temp: 25, humidity: 64, nitrogen: 41 },
        { time: "14:00", temp: 25, humidity: 63, nitrogen: 42 },
        { time: "15:00", temp: 26, humidity: 62, nitrogen: 43 },
    ]
};

export default function Dashboard() {
    // Definimos el estado para la data (lo que en el futuro se llenará con useEffect y la API)
    const [data, setData] = useState(INITIAL_DASHBOARD_DATA); 
    
    // Desestructuramos para facilitar el acceso
    const { current, predictions } = data;

    // Función auxiliar para renderizar una tarjeta de predicción
    const renderPredictionCard = (title, icon, dataKey, unit) => (
        <MDBCol md="4" className="mb-4">
            <MDBCard style={{ borderRadius: "15px" }}>
                <MDBCardBody>
                    <h5 className="mb-3 text-primary">{title}</h5>
                    {predictions.map((p, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                            <div className="fw-bold">{p.time}</div>
                            <div className="d-flex align-items-center">
                                <MDBIcon fas icon={icon} className="text-muted me-2" />
                                <span>{p[dataKey]}{unit}</span>
                            </div>
                        </div>
                    ))}
                </MDBCardBody>
            </MDBCard>
        </MDBCol>
    );

    // Función auxiliar para renderizar una tarjeta de métrica actual
    const renderMetricCard = (title, icon, value, unit) => (
        <MDBCol md="4" className="mb-4">
            <MDBCard 
                className="text-center" 
                // Estilos personalizados para el fondo y la sombra
                style={{ 
                    borderRadius: "15px", 
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
                    backgroundColor: '#E8F5E9' // Verde muy suave para el fondo
                }}
            >
                <MDBCardBody>
                    {/* Estilo para iconos y valores en verde oscuro para mejor contraste */}
                    <MDBIcon fas icon={icon} size="2x" className="mb-3" style={{ color: '#4CAF50' }} />
                    <h2 className="fw-bold" style={{ color: '#4CAF50' }}>{value}{unit}</h2>
                    <p className="mb-0 text-muted">{title}</p>
                </MDBCardBody>
            </MDBCard>
        </MDBCol>
    );


    return (
        <MDBContainer className="py-4">
            <h1 className="mb-5 text-center text-primary">Estado Actual y Predicciones Agrícolas</h1>

            {/* Fila de Recuadros de Métricas Actuales */}
            <MDBRow>
                {renderMetricCard("Temperatura", "thermometer-half", current.temp, current.unitTemp)}
                {renderMetricCard("Humedad", "tint", current.humidity, current.unitHumidity)}
                {renderMetricCard("Nitrógeno", "leaf", current.nitrogen, current.unitNitrogen)}
            </MDBRow>

            {/* Separador visual */}
            <MDBRow className="mt-5 mb-3">
                <MDBCol><h3 className="text-secondary">Predicción Horaria</h3></MDBCol>
            </MDBRow>
            
            {/* Fila de Predicciones */}
            <MDBRow>
                {renderPredictionCard("Predicción Temperatura", "thermometer-half", "temp", current.unitTemp)}
                {renderPredictionCard("Predicción Humedad", "tint", "humidity", current.unitHumidity)}
                {renderPredictionCard("Predicción Nitrógeno", "leaf", "nitrogen", current.unitNitrogen)}
            </MDBRow>
        </MDBContainer>
    );
}
