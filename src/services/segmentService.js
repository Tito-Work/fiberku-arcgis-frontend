import axiosClient from "./axiosClient";

export const segmentService = {
  async getSegments() {
    const response = await axiosClient.get("/api/v1/segments");

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

  async createSegment(data) {
    const response = await axiosClient.post("/api/v1/segments", data);
    return response.data;
  },

  async updateSegment(id, data) {
    const response = await axiosClient.put(`/api/v1/segments/${id}`, data);
    return response.data;
  },

  async deleteSegment(id) {
    const response = await axiosClient.delete(`/api/v1/segments/${id}`);
    return response;
  },
};
