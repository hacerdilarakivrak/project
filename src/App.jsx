import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomersPage from "./pages/CustomersPage";
import AccountsPage from "./pages/AccountsPage";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

