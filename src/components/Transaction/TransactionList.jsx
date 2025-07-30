import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/transactions";


const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await axios.get(API_URL);
      setTransactions(response.data);
    };
    fetchTransactions();
  }, [refresh]);

  return (
    <ul>
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          {transaction.amount} TL - {transaction.description}
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;



