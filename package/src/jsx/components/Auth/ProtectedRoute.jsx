import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';

export default function ProtectedRoute({
  requiredPermission,
  requiredAnyPermissions,
  children,
}) {
  const { isAuthenticated } = useAuth();
  const perms = usePermissions();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredPermission && !perms.has(requiredPermission)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (requiredAnyPermissions && !perms.hasAny(requiredAnyPermissions)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
