import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session token on mount
  useEffect(() => {
    const checkSession = async () => {
      if (token && !user) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          // Only clear the session on explicit authentication errors (401/403)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            handleLogout();
          }
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [token, user]);

  // Listen for global auth-unauthorized events from api response interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email ? email.trim().toLowerCase() : "";
      const params = new URLSearchParams();
      params.append("username", cleanEmail);
      params.append("password", password);

      const res = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = res.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      
      // Fetch user profile
      const userRes = await api.get("/auth/me");
      setUser(userRes.data);
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || "Failed to log in. Please verify your credentials.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const handleRegister = async (email, name, password) => {
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email ? email.trim().toLowerCase() : "";
      await api.post("/auth/register", {
        email: cleanEmail,
        full_name: name ? name.trim() : "",
        password,
      });
      setLoading(false);
      return await handleLogin(cleanEmail, password);
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || "Registration failed. Verify credentials.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be executed within an AuthProvider");
  }
  return context;
}
