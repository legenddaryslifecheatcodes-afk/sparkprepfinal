import { createContext, useContext, useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // The 24-hour Open House (backend open_house.py): free for everyone, no sign-up. null until known.
  const [openHouse, setOpenHouse] = useState(null);

  useEffect(() => {
    api.get("/open-house").then(({ data }) => setOpenHouse(data)).catch(() => setOpenHouse({ active: false }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        setUser(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("sp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    const { data } = await api.post("/auth/register", { email, password, name });
    if (data.token) localStorage.setItem("sp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  // Open House only: a guest account made on the spot, so people can start without signing up.
  const startGuest = async () => {
    const { data } = await api.post("/auth/guest");
    if (data.token) localStorage.setItem("sp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  // Keeps a guest's work by giving the same account an email and password.
  const claimGuest = async (email, password, name) => {
    const { data } = await api.post("/auth/guest/claim", { email, password, name });
    if (data.token) localStorage.setItem("sp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("sp_token");
    setUser(false);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser, fmtErr, openHouse, startGuest, claimGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
