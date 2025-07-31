import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main
        style={{
          width: "100vw",               
          overflowX: "hidden",          
          minHeight: "calc(100vh - 80px)",
          backgroundColor: "#2c2c2c",
          color: "#fff",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
