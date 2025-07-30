import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io";

const TransactionForm = ({ onTransactionAdded }) => {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Para Yatırma");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    fetchCustomers();
    fetchAccounts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error("Hesaplar alınamadı:", error);
    }
  };

  const handleAddTransaction = async () => {
    if (!amount || !customerId || !accountId) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      await axios.post(`${API_URL}/transactions`, {
        amount,
        type,
        description,
        customerId,
        accountId,
        date: new Date().toLocaleDateString(),
      });

      setAmount("");
      setType("Para Yatırma");
      setDescription("");
      setCustomerId("");
      setAccountId("");

      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      console.error("İşlem eklenemedi:", error);
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Tutar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Para Yatırma">Para Yatırma</option>
        <option value="Para Çekme">Para Çekme</option>
      </select>
      <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
        <option value="">Hesap Seç</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.accountNumber}
          </option>
        ))}
      </select>
      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">Müşteri Seç</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button onClick={handleAddTransaction}>İşlem Ekle</button>
    </div>
  );
};

export default TransactionForm;
