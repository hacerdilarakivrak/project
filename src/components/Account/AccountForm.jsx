import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const initialForm = {
  musteriNo: "",
  ekNo: "",
  kayitTarihi: new Date().toISOString().split("T")[0],
  kayitDurumu: "",
  hesapAdi: "",
  dovizKodu: "",
  bakiye: "",
  blokeTutar: "",
  faizOrani: "",
  iban: "",
  hesapTuru: "",
  kapanmaTarihi: "",
  faizliBakiye: "0.00",
};

const AccountForm = ({ onAccountAdd, selectedAccount, clearSelection, customers }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selectedAccount) {
      const bakiye = parseFloat(selectedAccount.bakiye) || 0;
      const faizOrani = parseFloat(selectedAccount.faizOrani) || 0;
      setForm({
        ...initialForm,
        ...selectedAccount,
        bakiye: bakiye.toString(),
        blokeTutar: (parseFloat(selectedAccount.blokeTutar) || 0).toString(),
        faizOrani: faizOrani.toString(),
        faizliBakiye: (bakiye + (bakiye * faizOrani) / 100).toFixed(2),
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedAccount]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["bakiye", "blokeTutar", "faizOrani"].includes(name) && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    let updatedForm = { ...form, [name]: value };
    const bakiye = parseFloat(updatedForm.bakiye || 0);
    const faizOrani = parseFloat(updatedForm.faizOrani || 0);
    updatedForm.faizliBakiye = (bakiye + (bakiye * faizOrani) / 100).toFixed(2);

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        bakiye: parseFloat(form.bakiye || 0),
        blokeTutar: parseFloat(form.blokeTutar || 0),
        faizOrani: parseFloat(form.faizOrani || 0),
        faizliBakiye: parseFloat(form.faizliBakiye || 0),
      };

      if (selectedAccount) {
        await axios.put(`${API_URL}/${selectedAccount.id}`, payload);
        alert("Hesap güncellendi.");
      } else {
        await axios.post(API_URL, { ...payload, createdAt: new Date().toISOString() });
        alert("Hesap eklendi.");
      }

      setForm(initialForm);
      if (onAccountAdd) onAccountAdd();
      if (clearSelection) clearSelection();
    } catch (err) {
      alert("Hata oluştu: " + err.message);
    }
  };

  const isKapali = form.kayitDurumu === "Kapalı";

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>Hesap Tanımlama</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          backgroundColor: "#1f1f1f",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div style={fieldStyle}>
          <label style={labelStyle}>Müşteri No:</label>
          <select name="musteriNo" value={form.musteriNo} onChange={handleChange} required>
            <option value="">Seçiniz</option>
            {customers.map((c) => (
              <option key={c.musteriNo} value={c.musteriNo}>
                {c.ad} {c.soyad} - {c.musteriNo}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Ek No:</label>
          <input name="ekNo" value={form.ekNo} onChange={handleChange} required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Kayıt Tarihi:</label>
          <input type="date" name="kayitTarihi" value={form.kayitTarihi} onChange={handleChange} required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Kayıt Durumu:</label>
          <select name="kayitDurumu" value={form.kayitDurumu} onChange={handleChange} required>
            <option value="">Kayıt Durumu</option>
            <option value="Açık">Açık</option>
            <option value="Kapalı">Kapalı</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Hesap Adı:</label>
          <input name="hesapAdi" value={form.hesapAdi} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Döviz Kodu:</label>
          <select name="dovizKodu" value={form.dovizKodu} onChange={handleChange}>
            <option value="">Döviz Kodu</option>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Hesap Türü:</label>
          <select name="hesapTuru" value={form.hesapTuru} onChange={handleChange} required>
            <option value="">Hesap Türü Seçin</option>
            <option value="Vadeli">Vadeli</option>
            <option value="Vadesiz">Vadesiz</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bakiye:</label>
          <input name="bakiye" value={form.bakiye} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bloke Tutar:</label>
          <input name="blokeTutar" value={form.blokeTutar} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Faiz Oranı (%):</label>
          <input name="faizOrani" value={form.faizOrani} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>IBAN:</label>
          <input name="iban" value={form.iban} onChange={handleChange} />
        </div>

        {isKapali && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Kapanma Tarihi:</label>
            <input type="date" name="kapanmaTarihi" value={form.kapanmaTarihi} onChange={handleChange} />
          </div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Faizli Bakiye:</label>
          <input name="faizliBakiye" value={form.faizliBakiye} disabled />
        </div>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          type="submit"
          style={{
            padding: "10px 30px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {selectedAccount ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </form>
  );
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "6px",
  fontWeight: "bold",
  color: "#ccc",
};

export default AccountForm;
