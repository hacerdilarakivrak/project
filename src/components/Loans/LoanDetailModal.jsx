import React, { useState, useEffect, useMemo } from "react";
import { calcRiskScore } from "../../utils/riskScore";
import RiskBadge from "./RiskBadge";

const THEME_MAP = {
  "İhtiyaç Kredisi": { accent: "#3b82f6", soft: "#eff6ff", icon: "🧾" },
  "Taşıt Kredisi": { accent: "#f59e0b", soft: "#fff7ed", icon: "🚗" },
  "Konut Kredisi": { accent: "#10b981", soft: "#ecfdf5", icon: "🏠" },
  "Bireysel": { accent: "#6366f1", soft: "#eef2ff", icon: "👤" },
  "Ticari": { accent: "#0ea5e9", soft: "#e0f2fe", icon: "🏢" },
  default: { accent: "#27ae60", soft: "#e8f5e9", icon: "💳" },
};

const LoanDetailModal = ({ loan, onClose }) => {
  if (!loan) return null;

  const typeKey =
    (loan?.subLoanType || "").trim() ||
    (loan?.loanType || "").trim() ||
    "default";

  const theme =
    THEME_MAP[typeKey] ||
    THEME_MAP[
      Object.keys(THEME_MAP).find((k) =>
        typeKey.toLowerCase().includes(k.toLowerCase())
      ) || "default"
    ];

  const [paidInstallments, setPaidInstallments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const savedPayments =
      JSON.parse(localStorage.getItem(`paidInstallments_${loan.id}`)) || [];
    setPaidInstallments(savedPayments);

    const savedHistory =
      JSON.parse(localStorage.getItem(`paymentHistory_${loan.id}`)) || [];
    setPaymentHistory(savedHistory);
  }, [loan.id]);

  const savePaidInstallments = (updated) => {
    setPaidInstallments(updated);
    localStorage.setItem(
      `paidInstallments_${loan.id}`,
      JSON.stringify(updated)
    );
  };

  const savePaymentHistory = (updated) => {
    setPaymentHistory(updated);
    localStorage.setItem(
      `paymentHistory_${loan.id}`,
      JSON.stringify(updated)
    );
  };

  const calculateInstallments = () => {
    const amount = parseFloat(loan.amount);
    const monthlyRate = parseFloat(loan.interestRate) / 100 / 12;
    const term = parseInt(loan.term);
    const installments = [];

    const monthlyPayment =
      (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));

    const startDate = new Date(loan.startDate || new Date());
    let remainingPrincipal = amount;

    for (let i = 1; i <= term; i++) {
      const interestPortion = remainingPrincipal * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      remainingPrincipal -= principalPortion;

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);

      const today = new Date();
      const diff = Math.floor((paymentDate - today) / (1000 * 60 * 60 * 24));

      let status = "Ödenecek";
      if (diff < 0) status = "Gecikmiş";
      else if (diff === 0) status = "Bugün";

      installments.push({
        number: i,
        date: paymentDate.toLocaleDateString(),
        ts: paymentDate.getTime(),
        amount: monthlyPayment.toFixed(2),
        interest: interestPortion.toFixed(2),
        principal: principalPortion.toFixed(2),
        remaining: Math.max(remainingPrincipal, 0).toFixed(2),
        status,
      });
    }

    return installments;
  };

  const installments = useMemo(calculateInstallments, [
    loan.amount,
    loan.interestRate,
    loan.term,
    loan.startDate,
  ]);

  const getStatusColor = (status) => {
    if (status === "Ödendi") return "#2ecc71";
    if (status === "Ödenecek") return "#e74c3c";
    if (status === "Gecikmiş") return "#e74c3c";
    if (status === "Bugün") return "#f39c12";
    return "#2ecc71";
  };

  const addHistory = (installmentNo) => {
    const exists = paymentHistory.some((h) => h.number === installmentNo);
    if (exists) return;
    const inst = installments.find((i) => i.number === installmentNo);
    const entry = {
      number: installmentNo,
      amount: inst ? parseFloat(inst.amount) : 0,
      paidAt: new Date().toISOString(),
    };
    const updated = [...paymentHistory, entry];
    savePaymentHistory(updated);
  };

  const removeHistory = (installmentNo) => {
    const updated = paymentHistory.filter((h) => h.number !== installmentNo);
    savePaymentHistory(updated);
  };

  const handleCheckboxChange = (number) => {
    let updated;
    if (paidInstallments.includes(number)) {
      updated = paidInstallments.filter((n) => n !== number);
      removeHistory(number);
    } else {
      updated = [...paidInstallments, number];
      addHistory(number);
    }
    savePaidInstallments(updated);
  };

  const handleEarlyClose = () => {
    const all = installments.map((i) => i.number);
    savePaidInstallments(all);
    const now = new Date().toISOString();
    const missing = installments
      .filter((i) => !paymentHistory.some((h) => h.number === i.number))
      .map((i) => ({
        number: i.number,
        amount: parseFloat(i.amount),
        paidAt: now,
      }));
    if (missing.length > 0) {
      savePaymentHistory([...paymentHistory, ...missing]);
    }
    localStorage.setItem(`loanClosed_${loan.id}`, "1");
  };

  const totalInstallments = installments.length;
  const paidCount = paidInstallments.length;
  const monthlyPayment =
    installments.length > 0 ? parseFloat(installments[0].amount) : 0;
  const totalAmount = monthlyPayment * totalInstallments;
  const paidAmount = monthlyPayment * paidCount;
  const totalInterest = totalAmount - parseFloat(loan.amount);

  const dailyLateFeeRate = 0.0005;
  let lateFee = 0;
  const todayStartMs = new Date();
  todayStartMs.setHours(0, 0, 0, 0);
  const todayMs = todayStartMs.getTime();

  installments.forEach((inst) => {
    const isPaid = paidInstallments.includes(inst.number);
    if (!isPaid && inst.status === "Gecikmiş") {
      const daysLate = Math.floor((todayMs - inst.ts) / (1000 * 60 * 60 * 24));
      if (daysLate > 0) {
        lateFee += monthlyPayment * dailyLateFeeRate * daysLate;
      }
    }
  });

  const isClosed =
    paidCount === totalInstallments ||
    localStorage.getItem(`loanClosed_${loan.id}`) === "1";
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const remainingWithLateFee = isClosed ? 0 : remainingAmount + lateFee;
  const progress =
    totalAmount > 0
      ? isClosed
        ? 100
        : (paidAmount / totalAmount) * 100
      : 0;

  const rs = calcRiskScore({
    income: Number(loan.income) || 0,
    otherDebts: Number(loan.otherDebts) || 0,
    loanAmount: Number(loan.amount) || 0,
    term: parseInt(loan.term, 10) || 0,
    annualRate: (Number(loan.interestRate) || 0) / 100,
    lateCount: Number(loan.lateCount) || 0,
  });

  const paymentHistorySorted = [...paymentHistory].sort((a, b) => {
    if (a.paidAt > b.paidAt) return -1;
    if (a.paidAt < b.paidAt) return 1;
    return 0;
  });

  const fmtTRY = (v) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(Number(v) || 0);

  return (
    <div style={overlayStyle}>
      <style>{responsiveCss(theme.accent)}</style>
      <div style={{ ...modalStyle, borderTop: `6px solid ${theme.accent}` }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {theme.icon} Kredi Detayları
        </h2>
        <p>
          <strong>Müşteri:</strong> {loan.customerName}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>Kredi Türü:</strong>{" "}
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: theme.soft,
              color: theme.accent,
              fontWeight: 600,
            }}
          >
            {loan.subLoanType || loan.loanType}
          </span>
        </p>
        <p>
          <strong>Alt Tür:</strong> {loan.subLoanType || "-"}
        </p>
        <p>
          <strong>Tutar:</strong> {fmtTRY(loan.amount)}
        </p>
        <p>
          <strong>Vade:</strong> {loan.term} ay
        </p>
        <p>
          <strong>Faiz Oranı:</strong> %{loan.interestRate}
        </p>
        <p>
          <strong>Başvuru Tarihi:</strong>{" "}
          {new Date(loan.startDate).toLocaleDateString()}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>Durum:</strong> {loan.status}
          {isClosed && (
            <span
              style={{
                marginLeft: 8,
                padding: "2px 8px",
                borderRadius: 8,
                background: "#e3fcef",
                color: "#057a55",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              Kapandı
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <div
            style={{
              ...summaryBoxStyle,
              background: "#e0f7fa",
              color: "#006064",
            }}
          >
            <strong>Toplam Tutar</strong>
            <div>{fmtTRY(totalAmount)}</div>
          </div>
          <div
            style={{
              ...summaryBoxStyle,
              background: "#e8f5e9",
              color: "#1b5e20",
            }}
          >
            <strong>Ödenen Toplam</strong>
            <div>{fmtTRY(paidAmount)}</div>
          </div>
          <div
            style={{
              ...summaryBoxStyle,
              background: "#fff3e0",
              color: "#e65100",
            }}
          >
            <strong>Kalan Anapara</strong>
            <div>{fmtTRY(remainingAmount)}</div>
          </div>
          <div
            style={{
              ...summaryBoxStyle,
              background: "#fce4ec",
              color: "#880e4f",
              position: "relative",
            }}
          >
            <strong style={{ display: "inline-flex", alignItems: "center" }}>
              Toplam Faiz
              <span className="tt" aria-label="toplam-faiz">
                ?
                <span className="tt-content">
                  Toplam faiz = (Aylık ödeme × vade) − kredi tutarı
                </span>
              </span>
            </strong>
            <div>{fmtTRY(totalInterest)}</div>
          </div>
        </div>
        <h4 style={{ marginTop: "30px" }}>📊 Ödeme Durumu</h4>
        <p>
          {paidCount}/{totalInstallments} taksit (
          {(isClosed ? totalAmount : paidAmount).toFixed(2)} ₺ /{" "}
          {totalAmount.toFixed(2)} ₺ ödendi)
        </p>
        <p style={{ fontWeight: "bold", color: "#c0392b" }}>
          Kalan Borç: {remainingWithLateFee.toFixed(2)} ₺
          {!isClosed && lateFee > 0 && (
            <span style={{ color: "#e74c3c" }}>
              {" "}
              (+ {lateFee.toFixed(2)} ₺ gecikme faizi)
            </span>
          )}
        </p>
        <div
          style={{
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
            height: "20px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              background: theme.accent,
              height: "100%",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleEarlyClose}
            style={{
              padding: "10px 14px",
              backgroundColor: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            disabled={isClosed}
          >
            Erken Kapat
          </button>
        </div>
        <h3 style={{ marginTop: "24px" }}>📅 Ödeme Planı</h3>
        <div className="table-wrap">
          <table style={tableStyle} className="rtable">
            <thead>
              <tr>
                <th>Taksit</th>
                <th>Ödeme Tarihi</th>
                <th>Taksit Tutarı</th>
                <th>Faiz</th>
                <th>Anapara</th>
                <th>Kalan Anapara</th>
                <th>Durum</th>
                <th>Ödendi mi?</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((item) => {
                const effectiveStatus = paidInstallments.includes(item.number)
                  ? "Ödendi"
                  : item.status;
                return (
                  <tr key={item.number}>
                    <td data-label="Taksit">{item.number}</td>
                    <td data-label="Ödeme Tarihi">{item.date}</td>
                    <td data-label="Taksit Tutarı">{item.amount} ₺</td>
                    <td data-label="Faiz">{item.interest} ₺</td>
                    <td data-label="Anapara">{item.principal} ₺</td>
                    <td data-label="Kalan Anapara">{item.remaining} ₺</td>
                    <td
                      data-label="Durum"
                      style={{
                        color: getStatusColor(effectiveStatus),
                        fontWeight: "bold",
                      }}
                    >
                      {effectiveStatus}
                    </td>
                    <td data-label="Ödendi mi?">
                      <input
                        type="checkbox"
                        checked={paidInstallments.includes(item.number)}
                        onChange={() => handleCheckboxChange(item.number)}
                        disabled={isClosed}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <h3 style={{ marginTop: "24px" }}>🧾 Ödeme Geçmişi</h3>
        {paymentHistorySorted.length > 0 ? (
          <div className="table-wrap">
            <table style={tableStyle} className="rtable">
              <thead>
                <tr>
                  <th>Taksit</th>
                  <th>Ödenen Tutar</th>
                  <th>Ödenme Zamanı</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistorySorted.map((h) => (
                  <tr key={h.number}>
                    <td data-label="Taksit">{h.number}</td>
                    <td data-label="Ödenen Tutar">{h.amount.toFixed(2)} ₺</td>
                    <td data-label="Ödenme Zamanı">
                      {new Date(h.paidAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: "#666", marginTop: 6 }}>
            Henüz ödeme kaydı yok.
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={onClose} style={buttonStyle}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

const summaryBoxStyle = {
  flex: 1,
  background: "#f4f6f8",
  borderRadius: "8px",
  padding: "12px",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "14px",
  width: "90vw",
  height: "90vh",
  overflowY: "auto",
  boxShadow: "0 2px 15px rgba(0,0,0,0.3)",
  color: "#333",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const buttonStyle = {
  padding: "10px 14px",
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

function responsiveCss(accent) {
  return `
  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .rtable th, .rtable td {
    border-bottom: 1px solid #eee;
    padding: 10px;
    text-align: left;
  }

  .tt {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:18px;
    height:18px;
    margin-left:6px;
    border-radius:999px;
    background:${accent};
    color:#fff;
    font-size:12px;
    font-weight:700;
    cursor:help;
    position:relative;
  }
  .tt .tt-content{
    position:absolute;
    bottom:130%;
    left:50%;
    transform:translateX(-50%);
    background:#111827;
    color:#fff;
    padding:8px 10px;
    border-radius:8px;
    white-space:nowrap;
    opacity:0;
    pointer-events:none;
    transition:opacity .15s ease;
    font-size:12px;
    box-shadow:0 8px 24px rgba(0,0,0,.18);
  }
  .tt:hover .tt-content{ opacity:1; }

  @media (max-width: 768px) {
    .rtable thead {
      display: none;
    }
    .rtable, .rtable tbody, .rtable tr, .rtable td {
      display: block;
      width: 100%;
    }
    .rtable tr {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-left: 4px solid ${accent};
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 8px 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .rtable td {
      border: none;
      border-bottom: 1px dashed #eee;
      position: relative;
      padding-left: 120px;
      min-height: 40px;
    }
    .rtable td:last-child { border-bottom: none; }
    .rtable td::before {
      content: attr(data-label);
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 600;
      color: #6b7280;
      width: 100px;
      white-space: nowrap;
    }
  }
  `;
}

export default LoanDetailModal;
