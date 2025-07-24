import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          overflowX: "auto",
          minHeight: "calc(100vh - 80px)",
          backgroundColor: "#2c2c2c", // zemin gri
          color: "#fff", // yazı beyaz
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;







