// src/components/Layout/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header style={{ padding: "15px", background: "#f0f0f0", marginBottom: "20px" }}>
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link to="/">Müşteri İşlemleri</Link>
        <Link to="/accounts">Hesap Tanımlama</Link>
        {/* İleride işyeri tanımlama da ekleyebiliriz */}
      </nav>
    </header>
  );
};

export default Header;
