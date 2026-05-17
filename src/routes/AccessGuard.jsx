import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCanAccess } from "../hooks/useCanAccess";
import { useHasPermission } from "../hooks/useHasPermission";
import { useHasRole } from "../hooks/useCanAccess";

/**
 * Comprehensive route guard that handles authentication, roles, and permissions
 */
export default function AccessGuard({ 
  children, 
  // Authentication options
  requireAuth = true,
  redirectTo = "/login",
  
  // Role options
  allowedRoles = [],
  minimumRole = null,
  requireAllRoles = false,
  
  // Permission options
  requiredPermissions = [],
  requireAllPermissions = false,
  
  // Fallback options
  fallback = null,
  showMissingPermissions = true,
  
  // Custom access check
  customAccessCheck = null
}) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  
  // Check authentication
  if (requireAuth && !token) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Custom access check (override all other checks)
  if (customAccessCheck && typeof customAccessCheck === 'function') {
    const customResult = customAccessCheck({ user, token });
    if (customResult === false) {
      return fallback || <div>403 Forbidden - Access denied</div>;
    }
    if (typeof customResult === 'object') {
      return customResult;
    }
  }
  
  // Check minimum role (hierarchy)
  if (minimumRole) {
    const { hasMinimumRole } = useHasRole(minimumRole);
    if (!hasMinimumRole) {
      return renderFallback("Insufficient role level");
    }
  }
  
  // Check specific roles
  if (allowedRoles.length > 0) {
    const { canAccess: hasRoleAccess } = useCanAccess([], allowedRoles, requireAllRoles);
    if (!hasRoleAccess) {
      return renderFallback("Insufficient role permissions");
    }
  }
  
  // Check permissions
  if (requiredPermissions.length > 0) {
    const { canAccess: hasPermissionAccess, missingPermissions } = useCanAccess(
      requiredPermissions, 
      [], 
      requireAllPermissions
    );
    
    if (!hasPermissionAccess) {
      if (showMissingPermissions && missingPermissions.length > 0) {
        return renderMissingPermissionsFallback(missingPermissions);
      }
      return renderFallback("Insufficient permissions");
    }
  }
  
  // All checks passed
  return children;
  
  function renderFallback(message) {
    if (fallback) {
      return typeof fallback === 'function' ? <>{fallback()}</> : <>{fallback}</>;
    }
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>403 Forbidden</h3>
        <p>{message}</p>
      </div>
    );
  }
  
  function renderMissingPermissionsFallback(missingPermissions) {
    if (fallback) {
      return typeof fallback === 'function' ? <>{fallback({ missingPermissions })}</> : <>{fallback}</>;
    }
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>403 Forbidden - Insufficient Permissions</h3>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <p>Missing required permissions:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            {missingPermissions.map((permission, index) => (
              <li key={index}>{permission}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

/**
 * Simplified access guard for common use cases
 */
export const SimpleAccessGuard = ({ 
  children, 
  permissions = [], 
  roles = [],
  fallback = null 
}) => {
  return (
    <AccessGuard
      requiredPermissions={permissions}
      allowedRoles={roles}
      fallback={fallback}
    >
      {children}
    </AccessGuard>
  );
};

/**
 * Admin-only guard
 */
export const AdminGuard = ({ children, fallback = null }) => {
  return (
    <AccessGuard
      minimumRole="admin"
      fallback={fallback || <div>403 Forbidden - Admin access required</div>}
    >
      {children}
    </AccessGuard>
  );
};

/**
 * Manager-level and above guard
 */
export const ManagerGuard = ({ children, fallback = null }) => {
  return (
    <AccessGuard
      minimumRole="manager"
      fallback={fallback || <div>403 Forbidden - Manager access required</div>}
    >
      {children}
    </AccessGuard>
  );
};
