import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomersPage from "./pages/CustomersPage";
import AccountsPage from "./pages/AccountsPage";
import WorkplacesPage from "./pages/WorkplacesPage"; // ← Eklendi
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/workplaces" element={<WorkplacesPage />} /> {/* ← Eklendi */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
