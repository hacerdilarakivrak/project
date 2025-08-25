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

  const readLS = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch { return []; }
  };
  const writeLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

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
    let acc = readLS("accounts");
    if (Array.isArray(acc) && acc.length > 0) {
      setHesaplar(acc.map(normalizeAccount));
      return;
    }
    try {
      const { data } = await api.get("/accounts");
      const arr = (Array.isArray(data) ? data : []).map(normalizeAccount);
      if (arr.length > 0) {
        writeLS("accounts", arr);
        setHesaplar(arr);
        return;
      }
    } catch (e) {
      console.warn("API accounts alınamadı, seed kullanılacak.", e);
    }
    const seed = [
      { id: 1, hesapAdi: "Vadesiz TL", bakiye: 1000 },
      { id: 2, hesapAdi: "Birikim", bakiye: 5000 },
      { id: 3, hesapAdi: "Kredi Kartı", bakiye: -2500 },
    ];
    writeLS("accounts", seed);
    setHesaplar(seed);
  };

  const fetchCustomers = async () => {
    let cus = readLS("customers");
    if (Array.isArray(cus) && cus.length > 0) {
      setMusteriler(cus.map(normalizeCustomer));
      return;
    }
    try {
      const { data } = await api.get("/customers");
      const arr = (Array.isArray(data) ? data : []).map(normalizeCustomer);
      if (arr.length > 0) {
        writeLS("customers", arr);
        setMusteriler(arr);
        return;
      }
    } catch (e) {
      console.warn("API customers alınamadı, seed kullanılacak.", e);
    }
    const seed = [
      { id: 1, musteriNo: "1001", ad: "Ali", soyad: "Yılmaz" },
      { id: 2, musteriNo: "1002", ad: "Ayşe", soyad: "Demir" },
    ];
    writeLS("customers", seed);
    setMusteriler(seed);
  };

  useEffect(() => {
    fetchAccounts();
    fetchCustomers();
  }, []);

  const getAccountById = (id) => hesaplar.find((h) => String(h.id) === String(id));
  const getAccountNameById = (id) => {
    const a = getAccountById(id);
    return a?.hesapAdi || a?.name || (a ? `Hesap ${a.id}` : "");
  };

  const updateAccountBalance = (id, newBalance) => {
    const acc = [...hesaplar];
    const idx = acc.findIndex((h) => String(h.id) === String(id));
    if (idx >= 0) {
      acc[idx] = { ...acc[idx], bakiye: Number(newBalance) || 0 };
      writeLS("accounts", acc);
      setHesaplar(acc);
    }
  };

  const saveTransaction = (tx) => {
    const prev = readLS("transactions");
    const next = [tx, ...prev];
    writeLS("transactions", next);
  };

  const handleSubmit = (e) => {
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

    if (tur === "transfer") {
      if (!gonderenHesapID || !aliciHesapID || gonderenHesapID === aliciHesapID) {
        alert("Geçerli gönderen ve alıcı hesap seçiniz!");
        return;
      }
      const fromAcc = getAccountById(gonderenHesapID);
      const toAcc = getAccountById(aliciHesapID);
      if (!fromAcc || !toAcc) {
        alert("Hesap bulunamadı!");
        return;
      }
      const fromBal = Number(fromAcc.bakiye || 0);
      if (amount > fromBal) {
        alert("Yetersiz bakiye!");
        return;
      }

      updateAccountBalance(gonderenHesapID, fromBal - amount);
      const toBal = Number(toAcc.bakiye || 0);
      updateAccountBalance(aliciHesapID, toBal + amount);

      saveTransaction({
        id: crypto.randomUUID(),
        from: getAccountNameById(gonderenHesapID),
        to: getAccountNameById(aliciHesapID),
        tutar: amount,
        tarih,
        type: "transfer",
        aciklama,
      });

      setGonderenHesapID("");
      setAliciHesapID("");
      setTur("paraYatirma");
      setTutar("");
      setTarih("");
      setAciklama("");
      onTransactionAdded?.("Transfer başarıyla eklendi!");
      return;
    }

    if (tur === "faturaOdeme") {
      if (!seciliMusteri || !gonderenHesapID || !faturaNo) {
        alert("Lütfen müşteri, hesap ve fatura numarasını giriniz!");
        return;
      }
      const fromAcc = getAccountById(gonderenHesapID);
      if (!fromAcc) {
        alert("Hesap bulunamadı!");
        return;
      }
      const fromBal = Number(fromAcc.bakiye || 0);
      if (amount > fromBal) {
        alert("Yetersiz bakiye!");
        return;
      }

      updateAccountBalance(gonderenHesapID, fromBal - amount);

      const faturaLabelMap = {
        electricity: "Elektrik",
        water: "Su",
        gas: "Doğalgaz",
        internet: "İnternet",
      };
      const toLabel = `Fatura: ${faturaLabelMap[faturaTuru] || faturaTuru} (${faturaNo})`;

      saveTransaction({
        id: crypto.randomUUID(),
        from: getAccountNameById(gonderenHesapID),
        to: toLabel,
        tutar: amount,
        tarih,
        type: "faturaOdeme",
        aciklama,
      });

      setGonderenHesapID("");
      setSeciliMusteri("");
      setFaturaTuru("electricity");
      setFaturaNo("");
      setTur("paraYatirma");
      setTutar("");
      setTarih("");
      setAciklama("");
      onTransactionAdded?.("Fatura ödeme işlemi eklendi!");
      return;
    }

    const acc = getAccountById(gonderenHesapID);
    if (!acc) {
      alert("Hesap bulunamadı!");
      return;
    }
    let bal = Number(acc.bakiye || 0);

    if (tur === "paraYatirma") {
      bal += amount;
    } else if (tur === "paraCekme") {
      if (amount > bal) {
        alert("Yetersiz bakiye!");
        return;
      }
      bal -= amount;
    }

    updateAccountBalance(gonderenHesapID, bal);

    saveTransaction({
      id: crypto.randomUUID(),
      from: getAccountNameById(gonderenHesapID),
      to: "-",
      tutar: amount,
      tarih,
      type: tur,
      aciklama,
    });

    setGonderenHesapID("");
    setTur("paraYatirma");
    setTutar("");
    setTarih("");
    setAciklama("");
    onTransactionAdded?.("İşlem başarıyla eklendi!");
  };

  return (
    <div>
      <h2>Yeni İşlem Ekle</h2>
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
                <option key={m.id} value={m.musteriNo}>
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
