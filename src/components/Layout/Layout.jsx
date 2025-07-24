// src/components/Layout/Layout.jsx
import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main
        style={{
          padding: "20px",
          maxWidth: "1200px",     // İçerik genişliğini sınırla
          margin: "0 auto",       // Ortalamak için
          overflowX: "auto",      // Taşma olursa yatay scroll göster
          minHeight: "calc(100vh - 80px)" // Sayfa boyunu dengeler (isteğe bağlı)
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;

