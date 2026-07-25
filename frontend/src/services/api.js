import axios from "axios";

// Central Axios Client configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

// Interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global authorization errors (401/403)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes("auth/login");
    if (!isLoginRequest && error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token from localStorage to prevent infinite redirect loops
      localStorage.removeItem("token");
      // Dispatch global event for AuthContext to handle state resets
      window.dispatchEvent(new Event("auth-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
