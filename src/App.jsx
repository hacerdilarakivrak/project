import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CustomersPage from "./pages/CustomersPage";
import AccountsPage from "./pages/AccountsPage";
import WorkplacesPage from "./pages/WorkplacesPage";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import ExchangeRatesPage from "./pages/ExchangeRatesPage";
import LoansPage from "./pages/LoansPage";
import Layout from "./components/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Login ve AuthContext importları
import LoginPage from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

// PrivateRoute bileşeni
function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div>Oturum kontrol ediliyor...</div>;
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Private Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/workplaces" element={<WorkplacesPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/exchange-rates" element={<ExchangeRatesPage />} />
                    <Route path="/loans" element={<LoansPage />} />
                  </Routes>
                  <ToastContainer position="top-right" autoClose={3000} />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


