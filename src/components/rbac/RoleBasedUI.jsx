import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useHasPermission, useHasPermissionGroup } from '../../hooks/useHasPermission';
import { useHasRole } from '../../hooks/useCanAccess';
import { PERMISSION_GROUPS, ROLES } from '../../utils/permissions';

/**
 * Component that renders different UI based on user roles
 */
export const RoleBasedUI = ({ children, roleUI = {}, fallback = null }) => {
  const { hasRole } = useHasRole();
  
  // Find the highest role the user has that has a UI defined
  const userRole = Object.keys(roleUI).find(role => hasRole(role));
  
  if (userRole && roleUI[userRole]) {
    return <>{roleUI[userRole]}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

/**
 * Component that renders different UI based on user permissions
 */
export const PermissionBasedUI = ({ children, permissionUI = {}, fallback = null }) => {
  const { hasPermission } = useHasPermission();
  
  // Find the first permission the user has that has a UI defined
  const userPermission = Object.keys(permissionUI).find(permission => hasPermission(permission));
  
  if (userPermission && permissionUI[userPermission]) {
    return <>{permissionUI[userPermission]}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

/**
 * Component that renders UI based on permission groups
 */
export const PermissionGroupUI = ({ children, groupUI = {}, fallback = null }) => {
  const { hasPermissionGroup } = useHasPermissionGroup();
  
  // Find the first permission group the user has access to
  const userGroup = Object.keys(groupUI).find(group => hasPermissionGroup(group));
  
  if (userGroup && groupUI[userGroup]) {
    return <>{groupUI[userGroup]}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

/**
 * Component that shows/hides content based on role hierarchy
 */
export const RoleHierarchyUI = ({ 
  children, 
  minimumRole = ROLES.VIEWER, 
  showForHigher = true,
  fallback = null 
}) => {
  const { hasMinimumRole } = useHasRole(minimumRole);
  
  const shouldShow = showForHigher ? hasMinimumRole : !hasMinimumRole;
  
  return shouldShow ? <>{children}</> : fallback ? <>{fallback}</> : null;
};

/**
 * Component that conditionally renders based on multiple conditions
 */
export const ConditionalUI = ({ 
  children, 
  conditions = [],
  logic = 'AND', // 'AND' or 'OR'
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useHasPermission();
  const { hasRole } = useHasRole();
  
  const evaluateCondition = (condition) => {
    const { type, value, operator = 'equals' } = condition;
    
    switch (type) {
      case 'permission':
        if (operator === 'equals') return hasPermission(value);
        if (operator === 'not') return !hasPermission(value);
        return false;
        
      case 'permissionList':
        if (operator === 'any') return hasAnyPermission(value);
        if (operator === 'all') return hasAllPermissions(value);
        return false;
        
      case 'role':
        if (operator === 'equals') return hasRole(value);
        if (operator === 'not') return !hasRole(value);
        return false;
        
      default:
        return false;
    }
  };
  
  const results = conditions.map(evaluateCondition);
  const shouldShow = logic === 'AND' 
    ? results.every(result => result === true)
    : results.some(result => result === true);
  
  return shouldShow ? <>{children}</> : fallback ? <>{fallback}</> : null;
};

/**
 * Component for navigation items that show/hide based on permissions
 */
export const NavigationItem = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requireAll = false,
  fallback = null,
  className = '',
  ...props 
}) => {
  const { canAccess } = useCanAccess(requiredPermissions, requiredRoles, requireAll);
  
  if (!canAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

/**
 * Component for menu items with role-based visibility
 */
export const MenuItem = ({ 
  children, 
  roles = [], 
  permissions = [],
  fallback = null,
  ...props 
}) => {
  const { canAccess } = useCanAccess(permissions, roles);
  
  if (!canAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <div {...props}>
      {children}
    </div>
  );
};

/**
 * Component that shows admin-only content
 */
export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <ProtectedByRole roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </ProtectedByRole>
  );
};

/**
 * Component that shows manager-level content
 */
export const ManagerOnly = ({ children, fallback = null }) => {
  return (
    <RoleHierarchyUI minimumRole={ROLES.MANAGER} fallback={fallback}>
      {children}
    </RoleHierarchyUI>
  );
};

/**
 * Component that shows operator-level content
 */
export const OperatorOnly = ({ children, fallback = null }) => {
  return (
    <ProtectedByRole roles={[ROLES.OPERATOR, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </ProtectedByRole>
  );
};

/**
 * Component that shows viewer-level and above content
 */
export const ViewerPlus = ({ children, fallback = null }) => {
  return (
    <RoleHierarchyUI minimumRole={ROLES.VIEWER} fallback={fallback}>
      {children}
    </RoleHierarchyUI>
  );
};

// Import ProtectedByRole from ProtectedComponent
import { ProtectedByRole } from './ProtectedComponent';

export default RoleBasedUI;
