import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Oturum kapatıldı");
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        backgroundColor: "#000",
        borderBottom: "1px solid #444",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "20px", color: "#fff" }}>
        <NavLink to="/" style={{ textDecoration: "none", color: "#fff" }}>
          X Bankası
        </NavLink>
      </div>

      <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <NavLink to="/dashboard" style={getLinkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/customers" style={getLinkStyle}>
          Müşteri İşlemleri
        </NavLink>
        <NavLink to="/accounts" style={getLinkStyle}>
          Hesap Tanımlama
        </NavLink>
        <NavLink to="/workplaces" style={getLinkStyle}>
          İşyeri Tanımlama
        </NavLink>

        {/* ✅ Yeni: Terminal Yönetimi */}
        <NavLink to="/terminals" style={getLinkStyle}>
          Terminal Yönetimi
        </NavLink>

        <NavLink to="/transactions" style={getLinkStyle}>
          İşlemler
        </NavLink>
        <NavLink to="/exchange-rates" style={getLinkStyle}>
          Döviz Kurları
        </NavLink>
        <NavLink to="/loans" style={getLinkStyle}>
          Kredi ve Mevduat
        </NavLink>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
            <span style={{ color: "#fff", opacity: 0.9 }}>👤 {user.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid #fff",
                color: "#fff",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Çıkış
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

const getLinkStyle = ({ isActive }) => ({
  textDecoration: "none",
  color: isActive ? "#00C49F" : "#fff",
  fontWeight: "bold",
  fontSize: "16px",
  borderBottom: isActive ? "2px solid #00C49F" : "none",
  paddingBottom: "2px",
});

export default Header;

