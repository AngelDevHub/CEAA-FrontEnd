import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../services/AxiosInstance';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Staff({ mode }) {
  const query = useQuery();
  const selectedUserId = query.get('user') ? Number(query.get('user')) : null;

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ nombre: '', correo: '', clave: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [rbac, setRbac] = useState({ roles: [], permissions: [] });
  const [userRbac, setUserRbac] = useState({ roles: [], directPermissions: [], effectivePermissions: [] });
  const [rbacLoading, setRbacLoading] = useState(false);

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError('');
      const res = await axiosInstance.get('usuarios');
      const list = res.data?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      setUsers([]);
      setError(e?.response?.data?.message || e?.message || 'No se pudieron cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const loadRbac = async () => {
      if (mode !== 'roles') return;
      try {
        setRbacLoading(true);
        setError('');
        const res = await axiosInstance.get('rbac/bootstrap');
        setRbac(res.data?.data || { roles: [], permissions: [] });
      } catch (e) {
        setRbac({ roles: [], permissions: [] });
        setError(e?.response?.data?.message || e?.message || 'No se pudo cargar RBAC');
      } finally {
        setRbacLoading(false);
      }
    };
    loadRbac();
  }, [mode]);

  useEffect(() => {
    const loadUserRbac = async () => {
      if (mode !== 'roles' || !selectedUserId) return;
      try {
        setRbacLoading(true);
        setError('');
        const res = await axiosInstance.get(`rbac/users/${selectedUserId}`);
        setUserRbac(res.data?.data || { roles: [], directPermissions: [], effectivePermissions: [] });
      } catch (e) {
        setUserRbac({ roles: [], directPermissions: [], effectivePermissions: [] });
        setError(e?.response?.data?.message || e?.message || 'No se pudo cargar roles/permisos del usuario');
      } finally {
        setRbacLoading(false);
      }
    };
    loadUserRbac();
  }, [mode, selectedUserId]);

  useEffect(() => {
    const loadActivity = async () => {
      if (mode !== 'activity') return;
      try {
        setActivityLoading(true);
        setError('');
        const url = selectedUserId ? `actividad?userId=${selectedUserId}` : 'actividad';
        const res = await axiosInstance.get(url);
        const list = res.data?.data || [];
        setActivity(Array.isArray(list) ? list : []);
      } catch (e) {
        setActivity([]);
        setError(e?.response?.data?.message || e?.message || 'No se pudo cargar actividad');
      } finally {
        setActivityLoading(false);
      }
    };
    loadActivity();
  }, [mode, selectedUserId]);

  useEffect(() => {
    const loadTasks = async () => {
      if (mode !== 'turnos') return;
      try {
        setTasksLoading(true);
        setError('');
        const res = await axiosInstance.get('tareas');
        const list = res.data?.data || [];
        setTasks(Array.isArray(list) ? list : []);
      } catch (e) {
        setTasks([]);
        setError(e?.response?.data?.message || e?.message || 'No se pudieron cargar tareas');
      } finally {
        setTasksLoading(false);
      }
    };
    loadTasks();
  }, [mode]);

  const createUser = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.correo.trim() || !form.clave.trim()) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await axiosInstance.post('usuarios', {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        clave: form.clave.trim()
      });
      setForm({ nombre: '', correo: '', clave: '' });
      setSuccess('Usuario creado');
      await loadUsers();
    } catch (e2) {
      setSuccess('');
      setError(e2?.response?.data?.message || e2?.message || 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleIds = useMemo(() => userRbac.roles.map((r) => r.id_rol), [userRbac.roles]);
  const selectedDirectPermIds = useMemo(() => userRbac.directPermissions.map((p) => p.id_permiso), [userRbac.directPermissions]);

  const toggleRole = (id_rol) => {
    setUserRbac((prev) => {
      const set = new Set(prev.roles.map((r) => r.id_rol));
      if (set.has(id_rol)) set.delete(id_rol);
      else set.add(id_rol);
      const roles = rbac.roles.filter((r) => set.has(r.id_rol));
      return { ...prev, roles };
    });
  };

  const toggleDirectPermission = (id_permiso) => {
    setUserRbac((prev) => {
      const set = new Set(prev.directPermissions.map((p) => p.id_permiso));
      if (set.has(id_permiso)) set.delete(id_permiso);
      else set.add(id_permiso);
      const directPermissions = rbac.permissions.filter((p) => set.has(p.id_permiso)).map((p) => ({ id_permiso: p.id_permiso, codigo: p.codigo }));
      return { ...prev, directPermissions };
    });
  };

  const saveRbac = async () => {
    if (!selectedUserId) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await axiosInstance.put(`rbac/users/${selectedUserId}/roles`, { roles: selectedRoleIds });
      await axiosInstance.put(`rbac/users/${selectedUserId}/permissions`, { permissions: selectedDirectPermIds });
      setSuccess('Roles y permisos actualizados');
      const res = await axiosInstance.get(`rbac/users/${selectedUserId}`);
      setUserRbac(res.data?.data || { roles: [], directPermissions: [], effectivePermissions: [] });
    } catch (e) {
      setSuccess('');
      setError(e?.response?.data?.message || e?.message || 'No se pudo guardar RBAC');
    } finally {
      setSaving(false);
    }
  };

  const header = useMemo(() => {
    if (mode === 'list') return { title: 'Lista de personal', subtitle: 'Usuarios activos y administración' };
    if (mode === 'add') return { title: 'Agregar nuevo', subtitle: 'Crear trabajador/usuario' };
    if (mode === 'roles') return { title: 'Roles y permisos', subtitle: 'Asignación de permisos por usuario' };
    if (mode === 'turnos') return { title: 'Turnos / Planeación', subtitle: 'Vista de tareas por trabajador (operación)' };
    if (mode === 'activity') return { title: 'Actividad', subtitle: 'Auditoría de acciones del sistema' };
    return { title: 'Personal', subtitle: '' };
  }, [mode]);

  const groupedTasks = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      const key = t.asignado_correo || String(t.asignado_a);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return Array.from(map.entries());
  }, [tasks]);

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">{header.title}</h2>
            <div className="text-muted">{header.subtitle}</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link className={`btn btn-sm ${mode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} to="/staff-list">Lista</Link>
            <Link className={`btn btn-sm ${mode === 'add' ? 'btn-primary' : 'btn-outline-primary'}`} to="/staff-add">Agregar</Link>
            <Link className={`btn btn-sm ${mode === 'roles' ? 'btn-primary' : 'btn-outline-primary'}`} to="/staff-roles">Roles</Link>
            <Link className={`btn btn-sm ${mode === 'turnos' ? 'btn-primary' : 'btn-outline-primary'}`} to="/staff-turnos">Turnos</Link>
            <Link className={`btn btn-sm ${mode === 'activity' ? 'btn-primary' : 'btn-outline-primary'}`} to="/staff-asistencia">Actividad</Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="col-12 mb-4">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      ) : null}
      {success ? (
        <div className="col-12 mb-4">
          <div className="alert alert-success mb-0">{success}</div>
        </div>
      ) : null}

      {mode === 'list' ? (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {loadingUsers ? (
                <div className="text-muted">Cargando...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Estatus</th>
                        <th style={{ width: 240 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id_usuario}>
                          <td>{u.id_usuario}</td>
                          <td>{u.nombre}</td>
                          <td>{u.correo}</td>
                          <td>{u.estatus}</td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <Link className="btn btn-sm btn-outline-primary" to={`/staff-roles?user=${u.id_usuario}`}>Permisos</Link>
                              <Link className="btn btn-sm btn-outline-secondary" to={`/staff-asistencia?user=${u.id_usuario}`}>Actividad</Link>
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
      ) : null}

      {mode === 'add' ? (
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-3">Crear usuario</h4>
              <form className="row g-3" onSubmit={createUser}>
                <div className="col-md-6">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" disabled={saving} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <input className="form-control" disabled={saving} value={form.correo} onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" disabled={saving} value={form.clave} onChange={(e) => setForm((p) => ({ ...p, clave: e.target.value }))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'roles' ? (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h4 className="card-title mb-0">Asignación de roles/permisos</h4>
                <div className="d-flex gap-2 flex-wrap">
                  <select
                    className="form-select form-select-sm"
                    value={selectedUserId || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      window.location.href = v ? `/staff-roles?user=${v}` : '/staff-roles';
                    }}
                    style={{ maxWidth: 360 }}
                  >
                    <option value="">Selecciona usuario</option>
                    {users.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre} ({u.correo})
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={saveRbac} disabled={!selectedUserId || saving || rbacLoading}>
                    Guardar
                  </button>
                </div>
              </div>

              {rbacLoading ? (
                <div className="text-muted">Cargando...</div>
              ) : !selectedUserId ? (
                <div className="text-muted">Selecciona un usuario para asignar roles y permisos.</div>
              ) : (
                <div className="row">
                  <div className="col-lg-4 mb-3">
                    <div className="fw-semibold mb-2">Roles</div>
                    <div className="d-grid gap-2">
                      {rbac.roles.map((r) => (
                        <label key={r.id_rol} className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(r.id_rol)}
                            onChange={() => toggleRole(r.id_rol)}
                            disabled={saving}
                          />
                          <span>{r.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-lg-4 mb-3">
                    <div className="fw-semibold mb-2">Permisos directos</div>
                    <div className="d-grid gap-2" style={{ maxHeight: 360, overflow: 'auto' }}>
                      {rbac.permissions.map((p) => (
                        <label key={p.id_permiso} className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDirectPermIds.includes(p.id_permiso)}
                            onChange={() => toggleDirectPermission(p.id_permiso)}
                            disabled={saving}
                          />
                          <span>{p.codigo}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-lg-4 mb-3">
                    <div className="fw-semibold mb-2">Permisos efectivos</div>
                    <div className="d-grid gap-2" style={{ maxHeight: 360, overflow: 'auto' }}>
                      {(userRbac.effectivePermissions || []).map((p) => (
                        <div key={p.id_permiso} className="badge bg-light text-dark border text-start" style={{ whiteSpace: 'normal' }}>
                          {p.codigo}
                        </div>
                      ))}
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                      Los permisos efectivos incluyen roles + permisos directos.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'activity' ? (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h4 className="card-title mb-0">Actividad</h4>
                <select
                  className="form-select form-select-sm"
                  value={selectedUserId || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    window.location.href = v ? `/staff-asistencia?user=${v}` : '/staff-asistencia';
                  }}
                  style={{ maxWidth: 360 }}
                >
                  <option value="">Todos</option>
                  {users.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} ({u.correo})
                    </option>
                  ))}
                </select>
              </div>

              {activityLoading || loadingUsers ? (
                <div className="text-muted">Cargando...</div>
              ) : activity.length === 0 ? (
                <div className="text-muted">Sin actividad para mostrar.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((a) => (
                        <tr key={a.id_actividad}>
                          <td className="text-muted">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td>
                          <td className="text-muted">{a.usuario_correo}</td>
                          <td>{a.accion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'turnos' ? (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {tasksLoading ? (
                <div className="text-muted">Cargando...</div>
              ) : groupedTasks.length === 0 ? (
                <div className="text-muted">No hay tareas registradas.</div>
              ) : (
                <div className="accordion" id="tasksByUser">
                  {groupedTasks.map(([k, list], idx) => (
                    <div className="accordion-item" key={k}>
                      <h2 className="accordion-header" id={`h_${idx}`}>
                        <button className={`accordion-button ${idx === 0 ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#c_${idx}`}>
                          {k} <span className="ms-2 text-muted">({list.length})</span>
                        </button>
                      </h2>
                      <div id={`c_${idx}`} className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} data-bs-parent="#tasksByUser">
                        <div className="accordion-body">
                          <div className="table-responsive">
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr>
                                  <th>Tarea</th>
                                  <th>Prioridad</th>
                                  <th>Estado</th>
                                  <th>Creado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {list.map((t) => (
                                  <tr key={t.id_tarea}>
                                    <td>
                                      <div className="fw-semibold">{t.titulo}</div>
                                      {t.descripcion ? <div className="text-muted" style={{ fontSize: 12 }}>{t.descripcion}</div> : null}
                                    </td>
                                    <td className="text-muted">{t.prioridad}</td>
                                    <td className="text-muted">{t.estado}</td>
                                    <td className="text-muted">{t.creado_en ? new Date(t.creado_en).toLocaleString() : '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

