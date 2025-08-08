import React, { useState, useEffect } from "react";
import { calcRiskScore } from "../../utils/riskScore";
import RiskBadge from "./RiskBadge";

const LoanDetailModal = ({ loan, onClose }) => {
  if (!loan) return null;

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

  const installments = calculateInstallments();

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
      .map((i) => ({ number: i.number, amount: parseFloat(i.amount), paidAt: now }));
    if (missing.length > 0) {
      savePaymentHistory([...paymentHistory, ...missing]);
    }
    localStorage.setItem(`loanClosed_${loan.id}`, "1");
  };

  const totalInstallments = installments.length;
  const paidCount = paidInstallments.length;
  const monthlyPayment = installments.length > 0 ? parseFloat(installments[0].amount) : 0;
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

  const isClosed = paidCount === totalInstallments || localStorage.getItem(`loanClosed_${loan.id}`) === "1";
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const remainingWithLateFee = isClosed ? 0 : remainingAmount + lateFee;
  const progress = totalAmount > 0 ? (isClosed ? 100 : (paidAmount / totalAmount) * 100) : 0;

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

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Kredi Detayları</h2>
        <p><strong>Müşteri:</strong> {loan.customerName}</p>
        <p><strong>Kredi Türü:</strong> {loan.loanType}</p>
        <p><strong>Alt Tür:</strong> {loan.subLoanType || "-"}</p>
        <p><strong>Tutar:</strong> {loan.amount} ₺</p>
        <p><strong>Vade:</strong> {loan.term} ay</p>
        <p><strong>Faiz Oranı:</strong> %{loan.interestRate}</p>
        <p><strong>Başvuru Tarihi:</strong> {new Date(loan.startDate).toLocaleDateString()}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>Durum:</strong> {loan.status}
          {isClosed && (
            <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 8, background: "#e3fcef", color: "#057a55", fontWeight: "bold", fontSize: 12 }}>
              Kapandı
            </span>
          )}
        </p>

        {/* Özet Kutuları */}
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <div style={summaryBoxStyle}>
            <strong>Toplam Tutar</strong>
            <div>₺{totalAmount.toFixed(2)}</div>
          </div>
          <div style={summaryBoxStyle}>
            <strong>Ödenen Toplam</strong>
            <div>₺{paidAmount.toFixed(2)}</div>
          </div>
          <div style={summaryBoxStyle}>
            <strong>Kalan Anapara</strong>
            <div>₺{remainingAmount.toFixed(2)}</div>
          </div>
          <div style={summaryBoxStyle}>
            <strong>Toplam Faiz</strong>
            <div>₺{totalInterest.toFixed(2)}</div>
          </div>
        </div>

        <h4 style={{ marginTop: "30px" }}>📊 Ödeme Durumu</h4>
        <p>
          {paidCount}/{totalInstallments} taksit ({(isClosed ? totalAmount : paidAmount).toFixed(2)} ₺ / {totalAmount.toFixed(2)} ₺ ödendi)
        </p>
        <p style={{ fontWeight: "bold", color: "#c0392b" }}>
          Kalan Borç: {remainingWithLateFee.toFixed(2)} ₺
          {!isClosed && lateFee > 0 && (
            <span style={{ color: "#e74c3c" }}>
              {" "}(+ {lateFee.toFixed(2)} ₺ gecikme faizi)
            </span>
          )}
        </p>
        <div style={{ background: "#ddd", borderRadius: "10px", overflow: "hidden", height: "20px" }}>
          <div style={{ width: `${progress}%`, background: "#27ae60", height: "100%", transition: "width 0.3s ease" }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={handleEarlyClose} style={{ padding: "10px 14px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} disabled={isClosed}>
            Erken Kapat
          </button>
        </div>

        <h3 style={{ marginTop: "24px" }}>📅 Ödeme Planı</h3>
        <table style={tableStyle}>
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
              const effectiveStatus = paidInstallments.includes(item.number) ? "Ödendi" : item.status;
              return (
                <tr key={item.number}>
                  <td>{item.number}</td>
                  <td>{item.date}</td>
                  <td>{item.amount} ₺</td>
                  <td>{item.interest} ₺</td>
                  <td>{item.principal} ₺</td>
                  <td>{item.remaining} ₺</td>
                  <td style={{ color: getStatusColor(effectiveStatus), fontWeight: "bold" }}>{effectiveStatus}</td>
                  <td>
                    <input type="checkbox" checked={paidInstallments.includes(item.number)} onChange={() => handleCheckboxChange(item.number)} disabled={isClosed} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ marginTop: "24px" }}>🧾 Ödeme Geçmişi</h3>
        {paymentHistorySorted.length > 0 ? (
          <table style={tableStyle}>
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
                  <td>{h.number}</td>
                  <td>{h.amount.toFixed(2)} ₺</td>
                  <td>{new Date(h.paidAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: "#666", marginTop: 6 }}>Henüz ödeme kaydı yok.</div>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={onClose} style={buttonStyle}>Kapat</button>
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
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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

export default LoanDetailModal;

