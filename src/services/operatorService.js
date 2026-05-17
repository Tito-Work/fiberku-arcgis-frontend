import axiosClient from "./axiosClient";

export const operatorService = {
  async getOperators() {
    const response = await axiosClient.get("/api/v1/operators");

    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response?.data?.data === undefined) {
      return [];
    } else {
      console.log("Unexpected response structure:", response);
      return [];
    }
  },

  async createOperator(data) {
    const response = await axiosClient.post("/api/v1/operators", data);
    return response.data;
  },

  async updateOperator(id, data) {
    const response = await axiosClient.put(`/api/v1/operators/${id}`, data);
    return response.data;
  },

  async deleteOperator(id) {
    const response = await axiosClient.delete(`/api/v1/operators/${id}`);
    return response;
  },
};
