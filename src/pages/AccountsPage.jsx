import React, { useState, useEffect } from "react";
import AccountForm from "../components/Account/AccountForm";
import AccountList from "../components/Account/AccountList";
import axios from "axios";

const CUSTOMER_API = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const AccountsPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [musteriNoFilter, setMusteriNoFilter] = useState("");
  const [customers, setCustomers] = useState([]); // ✅ customers state

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  // ✅ Müşterileri çek
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(CUSTOMER_API);
        setCustomers(res.data);
      } catch (err) {
        console.error("Müşteriler alınamadı:", err);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hesap Tanımlama</h2>

      <AccountForm
        onAccountAdd={handleRefresh}
        selectedAccount={selectedAccount}
        clearSelection={() => setSelectedAccount(null)}
        customers={customers} // ✅ customers props'u geçiriliyor
      />

      <hr />

      <div style={{ margin: "20px 0" }}>
        <label>
          Müşteri No ile Filtrele:{" "}
          <input
            type="text"
            value={musteriNoFilter}
            onChange={(e) => setMusteriNoFilter(e.target.value)}
            placeholder="Örn: 12345678"
          />
        </label>
      </div>

      <AccountList
        refresh={refresh}
        onEdit={(account) => setSelectedAccount(account)}
        musteriNoFilter={musteriNoFilter}
      />
    </div>
  );
};

export default AccountsPage;
