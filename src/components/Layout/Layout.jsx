// src/components/Layout/Layout.jsx
import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ padding: "20px" }}>
        {children}
      </main>
    </>
  );
};

export default Layout;
