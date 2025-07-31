import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TransactionList.css";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";
const ACCOUNTS_API = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const TransactionList = ({ refresh }) => {
  const [islemler, setIslemler] = useState([]);
  const [hesaplar, setHesaplar] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [refresh]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setIslemler(res.data);
    } catch (err) {
      console.error("İşlemler alınırken hata:", err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(ACCOUNTS_API);
      setHesaplar(res.data);
    } catch (err) {
      console.error("Hesaplar alınırken hata:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu işlemi silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTransactions();
      } catch (err) {
        console.error("İşlem silinirken hata oluştu:", err);
      }
    }
  };

  const getBakiyeSonrasi = (islem) => {
    return islem.bakiyeSonrasi ?? 0;
  };

  return (
    <div>
      <h2>İşlem Listesi</h2>
      <table>
        <thead>
          <tr>
            <th>Hesap Adı</th>
            <th>Tür</th>
            <th>Tutar</th>
            <th>Tarih</th>
            <th>Müşteri ID</th>
            <th>Açıklama</th>
            <th>Bakiye Sonrası</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {islemler.map((islem) => (
            <tr key={islem.id}>
              <td>{islem.hesapAdi?.trim() || "Bilinmiyor"}</td>
              <td>
                {islem.tur === "paraYatirma"
                  ? "Para Yatırma"
                  : islem.tur === "paraCekme"
                  ? "Para Çekme"
                  : islem.tur}
              </td>
              <td>{islem.tutar} ₺</td>
              <td>{islem.tarih}</td>
              <td>{islem.musteriID || "-"}</td>
              <td>{islem.aciklama || "-"}</td>
              <td>{getBakiyeSonrasi(islem)} ₺</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(islem.id)}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
