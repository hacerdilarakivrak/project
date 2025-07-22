import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerList = ({ refresh }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, [refresh]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_URL);
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchCustomers();
    }
  };

  return (
    <div>
      <h3>Kayıtlı Müşteriler</h3>
      {customers.length === 0 ? (
        <p>Henüz müşteri kaydı bulunmuyor.</p>
      ) : (
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Ünvan</th>
              <th>Tür</th>
              <th>VKN</th>
              <th>TC</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Adres</th>
              <th>Kayıt Tarihi</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.ad}</td>
                <td>{customer.soyad}</td>
                <td>{customer.unvan}</td>
                <td>{customer.tur === "G" ? "Gerçek" : "Tüzel"}</td>
                <td>{customer.vkn}</td>
                <td>{customer.tcKimlikNo}</td>
                <td>{customer.telefon}</td>
                <td>{customer.email}</td>
                <td>{customer.adres}</td>
                <td>{customer.kayitTarihi}</td>
                <td>
                  <button onClick={() => handleDelete(customer.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerList;
