import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";

const TransactionList = ({ refresh }) => {
  const [islemler, setIslemler] = useState([]);

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => setIslemler(res.data))
      .catch((err) => console.error(err));
  }, [refresh]);

  const getTurLabel = (tur) => {
    switch (tur) {
      case "paraYatirma":
        return "Para Yatırma";
      case "paraCekme":
        return "Para Çekme";
      default:
        return tur;
    }
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
          </tr>
        </thead>
        <tbody>
          {islemler.map((islem) => (
            <tr key={islem.id}>
              <td>{islem.hesapAdi || "Bilinmiyor"}</td>
              <td>{getTurLabel(islem.tur)}</td>
              <td>{islem.tutar} ₺</td>
              <td>{islem.tarih}</td>
              <td>{islem.musteriID}</td>
              <td>{islem.aciklama}</td>
              <td>{islem.bakiyeSonrasi} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;




