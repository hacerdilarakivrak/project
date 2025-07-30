import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io";

const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");

  useEffect(() => {
    fetchTransactions();
    fetchCustomers();
  }, [refresh]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("İşlemler alınamadı:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
    }
  };

  const startEditing = (transaction) => {
    setEditingTransaction(transaction);
    setUpdatedAmount(transaction.amount);
    setUpdatedDescription(transaction.description);
  };

  const updateTransaction = async () => {
    try {
      await axios.put(`${API_URL}/transactions/${editingTransaction.id}`, {
        ...editingTransaction,
        amount: updatedAmount,
        description: updatedDescription,
      });
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Güncelleme başarısız:", error);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    filterType === "all" ? true : t.type === filterType
  );

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Bilinmeyen Müşteri";
  };

  return (
    <div>
      {/* Sadece liste olacak */}
      <div style={{ marginBottom: "10px" }}>
        <label>Filtrele: </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
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
                {t.type} - {t.amount} TL - {t.description} ({t.date}) -{" "}
                <strong>{getCustomerName(t.customerId)}</strong>
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




