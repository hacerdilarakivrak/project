import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function PrivateRoute({ children, fallback }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Oturum kontrol ediliyor…</div>;
  return user ? children : (fallback ?? <div style={{ padding: 24 }}>Bu sayfa için giriş gerekli.</div>);
}
