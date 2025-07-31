import React, { useState } from "react";
import TransactionForm from "../components/Transaction/TransactionForm";
import TransactionList from "../components/Transaction/TransactionList";

const TransactionsPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleTransactionAdded = (message = "İşlem başarıyla eklendi!") => {
    setRefresh((prev) => !prev);
    setNotification(message);

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>💳 İşlemler</h1>

      {notification && <div style={notificationStyle}>{notification}</div>}

      <div style={formContainerStyle}>
        <TransactionForm onTransactionAdded={handleTransactionAdded} />
      </div>

      <div style={listContainerStyle}>
        <TransactionList refresh={refresh} />
      </div>
    </div>
  );
};

const pageStyle = {
  padding: "20px",
  backgroundColor: "#1e1e1e",
  minHeight: "100vh",
  color: "#fff",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
  fontSize: "28px",
  fontWeight: "bold",
  color: "#f5f5f5",
};

const notificationStyle = {
  backgroundColor: "#4caf50",
  color: "#fff",
  padding: "10px",
  borderRadius: "4px",
  textAlign: "center",
  marginBottom: "20px",
  fontWeight: "bold",
};

const formContainerStyle = {
  backgroundColor: "#2c2c2c",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
};

const listContainerStyle = {
  backgroundColor: "#2c2c2c",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
};

export default TransactionsPage;
