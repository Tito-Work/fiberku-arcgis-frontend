import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";
import { useHasRole } from "../hooks/useCanAccess";

// Helper function to check if JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If token is malformed, consider it expired
  }
};

export default function RoleGuard({ 
  children, 
  allowedRoles = [],
  requireAll = false,
  redirectTo = null,
  fallback = null 
}) {
  const token = useAuthStore((s) => s.token);
  const { hasRole, hasAnyRole } = useHasRole(null, allowedRoles);

  // Check if user is authenticated and token is not expired
  if (!token || isTokenExpired(token)) {
    // Clear expired token from storage
    localStorage.removeItem("token");
    localStorage.removeItem("auth-storage");
    
    return <Navigate to="/login" replace />;
  }

  // Check role access
  const hasAccess = requireAll ? hasRole : hasAnyRole;
  
  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback || <div>403 Forbidden - Insufficient role permissions</div>;
  }

  return children;
}