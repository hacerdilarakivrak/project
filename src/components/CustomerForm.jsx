import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    musteriNo: "",
    adSoyad: "",
    unvan: "",
    musteriTuru: "Gerçek",
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
  const [editId, setEditId] = useState(null); // Güncelleme modunu takip eder

  useEffect(() => {
    axios.get(API_URL).then((res) => setCustomers(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      musteriNo: "",
      adSoyad: "",
      unvan: "",
      musteriTuru: "Gerçek",
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
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      const res = await axios.put(`${API_URL}/${editId}`, formData);
      setCustomers(customers.map((c) => (c.id === editId ? res.data : c)));
    } else {
      const res = await axios.post(API_URL, formData);
      setCustomers([...customers, res.data]);
    }
    resetForm();
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
    <div>
      <h1>Müşteri İşlemleri</h1>
      <form onSubmit={handleSubmit}>
        <input name="musteriNo" placeholder="Müşteri No" value={formData.musteriNo} onChange={handleChange} />
        <input name="adSoyad" placeholder="Ad Soyad" value={formData.adSoyad} onChange={handleChange} />
        <input name="unvan" placeholder="Ünvan" value={formData.unvan} onChange={handleChange} />
        <select name="musteriTuru" value={formData.musteriTuru} onChange={handleChange}>
          <option value="Gerçek">Gerçek</option>
          <option value="Tüzel">Tüzel</option>
        </select>
        <input name="vergiKimlikNo" placeholder="Vergi Kimlik No" value={formData.vergiKimlikNo} onChange={handleChange} />
        <input name="kayitTarihi" type="date" value={formData.kayitTarihi} onChange={handleChange} />
        <input name="adres" placeholder="Adres" value={formData.adres} onChange={handleChange} />
        <input name="telefon" placeholder="Telefon" value={formData.telefon} onChange={handleChange} />
        <input name="email" placeholder="E-Posta" value={formData.email} onChange={handleChange} />

        {formData.musteriTuru === "Gerçek" && (
          <>
            <input name="tcKimlikNo" placeholder="TC Kimlik No" value={formData.tcKimlikNo} onChange={handleChange} />
            <input name="babaAdi" placeholder="Baba Adı" value={formData.babaAdi} onChange={handleChange} />
            <input name="anneAdi" placeholder="Anne Adı" value={formData.anneAdi} onChange={handleChange} />
            <input name="dogumTarihi" type="date" value={formData.dogumTarihi} onChange={handleChange} />
            <input name="dogumYeri" placeholder="Doğum Yeri" value={formData.dogumYeri} onChange={handleChange} />
            <input name="cinsiyet" placeholder="Cinsiyet" value={formData.cinsiyet} onChange={handleChange} />
            <input name="ogrenimDurumu" placeholder="Öğrenim Durumu" value={formData.ogrenimDurumu} onChange={handleChange} />
            <select name="medeniDurum" value={formData.medeniDurum} onChange={handleChange}>
              <option value="">Medeni Durum</option>
              <option value="Bekar">Bekar</option>
              <option value="Evli">Evli</option>
            </select>
          </>
        )}

        {formData.musteriTuru === "Tüzel" && (
          <select name="kamuDurumu" value={formData.kamuDurumu} onChange={handleChange}>
            <option value="">Kamu Durumu</option>
            <option value="Evet">Evet</option>
            <option value="Hayır">Hayır</option>
          </select>
        )}

        <button type="submit">{editId ? "Güncelle" : "Müşteri Ekle"}</button>
        {editId && <button type="button" onClick={resetForm}>İptal</button>}
      </form>

      <h2>Mevcut Müşteriler</h2>
      {customers.map((cust) => (
        <div key={cust.id}>
          <strong>{cust.adSoyad}</strong> - {cust.email} - {cust.musteriTuru}
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
          {cust.musteriTuru === "Tüzel" && <> | Kamu Durumu: {cust.kamuDurumu}</>}
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

