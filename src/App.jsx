import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomersPage from "./pages/CustomersPage";
import AccountsPage from "./pages/AccountsPage";
import WorkplacesPage from "./pages/WorkplacesPage";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import ExchangeRatesPage from "./pages/ExchangeRatesPage"; // ✅ Döviz kurları sayfası
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/workplaces" element={<WorkplacesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exchange-rates" element={<ExchangeRatesPage />} /> {/* ✅ Yeni ekleme */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;





