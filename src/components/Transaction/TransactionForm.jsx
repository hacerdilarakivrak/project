import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";
const ACCOUNTS_API = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";
const CUSTOMERS_API = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const TransactionForm = ({ onTransactionAdded }) => {
  const [hesaplar, setHesaplar] = useState([]);
  const [musteriler, setMusteriler] = useState([]);
  const [gonderenHesapID, setGonderenHesapID] = useState("");
  const [aliciHesapID, setAliciHesapID] = useState("");
  const [seciliMusteri, setSeciliMusteri] = useState("");
  const [faturaTuru, setFaturaTuru] = useState("electricity");
  const [faturaNo, setFaturaNo] = useState(""); // YENİ EKLENDİ
  const [tur, setTur] = useState("paraYatirma");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState("");
  const [aciklama, setAciklama] = useState("");

  useEffect(() => {
    fetchAccounts();
    fetchCustomers();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(ACCOUNTS_API);
      setHesaplar(res.data);
    } catch (err) {
      console.error("Hesaplar alınırken hata:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(CUSTOMERS_API);
      setMusteriler(res.data);
    } catch (err) {
      console.error("Müşteriler alınırken hata:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const islemTutar = Number(tutar);
    if (isNaN(islemTutar) || islemTutar <= 0) {
      alert("Geçerli bir tutar giriniz!");
      return;
    }

    if (tur === "faturaOdeme") {
      if (!seciliMusteri || !gonderenHesapID || !faturaNo) {
        alert("Lütfen müşteri, hesap ve fatura numarasını giriniz!");
        return;
      }

      const seciliHesap = hesaplar.find((h) => String(h.id) === String(gonderenHesapID));
      if (!seciliHesap) {
        alert("Hesap bulunamadı!");
        return;
      }

      if (islemTutar > seciliHesap.bakiye) {
        alert("Yetersiz bakiye!");
        return;
      }

      const yeniBakiye = seciliHesap.bakiye - islemTutar;

      const faturaIslem = {
        hesapID: seciliHesap.id,
        hesapAdi: seciliHesap.hesapAdi,
        tur: "faturaOdeme",
        faturaTuru,
        faturaNo,
        musteriID: seciliMusteri,
        tutar: islemTutar,
        tarih,
        aciklama: aciklama || `${faturaTuru} faturası ödemesi`,
        bakiyeSonrasi: yeniBakiye,
      };

      try {
        await axios.post(API_URL, faturaIslem);
        await axios.put(`${ACCOUNTS_API}/${gonderenHesapID}`, {
          ...seciliHesap,
          bakiye: yeniBakiye,
        });

        await fetchAccounts();
        onTransactionAdded();
        setGonderenHesapID("");
        setSeciliMusteri("");
        setFaturaTuru("electricity");
        setFaturaNo("");
        setTur("paraYatirma");
        setTutar("");
        setTarih("");
        setAciklama("");
      } catch (err) {
        console.error("Fatura ödeme sırasında hata:", err);
      }
      return;
    }

    if (tur === "transfer") {
      if (!gonderenHesapID || !aliciHesapID || gonderenHesapID === aliciHesapID) {
        alert("Geçerli gönderen ve alıcı hesap seçiniz!");
        return;
      }

      const gonderen = hesaplar.find((h) => String(h.id) === String(gonderenHesapID));
      const alici = hesaplar.find((h) => String(h.id) === String(aliciHesapID));

      if (!gonderen || !alici) {
        alert("Hesap bulunamadı!");
        return;
      }

      if (islemTutar > gonderen.bakiye) {
        alert("Gönderen hesapta yeterli bakiye yok!");
        return;
      }

      const gonderenYeniBakiye = gonderen.bakiye - islemTutar;
      const aliciYeniBakiye = (alici.bakiye || 0) + islemTutar;

      const gonderenIslem = {
        hesapID: gonderen.id,
        hesapAdi: gonderen.hesapAdi,
        tur: "transferGonderen",
        tutar: islemTutar,
        tarih,
        aciklama,
        bakiyeSonrasi: gonderenYeniBakiye,
        musteriID: gonderen.musteriNo,
      };

      const aliciIslem = {
        hesapID: alici.id,
        hesapAdi: alici.hesapAdi,
        tur: "transferAlici",
        tutar: islemTutar,
        tarih,
        aciklama,
        bakiyeSonrasi: aliciYeniBakiye,
        musteriID: alici.musteriNo,
      };

      try {
        await axios.post(API_URL, gonderenIslem);
        await axios.post(API_URL, aliciIslem);
        await axios.put(`${ACCOUNTS_API}/${gonderen.id}`, { ...gonderen, bakiye: gonderenYeniBakiye });
        await axios.put(`${ACCOUNTS_API}/${alici.id}`, { ...alici, bakiye: aliciYeniBakiye });
        await fetchAccounts();
        onTransactionAdded();
        setGonderenHesapID("");
        setAliciHesapID("");
        setTur("paraYatirma");
        setTutar("");
        setTarih("");
        setAciklama("");
      } catch (err) {
        console.error("Transfer işlemi sırasında hata:", err);
      }
      return;
    }

    const seciliHesap = hesaplar.find((h) => String(h.id) === String(gonderenHesapID));
    if (!seciliHesap) {
      alert("Hesap bulunamadı!");
      return;
    }

    let yeniBakiye = Number(seciliHesap.bakiye) || 0;
    if (tur === "paraYatirma") {
      yeniBakiye += islemTutar;
    } else if (tur === "paraCekme") {
      if (islemTutar > yeniBakiye) {
        alert("Yetersiz bakiye!");
        return;
      }
      yeniBakiye -= islemTutar;
    }

    const yeniIslem = {
      hesapID: seciliHesap.id,
      hesapAdi: seciliHesap.hesapAdi,
      tur,
      tutar: islemTutar,
      tarih,
      musteriID: seciliHesap.musteriNo,
      aciklama,
      bakiyeSonrasi: yeniBakiye,
    };

    try {
      await axios.post(API_URL, yeniIslem);
      await axios.put(`${ACCOUNTS_API}/${gonderenHesapID}`, {
        ...seciliHesap,
        bakiye: yeniBakiye,
      });
      await fetchAccounts();
      onTransactionAdded();
      setGonderenHesapID("");
      setTur("paraYatirma");
      setTutar("");
      setTarih("");
      setAciklama("");
    } catch (err) {
      console.error("İşlem eklenirken hata oluştu:", err);
    }
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
            <select value={gonderenHesapID} onChange={(e) => setGonderenHesapID(e.target.value)} required>
              <option value="">Gönderen Hesap</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>{h.hesapAdi}</option>
              ))}
            </select>

            <select value={aliciHesapID} onChange={(e) => setAliciHesapID(e.target.value)} required>
              <option value="">Alıcı Hesap</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>{h.hesapAdi}</option>
              ))}
            </select>
          </>
        ) : tur === "faturaOdeme" ? (
          <>
            <select value={gonderenHesapID} onChange={(e) => setGonderenHesapID(e.target.value)} required>
              <option value="">Hesap Seçin</option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>{h.hesapAdi}</option>
              ))}
            </select>

            <select value={seciliMusteri} onChange={(e) => setSeciliMusteri(e.target.value)} required>
              <option value="">Müşteri Seçiniz</option>
              {musteriler.map((m) => (
                <option key={m.id} value={m.musteriNo}>
                  {m.musteriNo} - {m.ad} {m.soyad}
                </option>
              ))}
            </select>

            <select value={faturaTuru} onChange={(e) => setFaturaTuru(e.target.value)}>
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
          <select value={gonderenHesapID} onChange={(e) => setGonderenHesapID(e.target.value)} required>
            <option value="">Hesap Seçin</option>
            {hesaplar.map((h) => (
              <option key={h.id} value={h.id}>{h.hesapAdi}</option>
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

        <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} required />

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

