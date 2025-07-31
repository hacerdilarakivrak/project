import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";

const TransactionForm = ({ onTransactionAdded }) => {
  const [hesaplar, setHesaplar] = useState([]);
  const [hesapID, setHesapID] = useState("");
  const [tur, setTur] = useState("paraYatirma");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState("");
  const [aciklama, setAciklama] = useState("");

  useEffect(() => {
    axios
      .get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts")
      .then((res) => setHesaplar(res.data))
      .catch((err) => console.error(err));
  }, []);

  const seciliHesap = hesaplar.find((h) => h.id === hesapID);
  const musteriID = seciliHesap ? seciliHesap.musteriNo : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const yeniIslem = {
      hesapID: Number(hesapID),
      tur,
      tutar: Number(tutar),
      tarih,
      musteriID: Number(musteriID),
      aciklama,
      bakiyeSonrasi: 0
    };

    try {
      await axios.post(API_URL, yeniIslem);
      onTransactionAdded();
      setHesapID("");
      setTur("paraYatirma");
      setTutar("");
      setTarih("");
      setAciklama("");
    } catch (err) {
      console.error("İşlem eklenirken hata oluştu:", err);
    }
  };

  return (
    <div>
      <h2>Yeni İşlem Ekle</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={hesapID}
          onChange={(e) => setHesapID(e.target.value)}
          required
        >
          <option value="">Hesap Seçin</option>
          {hesaplar.map((h) => (
            <option key={h.id} value={h.id}>
              {h.hesapAdi}
            </option>
          ))}
        </select>

        <select value={tur} onChange={(e) => setTur(e.target.value)}>
          <option value="paraYatirma">Para Yatırma</option>
          <option value="paraCekme">Para Çekme</option>
        </select>

        <input
          type="number"
          placeholder="Tutar"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          required
        />

        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Açıklama"
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
        />

        <button type="submit">İşlemi Kaydet</button>
      </form>
    </div>
  );
};

export default TransactionForm;
