import { useCallback } from 'react';
import { usePermissions } from './usePermissions';

/**
 * Hook to check if user has specific permission(s)
 */
export const useHasPermission = (permission = null, permissionList = [], requireAll = false) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const checkPermission = useCallback(() => {
    if (permission) {
      return hasPermission(permission);
    }
    
    if (permissionList.length > 0) {
      return requireAll ? hasAllPermissions(permissionList) : hasAnyPermission(permissionList);
    }
    
    return true; // No specific permission required
  }, [permission, permissionList, requireAll, hasPermission, hasAnyPermission, hasAllPermissions]);
  
  return checkPermission();
};

/**
 * Hook to check if user has any of the specified permissions
 */
export const useHasAnyPermission = (permissionList) => {
  return useHasPermission(null, permissionList, false);
};

/**
 * Hook to check if user has all of the specified permissions
 */
export const useHasAllPermissions = (permissionList) => {
  return useHasPermission(null, permissionList, true);
};

/**
 * Hook to check if user has permission from a specific group
 */
export const useHasPermissionGroup = (groupName) => {
  const { hasPermissionGroup } = usePermissions();
  
  return useCallback(() => {
    return hasPermissionGroup(groupName);
  }, [hasPermissionGroup, groupName]);
};
