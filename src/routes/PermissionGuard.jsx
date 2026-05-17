import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useHasPermission } from "../hooks/useHasPermission";
import { useCanAccess } from "../hooks/useCanAccess";

export default function PermissionGuard({ 
  children, 
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  redirectTo = null,
  fallback = null 
}) {
  const token = useAuthStore((s) => s.token);
  const { canAccess, missingPermissions } = useCanAccess(requiredPermissions, requiredRoles, requireAll);

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check permission and role access
  if (!canAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default forbidden message with missing permissions info
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>403 Forbidden - Insufficient Permissions</h3>
        {missingPermissions.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            <p>Missing required permissions:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              {missingPermissions.map((permission, index) => (
                <li key={index}>{permission}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return children;
}
