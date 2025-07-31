import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1";

const TransactionForm = ({ onTransactionAdded }) => {
  const [accounts, setAccounts] = useState([]);
  const [accountID, setAccountID] = useState("");
  const [type, setType] = useState("deposit"); // deposit veya withdraw
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      console.log("API'den gelen hesaplar:", response.data); // <-- Debug için eklendi
      setAccounts(response.data);
    } catch (error) {
      console.error("Hesaplar alınırken hata oluştu:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountID || !type || !amount || !date) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const newTransaction = { accountID, type, amount: parseFloat(amount), date };
      await axios.post(`${API_URL}/transactions`, newTransaction);
      onTransactionAdded();
      setAccountID("");
      setType("deposit");
      setAmount("");
      setDate("");
    } catch (error) {
      console.error("İşlem eklenirken hata oluştu:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h2>Yeni İşlem Ekle</h2>
      
      <label>Hesap Seç</label>
      <select value={accountID} onChange={(e) => setAccountID(e.target.value)}>
        <option value="">Hesap Seçin</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.accountNumber || acc.id} - {acc.balance}₺
          </option>
        ))}
      </select>

      <label>İşlem Türü</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="deposit">Para Yatırma</option>
        <option value="withdraw">Para Çekme</option>
      </select>

      <label>Tutar</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label>Tarih</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button type="submit">İşlemi Kaydet</button>
    </form>
  );
};

export default TransactionForm;



