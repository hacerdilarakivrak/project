import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      nav("/"); // girişten sonra ana sayfaya yönlendir
    } catch (err) {
      setError(err.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#1f2937" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
          background: "white",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Yönetim Paneli Giriş</h2>

        <label style={{ fontWeight: "bold" }}>Kullanıcı Adı</label>
        <input
          type="text"
          placeholder="Kullanıcı adınızı girin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 15,
            padding: "8px",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        />

        <label style={{ fontWeight: "bold" }}>Şifre</label>
        <input
          type="password"
          placeholder="Şifrenizi girin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 15,
            padding: "8px",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        />

        {error && <div style={{ color: "red", marginBottom: 15 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 4,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

