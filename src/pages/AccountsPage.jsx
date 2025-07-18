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

  // Hesapları çek
  const fetchAccounts = async () => {
    const response = await axios.get(API_URL);
    setAccounts(response.data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Hesap ekle
  const handleAddAccount = async () => {
    await axios.post(API_URL, newAccount);
    fetchAccounts(); // Listeyi güncelle
  };

  // Hesap sil
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchAccounts(); // Listeyi güncelle
  };

  return (
    <div>
      <h2>Hesap Tanımlama</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Müşteri No"
          value={newAccount.musteriNo}
          onChange={(e) => setNewAccount({ ...newAccount, musteriNo: e.target.value })}
        />
        <input
          placeholder="Ek No"
          value={newAccount.ekNo}
          onChange={(e) => setNewAccount({ ...newAccount, ekNo: e.target.value })}
        />
        <input
          type="date"
          value={newAccount.kayitTarihi}
          onChange={(e) => setNewAccount({ ...newAccount, kayitTarihi: e.target.value })}
        />
        <input
          placeholder="Kayıt Durumu (açık/kapalı)"
          value={newAccount.kayitDurumu}
          onChange={(e) => setNewAccount({ ...newAccount, kayitDurumu: e.target.value })}
        />
        <input
          placeholder="Hesap Adı"
          value={newAccount.hesapAdi}
          onChange={(e) => setNewAccount({ ...newAccount, hesapAdi: e.target.value })}
        />
        <input
          placeholder="Döviz Kodu"
          value={newAccount.dovizKodu}
          onChange={(e) => setNewAccount({ ...newAccount, dovizKodu: e.target.value })}
        />
        <input
          type="number"
          placeholder="Bakiye"
          value={newAccount.bakiyeTutar}
          onChange={(e) => setNewAccount({ ...newAccount, bakiyeTutar: e.target.value })}
        />
        <input
          type="number"
          placeholder="Bloke"
          value={newAccount.blokeTutar}
          onChange={(e) => setNewAccount({ ...newAccount, blokeTutar: e.target.value })}
        />
        <input
          type="number"
          placeholder="Faiz Oranı"
          value={newAccount.faizOrani}
          onChange={(e) => setNewAccount({ ...newAccount, faizOrani: e.target.value })}
        />
        <input
          placeholder="IBAN"
          value={newAccount.iban}
          onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value })}
        />
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
              <td>{acc.dovizKodu}</td>
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

