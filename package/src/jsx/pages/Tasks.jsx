import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';
import useAuth from '../hooks/useAuth';
import usePermissions from '../hooks/usePermissions';

const STORAGE_KEY = 'ceaa_tasks_v1';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Tasks() {
  const { user } = useAuth();
  const perms = usePermissions();
  const canManageUsers = perms.has('manage:users');

  const [tasks, setTasks] = useState(() => loadTasks());
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    asignadoA: '',
    prioridad: 'media',
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

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
    const correo = user?.correo;
    return tasks.filter((t) => t.asignadoA === correo);
  }, [tasks, canManageUsers, user?.correo]);

  const createTask = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    const newTask = {
      id: createId(),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      asignadoA: form.asignadoA || '',
      prioridad: form.prioridad,
      estado: 'pendiente',
      creadoPor: user?.correo || '',
      creadoEn: new Date().toISOString(),
      completadoEn: null,
    };

    setTasks((prev) => [newTask, ...prev]);
    setForm({ titulo: '', descripcion: '', asignadoA: '', prioridad: 'media' });
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextEstado = t.estado === 'completada' ? 'pendiente' : 'completada';
        return {
          ...t,
          estado: nextEstado,
          completadoEn: nextEstado === 'completada' ? new Date().toISOString() : null,
        };
      })
    );
  };

  const badgeClass = (estado) => {
    if (estado === 'completada') return 'badge bg-success';
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
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Asignar a</label>
                  <select
                    className="form-select"
                    value={form.asignadoA}
                    onChange={(e) => setForm((p) => ({ ...p, asignadoA: e.target.value }))}
                  >
                    <option value="">Sin asignar</option>
                    {workers.map((w) => (
                      <option key={w.id_usuario} value={w.correo}>
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
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">
                    Crear tarea
                  </button>
                </div>
              </form>
              <div className="text-muted mt-3" style={{ fontSize: 12 }}>
                Esto es un prototipo local (se guarda en tu navegador). Cuando lo bajemos a producción, lo conectamos a la BD.
              </div>
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

            {visibleTasks.length === 0 ? (
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
                      <tr key={t.id}>
                        <td>
                          <div className="fw-semibold">{t.titulo}</div>
                          {t.descripcion ? (
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {t.descripcion}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-muted">{t.asignadoA || '—'}</td>
                        <td>{t.prioridad}</td>
                        <td>
                          <span className={badgeClass(t.estado)}>{t.estado}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleDone(t.id)}
                          >
                            {t.estado === 'completada' ? 'Reabrir' : 'Marcar lista'}
                          </button>
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

