export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password + salt));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function getUsers() {
  return read("users", []);
}

export function saveUsers(users) {
  write("users", users);
}

export function getSession() {
  return read("session", null);
}

export function setSession(s) {
  write("session", s);
}

export function clearSession() {
  localStorage.removeItem("session");
}

function getAttempts() {
  return read("loginAttempts", {});
}

function saveAttempts(a) {
  write("loginAttempts", a);
}

export function canAttempt(username) {
  const a = getAttempts()[username] || { count: 0, ts: 0 };
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  if (now - a.ts > windowMs) return true;
  return a.count < 5;
}

export function recordAttempt(username, ok) {
  const all = getAttempts();
  const cur = all[username] || { count: 0, ts: 0 };
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  if (now - cur.ts > windowMs) {
    cur.count = 0;
    cur.ts = now;
  }
  if (!ok) {
    cur.count += 1;
    cur.ts = now;
  } else {
    cur.count = 0;
    cur.ts = now;
  }
  all[username] = cur;
  saveAttempts(all);
}

export async function register(username, password) {
  const users = getUsers();
  if (!username?.trim() || !password) throw new Error("Kullanıcı adı ve şifre gerekli.");
  if (users.find(u => u.username === username)) throw new Error("Bu kullanıcı zaten var.");
  const salt = crypto.getRandomValues(new Uint8Array(16)).join("-");
  const passHash = await hashPassword(password, salt);
  users.push({ username, salt, passHash, createdAt: Date.now() });
  saveUsers(users);
}

export async function login(username, password) {
  if (!canAttempt(username)) throw new Error("Çok fazla deneme. Lütfen sonra tekrar deneyin.");
  const users = getUsers();
  const u = users.find(x => x.username === username);
  if (!u) {
    recordAttempt(username, false);
    throw new Error("Kullanıcı bulunamadı.");
  }
  const tryHash = await hashPassword(password, u.salt);
  const ok = tryHash === u.passHash;
  recordAttempt(username, ok);
  if (!ok) throw new Error("Şifre hatalı.");
  setSession({ username, ts: Date.now() });
}

export async function changePassword(username, oldPassword, newPassword) {
  const users = getUsers();
  const u = users.find(x => x.username === username);
  if (!u) throw new Error("Kullanıcı bulunamadı.");
  const oldHash = await hashPassword(oldPassword, u.salt);
  if (oldHash !== u.passHash) throw new Error("Eski şifre yanlış.");
  const newSalt = crypto.getRandomValues(new Uint8Array(16)).join("-");
  const newHash = await hashPassword(newPassword, newSalt);
  u.salt = newSalt;
  u.passHash = newHash;
  saveUsers(users);
}
