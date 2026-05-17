import axiosClient from "./axiosClient";

export const packageService = {
  async getPackages() {
    const response = await axiosClient.get("/api/v1/packages");
    
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
};