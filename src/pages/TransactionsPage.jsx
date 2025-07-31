import React, { useState } from "react";
import TransactionForm from "../components/Transaction/TransactionForm";
import TransactionList from "../components/Transaction/TransactionList";

const TransactionPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleTransactionAdded = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="transaction-page">
      <TransactionForm onTransactionAdded={handleTransactionAdded} />
      <TransactionList refresh={refresh} />
    </div>
  );
};

export default TransactionPage;


