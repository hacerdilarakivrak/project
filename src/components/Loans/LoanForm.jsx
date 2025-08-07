import React, { useState, useEffect } from "react";
import LoanCalculator from "../Loans/LoanCalculator";

const LoanForm = ({ onLoanAdded, editingLoan }) => {
  const [customers, setCustomers] = useState([]);
  const [showSubLoanType, setShowSubLoanType] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    amount: "",
    term: "",
    interestRate: "",
    loanType: "",
    subLoanType: "",
  });

  useEffect(() => {
    fetch("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Müşteri listesi alınamadı:", err));
  }, []);

  useEffect(() => {
    if (editingLoan) {
      setFormData({
        customerId: editingLoan.customerId || "",
        customerName: editingLoan.customerName || "",
        amount: editingLoan.amount || "",
        term: editingLoan.term || "",
        interestRate: editingLoan.interestRate || "",
        loanType: editingLoan.loanType || "",
        subLoanType: editingLoan.subLoanType || "",
      });
      setShowSubLoanType(editingLoan.loanType === "Bireysel");
    } else {
      setFormData({
        customerId: "",
        customerName: "",
        amount: "",
        term: "",
        interestRate: "",
        loanType: "",
        subLoanType: "",
      });
      setShowSubLoanType(false);
    }
  }, [editingLoan]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerId") {
      const selectedCustomer = customers.find((c) => c.musteriNo === value);
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        customerName: selectedCustomer
          ? `${selectedCustomer.ad} ${selectedCustomer.soyad}`
          : "",
      }));
    } else if (name === "loanType") {
      setFormData((prev) => ({
        ...prev,
        loanType: value,
        subLoanType: "",
      }));
      setShowSubLoanType(value === "Bireysel");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.customerId ||
      !formData.customerName ||
      !formData.amount ||
      !formData.term ||
      !formData.interestRate ||
      !formData.loanType ||
      (formData.loanType === "Bireysel" && !formData.subLoanType)
    ) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const newLoan = editingLoan
      ? { ...editingLoan, ...formData }
      : {
          ...formData,
          id: Date.now(),
          status: "Onay Bekliyor",
          startDate: new Date().toISOString(),
        };

    onLoanAdded(newLoan);

    setFormData({
      customerId: "",
      customerName: "",
      amount: "",
      term: "",
      interestRate: "",
      loanType: "",
      subLoanType: "",
    });
    setShowSubLoanType(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: "10px" }}>
          {editingLoan ? "Kredi Güncelle" : "Kredi Başvurusu"}
        </h2>

        <select
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Müşteri Seçiniz</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.musteriNo}>
              {customer.musteriNo} - {customer.ad} {customer.soyad}
            </option>
          ))}
        </select>

        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Kredi Türü Seçiniz</option>
          <option value="Bireysel">Bireysel Krediler</option>
          <option value="Kurumsal">Kurumsal Krediler</option>
          <option value="KOBİ-Tarım">KOBİ – Tarım Kredileri</option>
        </select>

        {showSubLoanType && (
          <select
            name="subLoanType"
            value={formData.subLoanType}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Alt Tür Seçiniz</option>
            <option value="İhtiyaç Kredisi">İhtiyaç Kredisi</option>
            <option value="Konut Kredisi">Konut Kredisi</option>
            <option value="Taşıt Kredisi">Taşıt Kredisi</option>
          </select>
        )}

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
          {editingLoan ? "Kredi Güncelle" : "Kredi Ekle"}
        </button>
      </form>

      <LoanCalculator
        amount={formData.amount}
        term={formData.term}
        interest={formData.interestRate}
      />
    </>
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
