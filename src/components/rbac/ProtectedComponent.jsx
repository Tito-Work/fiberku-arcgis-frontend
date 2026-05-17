import React from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '../../hooks/useHasPermission';
import { useCanAccess } from '../../hooks/useCanAccess';

/**
 * Component that conditionally renders children based on permissions
 */
export const ProtectedComponent = ({ 
  children, 
  permission = null, 
  permissions = [], 
  requireAll = false,
  roles = [],
  fallback = null,
  renderFallback = false
}) => {
  // Handle permission-based protection
  if (permission || permissions.length > 0) {
    const hasAccess = useHasPermission(permission, permissions, requireAll);
    
    if (!hasAccess) {
      return renderFallback ? <>{fallback}</> : null;
    }
  }
  
  // Handle role-based protection
  if (roles.length > 0) {
    const { canAccess } = useCanAccess([], roles);
    
    if (!canAccess) {
      return renderFallback ? <>{fallback}</> : null;
    }
  }
  
  return <>{children}</>;
};

/**
 * Component that renders children if user has ANY of the specified permissions
 */
export const ProtectedByAnyPermission = ({ 
  children, 
  permissions, 
  fallback = null,
  renderFallback = false 
}) => {
  const hasAccess = useHasAnyPermission(permissions);
  
  if (!hasAccess) {
    return renderFallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};

/**
 * Component that renders children if user has ALL of the specified permissions
 */
export const ProtectedByAllPermissions = ({ 
  children, 
  permissions, 
  fallback = null,
  renderFallback = false 
}) => {
  const hasAccess = useHasAllPermissions(permissions);
  
  if (!hasAccess) {
    return renderFallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};

/**
 * Component that renders children if user has specific role(s)
 */
export const ProtectedByRole = ({ 
  children, 
  roles, 
  fallback = null,
  renderFallback = false 
}) => {
  const { canAccess } = useCanAccess([], roles);
  
  if (!canAccess) {
    return renderFallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};

/**
 * Component that renders children if user meets combined permission and role requirements
 */
export const ProtectedByAccess = ({ 
  children, 
  permissions = [], 
  roles = [],
  requireAll = false,
  fallback = null,
  renderFallback = false 
}) => {
  const { canAccess } = useCanAccess(permissions, roles, requireAll);
  
  if (!canAccess) {
    return renderFallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};

/**
 * Higher-order component for wrapping components with protection
 */
export const withProtection = (Component, protectionOptions = {}) => {
  return function ProtectedWrapper(props) {
    return (
      <ProtectedComponent {...protectionOptions}>
        <Component {...props} />
      </ProtectedComponent>
    );
  };
};

/**
 * Higher-order component for permission-based protection
 */
export const withPermissionProtection = (Component, permission, options = {}) => {
  return withProtection(Component, { permission, ...options });
};

/**
 * Higher-order component for role-based protection
 */
export const withRoleProtection = (Component, roles, options = {}) => {
  return withProtection(Component, { roles, ...options });
};

export default ProtectedComponent;
