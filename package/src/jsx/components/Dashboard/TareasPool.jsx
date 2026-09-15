import React, { useEffect, useState } from 'react';
import { MDBCard, MDBCardBody, MDBBtn, MDBIcon, MDBSpinner } from 'mdb-react-ui-kit';
import axiosInstance from '../../../services/AxiosInstance';

export default function TareasPool({ onTareaReclamada }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPool = async () => {
    try {
      const res = await axiosInstance.get('/tareas/pool');
      if (res.data.success) {
        setTareas(res.data.data);
      }
    } catch (error) {
      console.error("Error obteniendo pool de tareas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
    const interval = setInterval(fetchPool, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  const reclamarTarea = async (id) => {
    try {
      await axiosInstance.post(`/tareas/${id}/reclamar`);
      await fetchPool(); // Refrescar
      if (onTareaReclamada) onTareaReclamada();
    } catch (error) {
      console.error("Error al reclamar tarea", error);
      alert("No se pudo reclamar la tarea (tal vez alguien más ya la tomó)");
      fetchPool();
    }
  };

  if (loading) return <div className="text-center"><MDBSpinner size="sm" /> Cargando Buzón...</div>;

  return (
    <div className="mt-4">
      <h4 className="fw-bold text-primary mb-3"><MDBIcon fas icon="inbox" className="me-2" /> Buzón de Tareas (Pool)</h4>
      {tareas.length === 0 ? (
        <div className="text-muted">No hay tareas pendientes en el pool.</div>
      ) : (
        <div className="d-grid gap-3">
          {tareas.map(t => (
            <MDBCard key={t.id_tarea} style={{ borderLeft: '4px solid #f57c00', borderRadius: '12px' }}>
              <MDBCardBody className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <div className="fw-bold text-dark">{t.titulo}</div>
                  <div className="text-muted" style={{ fontSize: '14px' }}>{t.descripcion}</div>
                  <div className="text-muted mt-1" style={{ fontSize: '12px' }}>
                    <MDBIcon far icon="clock" className="me-1" /> {new Date(t.creado_en).toLocaleString()}
                  </div>
                </div>
                <MDBBtn color="warning" onClick={() => reclamarTarea(t.id_tarea)}>
                  <MDBIcon fas icon="hand-paper" className="me-2" /> Tomar Tarea
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          ))}
        </div>
      )}
    </div>
  );
}
