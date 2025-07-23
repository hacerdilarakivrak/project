import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const generateCustomerNo = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateTC = (tc) => {
  if (tc.length !== 11) return false;
  const total = tc
    .slice(0, 10)
    .split("")
    .reduce((sum, num) => sum + Number(num), 0);
  return total % 10 === Number(tc[10]);
};

const initialForm = {
  ad: "", soyad: "", unvan: "", musteriTuru: "G",
  vergiKimlikNo: "", tcKimlikNo: "", telefon: "", email: "",
  adres: "", babaAdi: "", anneAdi: "", dogumTarihi: "", dogumYeri: "",
  cinsiyet: "", ogrenimDurumu: "", medeniDurum: "", kamuDurumu: false
};

const CustomerForm = ({ onCustomerAdd, selectedCustomer, clearSelection }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selectedCustomer) {
      setForm(selectedCustomer);
    }
  }, [selectedCustomer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "vergiKimlikNo") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    if (name === "telefon") {
      if (!/^\d*$/.test(value) || value.length > 11) return;
    }

    if (["ad", "soyad", "babaAdi", "anneAdi", "dogumYeri", "unvan"].includes(name)) {
      if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]*$/.test(value)) return;
    }

    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
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

    try {
      if (selectedCustomer) {
        await axios.put(`${API_URL}/${selectedCustomer.id}`, form);
        alert("Müşteri güncellendi.");
      } else {
        const newCustomer = {
          ...form,
          musteriNo: generateCustomerNo(),
          kayitTarihi: new Date().toISOString().split("T")[0],
        };
        await axios.post(API_URL, newCustomer);
        alert("Müşteri kaydedildi.");
      }

      setForm(initialForm);
      if (onCustomerAdd) onCustomerAdd();
      if (clearSelection) clearSelection();
    } catch (error) {
      alert("Hata oluştu: " + error);
    }
  };

  const inputStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Ad</label>
        <input name="ad" value={form.ad} onChange={handleChange} required placeholder="Adınızı giriniz" title="Sadece harf giriniz" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Soyad</label>
        <input name="soyad" value={form.soyad} onChange={handleChange} required placeholder="Soyadınızı giriniz" title="Sadece harf giriniz" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Ünvan</label>
        <input name="unvan" value={form.unvan} onChange={handleChange} placeholder="Örn: Öğrenci" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Müşteri Türü</label>
        <select name="musteriTuru" value={form.musteriTuru} onChange={handleChange} style={inputStyle}>
          <option value="G">Gerçek</option>
          <option value="T">Tüzel</option>
        </select>
      </div>

      {form.musteriTuru === "T" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Kamu müşterisi mi?</label>
          <input type="checkbox" name="kamuDurumu" checked={form.kamuDurumu} onChange={handleChange} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Vergi Kimlik No</label>
        <input name="vergiKimlikNo" value={form.vergiKimlikNo} onChange={handleChange} placeholder="10 haneli sayı" title="Sadece rakam, en fazla 10 hane" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>TC Kimlik No</label>
        <input name="tcKimlikNo" value={form.tcKimlikNo} onChange={handleChange} placeholder="11 haneli TC Kimlik No" title="Sadece rakam giriniz" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Telefon</label>
        <input name="telefon" value={form.telefon} onChange={handleChange} placeholder="5xx1234567" title="Sadece rakam giriniz" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="ornek@mail.com" title="Geçerli bir e-posta giriniz" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Adres</label>
        <input name="adres" value={form.adres} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Baba Adı</label>
        <input name="babaAdi" value={form.babaAdi} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Anne Adı</label>
        <input name="anneAdi" value={form.anneAdi} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Doğum Tarihi</label>
        <input type="date" name="dogumTarihi" value={form.dogumTarihi} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Doğum Yeri</label>
        <input name="dogumYeri" value={form.dogumYeri} onChange={handleChange} placeholder="Örn: Eskişehir" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Cinsiyet</label>
        <select name="cinsiyet" value={form.cinsiyet} onChange={handleChange} style={inputStyle}>
          <option value="">Seçiniz</option>
          <option value="K">Kadın</option>
          <option value="E">Erkek</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Öğrenim Durumu</label>
        <select name="ogrenimDurumu" value={form.ogrenimDurumu} onChange={handleChange} style={inputStyle}>
          <option value="">Seçiniz</option>
          <option value="İlköğretim">İlköğretim</option>
          <option value="Ortaöğretim">Ortaöğretim</option>
          <option value="Lise">Lise</option>
          <option value="Lisans">Lisans</option>
          <option value="Yüksek Lisans">Yüksek Lisans</option>
          <option value="Doktora">Doktora</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Medeni Durum</label>
        <select name="medeniDurum" value={form.medeniDurum} onChange={handleChange} style={inputStyle}>
          <option value="">Seçiniz</option>
          <option value="Bekar">Bekar</option>
          <option value="Evli">Evli</option>
        </select>
      </div>

      <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          {selectedCustomer ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;