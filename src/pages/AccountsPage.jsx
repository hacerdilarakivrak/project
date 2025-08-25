import React, { useState, useEffect } from "react";
import AccountForm from "../components/Account/AccountForm";
import AccountList from "../components/Account/AccountList";
import api from "../api";

const AccountsPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [musteriNoFilter, setMusteriNoFilter] = useState("");
  const [customers, setCustomers] = useState([]);

  const handleRefresh = () => setRefresh((r) => !r);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("http://localhost:5000/api/customers");
        setCustomers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Müşteriler alınamadı:", err);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#2c2c2c",
        padding: "32px 0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: ".3px",
            color: "#ffffff",
          }}
        >
          Hesap Tanımlama
        </h1>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid #3a3a3a",
            background: "#1a1a1a",
            boxShadow: "0 10px 40px rgba(0,0,0,.35)",
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <AccountForm
              onAccountAdd={handleRefresh}
              selectedAccount={selectedAccount}
              clearSelection={() => setSelectedAccount(null)}
              customers={customers}
            />
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #2f2f2f",
              margin: "8px 0 24px",
            }}
          />

          <div style={{ margin: "0 0 20px" }}>
            <label style={{ color: "#e5e7eb", fontSize: 14 }}>
              Müşteri No ile Filtrele:
            </label>
            <input
              type="text"
              value={musteriNoFilter}
              onChange={(e) => setMusteriNoFilter(e.target.value)}
              placeholder="Örn: 12345678"
              style={{
                marginLeft: 8,
                background: "#121212",
                border: "1px solid #2f2f2f",
                color: "#ffffff",
                padding: "8px 10px",
                borderRadius: 10,
                outline: "none",
              }}
            />
          </div>

          <AccountList
            refresh={refresh}
            onEdit={(account) => setSelectedAccount(account)}
            musteriNoFilter={musteriNoFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
