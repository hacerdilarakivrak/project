import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    unvan: "",
    musteriTuru: "G",
    vergiKimlikNo: "",
    kayitTarihi: "",
    adres: "",
    telefon: "",
    email: "",
    tcKimlikNo: "",
    babaAdi: "",
    anneAdi: "",
    dogumTarihi: "",
    dogumYeri: "",
    cinsiyet: "",
    ogrenimDurumu: "",
    medeniDurum: "",
    kamuDurumu: "",
  });

  const [customers, setCustomers] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    axios.get(API_URL).then((res) => setCustomers(res.data));
    const now = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, kayitTarihi: now }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["vergiKimlikNo", "tcKimlikNo", "telefon"].includes(name) && /\D/.test(value)) {
      return;
    }

    if (["ad", "soyad", "babaAdi", "anneAdi", "dogumYeri"].includes(name) && /\d/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidTcKimlik = (tc) => {
    if (!/^\d{11}$/.test(tc)) return false;
    const sum = tc
      .slice(0, 10)
      .split("")
      .reduce((a, b) => a + Number(b), 0);
    const lastDigit = Number(tc[10]);
    return sum % 10 === 8 && lastDigit === 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      alert("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    if (!isValidTcKimlik(formData.tcKimlikNo)) {
      alert("Geçerli bir TC kimlik numarası giriniz.");
      return;
    }

    const dataToSend = {
      ...formData,
      musteriNo: editId ? formData.musteriNo : Math.floor(100000000 + Math.random() * 900000000).toString(),
      cinsiyet: formData.cinsiyet,
      musteriTuru: formData.musteriTuru,
    };

    if (editId) {
      const res = await axios.put(`${API_URL}/${editId}`, dataToSend);
      setCustomers(customers.map((c) => (c.id === editId ? res.data : c)));
    } else {
      const res = await axios.post(API_URL, dataToSend);
      setCustomers([...customers, res.data]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      ad: "",
      soyad: "",
      unvan: "",
      musteriTuru: "G",
      vergiKimlikNo: "",
      kayitTarihi: new Date().toISOString().split("T")[0],
      adres: "",
      telefon: "",
      email: "",
      tcKimlikNo: "",
      babaAdi: "",
      anneAdi: "",
      dogumTarihi: "",
      dogumYeri: "",
      cinsiyet: "",
      ogrenimDurumu: "",
      medeniDurum: "",
      kamuDurumu: "",
    });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setCustomers(customers.filter((cust) => cust.id !== id));
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditId(customer.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {["ad", "soyad", "unvan", "vergiKimlikNo", "adres", "telefon", "email", "tcKimlikNo", "babaAdi", "anneAdi", "dogumYeri"].map((key) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", width: "250px" }}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input
              type="text"
              name={key}
              maxLength={key === "vergiKimlikNo" ? 10 : undefined}
              value={formData[key] || ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
          <label>Doğum Tarihi</label>
          <input type="date" name="dogumTarihi" value={formData.dogumTarihi} onChange={handleChange} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
          <label>Cinsiyet</label>
          <select name="cinsiyet" value={formData.cinsiyet} onChange={handleChange}>
            <option value="">Seçiniz</option>
            <option value="K">Kadın</option>
            <option value="E">Erkek</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
          <label>Öğrenim Durumu</label>
          <select name="ogrenimDurumu" value={formData.ogrenimDurumu} onChange={handleChange}>
            <option value="">Seçiniz</option>
            <option value="İlköğretim">İlköğretim</option>
            <option value="Ortaöğretim">Ortaöğretim</option>
            <option value="Lise">Lise</option>
            <option value="Lisans">Lisans</option>
            <option value="Yüksek Lisans">Yüksek Lisans</option>
            <option value="Doktora">Doktora</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
          <label>Müşteri Türü</label>
          <select name="musteriTuru" value={formData.musteriTuru} onChange={handleChange}>
            <option value="G">Gerçek</option>
            <option value="T">Tüzel</option>
          </select>
        </div>

        {formData.musteriTuru === "G" ? (
          <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
            <label>Medeni Durum</label>
            <select name="medeniDurum" value={formData.medeniDurum} onChange={handleChange}>
              <option value="">Seçiniz</option>
              <option value="Bekar">Bekar</option>
              <option value="Evli">Evli</option>
            </select>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
            <label>Kamu Durumu</label>
            <select name="kamuDurumu" value={formData.kamuDurumu} onChange={handleChange}>
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
        )}

        <button type="submit" style={{ padding: "10px 20px", marginTop: "25px", height: "40px" }}>
          {editId ? "Güncelle" : "Müşteri Ekle"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Mevcut Müşteriler</h2>
      {customers.map((cust) => (
        <div key={cust.id} style={{ marginBottom: "20px" }}>
          <strong>{cust.ad} {cust.soyad}</strong> - {cust.email} - {cust.musteriTuru}
          <br />
          Müşteri No: {cust.musteriNo} | Ünvan: {cust.unvan} | VKN: {cust.vergiKimlikNo}
          <br />
          Kayıt Tarihi: {cust.kayitTarihi} | Adres: {cust.adres} | Tel: {cust.telefon}
          <br />
          TC: {cust.tcKimlikNo} | Baba: {cust.babaAdi} | Anne: {cust.anneAdi}
          <br />
          Doğum: {cust.dogumTarihi} / {cust.dogumYeri} | Cinsiyet: {cust.cinsiyet}
          <br />
          Eğitim: {cust.ogrenimDurumu} | Medeni Durum: {cust.medeniDurum}
          {cust.musteriTuru === "T" && <> | Kamu Durumu: {cust.kamuDurumu}</>}
          <br />
          <button onClick={() => handleEdit(cust)}>Güncelle</button>
          <button onClick={() => handleDelete(cust.id)}>Sil</button>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default CustomerForm;


  






  
