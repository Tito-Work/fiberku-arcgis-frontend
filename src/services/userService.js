import api from "./axiosClient";

export const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get("/api/v1/users");
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/v1/users/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post("/api/v1/users", userData);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/api/v1/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/v1/users/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
};
