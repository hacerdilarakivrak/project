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
          maxWidth: "1200px",     
          margin: "0 auto",       
          overflowX: "auto",      
          minHeight: "calc(100vh - 80px)" 
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;

