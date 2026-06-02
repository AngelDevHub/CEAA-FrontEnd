import React from 'react';
import usePermissions from '../../hooks/usePermissions';
import AdminDashboard from './AdminDashboard';
import WorkerDashboard from './WorkerDashboard';

export default function DashboardEntry() {
  const perms = usePermissions();

  if (perms.hasAny(['manage:users', 'view:metrics'])) {
    return <AdminDashboard />;
  }

  return <WorkerDashboard />;
}

