import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getToken = () => useAuthStore.getState().token;
const getRefreshToken = () => useAuthStore.getState().refreshToken;

class AxiosClient {
  constructor() {
    this.baseURL = baseURL;
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

    // RESPONSE with token refresh
    this.axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;
        const status = err.response?.status;

        // If 401 and not already retried, try to refresh token
        if (status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshToken = getRefreshToken();
          
          if (refreshToken) {
            try {
              // Call refresh endpoint
              const res = await axios.post(
                `${this.baseURL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              
              const responseData = res.data?.data || res.data;
              const newAccessToken = responseData.access_token;
              const newRefreshToken = responseData.refresh_token;
              
              // Update tokens in store
              useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
              
              // Update the failed request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              
              // Retry the original request
              return this.axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed - logout user
              console.error("Token refresh failed:", refreshError);
              useAuthStore.getState().logout();
              window.location.href = "/login";
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token - logout
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }
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
  setToken(token, refreshToken = null) {
    this.token = token;
    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
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