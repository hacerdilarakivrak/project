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

// ✅ TERMINAL sayfasını import et
import TerminalsPage from "./features/terminals/TerminalsPage";

import Layout from "./components/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Giriş */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ana sayfa */}
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

          {/* Müşteri İşlemleri */}
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

          {/* Hesap Tanımlama */}
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

          {/* İşyeri Tanımlama */}
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

          {/* İşlemler */}
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

          {/* Dashboard */}
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

          {/* Döviz Kurları */}
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

          {/* Kredi ve Mevduat */}
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

          {/* ✅ Terminaller — yeni rota */}
          <Route
            path="/terminals"
            element={
              <PrivateRoute fallback={<Navigate to="/login" replace />}>
                <Layout>
                  <TerminalsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Yakalama (fallback) */}
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

