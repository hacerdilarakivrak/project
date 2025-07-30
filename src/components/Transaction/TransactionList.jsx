import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/transactions";

const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("all"); // Filtre türü
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");

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

  const startEditing = (transaction) => {
    setEditingTransaction(transaction);
    setUpdatedAmount(transaction.amount);
    setUpdatedDescription(transaction.description);
  };

  const updateTransaction = async () => {
    await axios.put(`${API_URL}/${editingTransaction.id}`, {
      ...editingTransaction,
      amount: updatedAmount,
      description: updatedDescription,
    });
    setEditingTransaction(null);
    fetchTransactions();
  };

  // Filtrelenmiş işlemler
  const filteredTransactions = transactions.filter((t) =>
    filterType === "all" ? true : t.type === filterType
  );

  return (
    <div>
      {/* Filtreleme dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label>Filtrele: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Tümü</option>
          <option value="Para Yatırma">Para Yatırma</option>
          <option value="Para Çekme">Para Çekme</option>
        </select>
      </div>

      <ul>
        {filteredTransactions.map((t) => (
          <li key={t.id}>
            {editingTransaction?.id === t.id ? (
              <>
                <input
                  type="number"
                  value={updatedAmount}
                  onChange={(e) => setUpdatedAmount(e.target.value)}
                />
                <input
                  type="text"
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                />
                <button onClick={updateTransaction}>Kaydet</button>
                <button onClick={() => setEditingTransaction(null)}>İptal</button>
              </>
            ) : (
              <>
                {t.type} - {t.amount} TL - {t.description} ({t.date})
                <button onClick={() => startEditing(t)}>Düzenle</button>
                <button onClick={() => deleteTransaction(t.id)}>Sil</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;








