import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      roles: [],
      permissions: [],

      setAuth: (user, token, roles = [], permissions = []) => 
        set({ user, token, roles, permissions }),

      setRolesAndPermissions: (roles, permissions) => 
        set({ roles, permissions }),

      logout: () => set({ 
        user: null, 
        token: null, 
        roles: [], 
        permissions: [] 
      }),

      // Permission checking methods
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasAnyPermission: (permissionList) => {
        const { permissions } = get();
        return permissionList.some(permission => permissions.includes(permission));
      },

      hasAllPermissions: (permissionList) => {
        const { permissions } = get();
        return permissionList.every(permission => permissions.includes(permission));
      },

      // Role checking methods
      hasRole: (role) => {
        const { roles } = get();
        return roles.includes(role);
      },

      hasAnyRole: (roleList) => {
        const { roles } = get();
        return roleList.some(role => roles.includes(role));
      },

      // Comprehensive access check
      canAccess: (requiredPermissions = [], requiredRoles = [], requireAll = false) => {
        const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = get();
        
        if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
          return true; // No restrictions
        }

        const hasPermissionAccess = requiredPermissions.length > 0 
          ? (requireAll ? hasAllPermissions(requiredPermissions) : hasAnyPermission(requiredPermissions))
          : true;

        const hasRoleAccess = requiredRoles.length > 0 
          ? hasAnyRole(requiredRoles)
          : true;

        return hasPermissionAccess && hasRoleAccess;
      },

      // Get user display info
      getUserInfo: () => {
        const { user, roles } = get();
        return {
          ...user,
          roles,
          displayName: user?.full_name || user?.username || user?.email || 'Unknown User'
        };
      }
    }),
    {
      name: "auth-storage",
    }
  )
);