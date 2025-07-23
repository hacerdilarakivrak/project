import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountList = ({ refresh, onEdit, musteriNoFilter }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, [refresh]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(API_URL);
      setAccounts(response.data);
    } catch (error) {
      console.error("Veriler alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchAccounts();
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
    }
  };

  // ✅ Müşteri No filtresi uygulama
  const filteredAccounts = musteriNoFilter
    ? accounts.filter((acc) => acc.musteriNo === musteriNoFilter)
    : accounts;

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Tanımlı Hesaplar</h3>
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Müşteri No</th>
              <th>Ek No</th>
              <th>Kayıt Tarihi</th>
              <th>Hesap Durumu</th>
              <th>Hesap Adı</th>
              <th>Döviz</th>
              <th>Bakiye</th>
              <th>Bloke</th>
              <th>Faiz (%)</th>
              <th>IBAN</th>
              <th>Kapanma Tarihi</th>
              <th>Faizli Bakiye</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
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
                <td>{acc.kapanmaTarihi || "-"}</td>
                <td>{acc.faizliBakiye}</td>
                <td>
                  <button onClick={() => onEdit(acc)} style={{ marginRight: "6px" }}>
                    Güncelle
                  </button>
                  <button onClick={() => handleDelete(acc.id)}>Sil</button>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan="13" style={{ textAlign: "center", padding: "10px" }}>
                  Eşleşen müşteri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountList;
