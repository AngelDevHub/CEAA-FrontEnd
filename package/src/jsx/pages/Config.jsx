import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../services/AxiosInstance';
import CropConfig from '../components/CropConfig';

function getValue(items, key, fallback) {
  const found = items.find((i) => i.key === key);
  return found ? found.value : fallback;
}

export default function Config({ mode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [health, setHealth] = useState(null);

  const caudalLph = useMemo(() => {
    const raw = getValue(items, 'riego.caudal_lph', 100);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 100;
  }, [items]);

  const [form, setForm] = useState({
    caudal_lph: 100
  });

  useEffect(() => {
    setForm({
      caudal_lph: caudalLph
    });
  }, [caudalLph]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await axiosInstance.get('config');
      const list = res.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || e?.message || 'No se pudo cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const base = axiosInstance.defaults.baseURL || '';
      const url = base.endsWith('/api') ? `${base.slice(0, -4)}/health` : `${base}/health`;
      const res = await fetch(url, { method: 'GET' });
      const json = await res.json();
      setHealth(json);
    } catch {
      setHealth(null);
    }
  };

  useEffect(() => {
    setError('');
    setSuccess('');
    if (mode === 'users') {
      setLoading(false);
    }
    if (mode === 'alerts' || mode === 'system') {
      loadConfig();
    }
    if (mode === 'system') {
      loadHealth();
    }
  }, [mode]);

  const saveSystemSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await axiosInstance.put('config/riego.caudal_lph', {
        value: Number(form.caudal_lph)
      });
      setSuccess('Configuración guardada');
      await loadConfig();
    } catch (e2) {
      setSuccess('');
      setError(e2?.response?.data?.message || e2?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const header = useMemo(() => {
    if (mode === 'alerts') return { title: 'Configuración: Cultivo y Alertas', subtitle: 'Gestión de límites según planta' };
    if (mode === 'users') return { title: 'Configuración: Usuarios', subtitle: 'Accesos, roles y permisos' };
    if (mode === 'system') return { title: 'Configuración: Sistema', subtitle: 'Estado del backend y configuración general' };
    return { title: 'Configuración', subtitle: '' };
  }, [mode]);

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">{header.title}</h2>
            <div className="text-muted">{header.subtitle}</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link className={`btn btn-sm ${mode === 'alerts' ? 'btn-primary' : 'btn-outline-primary'}`} to="/config-alertas">Cultivo y Alertas</Link>
            <Link className={`btn btn-sm ${mode === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} to="/config-usuarios">Usuarios</Link>
            <Link className={`btn btn-sm ${mode === 'system' ? 'btn-primary' : 'btn-outline-primary'}`} to="/config-sistema">Sistema</Link>
          </div>
        </div>
      </div>

      {(mode === 'alerts' || mode === 'system') && error ? (
        <div className="col-12 mb-4">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      ) : null}
      {success ? (
        <div className="col-12 mb-4">
          <div className="alert alert-success mb-0">{success}</div>
        </div>
      ) : null}

      {mode === 'users' ? (
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-3">Administración de usuarios</h4>
              <div className="d-flex gap-2 flex-wrap">
                <Link className="btn btn-primary" to="/staff-list">Lista de personal</Link>
                <Link className="btn btn-outline-primary" to="/staff-add">Crear usuario</Link>
                <Link className="btn btn-outline-secondary" to="/staff-roles">Roles y permisos</Link>
                <Link className="btn btn-outline-secondary" to="/staff-asistencia">Actividad</Link>
              </div>
              <div className="text-muted mt-3" style={{ fontSize: 12 }}>
                La configuración de usuarios se gestiona en el módulo Personal.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'alerts' ? (
        <div className="col-12 col-lg-8">
          <CropConfig />

          <div className="card mt-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Ajustes del Sistema de Riego</h4>
              {loading ? (
                <div className="text-muted">Cargando...</div>
              ) : (
                <form className="row g-3" onSubmit={saveSystemSettings}>
                  <div className="col-md-6">
                    <label className="form-label">Caudal nominal de riego (L/h)</label>
                    <input className="form-control" disabled={saving} value={form.caudal_lph} onChange={(e) => setForm((p) => ({ ...p, caudal_lph: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}


      {mode === 'system' ? (
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="card-title mb-0">Health</h4>
                    <button className="btn btn-sm btn-outline-secondary" onClick={loadHealth}>Recargar</button>
                  </div>
                  {health ? (
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(health, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-muted">No disponible</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="card-title mb-0">Configuración</h4>
                    <button className="btn btn-sm btn-outline-secondary" onClick={loadConfig}>Recargar</button>
                  </div>
                  {loading ? (
                    <div className="text-muted">Cargando...</div>
                  ) : items.length === 0 ? (
                    <div className="text-muted">Sin configuración guardada.</div>
                  ) : (
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(items, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
