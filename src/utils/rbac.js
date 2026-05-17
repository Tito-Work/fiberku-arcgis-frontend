import { PERMISSIONS, PERMISSION_GROUPS, ROLES, ROLE_PERMISSIONS } from './permissions';

/**
 * RBAC utility functions for permission and role checking
 */

// Permission checking utilities
export const checkPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
};

export const checkAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (!requiredPermissions || !Array.isArray(requiredPermissions)) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const checkAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (!requiredPermissions || !Array.isArray(requiredPermissions)) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Role checking utilities
export const checkRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.includes(requiredRole);
};

export const checkAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  if (!requiredRoles || !Array.isArray(requiredRoles)) return true;
  return requiredRoles.some(role => userRoles.includes(role));
};

// Comprehensive access check
export const canAccess = (userPermissions, userRoles, requiredPermissions = [], requiredRoles = [], requireAll = false) => {
  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return true; // No restrictions
  }

  const hasPermissionAccess = requiredPermissions.length > 0 
    ? (requireAll ? checkAllPermissions(userPermissions, requiredPermissions) : checkAnyPermission(userPermissions, requiredPermissions))
    : true;

  const hasRoleAccess = requiredRoles.length > 0 
    ? checkAnyRole(userRoles, requiredRoles)
    : true;

  return hasPermissionAccess && hasRoleAccess;
};

// Permission grouping utilities
export const hasPermissionGroup = (userPermissions, groupName) => {
  const groupPermissions = PERMISSION_GROUPS[groupName];
  if (!groupPermissions) return false;
  return checkAnyPermission(userPermissions, groupPermissions);
};

export const hasAllPermissionGroup = (userPermissions, groupName) => {
  const groupPermissions = PERMISSION_GROUPS[groupName];
  if (!groupPermissions) return false;
  return checkAllPermissions(userPermissions, groupPermissions);
};

// Role hierarchy utilities
export const getRoleLevel = (role) => {
  const roleHierarchy = {
    [ROLES.SUPER_ADMIN]: 5,
    [ROLES.ADMIN]: 4,
    [ROLES.MANAGER]: 3,
    [ROLES.OPERATOR]: 2,
    [ROLES.VIEWER]: 1
  };
  return roleHierarchy[role] || 0;
};

export const hasMinimumRole = (userRoles, minimumRole) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  const minimumLevel = getRoleLevel(minimumRole);
  return userRoles.some(role => getRoleLevel(role) >= minimumLevel);
};

// Permission derivation from roles
export const getDerivedPermissions = (userRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return [];
  
  const allPermissions = new Set();
  userRoles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
};

// Enhanced permission checking with role derivation
export const checkPermissionWithRoles = (userRoles, userPermissions, requiredPermission) => {
  // Check direct permissions first
  if (checkPermission(userPermissions, requiredPermission)) {
    return true;
  }
  
  // Check derived permissions from roles
  const derivedPermissions = getDerivedPermissions(userRoles);
  return checkPermission(derivedPermissions, requiredPermission);
};

// Wildcard permission matching
export const checkWildcardPermission = (userPermissions, pattern) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return userPermissions.some(permission => regex.test(permission));
};

// Permission validation
export const validatePermission = (permission) => {
  return Object.values(PERMISSIONS).includes(permission);
};

export const validateRole = (role) => {
  return Object.values(ROLES).includes(role);
};

// Permission analysis utilities
export const analyzePermissions = (userPermissions, userRoles) => {
  const derivedPermissions = getDerivedPermissions(userRoles);
  const allPermissions = [...new Set([...userPermissions, ...derivedPermissions])];
  
  const analysis = {
    totalPermissions: allPermissions.length,
    directPermissions: userPermissions.length,
    derivedPermissions: derivedPermissions.length,
    permissionGroups: {},
    roleLevel: Math.max(...(userRoles.map(getRoleLevel) || [0]))
  };
  
  // Analyze permission groups
  Object.keys(PERMISSION_GROUPS).forEach(groupName => {
    const groupPermissions = PERMISSION_GROUPS[groupName];
    analysis.permissionGroups[groupName] = {
      total: groupPermissions.length,
      has: groupPermissions.filter(p => allPermissions.includes(p)).length,
      percentage: Math.round((groupPermissions.filter(p => allPermissions.includes(p)).length / groupPermissions.length) * 100)
    };
  });
  
  return analysis;
};

// Permission recommendations
export const getMissingPermissions = (userPermissions, userRoles, requiredPermissions) => {
  const allPermissions = [...new Set([...userPermissions, ...getDerivedPermissions(userRoles)])];
  return requiredPermissions.filter(permission => !allPermissions.includes(permission));
};

// Export all utilities as a single object for convenience
export const rbac = {
  // Permission checks
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  
  // Role checks
  checkRole,
  checkAnyRole,
  
  // Combined checks
  canAccess,
  checkPermissionWithRoles,
  
  // Group checks
  hasPermissionGroup,
  hasAllPermissionGroup,
  
  // Hierarchy checks
  getRoleLevel,
  hasMinimumRole,
  
  // Utilities
  getDerivedPermissions,
  checkWildcardPermission,
  
  // Validation
  validatePermission,
  validateRole,
  
  // Analysis
  analyzePermissions,
  getMissingPermissions
};

export default rbac;
