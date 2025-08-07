import React, { useState, useEffect } from "react";
import axios from "axios";
import LoanForm from "../components/Loans/LoanForm";
import LoanDetailModal from "../components/Loans/LoanDetailModal";

const LoansPage = () => {
  const [activeTab, setActiveTab] = useState("loans");
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [depositForm, setDepositForm] = useState({
    customerId: "",
    customerName: "",
    amount: "",
    type: "Vadesiz",
    term: "",
    interest: "",
  });
  const [customers, setCustomers] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const savedLoans = JSON.parse(localStorage.getItem("loans")) || [];
    setLoans(savedLoans);

    const savedDeposits = JSON.parse(localStorage.getItem("deposits")) || [];
    setDeposits(savedDeposits);

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers"
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Müşteriler yüklenirken hata oluştu:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const today = new Date();
    const reminders = [];

    loans.forEach((loan) => {
      if (!loan.startDate || !loan.term) return;

      const startDate = new Date(loan.startDate);
      for (let i = 1; i <= loan.term; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 3) {
          reminders.push(`📅 ${loan.customerName} adlı müşterinin kredi ödemesi 3 gün içinde.`);
        }
      }
    });

    if (reminders.length > 0) {
      setNotification(reminders[0]);
      setTimeout(() => setNotification(""), 5000);
    }
  }, [loans]);

  const handleNotify = () => {
    setNotification("🔔 Yeni kredi başvurusu yapıldı.");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleLoanAdded = (newLoan) => {
    let updatedLoans;
    if (editingLoan) {
      updatedLoans = loans.map((loan) =>
        loan.id === editingLoan.id ? { ...newLoan, id: editingLoan.id } : loan
      );
      setEditingLoan(null);
    } else {
      updatedLoans = [
        ...loans,
        {
          ...newLoan,
          id: Date.now(),
          status: "Onay Bekliyor",
          startDate: new Date().toISOString(),
        },
      ];
    }
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
    handleNotify();
  };

  const handleDeleteLoan = (loanId) => {
    if (window.confirm("Bu krediyi silmek istediğinize emin misiniz?")) {
      const updatedLoans = loans.filter((loan) => loan.id !== loanId);
      setLoans(updatedLoans);
      localStorage.setItem("loans", JSON.stringify(updatedLoans));
    }
  };

  const handleEditLoan = (loan) => setEditingLoan(loan);

  const handleStatusChange = (loanId, newStatus) => {
    const updatedLoans = loans.map((loan) =>
      loan.id === loanId ? { ...loan, status: newStatus } : loan
    );
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
  };

  const totalLoans = loans.length;
  const totalDeposits = deposits.length;
  const pendingLoans = loans.filter((loan) => loan.status === "Onay Bekliyor").length;

  return (
    <div style={pageStyle}>
      {notification && <div style={notificationStyle}>{notification}</div>}

      <div style={summaryContainer}>
        <div style={summaryCard}>Toplam Krediler: {totalLoans}</div>
        <div style={summaryCard}>Toplam Mevduatlar: {totalDeposits}</div>
        <div style={summaryCard}>Bekleyen Krediler: {pendingLoans}</div>
      </div>

      <div style={tabContainer}>
        <button
          onClick={() => setActiveTab("loans")}
          style={activeTab === "loans" ? activeTabStyle : tabStyle}
        >
          Kredi İşlemleri
        </button>
        <button
          onClick={() => setActiveTab("deposits")}
          style={activeTab === "deposits" ? activeTabStyle : tabStyle}
        >
          Mevduat İşlemleri
        </button>
      </div>

      {activeTab === "loans" && (
        <>
          <LoanForm onLoanAdded={handleLoanAdded} editingLoan={editingLoan} />

          <h2 style={{ marginTop: "30px" }}>Kredi Listesi</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Müşteri No</th>
                <th>Müşteri Adı</th>
                <th>Kredi Türü</th>
                <th>Alt Tür</th>
                <th>Tutar</th>
                <th>Vade</th>
                <th>Faiz</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <tr
                    key={loan.id}
                    onClick={() => {
                      setSelectedLoan(loan);
                      setIsModalOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{loan.customerId}</td>
                    <td>{loan.customerName}</td>
                    <td>{loan.loanType}</td>
                    <td>{loan.subLoanType || "-"}</td>
                    <td>{loan.amount}</td>
                    <td>{loan.term}</td>
                    <td>{loan.interestRate}</td>
                    <td>
                      <select
                        value={loan.status || "Onay Bekliyor"}
                        onChange={(e) => handleStatusChange(loan.id, e.target.value)}
                        style={statusSelectStyle}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Onay Bekliyor">Onay Bekliyor</option>
                        <option value="Onaylandı">Onaylandı</option>
                        <option value="Reddedildi">Reddedildi</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLoan(loan);
                        }}
                        style={updateButtonStyle}
                      >
                        Güncelle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLoan(loan.id);
                        }}
                        style={deleteButtonStyle}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "10px" }}>
                    Henüz kredi başvurusu yapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isModalOpen && (
            <LoanDetailModal
              loan={selectedLoan}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedLoan(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

const pageStyle = { padding: "20px" };

const notificationStyle = {
  backgroundColor: "#ffe58f",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  color: "#000",
  fontWeight: "bold",
  textAlign: "center",
};

const summaryContainer = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
};

const summaryCard = {
  background: "#2c2c2c",
  color: "#fff",
  padding: "15px",
  borderRadius: "8px",
  flex: 1,
  textAlign: "center",
  fontWeight: "bold",
};

const tabContainer = { display: "flex", marginBottom: "20px", gap: "10px" };

const tabStyle = {
  flex: 1,
  background: "#333",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const activeTabStyle = {
  ...tabStyle,
  background: "#00d09c",
  fontWeight: "bold",
};

const tableStyle = {
  width: "100%",
  marginTop: "10px",
  borderCollapse: "collapse",
  backgroundColor: "#2c2c2c",
  color: "#fff",
};

const updateButtonStyle = {
  backgroundColor: "#1abc9c",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 14px",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "5px",
};

const deleteButtonStyle = {
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 14px",
  fontWeight: "bold",
  cursor: "pointer",
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
