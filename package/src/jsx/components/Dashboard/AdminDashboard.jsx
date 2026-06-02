import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
import usePermissions from '../../hooks/usePermissions';

export default function AdminDashboard() {
  const perms = usePermissions();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        setError('');
        const res = await axiosInstance.get('usuarios');
        const rows = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.usuarios || [];
        setUsers(Array.isArray(rows) ? rows : []);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'No se pudo cargar la lista de usuarios');
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (perms.has('manage:users')) load();
  }, [perms]);

  const kpi = useMemo(() => {
    return {
      totalUsers: users.length,
    };
  }, [users.length]);

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">Dashboard de Administración</h2>
            <div className="text-muted">Métricas, alertas críticas y gestión de trabajadores</div>
          </div>
          <div className="d-flex gap-2">
            <a className="btn btn-outline-primary" href="/monitoreo-completo">Ver métricas</a>
            <a className="btn btn-primary" href="/staff-add">Crear trabajador</a>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-sm-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted">Trabajadores</div>
                <div className="fs-3 fw-bold">{kpi.totalUsers}</div>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: 'rgba(43,99,255,0.10)' }}>
                <i className="las la-users text-primary" style={{ fontSize: 22 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-sm-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="text-muted">Alertas críticas</div>
            <div className="fs-3 fw-bold">—</div>
            <div className="text-muted" style={{ fontSize: 12 }}>Conecta aquí tu fuente de alertas</div>
          </div>
        </div>
      </div>

      <div className="col-xl-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fw-bold">Gráficas avanzadas RS485</div>
              <a className="btn btn-sm btn-outline-secondary" href="/monitoreo-completo">Abrir</a>
            </div>
            <div className="mt-3" style={{ height: 220, borderRadius: 12, background: 'rgba(0,0,0,0.06)' }} />
          </div>
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header border-0 pb-0">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h4 className="card-title mb-0">Gestión de trabajadores</h4>
              <div className="d-flex gap-2">
                <a className="btn btn-outline-secondary btn-sm" href="/staff-roles">Roles</a>
                <a className="btn btn-primary btn-sm" href="/staff-add">Crear usuario</a>
              </div>
            </div>
          </div>
          <div className="card-body">
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : null}

            {loadingUsers ? (
              <div className="text-muted">Cargando usuarios...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Estatus</th>
                      <th style={{ width: 180 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted">Sin usuarios para mostrar</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id_usuario ?? u.id}>
                          <td>{u.id_usuario ?? u.id}</td>
                          <td>{u.nombre}</td>
                          <td>{u.correo}</td>
                          <td>{u.estatus ?? 'activo'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <a className="btn btn-sm btn-outline-primary" href={`/staff-list?user=${u.id_usuario ?? u.id}`}>
                                Permisos
                              </a>
                              <a className="btn btn-sm btn-outline-secondary" href={`/staff-asistencia?user=${u.id_usuario ?? u.id}`}>
                                Actividad
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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

