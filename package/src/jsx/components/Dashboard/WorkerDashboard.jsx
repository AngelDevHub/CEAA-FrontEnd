import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../../services/SocketService';
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBSpinner,
} from 'mdb-react-ui-kit';

const INITIAL_STATE = {
  humedad: null,
  temperatura: null,
  nitrogeno: null,
  updatedAt: null,
};

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on('nuevosDatos', (payload) => {
      const actual = payload?.actual;
      if (!actual) return;

      setData({
        humedad: actual.humedad ?? null,
        temperatura: actual.temperatura ?? null,
        nitrogeno: actual.nitrogeno ?? null,
        updatedAt: Date.now(),
      });
      setLoading(false);
    });

    return () => socket.off('nuevosDatos');
  }, []);

  const needsWater = useMemo(() => {
    if (data.humedad === null) return null;
    return Number(data.humedad) < 35;
  }, [data.humedad]);

  const activeAlerts = useMemo(() => {
    const alerts = [];
    if (needsWater === true) alerts.push({ type: 'warning', text: 'Humedad baja: requiere riego' });
    return alerts;
  }, [needsWater]);

  const badgeStyle = (variant) => {
    if (variant === 'ok') return { background: 'rgba(46, 125, 50, 0.12)', border: '1px solid rgba(46, 125, 50, 0.35)', color: '#1B5E20' };
    if (variant === 'warn') return { background: 'rgba(245, 124, 0, 0.12)', border: '1px solid rgba(245, 124, 0, 0.35)', color: '#E65100' };
    return { background: 'rgba(2, 136, 209, 0.10)', border: '1px solid rgba(2, 136, 209, 0.25)', color: '#01579B' };
  };

  return (
    <MDBContainer className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="text-primary fw-bold mb-1">Dashboard de Campo</h2>
          <div className="text-muted">Vista simple para trabajo en campo</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/bitacora')}
        >
          Registrar bitácora
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <MDBSpinner grow color="success" />
          <div className="mt-3 text-muted">Cargando datos en tiempo real...</div>
        </div>
      ) : (
        <>
          <MDBRow className="g-3">
            <MDBCol md="6">
              <MDBCard style={{ borderRadius: 16 }}>
                <MDBCardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold">¿Necesita riego?</div>
                    <MDBIcon fas icon="tint" />
                  </div>
                  <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
                    {needsWater === null ? (
                      <span className="px-3 py-2 rounded-pill" style={badgeStyle('info')}>Sin lectura</span>
                    ) : needsWater ? (
                      <span className="px-3 py-2 rounded-pill" style={badgeStyle('warn')}>Sí</span>
                    ) : (
                      <span className="px-3 py-2 rounded-pill" style={badgeStyle('ok')}>No</span>
                    )}
                    <span className="text-muted">Humedad: {data.humedad ?? '--'}%</span>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="6">
              <MDBCard style={{ borderRadius: 16 }}>
                <MDBCardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold">pH</div>
                    <MDBIcon fas icon="flask" />
                  </div>
                  <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
                    <span className="px-3 py-2 rounded-pill" style={badgeStyle('info')}>No disponible</span>
                    <span className="text-muted">Sensor de pH no configurado</span>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          <MDBRow className="g-3 mt-1">
            <MDBCol md="12">
              <MDBCard style={{ borderRadius: 16 }}>
                <MDBCardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold">Alertas activas</div>
                    <MDBIcon fas icon="exclamation-triangle" />
                  </div>
                  <div className="mt-3">
                    {activeAlerts.length === 0 ? (
                      <div className="text-muted">Sin alertas activas</div>
                    ) : (
                      <div className="d-grid gap-2">
                        {activeAlerts.map((a, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded"
                            style={{ background: 'rgba(245, 124, 0, 0.10)', border: '1px solid rgba(245, 124, 0, 0.25)' }}
                          >
                            {a.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-muted" style={{ fontSize: 12 }}>
                    Última actualización: {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '--'}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </>
      )}
    </MDBContainer>
  );
}

