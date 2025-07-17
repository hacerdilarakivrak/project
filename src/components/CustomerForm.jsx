// src/components/CustomerForm.jsx

import React, { useState, useEffect } from "react";
import api from "../api";

function CustomerForm() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    musteriNo: "",
    name: "",
    unvan: "",
    email: "",
    phone: "",
    type: "Gerçek",
    vergiKimlikNo: "",
    kayitTarihi: "",
    adres: "",
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      await api.post("/customers", formData);
      setFormData({
        musteriNo: "",
        name: "",
        unvan: "",
        email: "",
        phone: "",
        type: "Gerçek",
        vergiKimlikNo: "",
        kayitTarihi: "",
        adres: "",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Müşteri eklenemedi:", error);
    }
  };

  return (
    <div>
      <h1>Müşteri İşlemleri</h1>

      <h2>Müşteri Formu</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="musteriNo" placeholder="Müşteri No" value={formData.musteriNo} onChange={handleChange} />
        <input type="text" name="name" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} />
        <input type="text" name="unvan" placeholder="Ünvan" value={formData.unvan} onChange={handleChange} />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="Gerçek">Gerçek</option>
          <option value="Tüzel">Tüzel</option>
        </select>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="text" name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
        <input type="text" name="vergiKimlikNo" placeholder="Vergi Kimlik No" value={formData.vergiKimlikNo} onChange={handleChange} />
        <input type="date" name="kayitTarihi" placeholder="Kayıt Tarihi" value={formData.kayitTarihi} onChange={handleChange} />
        <input type="text" name="adres" placeholder="Adres" value={formData.adres} onChange={handleChange} />

        <button type="submit">Ekle</button>
      </form>

      <h2>Mevcut Müşteriler</h2>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> - {c.email} - {c.phone}<br />
            Müşteri No: {c.musteriNo} | Tür: {c.type}<br />
            Ünvan: {c.unvan} | VKN: {c.vergiKimlikNo}<br />
            Kayıt Tarihi: {c.kayitTarihi} | Adres: {c.adres}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerForm;

