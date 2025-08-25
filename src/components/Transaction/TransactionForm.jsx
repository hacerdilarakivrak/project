import React, { useState, useEffect } from "react";
import api from "../../api";

const TransactionForm = ({ onTransactionAdded }) => {
  const [hesaplar, setHesaplar] = useState([]);
  const [musteriler, setMusteriler] = useState([]);

  const [gonderenHesapID, setGonderenHesapID] = useState("");
  const [aliciHesapID, setAliciHesapID] = useState("");

  const [seciliMusteri, setSeciliMusteri] = useState("");
  const [faturaTuru, setFaturaTuru] = useState("electricity");
  const [faturaNo, setFaturaNo] = useState("");

  const [tur, setTur] = useState("paraYatirma");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState("");
  const [aciklama, setAciklama] = useState("");

  const normalizeAccount = (a) => ({
    id: a.id,
    hesapAdi: a.hesapAdi || a.name || `Hesap ${a.id}`,
    bakiye: Number(a.bakiye || 0),
  });

  const normalizeCustomer = (c) => ({
    id: c.id,
    musteriNo: c.musteriNo || c.customerNo || String(c.id ?? ""),
    ad: c.ad || c.firstName || "Ad",
    soyad: c.soyad || c.lastName || "Soyad",
  });

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/accounts");
      setHesaplar((Array.isArray(data) ? data : []).map(normalizeAccount));
    } catch (e) {
      console.warn("API accounts alınamadı.", e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setMusteriler((Array.isArray(data) ? data : []).map(normalizeCustomer));
    } catch (e) {
      console.warn("API customers alınamadı.", e);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCustomers();
  }, []);

  const getAccountById = (id) =>
    hesaplar.find((h) => String(h.id) === String(id));
  const getAccountNameById = (id) => {
    const a = getAccountById(id);
    return a?.hesapAdi || a?.name || (a ? `Hesap ${a.id}` : "");
  };

  const saveTransaction = async (tx) => {
    try {
      await api.post("/transactions", tx);
      onTransactionAdded?.("İşlem başarıyla eklendi!");
    } catch (err) {
      console.error("Transaction kaydedilemedi:", err);
      alert("İşlem kaydedilemedi!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(tutar);
    if (!amount || amount <= 0) {
      alert("Geçerli bir tutar giriniz!");
      return;
    }
    if (!tarih) {
      alert("Lütfen tarih seçiniz!");
      return;
    }

    let transactionData = {
      tur,
      tutar: amount,
      tarih,
      musteriID: seciliMusteri || null,
      aciklama,
    };

    if (tur === "transfer") {
      if (
        !gonderenHesapID ||
        !aliciHesapID ||
        gonderenHesapID === aliciHesapID
      ) {
        alert("Geçerli gönderen ve alıcı hesap seçiniz!");
        return;
      }
      transactionData = {
        ...transactionData,
        fromId: gonderenHesapID,
        toId: aliciHesapID,
        from: getAccountNameById(gonderenHesapID),
        to: getAccountNameById(aliciHesapID),
      };
    } else if (tur === "faturaOdeme") {
      if (!seciliMusteri || !gonderenHesapID || !faturaNo) {
        alert("Lütfen müşteri, hesap ve fatura numarasını giriniz!");
        return;
      }
      transactionData = {
        ...transactionData,
        fromId: gonderenHesapID,
        from: getAccountNameById(gonderenHesapID),
        to: `Fatura: ${faturaTuru} (${faturaNo})`,
        faturaTuru,
        faturaNo,
      };
    } else {
      if (!gonderenHesapID) {
        alert("Hesap seçiniz!");
        return;
      }
      transactionData = {
        ...transactionData,
        fromId: gonderenHesapID,
        from: getAccountNameById(gonderenHesapID),
        to: "-",
      };
    }

    await saveTransaction(transactionData);

    setGonderenHesapID("");
    setAliciHesapID("");
    setSeciliMusteri("");
    setFaturaTuru("electricity");
    setFaturaNo("");
    setTur("paraYatirma");
    setTutar("");
    setTarih("");
    setAciklama("");
  };

  return (
    <div>
      <h2>Yeni İşlem Ekle</h2>

      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={fetchAccounts}>
          Hesapları Yenile
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <select value={tur} onChange={(e) => setTur(e.target.value)}>
          <option value="paraYatirma">Para Yatırma</option>
          <option value="paraCekme">Para Çekme</option>
          <option value="transfer">Transfer</option>
          <option value="faturaOdeme">Fatura Ödeme</option>
        </select>

        {tur === "transfer" ? (
          <>
            <select
              value={gonderenHesapID}
              onChange={(e) => setGonderenHesapID(e.target.value)}
              required
            >
              <option value="">Gönderen Hesap</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hesapAdi}
                </option>
              ))}
            </select>
            <select
              value={aliciHesapID}
              onChange={(e) => setAliciHesapID(e.target.value)}
              required
            >
              <option value="">Alıcı Hesap</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hesapAdi}
                </option>
              ))}
            </select>
          </>
        ) : tur === "faturaOdeme" ? (
          <>
            <select
              value={gonderenHesapID}
              onChange={(e) => setGonderenHesapID(e.target.value)}
              required
            >
              <option value="">Hesap Seçin</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hesapAdi}
                </option>
              ))}
            </select>
            <select
              value={seciliMusteri}
              onChange={(e) => setSeciliMusteri(e.target.value)}
              required
            >
              <option value="">Müşteri Seçiniz</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.musteriNo} - {m.ad} {m.soyad}
                </option>
              ))}
            </select>
            <select
              value={faturaTuru}
              onChange={(e) => setFaturaTuru(e.target.value)}
            >
              <option value="electricity">Elektrik</option>
              <option value="water">Su</option>
              <option value="gas">Doğalgaz</option>
              <option value="internet">İnternet</option>
            </select>
            <input
              type="text"
              placeholder="Fatura No"
              value={faturaNo}
              onChange={(e) => setFaturaNo(e.target.value)}
              required
            />
          </>
        ) : (
          <select
            value={gonderenHesapID}
            onChange={(e) => setGonderenHesapID(e.target.value)}
            required
          >
            <option value="">Hesap Seçin</option>
            {hesaplar.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hesapAdi}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Tutar"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          required
          min="0.01"
          step="0.01"
        />
        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Açıklama"
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
        />
        <button type="submit">İşlemi Kaydet</button>
      </form>
    </div>
  );
};

export default TransactionForm;
