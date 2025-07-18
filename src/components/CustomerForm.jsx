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
    <div style={{ padding: "20px" }}>
      <h1>Müşteri Tanımlama</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}
      >
        {Object.entries({
          musteriNo: "Müşteri No",
          adSoyad: "Ad Soyad",
          unvan: "Ünvan",
          vergiKimlikNo: "Vergi Kimlik No",
          kayitTarihi: "Kıyat Tarihi",
          adres: "Adres",
          telefon: "Telefon",
          email: "E-Posta",
          tcKimlikNo: "TC Kimlik No",
          babaAdi: "Baba Adı",
          anneAdi: "Anne Adı",
          dogumTarihi: "Doğum Tarihi",
          dogumYeri: "Doğum Yeri",
          cinsiyet: "Cinsiyet",
          ogrenimDurumu: "Öğrenim Durumu",
        }).map(([key, label]) => (
          <div style={{ display: "flex", flexDirection: "column", width: "250px" }} key={key}>
            <label>{label}</label>
            <input
              type={key.toLowerCase().includes("tarihi") ? "date" : "text"}
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
          <label>Müşteri Türü</label>
          <select
            name="musteriTuru"
            value={formData.musteriTuru}
            onChange={handleChange}
          >
            <option value="Gerçek">Gerçek</option>
            <option value="Tüzel">Tüzel</option>
          </select>
        </div>

        {formData.musteriTuru === "Gerçek" ? (
          <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
            <label>Medeni Durum</label>
            <select
              name="medeniDurum"
              value={formData.medeniDurum}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              <option value="Bekar">Bekar</option>
              <option value="Evli">Evli</option>
            </select>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
            <label>Kamu Durumu</label>
            <select
              name="kamuDurumu"
              value={formData.kamuDurumu}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          style={{ padding: "10px 20px", marginTop: "25px", height: "40px" }}
        >
          {editId ? "Güncelle" : "Müşteri Ekle"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Mevcut Müşteriler</h2>
      {customers.map((cust) => (
        <div key={cust.id} style={{ marginBottom: "20px" }}>
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
