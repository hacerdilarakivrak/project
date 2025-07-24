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
        backgroundColor: "#000", // siyah üst bar
        borderBottom: "1px solid #444",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "20px", color: "#fff" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
          Ziraat Bankası
        </Link>
      </div>

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
  color: "#fff",
  fontWeight: "bold",
  fontSize: "16px",
};

export default Header;






