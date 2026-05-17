import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { rbac } from '../utils/rbac';

/**
 * Hook to check if user can access based on permissions and roles
 */
export const useCanAccess = (requiredPermissions = [], requiredRoles = [], requireAll = false) => {
  const { permissions, roles } = useAuthStore();
  
  const canAccess = useCallback(() => {
    return rbac.canAccess(permissions, roles, requiredPermissions, requiredRoles, requireAll);
  }, [permissions, roles, requiredPermissions, requiredRoles, requireAll]);
  
  const getMissingPermissions = useCallback(() => {
    return rbac.getMissingPermissions(permissions, roles, requiredPermissions);
  }, [permissions, roles, requiredPermissions]);
  
  const hasMinimumRole = useCallback((minimumRole) => {
    return rbac.hasMinimumRole(roles, minimumRole);
  }, [roles]);
  
  return {
    canAccess: canAccess(),
    missingPermissions: getMissingPermissions(),
    hasMinimumRole,
    requirements: {
      permissions: requiredPermissions,
      roles: requiredRoles,
      requireAll
    }
  };
};

/**
 * Hook to check role-based access
 */
export const useHasRole = (role = null, roleList = []) => {
  const { roles } = useAuthStore();
  
  const hasRole = useCallback(() => {
    if (role) {
      return rbac.checkRole(roles, role);
    }
    
    if (roleList.length > 0) {
      return rbac.checkAnyRole(roles, roleList);
    }
    
    return false;
  }, [role, roleList, roles]);
  
  const hasAnyRole = useCallback(() => {
    return rbac.checkAnyRole(roles, roleList);
  }, [roleList, roles]);
  
  const getRoleLevel = useCallback(() => {
    if (role) {
      return rbac.getRoleLevel(role);
    }
    return Math.max(...(roles.map(rbac.getRoleLevel) || [0]));
  }, [role, roles]);
  
  return {
    hasRole: hasRole(),
    hasAnyRole: hasAnyRole(),
    roleLevel: getRoleLevel(),
    userRoles: roles
  };
};

/**
 * Hook to check minimum role level access
 */
export const useMinimumRole = (minimumRole) => {
  const { hasMinimumRole } = useCanAccess([], [minimumRole]);
  const { roleLevel } = useHasRole(minimumRole);
  
  return {
    hasMinimumRole: hasMinimumRole(),
    minimumRole,
    currentLevel: roleLevel,
    requiredLevel: rbac.getRoleLevel(minimumRole)
  };
};
