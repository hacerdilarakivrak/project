import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, getProfile } from "../api/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken("");
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username, password) => {
    const { token: t } = await apiLogin(username, password);
    setToken(t);
    localStorage.setItem("token", t);
    const data = await getProfile(t);
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
