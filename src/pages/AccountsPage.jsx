import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    musteriNo: "",
    ekNo: "",
    kayitTarihi: "",
    kayitDurumu: "",
    hesapAdi: "",
    dovizKodu: "",
    bakiyeTutar: 0,
    blokeTutar: 0,
    faizOrani: 0,
    iban: ""
  });

  const fetchAccounts = async () => {
    const response = await axios.get(API_URL);
    setAccounts(response.data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    await axios.post(API_URL, newAccount);
    fetchAccounts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchAccounts();
  };

  const dovizSembolleri = {
    "USD": "$",
    "EUR": "€",
    "TRY": "₺",
    "GBP": "£",
    "JPY": "¥"
  };

  return (
    <div>
      <h2>Hesap Tanımlama</h2>

      <div style={{ marginBottom: 20, display: "grid", gap: "10px" }}>
        <label>
          Müşteri No:
          <input
            value={newAccount.musteriNo}
            onChange={(e) => setNewAccount({ ...newAccount, musteriNo: e.target.value })}
          />
        </label>

        <label>
          Ek No:
          <input
            value={newAccount.ekNo}
            onChange={(e) => setNewAccount({ ...newAccount, ekNo: e.target.value })}
          />
        </label>

        <label>
          Kayıt Tarihi:
          <input
            type="date"
            value={newAccount.kayitTarihi}
            onChange={(e) => setNewAccount({ ...newAccount, kayitTarihi: e.target.value })}
          />
        </label>

        <label>
          Kayıt Durumu (açık/kapalı):
          <input
            value={newAccount.kayitDurumu}
            onChange={(e) => setNewAccount({ ...newAccount, kayitDurumu: e.target.value })}
          />
        </label>

        <label>
          Hesap Adı:
          <input
            value={newAccount.hesapAdi}
            onChange={(e) => setNewAccount({ ...newAccount, hesapAdi: e.target.value })}
          />
        </label>

        <label>
          Döviz Kodu:
          <select
            value={newAccount.dovizKodu}
            onChange={(e) => setNewAccount({ ...newAccount, dovizKodu: e.target.value })}
          >
            <option value="">Seçiniz</option>
            <option value="USD">$ - Dolar</option>
            <option value="EUR">€ - Euro</option>
            <option value="TRY">₺ - Türk Lirası</option>
            <option value="GBP">£ - Sterlin</option>
            <option value="JPY">¥ - Yen</option>
          </select>
        </label>

        <label>
          Bakiye Tutar:
          <input
            type="number"
            value={newAccount.bakiyeTutar}
            onChange={(e) => setNewAccount({ ...newAccount, bakiyeTutar: e.target.value })}
          />
        </label>

        <label>
          Bloke Tutar:
          <input
            type="number"
            value={newAccount.blokeTutar}
            onChange={(e) => setNewAccount({ ...newAccount, blokeTutar: e.target.value })}
          />
        </label>

        <label>
          Faiz Oranı:
          <input
            type="number"
            value={newAccount.faizOrani}
            onChange={(e) => setNewAccount({ ...newAccount, faizOrani: e.target.value })}
          />
        </label>

        <label>
          IBAN:
          <input
            value={newAccount.iban}
            onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value })}
          />
        </label>

        <button onClick={handleAddAccount}>Ekle</button>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Müşteri No</th>
            <th>Ek No</th>
            <th>Kayıt Tarihi</th>
            <th>Kayıt Durumu</th>
            <th>Hesap Adı</th>
            <th>Döviz Kodu</th>
            <th>Bakiye</th>
            <th>Bloke</th>
            <th>Faiz</th>
            <th>IBAN</th>
            <th>Sil</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td>{acc.musteriNo}</td>
              <td>{acc.ekNo}</td>
              <td>{acc.kayitTarihi}</td>
              <td>{acc.kayitDurumu}</td>
              <td>{acc.hesapAdi}</td>
              <td>{dovizSembolleri[acc.dovizKodu] || acc.dovizKodu}</td>
              <td>{acc.bakiyeTutar}</td>
              <td>{acc.blokeTutar}</td>
              <td>{acc.faizOrani}</td>
              <td>{acc.iban}</td>
              <td>
                <button onClick={() => handleDelete(acc.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsPage;

