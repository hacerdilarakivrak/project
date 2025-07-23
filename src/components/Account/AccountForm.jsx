import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";
const CUSTOMER_API = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const AccountForm = ({ onAccountAdded, selectedAccount, clearSelectedAccount }) => {
  const [editId, setEditId] = useState(null);
  const [customers, setCustomers] = useState([]);

  const [account, setAccount] = useState({
    musteriNo: "",
    ekNo: "",
    kayitTarihi: new Date().toISOString().split("T")[0],
    kayitDurumu: "",
    hesapAdi: "",
    dovizKodu: "",
    bakiyeTutar: "",
    blokeTutar: "",
    faizOrani: "",
    iban: "",
    kapanmaTarihi: "",
    faizliBakiye: ""
  });

  // Formu güncelleme modunda doldur
  useEffect(() => {
    if (selectedAccount) {
      setAccount(selectedAccount);
      setEditId(selectedAccount.id);
    }
  }, [selectedAccount]);

  // Müşteri listesini çek
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(CUSTOMER_API);
        setCustomers(response.data);
      } catch (error) {
        console.error("Müşteriler alınamadı:", error);
      }
    };

    fetchCustomers();
  }, []);

  // Faizli bakiye hesapla (otomatik)
  useEffect(() => {
    const faiz = parseFloat(account.faizOrani) || 0;
    const bakiye = parseFloat(account.bakiyeTutar) || 0;
    const faizli = bakiye + (bakiye * faiz / 100);
    setAccount(prev => ({ ...prev, faizliBakiye: faizli.toFixed(2) }));
  }, [account.bakiyeTutar, account.faizOrani]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, account);
      } else {
        await axios.post(API_URL, account);
      }
      resetForm();
      onAccountAdded();
      clearSelectedAccount();
    } catch (error) {
      console.error("Hesap işlemi hatası:", error);
    }
  };

  const resetForm = () => {
    setAccount({
      musteriNo: "",
      ekNo: "",
      kayitTarihi: new Date().toISOString().split("T")[0],
      kayitDurumu: "",
      hesapAdi: "",
      dovizKodu: "",
      bakiyeTutar: "",
      blokeTutar: "",
      faizOrani: "",
      iban: "",
      kapanmaTarihi: "",
      faizliBakiye: ""
    });
    setEditId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>

        <select name="musteriNo" value={account.musteriNo} onChange={handleChange}>
          <option value="">Müşteri Seçin</option>
          {customers.map((c) => (
            <option key={c.id} value={c.musteriNo}>
              {c.ad && c.soyad ? `${c.ad} ${c.soyad}` : c.adSoyad} ({c.musteriNo})
            </option>
          ))}
        </select>

        <input name="ekNo" placeholder="Ek No" value={account.ekNo} onChange={handleChange} />
        <input name="kayitTarihi" type="date" value={account.kayitTarihi} onChange={handleChange} />

        <select name="hesapDurumu" value={account.hesapDurumu} onChange={handleChange}>
          <option value="">Hesap Durumu</option>
          <option value="Açık">Açık</option>
          <option value="Kapalı">Kapalı</option>
        </select>

        <input name="hesapAdi" placeholder="Hesap Adı" value={account.hesapAdi} onChange={handleChange} />

        <select name="dovizKodu" value={account.dovizKodu} onChange={handleChange}>
          <option value="">Döviz Kodu</option>
          <option value="TRY">₺ - Türk Lirası</option>
          <option value="USD">$ - Dolar</option>
          <option value="EUR">€ - Euro</option>
          <option value="GBP">£ - Sterlin</option>
          <option value="JPY">¥ - Yen</option>
        </select>

        <input name="bakiyeTutar" type="number" placeholder="Bakiye" value={account.bakiyeTutar} onChange={handleChange} />
        <input name="blokeTutar" type="number" placeholder="Bloke Tutar" value={account.blokeTutar} onChange={handleChange} />
        <input name="faizOrani" type="number" placeholder="Faiz Oranı (%)" value={account.faizOrani} onChange={handleChange} />
        <input name="iban" placeholder="IBAN" value={account.iban} onChange={handleChange} />

        <input name="kapanmaTarihi" type="date" placeholder="Kapanma Tarihi" value={account.kapanmaTarihi} onChange={handleChange} />
        <input name="faizliBakiye" value={account.faizliBakiye} disabled placeholder="Faizli Bakiye" />

      </div>

      <button onClick={handleSubmit}>{editId ? "Güncelle" : "Ekle"}</button>
      {editId && (
        <button
          onClick={() => {
            resetForm();
            clearSelectedAccount();
          }}
          style={{ marginLeft: "10px" }}
        >
          İptal
        </button>
      )}
    </div>
  );
};

export default AccountForm;
