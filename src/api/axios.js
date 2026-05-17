import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// attach token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");
      
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;