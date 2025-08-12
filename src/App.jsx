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

// Auth
import { AuthProvider } from "./context/AuthContext.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toast her sayfada (login dahil) */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Public: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected: Layout içinde tüm sayfalar */}
          <Route
            path="/"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <HomePage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <CustomersPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/accounts"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <AccountsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/workplaces"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <WorkplacesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <TransactionsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/exchange-rates"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <ExchangeRatesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/loans"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <LoansPage />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* olmayan yollar */}
          <Route
            path="*"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Navigate to="/" replace />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;






