import React, { useState, useEffect } from "react";
import axios from "axios";
import LoanForm from "../components/Loans/LoanForm";

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [depositForm, setDepositForm] = useState({
    customerId: "",
    customerName: "",
    amount: "",
    type: "Vadesiz",
    term: "",
    interest: ""
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const savedLoans = JSON.parse(localStorage.getItem("loans")) || [];
    setLoans(savedLoans);

    const savedDeposits = JSON.parse(localStorage.getItem("deposits")) || [];
    setDeposits(savedDeposits);

    const fetchCustomers = async () => {
      try {
        const response = await axios.get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Müşteriler yüklenirken hata oluştu:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleLoanAdded = (newLoan) => {
    let updatedLoans;
    if (editingLoan) {
      updatedLoans = loans.map((loan) =>
        loan.id === editingLoan.id ? { ...newLoan, id: editingLoan.id } : loan
      );
      setEditingLoan(null);
    } else {
      updatedLoans = [...loans, { ...newLoan, id: Date.now(), status: "Onay Bekliyor" }];
    }
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
  };

  const handleDeleteLoan = (loanId) => {
    const confirmDelete = window.confirm("Bu krediyi silmek istediğinize emin misiniz?");
    if (confirmDelete) {
      const updatedLoans = loans.filter((loan) => loan.id !== loanId);
      setLoans(updatedLoans);
      localStorage.setItem("loans", JSON.stringify(updatedLoans));
    }
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
  };

  const handleStatusChange = (loanId, newStatus) => {
    const updatedLoans = loans.map((loan) =>
      loan.id === loanId ? { ...loan, status: newStatus } : loan
    );
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
  };

  const isTermVisible = depositForm.type === "Vadeli";

  const handleDepositChange = (e) => {
    const { name, value } = e.target;
    setDepositForm({ ...depositForm, [name]: value });
  };

  const handleAddDeposit = () => {
    if (!depositForm.customerId || !depositForm.amount) {
      alert("Lütfen müşteri seçin ve tutarı girin.");
      return;
    }

    const newDeposit = {
      id: Date.now(),
      customerId: depositForm.customerId,
      customerName: depositForm.customerName,
      amount: depositForm.amount,
      type: depositForm.type,
      term: isTermVisible ? depositForm.term : null,
      interest: isTermVisible ? depositForm.interest : null,
    };

    const updatedDeposits = [...deposits, newDeposit];
    setDeposits(updatedDeposits);
    localStorage.setItem("deposits", JSON.stringify(updatedDeposits));

    setDepositForm({ customerId: "", customerName: "", amount: "", type: "Vadesiz", term: "", interest: "" });
  };

  return (
    <div style={pageStyle}>
      <LoanForm onLoanAdded={handleLoanAdded} editingLoan={editingLoan} />

      <h2 style={{ marginTop: "30px" }}>Kredi Listesi</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Müşteri No</th>
            <th>Müşteri Adı</th>
            <th>Kredi Tutarı</th>
            <th>Vade (Ay)</th>
            <th>Faiz Oranı (%)</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {loans.length > 0 ? (
            loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.customerId}</td>
                <td>{loan.customerName}</td>
                <td>{loan.amount}</td>
                <td>{loan.term}</td>
                <td>{loan.interestRate}</td>
                <td>
                  <select
                    value={loan.status || "Onay Bekliyor"}
                    onChange={(e) => handleStatusChange(loan.id, e.target.value)}
                    style={statusSelectStyle}
                  >
                    <option value="Onay Bekliyor">Onay Bekliyor</option>
                    <option value="Onaylandı">Onaylandı</option>
                    <option value="Reddedildi">Reddedildi</option>
                  </select>
                </td>
                <td style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <button onClick={() => handleEditLoan(loan)} style={updateButtonStyle}>
                    Güncelle
                  </button>
                  <button onClick={() => handleDeleteLoan(loan.id)} style={deleteButtonStyle}>
                    Sil
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                Henüz kredi başvurusu yapılmadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Mevduat İşlemleri</h2>
      <div style={{ marginBottom: "20px", background: "#222", padding: "20px", borderRadius: "8px" }}>
        <select
          name="customerId"
          value={depositForm.customerId}
          onChange={(e) => {
            const selectedCustomer = customers.find((c) => c.musteriNo === e.target.value);
            setDepositForm({
              ...depositForm,
              customerId: selectedCustomer?.musteriNo || "",
              customerName: `${selectedCustomer?.ad || ""} ${selectedCustomer?.soyad || ""}`,
            });
          }}
          style={inputStyle}
        >
          <option value="">Müşteri Seçiniz</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.musteriNo}>
              {customer.musteriNo} - {customer.ad} {customer.soyad}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Mevduat Tutarı"
          value={depositForm.amount}
          onChange={handleDepositChange}
          style={inputStyle}
        />
        <select name="type" value={depositForm.type} onChange={handleDepositChange} style={inputStyle}>
          <option value="Vadesiz">Vadesiz</option>
          <option value="Vadeli">Vadeli</option>
        </select>

        {isTermVisible && (
          <>
            <input
              type="number"
              name="term"
              placeholder="Vade (Ay)"
              value={depositForm.term}
              onChange={handleDepositChange}
              style={inputStyle}
            />
            <input
              type="number"
              name="interest"
              placeholder="Faiz Oranı (%)"
              value={depositForm.interest}
              onChange={handleDepositChange}
              style={inputStyle}
            />
          </>
        )}

        <button onClick={handleAddDeposit} style={addButtonStyle}>
          Mevduat Ekle
        </button>
      </div>

      <h3>Mevduat Listesi</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Müşteri No</th>
            <th>Müşteri Adı</th>
            <th>Mevduat Tutarı</th>
            <th>Tür</th>
            <th>Vade (Ay)</th>
            <th>Faiz Oranı (%)</th>
          </tr>
        </thead>
        <tbody>
          {deposits.length > 0 ? (
            deposits.map((deposit) => (
              <tr key={deposit.id}>
                <td>{deposit.customerId}</td>
                <td>{deposit.customerName}</td>
                <td>{deposit.amount}</td>
                <td>{deposit.type}</td>
                <td>{deposit.term || "-"}</td>
                <td>{deposit.interest || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                Henüz mevduat eklenmedi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const pageStyle = { padding: "20px" };

const tableStyle = {
  width: "100%",
  marginTop: "10px",
  borderCollapse: "collapse",
  backgroundColor: "#2c2c2c",
  color: "#fff",
};

const inputStyle = {
  display: "block",
  marginBottom: "10px",
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #444",
  background: "#333",
  color: "#fff",
};

const addButtonStyle = {
  background: "#00d09c",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  width: "100%",
};

const buttonBaseStyle = {
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 14px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
  whiteSpace: "nowrap",
  minWidth: "90px",
  textAlign: "center",
};

const updateButtonStyle = { ...buttonBaseStyle, backgroundColor: "#1abc9c" };
const deleteButtonStyle = { ...buttonBaseStyle, backgroundColor: "#e74c3c" };

const statusSelectStyle = {
  padding: "5px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  color: "#333",
  fontWeight: "bold",
};

export default LoansPage;
