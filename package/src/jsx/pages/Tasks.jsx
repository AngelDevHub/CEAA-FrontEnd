import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';
import useAuth from '../hooks/useAuth';
import usePermissions from '../hooks/usePermissions';

export default function Tasks() {
  const { user } = useAuth();
  const perms = usePermissions();
  const canManageUsers = perms.has('manage:users');

  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    asignadoA: '',
    prioridad: 'media',
  });

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoadingTasks(true);
        setError('');
        const res = await axiosInstance.get('tareas');
        const list = res.data?.data || [];
        setTasks(Array.isArray(list) ? list : []);
      } catch (e) {
        setTasks([]);
        setError(e?.response?.data?.message || e?.message || 'No se pudieron cargar las tareas');
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const res = await axiosInstance.get('usuarios');
        const list = res.data?.data || [];
        setWorkers(Array.isArray(list) ? list : []);
      } catch {
        setWorkers([]);
      }
    };
    if (canManageUsers) loadWorkers();
  }, [canManageUsers]);

  const visibleTasks = useMemo(() => {
    if (canManageUsers) return tasks;
    const id = user?.id;
    return tasks.filter((t) => t.asignado_a === id);
  }, [tasks, canManageUsers, user?.id]);

  const createTask = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (!form.asignadoA) return;

    try {
      setSavingTask(true);
      setError('');
      await axiosInstance.post('tareas', {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        prioridad: form.prioridad,
        asignado_a: Number(form.asignadoA),
      });

      const res = await axiosInstance.get('tareas');
      const list = res.data?.data || [];
      setTasks(Array.isArray(list) ? list : []);
      setForm({ titulo: '', descripcion: '', asignadoA: '', prioridad: 'media' });
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'No se pudo crear la tarea');
    } finally {
      setSavingTask(false);
    }
  };

  const updateEstado = async (id_tarea, nextEstado) => {
    try {
      setError('');
      await axiosInstance.patch(`tareas/${id_tarea}/estado`, { estado: nextEstado });
      setTasks((prev) =>
        prev.map((t) => (t.id_tarea === id_tarea ? { ...t, estado: nextEstado } : t))
      );
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'No se pudo actualizar la tarea');
    }
  };

  const badgeClass = (estado) => {
    if (estado === 'completada') return 'badge bg-success';
    if (estado === 'en_progreso') return 'badge bg-info text-dark';
    if (estado === 'cancelada') return 'badge bg-secondary';
    return 'badge bg-warning text-dark';
  };

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">Tareas del huerto</h2>
            <div className="text-muted">
              {canManageUsers
                ? 'Asigna tareas, da seguimiento y valida cumplimiento'
                : 'Revisa tus tareas y registra avances en campo'}
            </div>
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Usuario: {user?.correo || '—'}
          </div>
        </div>
      </div>

      {error ? (
        <div className="col-12 mb-4">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      ) : null}

      {canManageUsers ? (
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-3">Crear y asignar tarea</h4>
              <form onSubmit={createTask} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={form.titulo}
                    onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ej. Riego sector 2"
                    disabled={savingTask}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Asignar a</label>
                  <select
                    className="form-select"
                    value={form.asignadoA}
                    onChange={(e) => setForm((p) => ({ ...p, asignadoA: e.target.value }))}
                    disabled={savingTask}
                  >
                    <option value="">Sin asignar</option>
                    {workers.map((w) => (
                      <option key={w.id_usuario} value={w.id_usuario}>
                        {w.nombre} ({w.correo})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Prioridad</label>
                  <select
                    className="form-select"
                    value={form.prioridad}
                    onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value }))}
                    disabled={savingTask}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descripcion}
                    onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Indicaciones específicas (qué, dónde, cuánto, evidencia)"
                    disabled={savingTask}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={savingTask || !form.asignadoA}>
                    {savingTask ? 'Creando...' : 'Crear tarea'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="card-title mb-0">
                {canManageUsers ? 'Todas las tareas' : 'Mis tareas asignadas'}
              </h4>
              <span className="text-muted" style={{ fontSize: 12 }}>
                Total: {visibleTasks.length}
              </span>
            </div>

            {loadingTasks ? (
              <div className="text-muted">Cargando tareas...</div>
            ) : visibleTasks.length === 0 ? (
              <div className="text-muted">No hay tareas para mostrar.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Tarea</th>
                      <th>Asignado a</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th style={{ width: 140 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map((t) => (
                      <tr key={t.id_tarea}>
                        <td>
                          <div className="fw-semibold">{t.titulo}</div>
                          {t.descripcion ? (
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {t.descripcion}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-muted">{t.asignado_correo || '—'}</td>
                        <td>{t.prioridad}</td>
                        <td>
                          <span className={badgeClass(t.estado)}>{t.estado}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            {t.estado === 'pendiente' ? (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => updateEstado(t.id_tarea, 'en_progreso')}
                                >
                                  Iniciar
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => updateEstado(t.id_tarea, 'completada')}
                                >
                                  Completar
                                </button>
                              </>
                            ) : null}

                            {t.estado === 'en_progreso' ? (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => updateEstado(t.id_tarea, 'completada')}
                                >
                                  Completar
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateEstado(t.id_tarea, 'pendiente')}
                                >
                                  Reabrir
                                </button>
                              </>
                            ) : null}

                            {t.estado === 'completada' ? (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateEstado(t.id_tarea, 'pendiente')}
                              >
                                Reabrir
                              </button>
                            ) : null}
                          </div>
                        </td>
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
