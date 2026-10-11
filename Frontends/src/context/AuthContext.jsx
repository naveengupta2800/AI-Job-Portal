import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the user's existing session.
  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/auth/get-role");
      const role = response.data?.role ?? null;

      setUserRole(role);
      return role;
    } catch (error) {
      setUserRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check session when the application starts.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login an existing user.
  const login = async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    const data = response.data;

    const role = data?.role ?? data?.user?.role ?? null;

    if (role) {
      setUserRole(role);
    }

    return {
      ...data,
      role,
    };
  };

  // Register a new user.
  const register = async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  };

  // Verify the OTP sent to the user's email.
  const verifyOTP = async (otp) => {
    const response = await api.post("/api/auth/verify", { otp });
    const data = response.data;

    const role = data?.role ?? data?.user?.role ?? null;

    if (role) {
      setUserRole(role);
    }

    return {
      ...data,
      role,
    };
  };

  // Log out and clear the local authentication state.
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUserRole(null);
    }
  };

  const value = {
    userRole,
    loading,
    isAuthenticated: Boolean(userRole),
    login,
    register,
    verifyOTP,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
