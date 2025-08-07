import React from "react";

const LoanDetailModal = ({ loan, onClose }) => {
  if (!loan) return null;

  const calculateInstallments = () => {
    const amount = parseFloat(loan.amount);
    const interest = parseFloat(loan.interestRate) / 100 / 12; // aylık faiz
    const term = parseInt(loan.term);
    const installments = [];

    const monthlyPayment =
      (amount * interest) / (1 - Math.pow(1 + interest, -term));

    const startDate = new Date(loan.startDate || new Date());

    for (let i = 1; i <= term; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      installments.push({
        number: i,
        date: paymentDate.toLocaleDateString(),
        amount: monthlyPayment.toFixed(2),
      });
    }

    return installments;
  };

  const installments = calculateInstallments();

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
        <p><strong>Başvuru Tarihi:</strong> {new Date(loan.startDate).toLocaleString()}</p>
        <p><strong>Durum:</strong> {loan.status}</p>

        <h3 style={{ marginTop: "20px" }}>📅 Ödeme Planı</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Taksit</th>
              <th>Ödeme Tarihi</th>
              <th>Taksit Tutarı</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((item) => (
              <tr key={item.number}>
                <td>{item.number}</td>
                <td>{item.date}</td>
                <td>{item.amount} ₺</td>
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
  borderRadius: "10px",
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

