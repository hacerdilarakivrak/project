import React, { useState, useEffect } from "react";
import api from "../api";
import LoanForm from "../components/Loans/LoanForm";
import LoanDetailModal from "../components/Loans/LoanDetailModal";
import { calcRiskScore } from "../utils/riskScore";
import RiskBadge from "../components/Loans/RiskBadge";
import { getAutoDecision } from "../utils/autoDecision";
import DepositForm from "../components/Deposits/DepositForm";
import DepositDetailModal from "../components/Deposits/DepositDetailModal";

const trCurrency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

const LoansPage = () => {
  const [activeTab, setActiveTab] = useState("loans");
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedLoans = JSON.parse(localStorage.getItem("loans")) || [];
    setLoans(savedLoans);

    const savedDeposits = JSON.parse(localStorage.getItem("deposits")) || [];
    setDeposits(savedDeposits);

    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/customers");
        setCustomers(Array.isArray(data) ? data : []);
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
      setTimeout(() => setNotification(null), 5000);
    }
  }, [loans]);

  const handleNotify = (msg = "🔔 Yeni kredi başvurusu yapıldı.") => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoanAdded = (newLoan) => {
    const { status, reason } = getAutoDecision(newLoan);

    let updatedLoans;
    if (editingLoan) {
      const merged = { ...editingLoan, ...newLoan };
      const decision = getAutoDecision(merged);
      updatedLoans = loans.map((loan) =>
        loan.id === editingLoan.id
          ? {
              ...merged,
              id: editingLoan.id,
              status: decision.status,
              decisionReason: decision.reason,
            }
          : loan
      );
      setEditingLoan(null);
    } else {
      updatedLoans = [
        ...loans,
        {
          ...newLoan,
          id: Date.now(),
          status,
          decisionReason: reason,
          startDate: new Date().toISOString(),
        },
      ];
    }
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
    handleNotify();
  };

  const handleDeleteLoan = (loanId) => {
    if (!window.confirm("Bu krediyi silmek istediğinize emin misiniz?")) return;
    const updatedLoans = loans.filter((loan) => loan.id !== loanId);
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
  };

  const handleEditLoan = (loan) => setEditingLoan(loan);

  const handleStatusChange = (loanId, newStatus) => {
    const updatedLoans = loans.map((loan) =>
      loan.id === loanId ? { ...loan, status: newStatus } : loan
    );
    setLoans(updatedLoans);
    localStorage.setItem("loans", JSON.stringify(updatedLoans));
  };

  const handleDepositAdded = (newDeposit) => {
    const updated = [...deposits, newDeposit];
    setDeposits(updated);
    localStorage.setItem("deposits", JSON.stringify(updated));
    handleNotify("💰 Yeni mevduat eklendi.");
  };

  const handleDeleteDeposit = (depositId) => {
    if (!window.confirm("Bu mevduatı silmek istediğinize emin misiniz?")) return;
    const updated = deposits.filter((d) => d.id !== depositId);
    setDeposits(updated);
    localStorage.setItem("deposits", JSON.stringify(updated));
  };

  const handleCloseDepositAccount = (depositId) => {
    const updated = deposits.map((d) =>
      d.id === depositId ? { ...d, status: "Kapalı" } : d
    );
    setDeposits(updated);
    localStorage.setItem("deposits", JSON.stringify(updated));
    setIsDepositModalOpen(false);
    handleNotify("✅ Mevduat kapatıldı.");
  };

  const totalLoans = loans.length;
  const totalDeposits = deposits.length;
  const pendingLoans = loans.filter((loan) => loan.status === "Onay Bekliyor").length;

  const renderOzelBilgi = (loan) => {
    if (loan.subLoanType === "Konut Kredisi") {
      const exp = loan.ekspertizDegeri ? trCurrency.format(Number(loan.ekspertizDegeri)) : "-";
      const ipt = loan.ipotekBilgisi || "-";
      return `Ekspertiz: ${exp} • İpotek: ${ipt}`;
    }
    if (loan.subLoanType === "Taşıt Kredisi") {
      const marka = loan.aracMarka || "-";
      const model = loan.aracModel || "";
      const yil = loan.aracYil ? ` (${loan.aracYil})` : "";
      return `${marka} ${model}${yil}`;
    }
    return "-";
  };

  const notifText = typeof notification === "string" ? notification : notification?.message;

  return (
    <div style={pageStyle}>
      <style>{depositCSS}</style>

      {notifText ? <div style={notificationStyle}>{notifText}</div> : null}

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
                <th>Özel Bilgi</th>
                <th>Tutar</th>
                <th>Vade</th>
                <th>FAİZ</th>
                <th>SİGORTA</th>
                <th>RİSK</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => {
                  const rs = calcRiskScore({
                    income: Number(loan.income) || 0,
                    otherDebts: Number(loan.otherDebts) || 0,
                    loanAmount: Number(loan.amount) || 0,
                    term: parseInt(loan.term, 10) || 0,
                    annualRate: (Number(loan.interestRate) || 0) / 100,
                    lateCount: Number(loan.lateCount) || 0,
                  });

                  return (
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
                      <td>{renderOzelBilgi(loan)}</td>
                      <td>{loan.amount ? trCurrency.format(Number(loan.amount)) : "-"}</td>
                      <td>{loan.term}</td>
                      <td>{loan.interestRate}</td>
                      <td>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 6,
                            fontWeight: "bold",
                            background:
                              (loan.insurance || "").toLowerCase() === "var"
                                ? "#e3fcef"
                                : "#ffecec",
                            color:
                              (loan.insurance || "").toLowerCase() === "var"
                                ? "#057a55"
                                : "#a30000",
                          }}
                        >
                          {loan.insurance || "-"}
                        </span>
                      </td>
                      <td>
                        <span title={rs.breakdown ? rs.breakdown.join(" • ") : ""}>
                          <RiskBadge score={rs.score} label={rs.label} compact />
                        </span>
                      </td>
                      <td>
                        <select
                          value={loan.status || "Onay Bekliyor"}
                          onChange={(e) => handleStatusChange(loan.id, e.target.value)}
                          style={statusSelectStyle}
                          onClick={(e) => e.stopPropagation()}
                          title={loan.decisionReason || ""}
                        >
                          <option value="Ön Onay">Ön Onay</option>
                          <option value="İnceleme">İnceleme</option>
                          <option value="Reddedildi">Reddedildi</option>
                          <option value="Onay Bekliyor">Onay Bekliyor</option>
                          <option value="Onaylandı">Onaylandı</option>
                        </select>
                        {loan.decisionReason && (
                          <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                            {loan.decisionReason}
                          </div>
                        )}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: "10px" }}>
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

      {activeTab === "deposits" && (
        <>
          <DepositForm
            onAdd={handleDepositAdded}
            onNotify={(n) => setNotification(typeof n === "string" ? n : n?.message)}
          />

          <h2 style={{ marginTop: "30px" }}>Mevduat Listesi</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Tür</th>
                <th>Tutar</th>
                <th>Faiz %</th>
                <th>Başlangıç</th>
                <th>Vade Sonu</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length > 0 ? (
                deposits.map((dep) => (
                  <tr
                    key={dep.id}
                    onClick={() => {
                      setSelectedDeposit(dep);
                      setIsDepositModalOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{dep.customerName}</td>
                    <td>{dep.type}</td>
                    <td>{trCurrency.format(dep.amount)}</td>
                    <td>{dep.type === "Vadeli" ? dep.interestRate : "-"}</td>
                    <td>{dep.startDate || "-"}</td>
                    <td>{dep.maturityDate || "-"}</td>
                    <td>{dep.status}</td>
                    <td>
                      <button
                        style={deleteButtonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeposit(dep.id);
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                    Henüz mevduat yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isDepositModalOpen && selectedDeposit && (
            <DepositDetailModal
              open={true}
              deposit={selectedDeposit}
              onClose={() => setIsDepositModalOpen(false)}
              onCloseAccount={handleCloseDepositAccount}
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

const depositCSS = `
.deposit-form{max-width:680px;padding:18px 20px;border-radius:12px;background:#2a2a2a;box-shadow:0 4px 18px rgba(0,0,0,.25)}
.deposit-form h3{margin:0 0 14px 0}
.deposit-form .row{display:grid;grid-template-columns:170px 1fr;align-items:center;column-gap:14px;row-gap:8px;margin-bottom:14px}
.deposit-form label{color:#dcdcdc;font-weight:600}
.deposit-form input,.deposit-form select{width:100%;height:40px;padding:8px 12px;border-radius:8px;border:1px solid #3b3b3b;background:#1f1f1f;color:#fff;outline:none}
.deposit-form input:focus,.deposit-form select:focus{border-color:#00d09c;box-shadow:0 0 0 3px rgba(0,208,156,.15)}
.deposit-form .hint{grid-column:1 / -1;margin:4px 0 6px;font-size:14px;color:#cfeee6}
.deposit-form button[type="submit"]{grid-column:1 / -1;justify-self:start;padding:10px 16px;border:0;border-radius:8px;background:#00d09c;color:#0b0b0b;font-weight:700;cursor:pointer}
.deposit-form button[type="submit"]:hover{filter:brightness(1.05)}
@media (max-width:640px){
  .deposit-form .row{grid-template-columns:1fr}
  .deposit-form button[type="submit"]{width:100%;justify-self:stretch}
}
`;

export default LoansPage;
