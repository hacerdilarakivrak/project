import React, { useState, useEffect } from "react";

const LoanForm = ({ onLoanAdded }) => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    amount: "",
    term: "",
    interestRate: "",
  });

  useEffect(() => {
    fetch("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Müşteri listesi alınamadı:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerId") {
      const selectedCustomer = customers.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        customerName: selectedCustomer
          ? `${selectedCustomer.ad} ${selectedCustomer.soyad}`
          : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerId || !formData.amount || !formData.term || !formData.interestRate) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const newLoan = {
      ...formData,
      id: Date.now(),
    };

    onLoanAdded(newLoan);

    setFormData({
      customerId: "",
      customerName: "",
      amount: "",
      term: "",
      interestRate: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ marginBottom: "10px" }}>Kredi Başvurusu</h2>

      <select
        name="customerId"
        value={formData.customerId}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="">Müşteri Seçiniz</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.musteriNo} - {customer.ad} {customer.soyad}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="amount"
        placeholder="Kredi Tutarı"
        value={formData.amount}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="number"
        name="term"
        placeholder="Vade (Ay)"
        value={formData.term}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        type="number"
        name="interestRate"
        placeholder="Faiz Oranı (%)"
        value={formData.interestRate}
        onChange={handleChange}
        style={inputStyle}
      />

      <button type="submit" style={buttonStyle}>
        Kredi Ekle
      </button>
    </form>
  );
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "20px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#00C49F",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default LoanForm;
