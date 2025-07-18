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
  const [editId, setEditId] = useState(null);

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
        <label>
          Müşteri No:
          <input name="musteriNo" value={formData.musteriNo} onChange={handleChange} />
        </label>
        <label>
          Ad Soyad:
          <input name="adSoyad" value={formData.adSoyad} onChange={handleChange} />
        </label>
        <label>
          Ünvan:
          <input name="unvan" value={formData.unvan} onChange={handleChange} />
        </label>
        <label>
          Müşteri Türü:
          <select name="musteriTuru" value={formData.musteriTuru} onChange={handleChange}>
            <option value="Gerçek">Gerçek</option>
            <option value="Tüzel">Tüzel</option>
          </select>
        </label>
        <label>
          Vergi Kimlik No:
          <input name="vergiKimlikNo" value={formData.vergiKimlikNo} onChange={handleChange} />
        </label>
        <label>
          Kayıt Tarihi:
          <input name="kayitTarihi" type="date" value={formData.kayitTarihi} onChange={handleChange} />
        </label>
        <label>
          Adres:
          <input name="adres" value={formData.adres} onChange={handleChange} />
        </label>
        <label>
          Telefon:
          <input name="telefon" value={formData.telefon} onChange={handleChange} />
        </label>
        <label>
          E-Posta:
          <input name="email" value={formData.email} onChange={handleChange} />
        </label>

        {formData.musteriTuru === "Gerçek" && (
          <>
            <label>
              TC Kimlik No:
              <input name="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} />
            </label>
            <label>
              Baba Adı:
              <input name="babaAdi" value={formData.babaAdi} onChange={handleChange} />
            </label>
            <label>
              Anne Adı:
              <input name="anneAdi" value={formData.anneAdi} onChange={handleChange} />
            </label>
            <label>
              Doğum Tarihi:
              <input name="dogumTarihi" type="date" value={formData.dogumTarihi} onChange={handleChange} />
            </label>
            <label>
              Doğum Yeri:
              <input name="dogumYeri" value={formData.dogumYeri} onChange={handleChange} />
            </label>
            <label>
              Cinsiyet:
              <input name="cinsiyet" value={formData.cinsiyet} onChange={handleChange} />
            </label>
            <label>
              Öğrenim Durumu:
              <input name="ogrenimDurumu" value={formData.ogrenimDurumu} onChange={handleChange} />
            </label>
            <label>
              Medeni Durum:
              <select name="medeniDurum" value={formData.medeniDurum} onChange={handleChange}>
                <option value="">Medeni Durum</option>
                <option value="Bekar">Bekar</option>
                <option value="Evli">Evli</option>
              </select>
            </label>
          </>
        )}

        {formData.musteriTuru === "Tüzel" && (
          <label>
            Kamu Durumu:
            <select name="kamuDurumu" value={formData.kamuDurumu} onChange={handleChange}>
              <option value="">Kamu Durumu</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </label>
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

