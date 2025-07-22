import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountList = ({ refresh }) => {
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    const response = await axios.get(API_URL);
    setAccounts(response.data);
  };

  useEffect(() => {
    fetchAccounts();
  }, [refresh]);

  return (
    <div>
      <h3>Tanımlı Hesaplar</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Müşteri No</th>
            <th>Ek No</th>
            <th>Kayıt Tarihi</th>
            <th>Kayıt Durumu</th>
            <th>Hesap Adı</th>
            <th>Döviz</th>
            <th>Bakiye</th>
            <th>Bloke</th>
            <th>Faiz</th>
            <th>IBAN</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountList;
