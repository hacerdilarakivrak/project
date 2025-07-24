import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // ← Yeni eklenen ana sayfa
import CustomersPage from "./pages/CustomersPage";
import AccountsPage from "./pages/AccountsPage";
import WorkplacesPage from "./pages/WorkplacesPage";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />               {/* Ana sayfa */}
          <Route path="/customers" element={<CustomersPage />} /> {/* Müşteri işlemleri */}
          <Route path="/accounts" element={<AccountsPage />} />   {/* Hesap tanımlama */}
          <Route path="/workplaces" element={<WorkplacesPage />} /> {/* İşyeri tanımlama */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

