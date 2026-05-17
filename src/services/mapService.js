import axiosClient from "./axiosClient";

export const mapService = {
  async fetchCustomers() {
    const data = await axiosClient.getCustomers();
    return data?.features || [];
  },

  async fetchFiber() {
    const data = await axiosClient.getFiberOptics();
    return data?.features || [];
  },

  async fetchCoverages() {
    const data = await axiosClient.getCoverages();
    return data?.features || [];
  },

  async createCoverage(payload) {
    return axiosClient.createCoverage(payload);
  },

  async createFiberOptic(payload) {
    return axiosClient.createFiberOptic(payload);
  },
};