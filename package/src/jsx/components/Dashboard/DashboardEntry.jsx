import React from 'react';
import usePermissions from '../../hooks/usePermissions';
import useAuth from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import WorkerDashboard from './WorkerDashboard';

export default function DashboardEntry() {
  const perms = usePermissions();
  const { user } = useAuth();

  const roles = Array.isArray(user?.roles) 
    ? user.roles.map(r => String(r).toLowerCase()) 
    : (user?.role ? [String(user.role).toLowerCase()] : []);

  const isWorker = roles.includes('worker') || roles.includes('trabajador') || roles.includes('agricultor');
  const isAdmin = roles.includes('owner') || roles.includes('admin') || roles.includes('dueño') || roles.includes('administrador') || perms.has('manage:users');

  // Si es rol de trabajador y no es admin, mostrar Dashboard de Campo
  if (isWorker && !isAdmin) {
    return <WorkerDashboard />;
  }

  // Si es administrador / dueño o tiene permisos de gestión
  if (isAdmin || perms.has('manage:users')) {
    return <AdminDashboard />;
  }

  // Por defecto para trabajadores u otros usuarios sin gestión administrativa
  return <WorkerDashboard />;
}


