import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';

function parseTimestamp(record) {
  const raw = record?.timestamp || record?.fecha;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function Devices() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [sensRes, devRes] = await Promise.all([
          axiosInstance.get('invernadero/sensores'),
          axiosInstance.get('dispositivos')
        ]);
        const list = sensRes.data?.data || [];
        setRecords(Array.isArray(list) ? list : []);
        const devList = devRes.data?.data || [];
        setDevices(Array.isArray(devList) ? devList : []);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'No se pudo consultar sensores');
        setRecords([]);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const lastSeen = useMemo(() => {
    if (!records.length) return null;
    const dates = records.map(parseTimestamp).filter(Boolean);
    if (!dates.length) return null;
    dates.sort((a, b) => b.getTime() - a.getTime());
    return dates[0];
  }, [records]);

  const isOnline = useMemo(() => {
    if (!lastSeen) return false;
    return Date.now() - lastSeen.getTime() <= 5 * 60 * 1000;
  }, [lastSeen]);

  const device = useMemo(() => {
    const key = 'sensores_rs485';
    const db = devices.find((d) => d.clave === key);
    const manual = db?.modo === 'manual' ? db?.estado_manual : 'auto';
    const status = manual === 'auto' ? (isOnline ? 'operativo' : 'sin_datos') : manual;

    return {
      key,
      nombre: 'Sensores RS485 / Gateway',
      status,
      lastSeen,
      modo: db?.modo || 'auto',
      estado_manual: db?.estado_manual || null,
      updated_at: db?.updated_at || null,
    };
  }, [devices, isOnline, lastSeen]);

  const setManualStatus = async (value) => {
    try {
      setSaving(true);
      setError('');
      await axiosInstance.put(`dispositivos/${device.key}/estado`, {
        estado: value,
        nombre: device.nombre
      });
      const devRes = await axiosInstance.get('dispositivos');
      const devList = devRes.data?.data || [];
      setDevices(Array.isArray(devList) ? devList : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'No se pudo actualizar el estado del dispositivo');
    } finally {
      setSaving(false);
    }
  };

  const badge = (status) => {
    if (status === 'operativo') return 'badge bg-success';
    if (status === 'mantenimiento') return 'badge bg-warning text-dark';
    if (status === 'fuera_servicio') return 'badge bg-danger';
    return 'badge bg-secondary';
  };

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">Dispositivos</h2>
            <div className="text-muted">Estado, último dato recibido y control de mantenimiento</div>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            {error ? <div className="alert alert-danger">{error}</div> : null}

            {loading ? (
              <div className="text-muted">Cargando...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Dispositivo</th>
                      <th>Estado</th>
                      <th>Último dato</th>
                      <th style={{ width: 280 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="fw-semibold">{device.nombre}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          Fuente: Firebase / invernadero/sensores
                        </div>
                      </td>
                      <td>
                        <span className={badge(device.status)}>{device.status}</span>
                      </td>
                      <td className="text-muted">
                        {device.lastSeen ? device.lastSeen.toLocaleString() : '—'}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-sm btn-outline-primary" disabled={saving} onClick={() => setManualStatus('auto')}>
                            Auto
                          </button>
                          <button className="btn btn-sm btn-outline-warning" disabled={saving} onClick={() => setManualStatus('mantenimiento')}>
                            Mantenimiento
                          </button>
                          <button className="btn btn-sm btn-outline-danger" disabled={saving} onClick={() => setManualStatus('fuera_servicio')}>
                            Fuera de servicio
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-muted mt-3" style={{ fontSize: 12 }}>
              El estado manual ahora se guarda en BD y aplica para todos los admins.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
