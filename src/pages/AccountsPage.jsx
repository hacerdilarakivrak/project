import React, { useState } from "react";
import AccountForm from "../components/Account/AccountForm";
import AccountList from "../components/Account/AccountList";

const AccountsPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [musteriNoFilter, setMusteriNoFilter] = useState(""); // ✅ filtre state

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hesap Tanımlama</h2>

      <AccountForm
        onAccountAdded={handleRefresh}
        selectedAccount={selectedAccount}
        clearSelectedAccount={() => setSelectedAccount(null)}
      />

      <hr />

      {/* ✅ Filtreleme inputu */}
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

      {/* ✅ Filtrelenmiş liste */}
      <AccountList
        refresh={refresh}
        onEdit={(account) => setSelectedAccount(account)}
        musteriNoFilter={musteriNoFilter}
      />
    </div>
  );
};

export default AccountsPage;
