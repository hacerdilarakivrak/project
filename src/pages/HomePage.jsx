import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Özel sol buton
const CustomPrevArrow = ({ onClick }) => (
  <div
    style={{
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      fontSize: "30px",
      cursor: "pointer",
      color: "#fff",
    }}
    onClick={onClick}
  >
    ‹
  </div>
);

// Özel sağ buton
const CustomNextArrow = ({ onClick }) => (
  <div
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      fontSize: "30px",
      cursor: "pointer",
      color: "#fff",
    }}
    onClick={onClick}
  >
    ›
  </div>
);

// Slider ayarları
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: true,
  nextArrow: <CustomNextArrow />,
  prevArrow: <CustomPrevArrow />,
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
        color: "#fff",
        position: "relative",
        overflowX: "hidden",
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

      {/* Slider Alanı */}
      <div
        style={{
          maxWidth: "96vw",
          margin: "0 auto",
          padding: "0 10px",
          zIndex: 2,
        }}
      >
        <Slider {...sliderSettings}>
          {bannerImages.map((src, index) => (
            <div key={index}>
              <img
                src={src}
                alt={`Slider ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100vh",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Hoş Geldiniz metni */}
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

      {/* Kırmızı daire animasyonu */}
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
















