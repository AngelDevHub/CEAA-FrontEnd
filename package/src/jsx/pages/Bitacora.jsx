import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';
import usePermissions from '../hooks/usePermissions';

export default function Bitacora() {
  const perms = usePermissions();
  const canManageUsers = perms.has('manage:users');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    sector: '',
    id_tarea: ''
  });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('bitacoras');
      const list = res.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || e?.message || 'No se pudieron cargar bitácoras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    try {
      setSaving(true);
      setError('');
      await axiosInstance.post('bitacoras', {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        sector: form.sector.trim(),
        id_tarea: form.id_tarea ? Number(form.id_tarea) : null
      });
      setForm({ titulo: '', descripcion: '', sector: '', id_tarea: '' });
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'No se pudo registrar la bitácora');
    } finally {
      setSaving(false);
    }
  };

  const title = useMemo(() => {
    return canManageUsers ? 'Bitácoras de campo (todas)' : 'Mi bitácora de campo';
  }, [canManageUsers]);

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">{title}</h2>
            <div className="text-muted">Registra actividades y observaciones del huerto</div>
          </div>
          <button className="btn btn-outline-secondary" onClick={load} disabled={loading || saving}>
            Recargar
          </button>
        </div>
      </div>

      {error ? (
        <div className="col-12 mb-4">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      ) : null}

      <div className="col-12 col-lg-5 mb-4">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-3">Nueva bitácora</h4>
            <form className="row g-3" onSubmit={create}>
              <div className="col-12">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  value={form.titulo}
                  disabled={saving}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej. Riego completado / Revisión de plagas"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Sector / Ubicación</label>
                <input
                  className="form-control"
                  value={form.sector}
                  disabled={saving}
                  onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                  placeholder="Ej. Sector 2 / Camas A3-A5"
                />
              </div>
              <div className="col-12">
                <label className="form-label">ID de tarea (opcional)</label>
                <input
                  className="form-control"
                  value={form.id_tarea}
                  disabled={saving}
                  onChange={(e) => setForm((p) => ({ ...p, id_tarea: e.target.value }))}
                  placeholder="Ej. 12"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={form.descripcion}
                  disabled={saving}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Qué se hizo, observaciones, evidencia, pendientes..."
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="card-title mb-0">Historial</h4>
              <span className="text-muted" style={{ fontSize: 12 }}>Total: {items.length}</span>
            </div>

            {loading ? (
              <div className="text-muted">Cargando...</div>
            ) : items.length === 0 ? (
              <div className="text-muted">Sin registros aún.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Registro</th>
                      <th>Sector</th>
                      <th>Tarea</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((b) => (
                      <tr key={b.id_bitacora}>
                        <td>
                          <div className="fw-semibold">{b.titulo}</div>
                          {b.descripcion ? (
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {b.descripcion}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-muted">{b.sector || '—'}</td>
                        <td className="text-muted">{b.id_tarea ? `#${b.id_tarea}` : '—'}</td>
                        <td className="text-muted">{canManageUsers ? (b.usuario_correo || '—') : 'Yo'}</td>
                        <td className="text-muted">{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

