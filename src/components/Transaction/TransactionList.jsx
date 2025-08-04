import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TransactionList.css";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";

const TransactionList = ({ refresh }) => {
  const [islemler, setIslemler] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setIslemler(res.data);
    } catch (err) {
      console.error("İşlemler alınırken hata:", err);
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

  const getIslemTurText = (islem) => {
    switch (islem.tur) {
      case "paraYatirma":
        return `Para Yatırma (${islem.hesapAdi})`;
      case "paraCekme":
        return `Para Çekme (${islem.hesapAdi})`;
      case "transferGonderen":
        return `Transfer (Gönderen) - ${islem.hesapAdi}`;
      case "transferAlici":
        return `Transfer (Alıcı) - ${islem.hesapAdi}`;
      default:
        return islem.tur || "-";
    }
  };

  return (
    <div className="transaction-list-container">
      <h2>İşlem Listesi</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>İşlem</th>
            <th>Tutar</th>
            <th>Tarih</th>
            <th>Müşteri No</th>
            <th>Açıklama</th>
            <th>Bakiye Sonrası</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {islemler.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "12px" }}>
                Kayıtlı işlem yok.
              </td>
            </tr>
          ) : (
            islemler.map((islem) => (
              <tr key={islem.id}>
                <td>{getIslemTurText(islem)}</td>
                <td>{islem.tutar} ₺</td>
                <td>{islem.tarih}</td>
                <td>{islem.musteriID || "-"}</td>
                <td>{islem.aciklama || "-"}</td>
                <td>{islem.bakiyeSonrasi ?? 0} ₺</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(islem.id)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
