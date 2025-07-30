import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/transactions";

const TransactionForm = ({ onTransactionAdded }) => {
  const [tutar, setTutar] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tur, setTur] = useState("Para Yatırma");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutar || !aciklama) return;

    await axios.post(API_URL, {
      amount: tutar,
      description: aciklama,
      type: tur,
      date: new Date().toLocaleString(),
    });

    setTutar("");
    setAciklama("");
    setTur("Para Yatırma");
    onTransactionAdded();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="number"
        placeholder="Tutar"
        value={tutar}
        onChange={(e) => setTutar(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="text"
        placeholder="Açıklama"
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <select
        value={tur}
        onChange={(e) => setTur(e.target.value)}
        style={{ marginRight: "10px" }}
      >
        <option value="Para Yatırma">Para Yatırma</option>
        <option value="Para Çekme">Para Çekme</option>
      </select>
      <button type="submit">İşlem Ekle</button>
    </form>
  );
};

export default TransactionForm;



