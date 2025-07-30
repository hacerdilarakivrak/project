import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/transactions";

const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const fetchTransactions = async () => {
    const response = await axios.get(API_URL);
    setTransactions(response.data);
  };

  
  const deleteTransaction = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTransactions(); 
  };

  return (
    <div>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.type} - {t.amount} TL - {t.description} ({t.date})
            <button onClick={() => deleteTransaction(t.id)}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;






