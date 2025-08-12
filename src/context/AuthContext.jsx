import React, { createContext, useContext, useEffect, useState } from "react";

function read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function getSession() { return read("session", null); }
function setSession(s) { write("session", s); }
function clearSession() { localStorage.removeItem("session"); }

function getUsers() { return read("users", []); }
function saveUsers(u) { write("users", u); }

async function hashPassword(pw, salt) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(pw + salt));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

const fold = (s) => s.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
const norm = (s) => fold((s ?? "").trim().toLocaleLowerCase("tr"));

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setUser(getSession()); setLoading(false); }, []);

  const login = async (username, password) => {
    const users = getUsers();
    const typed = norm(username);
    const u = users.find(x => norm(x.username) === typed);
    if (!u) throw new Error("Kullanıcı bulunamadı.");
    const tryHash = await hashPassword(password, u.salt);
    if (tryHash !== u.passHash) throw new Error("Şifre hatalı.");
    setSession({ username: u.username, ts: Date.now() });
    setUser(getSession());
  };

  const register = async (username, password) => {
    const users = getUsers();
    const uname = norm(username);
    if (!uname || !password) throw new Error("Kullanıcı adı ve şifre gerekli.");
    if (users.find(u => norm(u.username) === uname)) throw new Error("Bu kullanıcı zaten var.");
    const salt = crypto.getRandomValues(new Uint8Array(16)).join("-");
    const passHash = await hashPassword(password, salt);
    users.push({ username: uname, salt, passHash, createdAt: Date.now() });
    saveUsers(users);
    await login(uname, password);
  };

  const logout = () => { clearSession(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
