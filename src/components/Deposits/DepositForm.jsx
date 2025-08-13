import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function DepositForm({ onAdd, onNotify }) {
  const [type, setType] = useState("Vadeli");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [termMonths, setTermMonths] = useState("3");
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers"
        );
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        onNotify?.({ type: "error", message: "Müşteri listesi alınamadı." });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [onNotify]);

  const calcMaturityDate = () => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + Number(termMonths || 0));
    return d.toISOString().slice(0, 10);
  };

  const buildName = (c) => {
    const composed = [c.ad, c.soyad].map(x => (x || "").trim()).filter(Boolean).join(" ");
    const alt = (c.adSoyad || c.fullName || c.name || "").toString().trim();
    return composed || alt || "İsimsiz";
  };

  const buildCode = (c) => c.musteriNo || c.nationalId || c.tcKimlikNo || c.id;

  const displayName = (c) => `${buildCode(c)} - ${buildName(c)}`;

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) =>
      String(buildCode(a)).localeCompare(String(buildCode(b)))
    );
  }, [customers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      onNotify?.({ type: "error", message: "Lütfen bir müşteri seçiniz." });
      return;
    }
    if (!amount) {
      onNotify?.({ type: "error", message: "Tutar zorunludur." });
      return;
    }

    const c = customers.find((x) => String(x.id) === String(customerId));

    const deposit = {
      id: crypto.randomUUID(),
      customerId,
      customerName: c ? buildName(c) : "Bilinmiyor",
      customerNo: c ? buildCode(c) : null,
      type,
      amount: Number(amount),
      interestRate: type === "Vadeli" ? Number(interestRate || 0) : 0,
      startDate,
      termMonths: type === "Vadeli" ? Number(termMonths || 0) : 0,
      maturityDate: type === "Vadeli" ? calcMaturityDate() : null,
      status: "Aktif",
      createdAt: new Date().toISOString(),
      transactions: [],
    };

    onAdd(deposit);
    onNotify?.({ type: "success", message: "Mevduat başarıyla eklendi." });
    setAmount("");
    setInterestRate("");
    setTermMonths("3");
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Mevduat Aç</h3>

      <div className="row">
        <label>Müşteri</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? "Yükleniyor..." : "Müşteri Seçiniz"}</option>
          {sortedCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {displayName(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <label>Tür</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Vadeli</option>
          <option>Vadesiz</option>
        </select>
      </div>

      <div className="row">
        <label>Tutar (₺)</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      {type === "Vadeli" && (
        <>
          <div className="row">
            <label>Faiz Oranı (%)</label>
            <input type="number" min="0" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
          </div>
          <div className="row">
            <label>Başlangıç Tarihi</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="row">
            <label>Vade (ay)</label>
            <input type="number" min="1" step="1" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
          </div>
          <div className="hint">
            Vade sonu: <b>
              {startDate
                ? new Date(
                    new Date(startDate).setMonth(
                      new Date(startDate).getMonth() + Number(termMonths || 0)
                    )
                  ).toISOString().slice(0, 10)
                : "-"}
            </b>
          </div>
        </>
      )}

      <button type="submit">Hesap Aç</button>
    </form>
  );
}
