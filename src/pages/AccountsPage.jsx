import React, { useState } from "react";
import AccountForm from "../components/Account/AccountForm";
import AccountList from "../components/Account/AccountList";

const AccountsPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hesap Tanımlama</h2>
      <AccountForm onAccountAdded={handleRefresh} />
      <hr />
      <AccountList refresh={refresh} />
    </div>
  );
};

export default AccountsPage;
