import React, { useState } from "react";

const LoanDetailModal = ({ loan, onClose }) => {
  if (!loan) return null;

  const [paidInstallments, setPaidInstallments] = useState([]);

  const calculateInstallments = () => {
    const amount = parseFloat(loan.amount);
    const interest = parseFloat(loan.interestRate) / 100 / 12;
    const term = parseInt(loan.term);
    const installments = [];

    const monthlyPayment =
      (amount * interest) / (1 - Math.pow(1 + interest, -term));

    const startDate = new Date(loan.startDate || new Date());

    for (let i = 1; i <= term; i++) {
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
        amount: monthlyPayment.toFixed(2),
        status,
      });
    }

    return installments;
  };

  const installments = calculateInstallments();

  const getStatusColor = (status) => {
    if (status === "Gecikmiş") return "#e74c3c";
    if (status === "Bugün") return "#f39c12";
    return "#2ecc71";
  };

  const handleCheckboxChange = (number) => {
    setPaidInstallments((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    );
  };

  const totalInstallments = installments.length;
  const paidCount = paidInstallments.length;
  const progress = totalInstallments > 0 ? (paidCount / totalInstallments) * 100 : 0;

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
        <p><strong>Durum:</strong> {loan.status}</p>

        <h4 style={{ marginTop: "30px" }}>📊 Ödeme Durumu</h4>
        <div style={{ background: "#ddd", borderRadius: "10px", overflow: "hidden", height: "20px" }}>
          <div style={{
            width: `${progress}%`,
            background: "#27ae60",
            height: "100%",
            transition: "width 0.3s ease"
          }} />
        </div>
        <p style={{ marginTop: "5px" }}>{paidCount}/{totalInstallments} taksit ödendi</p>

        <h3 style={{ marginTop: "30px" }}>📅 Ödeme Planı</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Taksit</th>
              <th>Ödeme Tarihi</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th>Ödendi mi?</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((item) => (
              <tr key={item.number}>
                <td>{item.number}</td>
                <td>{item.date}</td>
                <td>{item.amount} ₺</td>
                <td style={{ color: getStatusColor(item.status), fontWeight: "bold" }}>
                  {item.status}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={paidInstallments.includes(item.number)}
                    onChange={() => handleCheckboxChange(item.number)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onClose} style={buttonStyle}>Kapat</button>
      </div>
    </div>
  );
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
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default LoanDetailModal;
