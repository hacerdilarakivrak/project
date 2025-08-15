import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CustomPrevArrow = ({ onClick }) => (
  <div
    style={{
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      fontSize: "30px",
      cursor: "pointer",
      color: "#fff",
      userSelect: "none",
    }}
    onClick={onClick}
  >
    ‹
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div
    style={{
      position: "absolute",
      right: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      fontSize: "30px",
      cursor: "pointer",
      color: "#fff",
      userSelect: "none",
    }}
    onClick={onClick}
  >
    ›
  </div>
);

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
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        backgroundColor: "#1e1e1e",
        color: "#fff",
      }}
    >
      <div
        style={{
          backgroundColor: "#9e0b0f",
          padding: "20px 0",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        X Bankası Yönetim Paneli
      </div>

      <div style={{ width: "100%", margin: 0, padding: 0 }}>
        <Slider {...sliderSettings}>
          {bannerImages.map((src, index) => (
            <div key={index}>
              <img
                src={src}
                alt={`Slider ${index + 1}`}
                style={{
                  width: "100vw",
                  height: "90vh",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </Slider>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          textAlign: "center",
          marginTop: "60px",
        }}
      >
        <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>Hoş Geldiniz</h2>
        <p style={{ fontSize: "18px", color: "#ccc" }}>
          Sağ üstten bir işlem seçerek devam edebilirsiniz.
        </p>
      </motion.section>

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

      <footer
        style={{
          backgroundColor: "#111",
          padding: "16px",
          textAlign: "center",
          fontSize: "14px",
          color: "#aaa",
          marginTop: "80px",
        }}
      >
        © 2025 X Bank Project by Hacer Dilara Kıvrak
      </footer>
    </div>
  );
};

export default HomePage;
