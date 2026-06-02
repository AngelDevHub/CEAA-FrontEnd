import { useMemo } from 'react';
import useAuth from './useAuth';

export default function usePermissions() {
  const { user } = useAuth();

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const set = useMemo(() => new Set(permissions), [permissions]);

  return {
    permissions,
    has: (permission) => set.has(permission),
    hasAny: (requiredPermissions) =>
      Array.isArray(requiredPermissions) && requiredPermissions.some((p) => set.has(p)),
    hasAll: (requiredPermissions) =>
      Array.isArray(requiredPermissions) && requiredPermissions.every((p) => set.has(p)),
  };
}
