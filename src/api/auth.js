export const API_BASE = "";

function read(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function getUsers() { return read("users", []); }
function saveUsers(u) { write("users", u); }
function getSession() { return read("session", null); }
function setSession(s) { write("session", s); }

async function hashPassword(pw, salt) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(pw + salt));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function register(username, password) {
  const users = getUsers();
  if (users.find(u => u.username === username)) throw new Error("User exists");
  const salt = crypto.getRandomValues(new Uint8Array(16)).join("-");
  const passHash = await hashPassword(password, salt);
  users.push({ username, salt, passHash, createdAt: Date.now() });
  saveUsers(users);
  setSession({ username, ts: Date.now(), token: "local-token" });
  return { ok: true };
}

export async function login(username, password) {
  const users = getUsers();
  const u = users.find(x => x.username === username);
  if (!u) throw new Error("User not found");
  const tryHash = await hashPassword(password, u.salt);
  if (tryHash !== u.passHash) throw new Error("Wrong password");
  setSession({ username, ts: Date.now(), token: "local-token" });
  return { ok: true };
}

export async function getProfile() {
  const s = getSession();
  if (!s) throw new Error("No session");
  return { username: s.username };
}
