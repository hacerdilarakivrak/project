import React, { useState, useEffect } from "react";
import axios from "axios";

const initialForm = {
  ad: "",
  soyad: "",
  unvan: "",
  musteriTuru: "G", // G: Gerçek, T: Tüzel
  vergiNo: "",
  adres: "",
  telefon: "",
  email: "",
  tcNo: "",
  babaAdi: "",
  anneAdi: "",
  dogumTarihi: "",
  dogumYeri: "",
  cinsiyet: "E", // E: Erkek, K: Kadın
  ogrenimDurumu: "Lise",
  medeniDurum: "Bekar",
  kamuDurumu: false,
};

const CustomerForm = ({ onAddCustomer }) => {
  const [formData, setFormData] = useState(initialForm);
  const [kayitTarihi, setKayitTarihi] = useState("");

  useEffect(() => {
    const now = new Date().toISOString().split("T")[0];
    setKayitTarihi(now);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateTC = (tc) => {
    if (tc.length !== 11) return false;
    const digits = tc.split("").map(Number);
    const total = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    return total % 10 === 8 && digits[10] === 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.vergiNo.length > 10) {
      alert("Vergi no en fazla 10 karakter olabilir.");
      return;
    }
    if (!validateEmail(formData.email)) {
      alert("Geçerli bir email adresi giriniz.");
      return;
    }
    if (formData.musteriTuru === "G" && !validateTC(formData.tcNo)) {
      alert("Geçersiz TC Kimlik No.");
      return;
    }

    const customerData = {
      ...formData,
      kayitTarihi,
    };

    try {
      const res = await axios.post("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers", customerData);
      onAddCustomer(res.data);
      setFormData(initialForm);
    } catch (error) {
      console.error("Ekleme hatası", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
      <input name="ad" value={formData.ad} onChange={handleChange} placeholder="Ad" pattern="[A-Za-zÇçĞğİıÖöŞşÜü ]+" required />
      <input name="soyad" value={formData.soyad} onChange={handleChange} placeholder="Soyad" pattern="[A-Za-zÇçĞğİıÖöŞşÜü ]+" required />
      <input name="unvan" value={formData.unvan} onChange={handleChange} placeholder="Ünvan" required />
      <select name="musteriTuru" value={formData.musteriTuru} onChange={handleChange}>
        <option value="G">Gerçek</option>
        <option value="T">Tüzel</option>
      </select>
      <input name="vergiNo" value={formData.vergiNo} onChange={handleChange} placeholder="Vergi Kimlik No" pattern="\d*" maxLength={10} required />
      <input name="adres" value={formData.adres} onChange={handleChange} placeholder="Adres" required />
      <input name="telefon" value={formData.telefon} onChange={handleChange} placeholder="Telefon" pattern="\d*" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="E-Posta" required />
      {formData.musteriTuru === "G" && (
        <>
          <input name="tcNo" value={formData.tcNo} onChange={handleChange} placeholder="TC Kimlik No" pattern="\d*" required />
          <input name="babaAdi" value={formData.babaAdi} onChange={handleChange} placeholder="Baba Adı" pattern="[A-Za-zÇçĞğİıÖöŞşÜü ]+" required />
          <input name="anneAdi" value={formData.anneAdi} onChange={handleChange} placeholder="Anne Adı" pattern="[A-Za-zÇçĞğİıÖöŞşÜü ]+" required />
          <input name="dogumTarihi" type="date" value={formData.dogumTarihi} onChange={handleChange} required />
          <input name="dogumYeri" value={formData.dogumYeri} onChange={handleChange} placeholder="Doğum Yeri" required />
          <select name="cinsiyet" value={formData.cinsiyet} onChange={handleChange}>
            <option value="E">Erkek</option>
            <option value="K">Kadın</option>
          </select>
          <select name="ogrenimDurumu" value={formData.ogrenimDurumu} onChange={handleChange}>
            <option value="İlköğretim">İlköğretim</option>
            <option value="Ortaöğretim">Ortaöğretim</option>
            <option value="Lise">Lise</option>
            <option value="Lisans">Lisans</option>
            <option value="Yüksek Lisans">Yüksek Lisans</option>
            <option value="Doktora">Doktora</option>
          </select>
          <select name="medeniDurum" value={formData.medeniDurum} onChange={handleChange}>
            <option value="Evli">Evli</option>
            <option value="Bekar">Bekar</option>
          </select>
        </>
      )}
      {formData.musteriTuru === "T" && (
        <label>
          Kamu Müşterisi mi?
          <input type="checkbox" name="kamuDurumu" checked={formData.kamuDurumu} onChange={handleChange} />
        </label>
      )}
      <button type="submit">Müşteri Ekle</button>
    </form>
  );
};

export default CustomerForm;

