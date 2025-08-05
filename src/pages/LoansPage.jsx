import React, { useState, useEffect } from "react";
import LoanForm from "../components/Loans/LoanForm";

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);

  useEffect(() => {
    const savedLoans = JSON.parse(localStorage.getItem("loans")) || [];
    setLoans(savedLoans);
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
                  <button
                    onClick={() => handleEditLoan(loan)}
                    style={updateButtonStyle}
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => handleDeleteLoan(loan.id)}
                    style={deleteButtonStyle}
                  >
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
    </div>
  );
};

const pageStyle = {
  padding: "20px",
};

const tableStyle = {
  width: "100%",
  marginTop: "10px",
  borderCollapse: "collapse",
  backgroundColor: "#2c2c2c",
  color: "#fff",
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

const updateButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "#1abc9c",
};

const deleteButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: "#e74c3c",
};

const statusSelectStyle = {
  padding: "5px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  color: "#333",
  fontWeight: "bold",
};

export default LoansPage;
