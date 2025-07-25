import React from "react";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e1e 40%, #2d2d2d 100%)",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Üst Başlık Panel */}
      <header
        style={{
          backgroundColor: "#9e0b0f",
          padding: "20px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Ziraat Bankası Uygulama Paneli
      </header>

      {/* İçerik - Animasyonlu */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          textAlign: "center",
          paddingTop: "100px",
        }}
      >
        <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>Hoş Geldiniz</h2>
        <p style={{ fontSize: "18px", color: "#ccc" }}>
          Sağ üstten bir işlem seçerek devam edebilirsiniz.
        </p>
      </motion.section>

      {/* Animasyonlu arka plan simgesi (basit desen efekti) */}
      <motion.div
        animate={{ x: [0, 20, -20, 0], y: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, #9e0b0f30, transparent 70%)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      ></motion.div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#111",
          padding: "16px",
          textAlign: "center",
          fontSize: "14px",
          color: "#aaa",
          position: "absolute",
          width: "100%",
          bottom: 0,
        }}
      >
        © 2025 Ziraat Bankası Projesi
      </footer>
    </div>
  );
};

export default HomePage;








