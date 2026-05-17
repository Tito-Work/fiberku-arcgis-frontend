import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const getToken = () => useAuthStore.getState().token;
class AxiosClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    this.token = getToken();

    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // REQUEST
    this.axios.interceptors.request.use((config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // RESPONSE
    this.axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err.response?.status;

        if (status === 401) {
          this.clearToken();
          // window.location.href = "/login";
        }

        return Promise.reject(err);
      }
    );
  }

  async request(config) {
    try {
      const res = await this.axios.request(config);
      return res.data;
    } catch (err) {
      console.error("API ERROR:", err?.response?.data || err);
      throw err;
    }
  }

  // ======================
  // HTTP METHODS
  // ======================
  get(url, config = {}) {
    return this.request({ method: "GET", url, ...config });
  }

  post(url, data, config = {}) {
    return this.request({ method: "POST", url, data, ...config });
  }

  put(url, data, config = {}) {
    return this.request({ method: "PUT", url, data, ...config });
  }

  delete(url, config = {}) {
    return this.request({ method: "DELETE", url, ...config });
  }

  // ======================
  // AUTH
  // ======================
  setToken(token) {
    this.token = token;
    localStorage.setItem("access_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("access_token");
  }

  // ======================
  // GEO API (CLEAN VERSION)
  // ======================
  getCoverages() {
    return this.get(`/api/v1/geojson/coverages?token=${this.token}`);
  }

  createCoverage(payload) {
    return this.post("/api/v1/coverages", payload);
  }

  getCustomers() {
    return this.get(`/api/v1/geojson/customers?token=${this.token}`);
  }

  getFiberOptics() {
    return this.get(`/api/v1/geojson/fiber-optics?token=${this.token}`);
  }

  createFiberOptic(payload) {
    return this.post("/api/v1/fiber-optics", payload);
  }

  // ======================
  // BUSINESS API
  // ======================
  createCustomer(payload) {
    return this.post("/api/v1/customers", payload);
  }
  
  updateCustomer(id, payload) {
    return this.put(`/api/v1/customers/${id}`, payload);
  }
  
  deleteCustomer(id) {
    return this.delete(`/api/v1/customers/${id}`, null);
  }
  
  getPackages() {
    return this.get(`/api/v1/packages`);
  }
  
  getOperators() {
    return this.get(`/api/v1/operators`);
  }
}

export default new AxiosClient();