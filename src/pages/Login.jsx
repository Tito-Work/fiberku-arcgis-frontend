import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, authenticateWithPermissions } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();

  const setAuth = useAuthStore((s) => s.setAuth);
  const setRolesAndPermissions = useAuthStore((s) => s.setRolesAndPermissions);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Try to authenticate with roles and permissions first
      try {
        const authData = await authenticateWithPermissions({ username, password });
        
        // Set user authentication data
        setAuth(authData.user, authData.token, authData.roles, authData.permissions);
        
        navigate("/map");
      } catch (rbacError) {
        console.warn("RBAC authentication failed, falling back to basic login:", rbacError);
        
        // Fallback to basic login if RBAC endpoints are not available
        const res = await login({ username, password });
        
        setAuth(res.user, res.access_token || res.token);
        
        navigate("/map");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
        {/* Project Icon */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/icon.png" 
            alt="Project Icon" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mb-3"
          />
          <h2 className="text-lg sm:text-xl font-bold text-center text-gray-900">
            Network Management System
          </h2>
        </div>
        
        {error && (
          <div className="text-red-600 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Username"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Password"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading || !username || !password}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base mb-3"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="text-xs sm:text-sm text-gray-500 text-center">
          Enter your credentials to proceed
        </div>
      </div>
    </div>
  );
}