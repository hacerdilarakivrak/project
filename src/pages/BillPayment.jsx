import React, { useState } from "react";

const BillPayment = () => {
  const [billType, setBillType] = useState("electricity");
  const [subscriberNo, setSubscriberNo] = useState("");
  const [amount, setAmount] = useState("");
  const [payments, setPayments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!subscriberNo || !amount) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const newPayment = {
      id: Date.now(),
      billType,
      subscriberNo,
      amount,
      date: new Date().toLocaleString(),
    };

    setPayments([newPayment, ...payments]);

    alert(`${billType.toUpperCase()} faturası için ${amount} TL ödeme başarıyla gerçekleştirildi.`);

    setSubscriberNo("");
    setAmount("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Fatura Ödeme</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "400px",
        }}
      >
        <label>
          Fatura Türü:
          <select
            value={billType}
            onChange={(e) => setBillType(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="electricity">Elektrik</option>
            <option value="water">Su</option>
            <option value="gas">Doğalgaz</option>
            <option value="internet">İnternet</option>
          </select>
        </label>

        <label>
          Abone No:
          <input
            type="text"
            value={subscriberNo}
            onChange={(e) => setSubscriberNo(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </label>

        <label>
          Tutar (TL):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#00C49F",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            borderRadius: "4px",
          }}
        >
          Ödeme Yap
        </button>
      </form>

      {payments.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Ödeme Geçmişi</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Fatura Türü</th>
                <th style={thStyle}>Abone No</th>
                <th style={thStyle}>Tutar (TL)</th>
                <th style={thStyle}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td style={tdStyle}>{payment.billType}</td>
                  <td style={tdStyle}>{payment.subscriberNo}</td>
                  <td style={tdStyle}>{payment.amount}</td>
                  <td style={tdStyle}>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  border: "1px solid #444",
  padding: "8px",
  backgroundColor: "#222",
  color: "#fff",
};

const tdStyle = {
  border: "1px solid #444",
  padding: "8px",
  textAlign: "center",
  color: "#fff",
};

export default BillPayment;
