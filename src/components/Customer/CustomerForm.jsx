import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const generateCustomerNo = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateTC = (tc) => {
  if (tc.length !== 11) return false;
  const total = tc
    .slice(0, 10)
    .split("")
    .reduce((sum, num) => sum + Number(num), 0);
  return total % 10 === Number(tc[10]);
};

const CustomerForm = ({ onCustomerAdd }) => {
  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    unvan: "",
    musteriTuru: "G",
    vergiKimlikNo: "",
    tcKimlikNo: "",
    telefon: "",
    email: "",
    adres: "",
    babaAdi: "",
    anneAdi: "",
    dogumTarihi: "",
    dogumYeri: "",
    cinsiyet: "",
    ogrenimDurumu: "",
    medeniDurum: "",
    kamuDurumu: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
      alert("Geçerli bir e-posta giriniz.");
      return;
    }

    if (form.musteriTuru === "G" && !validateTC(form.tcKimlikNo)) {
      alert("TC Kimlik No geçerli değil.");
      return;
    }

    const newCustomer = {
      ...form,
      musteriNo: generateCustomerNo(),
      kayitTarihi: new Date().toISOString().split("T")[0],
    };

    try {
      await axios.post(API_URL, newCustomer);
      alert("Müşteri kaydedildi.");
      setForm({
        ad: "",
        soyad: "",
        unvan: "",
        musteriTuru: "G",
        vergiKimlikNo: "",
        tcKimlikNo: "",
        telefon: "",
        email: "",
        adres: "",
        babaAdi: "",
        anneAdi: "",
        dogumTarihi: "",
        dogumYeri: "",
        cinsiyet: "",
        ogrenimDurumu: "",
        medeniDurum: "",
        kamuDurumu: false,
      });
      if (onCustomerAdd) onCustomerAdd();
    } catch (error) {
      alert("Hata oluştu: " + error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="ad"
          placeholder="Ad"
          value={form.ad}
          onChange={handleChange}
          onKeyPress={(e) => /[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/.test(e.key) && e.preventDefault()}
          required
        />
        <input
          type="text"
          name="soyad"
          placeholder="Soyad"
          value={form.soyad}
          onChange={handleChange}
          onKeyPress={(e) => /[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/.test(e.key) && e.preventDefault()}
          required
        />
        <input
          type="text"
          name="unvan"
          placeholder="Ünvan"
          value={form.unvan}
          onChange={handleChange}
        />

        <select name="musteriTuru" value={form.musteriTuru} onChange={handleChange}>
          <option value="G">Gerçek</option>
          <option value="T">Tüzel</option>
        </select>

        {form.musteriTuru === "T" && (
          <label>
            <input
              type="checkbox"
              name="kamuDurumu"
              checked={form.kamuDurumu}
              onChange={handleChange}
            />
            Kamu müşterisi mi?
          </label>
        )}

        <input
          type="text"
          name="vergiKimlikNo"
          placeholder="Vergi Kimlik No"
          value={form.vergiKimlikNo}
          onChange={handleChange}
          onKeyPress={(e) => /\D/.test(e.key) && e.preventDefault()}
        />

        <input
          type="text"
          name="tcKimlikNo"
          placeholder="TC Kimlik No"
          value={form.tcKimlikNo}
          onChange={handleChange}
          onKeyPress={(e) => /\D/.test(e.key) && e.preventDefault()}
        />

        <input
          type="text"
          name="telefon"
          placeholder="Telefon"
          value={form.telefon}
          onChange={handleChange}
          onKeyPress={(e) => /\D/.test(e.key) && e.preventDefault()}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="adres"
          placeholder="Adres"
          value={form.adres}
          onChange={handleChange}
        />

        <input
          type="text"
          name="babaAdi"
          placeholder="Baba Adı"
          value={form.babaAdi}
          onChange={handleChange}
        />

        <input
          type="text"
          name="anneAdi"
          placeholder="Anne Adı"
          value={form.anneAdi}
          onChange={handleChange}
        />

        <input
          type="date"
          name="dogumTarihi"
          value={form.dogumTarihi}
          onChange={handleChange}
        />

        <input
          type="text"
          name="dogumYeri"
          placeholder="Doğum Yeri"
          value={form.dogumYeri}
          onChange={handleChange}
        />

        <select name="cinsiyet" value={form.cinsiyet} onChange={handleChange}>
          <option value="">Cinsiyet Seç</option>
          <option value="K">Kadın</option>
          <option value="E">Erkek</option>
        </select>

        <select name="ogrenimDurumu" value={form.ogrenimDurumu} onChange={handleChange}>
          <option value="">Öğrenim Durumu</option>
          <option value="İlköğretim">İlköğretim</option>
          <option value="Ortaöğretim">Ortaöğretim</option>
          <option value="Lise">Lise</option>
          <option value="Lisans">Lisans</option>
          <option value="Yüksek Lisans">Yüksek Lisans</option>
          <option value="Doktora">Doktora</option>
        </select>

        <select name="medeniDurum" value={form.medeniDurum} onChange={handleChange}>
          <option value="">Medeni Durum</option>
          <option value="Bekar">Bekar</option>
          <option value="Evli">Evli</option>
        </select>

        <button type="submit">Kaydet</button>
      </div>
    </form>
  );
};

export default CustomerForm;
