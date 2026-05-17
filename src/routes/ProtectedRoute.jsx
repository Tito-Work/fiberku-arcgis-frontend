import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

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

export default function ProtectedRoute({ 
  children, 
  redirectTo = "/login",
  requireAuth = true 
}) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  // Check if authentication is required and token is valid
  if (requireAuth && (!token || isTokenExpired(token))) {
    // Clear expired token from storage
    localStorage.removeItem("token");
    localStorage.removeItem("auth-storage");
    
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user exists (for cases where token exists but user data is missing)
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}