import React, { useState } from "react";
import TransactionForm from "../components/Transaction/TransactionForm";
import TransactionList from "../components/Transaction/TransactionList";

const TransactionsPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleTransactionAdded = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div>
      <h1>İşlemler</h1>
      <TransactionForm onTransactionAdded={handleTransactionAdded} />
      <h2>İşlem Listesi</h2>
      <TransactionList refresh={refresh} />
    </div>
  );
};

export default TransactionsPage;



