import axios from "axios";
import axiosClient from "./axiosClient";

export const login = async ({ username, password }) => {
  const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await axios.post(
    `${baseURL}/api/v1/auth/login`,
    form,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data;
};

/**
 * Fetch user profile with roles and permissions
 */
export const getUserProfile = async () => {
  try {
    const res = await axiosClient.get(`/api/v1/users/me`);
    return res;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

/**
 * Fetch user roles and permissions separately
 */
export const getUserRoles = async () => {
  try {
    const res = await axiosClient.get(`/api/v1/users/me/roles`);
    return res;
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    throw error;
  }
};

/**
 * Fetch user permissions
 */
export const getUserPermissions = async () => {
  try {
    const res = await axiosClient.get(`/api/v1/users/me/permissions`);
    return res;
  } catch (error) {
    console.error("Failed to fetch user permissions:", error);
    throw error;
  }
};

/**
 * Complete authentication with roles and permissions
 */
export const authenticateWithPermissions = async ({ username, password }) => {
  try {
    // Login now returns user data with roles and permissions in the response
    const loginResponse = await login({ username, password });
    
    // Handle the new response structure: { status, code, message, data: { access_token, token_type, user } }
    const responseData = loginResponse.data || loginResponse;
    const token = responseData.access_token;
    const user = responseData.user;
    
    // Set the token in axiosClient before making authenticated requests
    axiosClient.setToken(token);
    
    // Extract roles and permissions from the user object in login response
    let roles = [];
    let permissions = [];
    
    if (user?.roles && Array.isArray(user.roles)) {
      roles = user.roles.map(role => role.name || role);
    }
    
    if (user?.permissions && Array.isArray(user.permissions)) {
      permissions = user.permissions.map(perm => perm.name || perm);
    }
    
    // If no roles/permissions in login response, try separate endpoints
    if (roles.length === 0) {
      try {
        const rolesResponse = await getUserRoles();
        if (rolesResponse.data) {
          roles = Array.isArray(rolesResponse.data) 
            ? rolesResponse.data.map(role => role.name || role)
            : rolesResponse.data.roles?.map(role => role.name || role) || [];
        }
      } catch (err) {
        console.warn("Could not fetch roles from separate endpoint:", err.response?.status || err.message);
      }
    }
    
    if (permissions.length === 0) {
      try {
        const permissionsResponse = await getUserPermissions();
        if (permissionsResponse.data) {
          permissions = Array.isArray(permissionsResponse.data)
            ? permissionsResponse.data.map(perm => perm.name || perm)
            : permissionsResponse.data.permissions?.map(perm => perm.name || perm) || [];
        }
      } catch (err) {
        console.warn("Could not fetch permissions from separate endpoint:", err.response?.status || err.message);
      }
    }
    
    // If still no permissions, assign default permissions based on roles
    if (permissions.length === 0 && roles.length > 0) {
      permissions = getDefaultPermissionsForRoles(roles);
    }
    
    const result = {
      user: user,
      token: token,
      roles,
      permissions
    };
    
    return result;
    
  } catch (error) {
    console.error("Authentication with permissions failed:", error);
    throw error;
  }
};

/**
 * Refresh user permissions (useful after role changes)
 */
export const refreshPermissions = async () => {
  try {
    const [rolesResponse, permissionsResponse] = await Promise.all([
      getUserRoles(),
      getUserPermissions()
    ]);
    
    const roles = rolesResponse.data?.map(role => role.name || role) || [];
    const permissions = permissionsResponse.data?.map(perm => perm.name || perm) || [];
    
    return { roles, permissions };
  } catch (error) {
    console.error("Failed to refresh permissions:", error);
    throw error;
  }
};

/**
 * Check if user has specific permission (server-side validation)
 */
export const checkPermission = async (permission) => {
  try {
    const res = await axiosClient.post(`/api/v1/auth/check-permission`, { permission });
    return res.data?.has_permission || false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};