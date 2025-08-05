import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const BillPayment = () => {
  const [billType, setBillType] = useState("electricity");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(API_URL);
        setCustomers(response.data);
      } catch (error) {
        console.error("Müşteri listesi alınamadı:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const savedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setPayments(savedPayments);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCustomer || !amount) {
      alert("Lütfen müşteri ve tutarı seçiniz!");
      return;
    }

    const newPayment = {
      id: Date.now(),
      billType,
      subscriberNo: selectedCustomer,
      amount,
      date: new Date().toLocaleString(),
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));

    alert(
      `${billType.toUpperCase()} faturası için ${amount} TL ödeme başarıyla gerçekleştirildi.`
    );

    setSelectedCustomer("");
    setAmount("");
  };

  const clearPayments = () => {
    if (window.confirm("Tüm ödeme geçmişini silmek istediğinize emin misiniz?")) {
      setPayments([]);
      localStorage.removeItem("payments");
    }
  };

  const deletePayment = (id) => {
    const updatedPayments = payments.filter((payment) => payment.id !== id);
    setPayments(updatedPayments);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
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
          Müşteri No:
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Müşteri seçiniz</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.musteriNo}>
                {customer.musteriNo} - {customer.ad} {customer.soyad}
              </option>
            ))}
          </select>
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
          <button
            onClick={clearPayments}
            style={{
              marginBottom: "10px",
              padding: "8px",
              backgroundColor: "#FF4D4D",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px",
            }}
          >
            Ödeme Geçmişini Sil
          </button>
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
                <th style={thStyle}>Müşteri No</th>
                <th style={thStyle}>Tutar (TL)</th>
                <th style={thStyle}>Tarih</th>
                <th style={thStyle}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td style={tdStyle}>{payment.billType}</td>
                  <td style={tdStyle}>{payment.subscriberNo}</td>
                  <td style={tdStyle}>{payment.amount}</td>
                  <td style={tdStyle}>{payment.date}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => deletePayment(payment.id)}
                      style={{
                        backgroundColor: "#FF4D4D",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Sil
                    </button>
                  </td>
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
