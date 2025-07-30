import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/transactions";


const TransactionForm = ({ onTransactionAdded }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, { amount, description });
    setAmount("");
    setDescription("");
    onTransactionAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Tutar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Açıklama"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">İşlem Ekle</button>
    </form>
  );
};

export default TransactionForm;


