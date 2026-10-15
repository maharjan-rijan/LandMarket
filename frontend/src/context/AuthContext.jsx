import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on page refresh
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // token may already be invalid; clear local state anyway
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  // Merge fields returned by the API (profile, role change) into the logged-in user.
  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u));

  // Reload the user from the API, for example after the server changed their role.
  const refresh = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
