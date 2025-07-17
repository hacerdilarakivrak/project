import React, { useState, useEffect } from "react";
import api from "../api";

function CustomerForm() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerNo: "",
    name: "",
    title: "",
    type: "Gerçek",
    taxId: "",
    registerDate: "",
    address: "",
    phone: "",
    email: "",
    identityNumber: "",
    fatherName: "",
    motherName: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    education: "",
    maritalStatus: "",
    isPublic: false, // sadece tüzel müşteride
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Müşteriler alınamadı:", err);
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
        customerNo: "",
        name: "",
        title: "",
        type: "Gerçek",
        taxId: "",
        registerDate: "",
        address: "",
        phone: "",
        email: "",
        identityNumber: "",
        fatherName: "",
        motherName: "",
        birthDate: "",
        birthPlace: "",
        gender: "",
        education: "",
        maritalStatus: "",
        isPublic: false,
      });
      fetchCustomers();
    } catch (err) {
      console.error("Müşteri eklenemedi:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Silme başarısız:", err);
    }
  };

  return (
    <div>
      <h1>Müşteri İşlemleri</h1>
      <form onSubmit={handleSubmit}>
        <input name="customerNo" placeholder="Müşteri No" value={formData.customerNo} onChange={handleChange} />
        <input name="name" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} />
        <input name="title" placeholder="Ünvan" value={formData.title} onChange={handleChange} />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="Gerçek">Gerçek</option>
          <option value="Tüzel">Tüzel</option>
        </select>
        <input name="taxId" placeholder="Vergi Kimlik No" value={formData.taxId} onChange={handleChange} />
        <input name="registerDate" type="date" value={formData.registerDate} onChange={handleChange} />
        <input name="address" placeholder="Adres" value={formData.address} onChange={handleChange} />
        <input name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

        {formData.type === "Gerçek" && (
          <>
            <input name="identityNumber" placeholder="TC Kimlik No" value={formData.identityNumber} onChange={handleChange} />
            <input name="fatherName" placeholder="Baba Adı" value={formData.fatherName} onChange={handleChange} />
            <input name="motherName" placeholder="Anne Adı" value={formData.motherName} onChange={handleChange} />
            <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
            <input name="birthPlace" placeholder="Doğum Yeri" value={formData.birthPlace} onChange={handleChange} />
            <input name="gender" placeholder="Cinsiyet" value={formData.gender} onChange={handleChange} />
            <input name="education" placeholder="Öğrenim Durumu" value={formData.education} onChange={handleChange} />
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
              <option value="">Medeni Durum</option>
              <option value="Evli">Evli</option>
              <option value="Bekar">Bekar</option>
            </select>
          </>
        )}

        {formData.type === "Tüzel" && (
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />{" "}
            Kamu Müşterisi mi?
          </label>
        )}

        <button type="submit">Müşteri Ekle</button>
      </form>

      <h2>Mevcut Müşteriler</h2>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> - {c.email} - {c.type}
            <br />
            Müşteri No: {c.customerNo} | Ünvan: {c.title} | VKN: {c.taxId}
            <br />
            Kayıt Tarihi: {c.registerDate} | Adres: {c.address} | Tel: {c.phone}
            <br />
            {c.type === "Gerçek" && (
              <>
                TC: {c.identityNumber} | Baba: {c.fatherName} | Anne: {c.motherName}
                <br />
                Doğum: {c.birthDate} / {c.birthPlace} | Cinsiyet: {c.gender}
                <br />
                Eğitim: {c.education} | Medeni Durum: {c.maritalStatus}
              </>
            )}
            {c.type === "Tüzel" && (
              <>
                <br />
                Kamu Müşterisi mi: {c.isPublic ? "Evet" : "Hayır"}
              </>
            )}
            <br />
            <button onClick={() => handleDelete(c.id)}>Sil</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerForm;
