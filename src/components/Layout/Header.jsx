import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
        marginBottom: "20px",
      }}
    >
      {/* Sol logo veya başlık (Ana Sayfaya Link) */}
      <div style={{ fontWeight: "bold", fontSize: "20px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
          Ziraat Bankası
        </Link>
      </div>

      {/* Sağ menü */}
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link to="/customers" style={linkStyle}>Müşteri İşlemleri</Link>
        <Link to="/accounts" style={linkStyle}>Hesap Tanımlama</Link>
        <Link to="/workplaces" style={linkStyle}>İşyeri Tanımlama</Link>
      </nav>
    </header>
  );
};

const linkStyle = {
  textDecoration: "none",
  color: "#4b4bff",
  fontWeight: "bold",
  fontSize: "16px",
};

export default Header;


