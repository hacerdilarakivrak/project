import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1";

const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("İşlemler alınırken hata oluştu:", error);
    }
  };

  return (
    <div className="transaction-list">
      <h2>İşlem Listesi</h2>
      <table>
        <thead>
          <tr>
            <th>Hesap ID</th>
            <th>İşlem Türü</th>
            <th>Tutar</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.accountID}</td>
              <td>{transaction.type}</td>
              <td>{transaction.amount} ₺</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;





