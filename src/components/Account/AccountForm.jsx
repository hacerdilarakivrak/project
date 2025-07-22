import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountForm = ({ onAccountAdded }) => {
  const [account, setAccount] = useState({
    musteriNo: "",
    ekNo: "",
    kayitTarihi: new Date().toISOString().slice(0, 10),
    kayitDurumu: "",
    hesapAdi: "",
    dovizKodu: "",
    bakiyeTutar: 0,
    blokeTutar: 0,
    faizOrani: 0,
    iban: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  };

  const handleSubmit = async () => {
    await axios.post(API_URL, account);
    setAccount({ ...account, ekNo: "", hesapAdi: "", dovizKodu: "", bakiyeTutar: 0, blokeTutar: 0, faizOrani: 0, iban: "" });
    onAccountAdded();
  };

  return (
    <div className="form">
      <h3>Hesap Tanımlama</h3>

      <label>Müşteri No:</label>
      <input name="musteriNo" value={account.musteriNo} onChange={handleChange} />

      <label>Ek No:</label>
      <input name="ekNo" value={account.ekNo} onChange={handleChange} />

      <label>Kayıt Durumu:</label>
      <select name="kayitDurumu" value={account.kayitDurumu} onChange={handleChange}>
        <option value="">Seçiniz</option>
        <option value="Açık">Açık</option>
        <option value="Kapalı">Kapalı</option>
      </select>

      <label>Hesap Adı:</label>
      <input name="hesapAdi" value={account.hesapAdi} onChange={handleChange} />

      <label>Döviz Kodu:</label>
      <select name="dovizKodu" value={account.dovizKodu} onChange={handleChange}>
        <option value="">Seçiniz</option>
        <option value="TRY">₺ Türk Lirası</option>
        <option value="USD">$ Dolar</option>
        <option value="EUR">€ Euro</option>
      </select>

      <label>Bakiye Tutar:</label>
      <input type="number" name="bakiyeTutar" value={account.bakiyeTutar} onChange={handleChange} />

      <label>Bloke Tutar:</label>
      <input type="number" name="blokeTutar" value={account.blokeTutar} onChange={handleChange} />

      <label>Faiz Oranı:</label>
      <input type="number" name="faizOrani" value={account.faizOrani} onChange={handleChange} />

      <label>IBAN:</label>
      <input name="iban" value={account.iban} onChange={handleChange} />

      <br />
      <button onClick={handleSubmit}>Ekle</button>
    </div>
  );
};

export default AccountForm;
