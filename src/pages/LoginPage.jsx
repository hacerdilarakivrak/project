import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login: doLogin, register: doRegister } = useAuth();

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const uname = username;
      if (mode === "login") {
        await doLogin(uname, password);
      } else {
        await doRegister(uname, password);
      }
      navigate("/");
    } catch (err) {
      setMsg(err?.message || "Hata oluştu.");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
      <h2 style={{ marginBottom: 12 }}>{mode === "login" ? "Giriş Yap" : "Kayıt Ol"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:8 }}
        />
        <input
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:8 }}
        />
        <button type="submit" style={{ width:"100%", padding:10 }}>
          {mode === "login" ? "Giriş" : "Kayıt"}
        </button>
      </form>
      <div style={{ marginTop: 8, fontSize: 14, minHeight: 24 }}>{msg}</div>
      <button onClick={()=>setMode(mode==="login"?"register":"login")} style={{ marginTop: 8, width:"100%", padding:10 }}>
        {mode==="login" ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
      </button>
    </div>
  );
}
