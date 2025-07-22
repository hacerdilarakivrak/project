import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountForm = ({ onAccountAdded }) => {
  const [editId, setEditId] = useState(null);
  const [account, setAccount] = useState({
    musteriNo: "",
    ekNo: "",
    kayitTarihi: new Date().toISOString().split("T")[0],
    kayitDurumu: "",
    hesapAdi: "",
    dovizKodu: "",
    bakiyeTutar: "",
    blokeTutar: "",
    faizOrani: "",
    iban: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, account);
      } else {
        await axios.post(API_URL, account);
      }
      resetForm();
      onAccountAdded(); // Listeyi güncelle
    } catch (error) {
      console.error("Hesap işlemi hatası:", error);
    }
  };

  const resetForm = () => {
    setAccount({
      musteriNo: "",
      ekNo: "",
      kayitTarihi: new Date().toISOString().split("T")[0],
      kayitDurumu: "",
      hesapAdi: "",
      dovizKodu: "",
      bakiyeTutar: "",
      blokeTutar: "",
      faizOrani: "",
      iban: ""
    });
    setEditId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <input name="musteriNo" placeholder="Müşteri No" value={account.musteriNo} onChange={handleChange} />
        <input name="ekNo" placeholder="Ek No" value={account.ekNo} onChange={handleChange} />
        <input name="kayitTarihi" type="date" value={account.kayitTarihi} onChange={handleChange} />
        <select name="kayitDurumu" value={account.kayitDurumu} onChange={handleChange}>
          <option value="">Kayıt Durumu</option>
          <option value="Açık">Açık</option>
          <option value="Kapalı">Kapalı</option>
        </select>
        <input name="hesapAdi" placeholder="Hesap Adı" value={account.hesapAdi} onChange={handleChange} />
        <select name="dovizKodu" value={account.dovizKodu} onChange={handleChange}>
          <option value="">Döviz Kodu</option>
          <option value="TRY">₺ - Türk Lirası</option>
          <option value="USD">$ - Dolar</option>
          <option value="EUR">€ - Euro</option>
          <option value="GBP">£ - Sterlin</option>
          <option value="JPY">¥ - Yen</option>
        </select>
        <input name="bakiyeTutar" type="number" placeholder="Bakiye" value={account.bakiyeTutar} onChange={handleChange} />
        <input name="blokeTutar" type="number" placeholder="Bloke Tutar" value={account.blokeTutar} onChange={handleChange} />
        <input name="faizOrani" type="number" placeholder="Faiz Oranı (%)" value={account.faizOrani} onChange={handleChange} />
        <input name="iban" placeholder="IBAN" value={account.iban} onChange={handleChange} />
      </div>
      <button onClick={handleSubmit}>{editId ? "Güncelle" : "Ekle"}</button>
    </div>
  );
};

export default AccountForm;
