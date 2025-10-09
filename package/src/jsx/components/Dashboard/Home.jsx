import React from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBIcon,
} from "mdb-react-ui-kit";

export default function Dashboard() {
  return (
    <MDBContainer className="py-4">
      {/* Recuadritos de temperatura, humedad y nitrógeno */}
      <MDBRow className="mb-4">
        {/* Temperatura */}
        <MDBCol md="4">
          <MDBCard className="text-center" style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <MDBIcon fas icon="thermometer-half" size="2x" className="mb-2" />
              <h3>23°C</h3>
              <p>Temperatura</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* Humedad */}
        <MDBCol md="4">
          <MDBCard className="text-center" style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <MDBIcon fas icon="tint" size="2x" className="mb-2" />
              <h3>65%</h3>
              <p>Humedad</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* Nitrógeno */}
        <MDBCol md="4">
          <MDBCard className="text-center" style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <MDBIcon fas icon="leaf" size="2x" className="mb-2" />
              <h3>40 mg/kg</h3>
              <p>Nitrógeno</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Predicciones separadas */}

      <MDBRow className="mb-4">
        {/* Predicción Temperatura */}
        <MDBCol md="4">
          <MDBCard style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <h5 className="mb-3">Predicción Temperatura</h5>
              {["12:00", "13:00", "14:00", "15:00"].map((hora, index) => (
                <div key={index} className="text-center mb-2">
                  <p><strong>{hora}</strong></p>
                  <MDBIcon fas icon="thermometer-half" className="mb-1" />
                  <p>{23 + index}°C</p>
                </div>
              ))}
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* Predicción Humedad */}
        <MDBCol md="4">
          <MDBCard style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <h5 className="mb-3">Predicción Humedad</h5>
              {["12:00", "13:00", "14:00", "15:00"].map((hora, index) => (
                <div key={index} className="text-center mb-2">
                  <p><strong>{hora}</strong></p>
                  <MDBIcon fas icon="tint" className="mb-1" />
                  <p>{65 - index}%</p>
                </div>
              ))}
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* Predicción Nitrógeno */}
        <MDBCol md="4">
          <MDBCard style={{ borderRadius: "15px" }}>
            <MDBCardBody>
              <h5 className="mb-3">Predicción Nitrógeno</h5>
              {["12:00", "13:00", "14:00", "15:00"].map((hora, index) => (
                <div key={index} className="text-center mb-2">
                  <p><strong>{hora}</strong></p>
                  <MDBIcon fas icon="leaf" className="mb-1" />
                  <p>{40 + index} mg/kg</p>
                </div>
              ))}
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}
