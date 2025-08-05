import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
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

      <nav style={{ display: "flex", gap: "20px" }}>
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
        <NavLink to="/transactions" style={getLinkStyle}>
          İşlemler
        </NavLink>
        <NavLink to="/exchange-rates" style={getLinkStyle}>
          Döviz Kurları
        </NavLink>
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
