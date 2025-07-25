import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";

// Slider ayarları
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
  pauseOnHover: true,
};

const bannerImages = [
  "/images/banner1.jpg",
  "/images/banner2.jpg",
  "/images/banner3.jpg",
];

const HomePage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e1e 40%, #2d2d2d 100%)",
        backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
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
        X Bankası Uygulama Paneli
      </header>

      {/* Slider */}
      <div style={{ maxWidth: "1000px", margin: "40px auto", zIndex: 2 }}>
        <Slider {...sliderSettings}>
          {bannerImages.map((src, index) => (
            <div key={index}>
              <img
                src={src}
                alt={`Slider ${index + 1}`}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Animasyonlu içerik */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          textAlign: "center",
          marginTop: "60px",
          zIndex: 1,
        }}
      >
        <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>Hoş Geldiniz</h2>
        <p style={{ fontSize: "18px", color: "#ccc" }}>
          Sağ üstten bir işlem seçerek devam edebilirsiniz.
        </p>
      </motion.section>

      {/* Arka planda hareketli kırmızı daire */}
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
        © 2025 X Bankası Projesi
      </footer>
    </div>
  );
};

export default HomePage;











