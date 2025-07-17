// src/components/CustomerForm.jsx

import React, { useEffect, useState } from "react";
import api from "../api";

function CustomerForm() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    musteriNo: "",
    name: "",
    unvan: "",
    type: "Gerçek",
    vergiKimlikNo: "",
    kayitTarihi: "",
    adres: "",
    phone: "",
    email: "",

    // Gerçek müşteri alanları
    tcKimlikNo: "",
    babaAdi: "",
    anneAdi: "",
    dogumTarihi: "",
    dogumYeri: "",
    cinsiyet: "",
    ogrenimDurumu: "",
    medeniDurum: "",

    // Tüzel müşteri alanı
    kamuDurumu: false,
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Veri alınamadı", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/customers", formData);
      setFormData({
        musteriNo: "",
        name: "",
        unvan: "",
        type: "Gerçek",
        vergiKimlikNo: "",
        kayitTarihi: "",
        adres: "",
        phone: "",
        email: "",
        tcKimlikNo: "",
        babaAdi: "",
        anneAdi: "",
        dogumTarihi: "",
        dogumYeri: "",
        cinsiyet: "",
        ogrenimDurumu: "",
        medeniDurum: "",
        kamuDurumu: false,
      });
      fetchCustomers();
    } catch (err) {
      console.error("Müşteri eklenemedi", err);
    }
  };

  return (
    <div>
      <h1>Müşteri Formu</h1>
      <form onSubmit={handleSubmit}>
        <input name="musteriNo" placeholder="Müşteri No" onChange={handleChange} value={formData.musteriNo} />
        <input name="name" placeholder="Ad Soyad" onChange={handleChange} value={formData.name} />
        <input name="unvan" placeholder="Unvan" onChange={handleChange} value={formData.unvan} />
        <select name="type" onChange={handleChange} value={formData.type}>
          <option value="Gerçek">Gerçek</option>
          <option value="Tüzel">Tüzel</option>
        </select>
        <input name="email" placeholder="Email" onChange={handleChange} value={formData.email} />
        <input name="phone" placeholder="Telefon" onChange={handleChange} value={formData.phone} />
        <input name="vergiKimlikNo" placeholder="Vergi Kimlik No" onChange={handleChange} value={formData.vergiKimlikNo} />
        <input type="date" name="kayitTarihi" onChange={handleChange} value={formData.kayitTarihi} />
        <input name="adres" placeholder="Adres" onChange={handleChange} value={formData.adres} />

        {formData.type === "Gerçek" && (
          <>
            <input name="tcKimlikNo" placeholder="TC Kimlik No" onChange={handleChange} value={formData.tcKimlikNo} />
            <input name="babaAdi" placeholder="Baba Adı" onChange={handleChange} value={formData.babaAdi} />
            <input name="anneAdi" placeholder="Anne Adı" onChange={handleChange} value={formData.anneAdi} />
            <input type="date" name="dogumTarihi" onChange={handleChange} value={formData.dogumTarihi} />
            <input name="dogumYeri" placeholder="Doğum Yeri" onChange={handleChange} value={formData.dogumYeri} />
            <input name="cinsiyet" placeholder="Cinsiyet" onChange={handleChange} value={formData.cinsiyet} />
            <input name="ogrenimDurumu" placeholder="Öğrenim Durumu" onChange={handleChange} value={formData.ogrenimDurumu} />
            <input name="medeniDurum" placeholder="Medeni Durum" onChange={handleChange} value={formData.medeniDurum} />
          </>
        )}

        {formData.type === "Tüzel" && (
          <label>
            <input
              type="checkbox"
              name="kamuDurumu"
              checked={formData.kamuDurumu}
              onChange={handleChange}
            />{" "}
            Kamu Müşterisi mi?
          </label>
        )}

        <button type="submit">Ekle</button>
      </form>

      <h2>Mevcut Müşteriler</h2>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> - {c.email} - {c.phone}
            <br />
            Müşteri No: {c.musteriNo} | Tür: {c.type}
            <br />
            Ünvan: {c.unvan} | VKN: {c.vergiKimlikNo}
            <br />
            Kayıt Tarihi: {c.kayitTarihi} | Adres: {c.adres}
            {c.type === "Gerçek" && (
              <>
                <br />
                TC: {c.tcKimlikNo} | Baba: {c.babaAdi} | Anne: {c.anneAdi}
                <br />
                Doğum: {c.dogumTarihi} - {c.dogumYeri} | Cinsiyet: {c.cinsiyet}
                <br />
                Eğitim: {c.ogrenimDurumu} | Medeni Durum: {c.medeniDurum}
              </>
            )}
            {c.type === "Tüzel" && <p>Kamu Durumu: {c.kamuDurumu ? "Evet" : "Hayır"}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerForm;
