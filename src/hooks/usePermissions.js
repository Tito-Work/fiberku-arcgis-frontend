import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { rbac } from '../utils/rbac';

/**
 * Hook to get user permissions and related information
 */
export const usePermissions = () => {
  const { permissions, roles, user } = useAuthStore();
  
  const getDerivedPermissions = useCallback(() => {
    return rbac.getDerivedPermissions(roles);
  }, [roles]);
  
  const getAllPermissions = useCallback(() => {
    const derived = getDerivedPermissions();
    return [...new Set([...permissions, ...derived])];
  }, [permissions, getDerivedPermissions]);
  
  const hasPermission = useCallback((permission) => {
    return rbac.checkPermissionWithRoles(roles, permissions, permission);
  }, [roles, permissions]);
  
  const hasAnyPermission = useCallback((permissionList) => {
    const allPermissions = getAllPermissions();
    return rbac.checkAnyPermission(allPermissions, permissionList);
  }, [getAllPermissions]);
  
  const hasAllPermissions = useCallback((permissionList) => {
    const allPermissions = getAllPermissions();
    return rbac.checkAllPermissions(allPermissions, permissionList);
  }, [getAllPermissions]);
  
  const hasPermissionGroup = useCallback((groupName) => {
    const allPermissions = getAllPermissions();
    return rbac.hasPermissionGroup(allPermissions, groupName);
  }, [getAllPermissions]);
  
  const getPermissionAnalysis = useCallback(() => {
    return rbac.analyzePermissions(permissions, roles);
  }, [permissions, roles]);
  
  return {
    permissions,
    roles,
    user,
    derivedPermissions: getDerivedPermissions(),
    allPermissions: getAllPermissions(),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionGroup,
    analysis: getPermissionAnalysis()
  };
};
