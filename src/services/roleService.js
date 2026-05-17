import api from "./axiosClient";

export const roleService = {
  // Get all roles
  getRoles: async () => {
    try {
      const response = await api.get("/api/v1/roles");
      return response;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/api/v1/roles/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await api.post("/api/v1/roles", roleData);
      return response;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/api/v1/roles/${id}`, roleData);
      return response;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/api/v1/roles/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },

  // Get all permissions
  getPermissions: async () => {
    try {
      const response = await api.get("/api/v1/permissions");
      return response;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },

  // Get permission by ID
  getPermissionById: async (id) => {
    try {
      const response = await api.get(`/api/v1/permissions/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching permission:", error);
      throw error;
    }
  },

  // Create new permission
  createPermission: async (permissionData) => {
    try {
      const response = await api.post("/api/v1/permissions", permissionData);
      return response;
    } catch (error) {
      console.error("Error creating permission:", error);
      throw error;
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      const response = await api.put(`/api/v1/permissions/${id}`, permissionData);
      return response;
    } catch (error) {
      console.error("Error updating permission:", error);
      throw error;
    }
  },

  // Delete permission
  deletePermission: async (id) => {
    try {
      const response = await api.delete(`/api/v1/permissions/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting permission:", error);
      throw error;
    }
  },

  // Get role permissions
  getRolePermissions: async (roleId) => {
    try {
      const response = await api.get(`/api/v1/roles/${roleId}/permissions`);
      return response;
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      throw error;
    }
  },

  // Assign permission to role
  assignPermissionToRole: async (roleId, permissionId) => {
    try {
      const response = await api.post(`/api/v1/roles/${roleId}/permissions/${permissionId}`);
      return response;
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      throw error;
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const response = await api.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`);
      return response;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      throw error;
    }
  }
};
