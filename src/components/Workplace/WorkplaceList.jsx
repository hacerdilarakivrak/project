import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/workplaces";

const WorkplaceList = ({ refresh, onRefresh, setSelectedWorkplace }) => {
  const [workplaces, setWorkplaces] = useState([]);

  useEffect(() => {
    fetchWorkplaces();
  }, [refresh]);

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get(API_URL);
      setWorkplaces(response.data);
    } catch (error) {
      console.error("İşyeri verileri alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu işyerini silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Silme işlemi başarısız:", error);
      }
    }
  };

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>Tanımlı İşyeri Listesi</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
        minWidth: "1600px",
        backgroundColor: "#1e1e1e",
        color: "#f1f1f1",
      }}>
        <thead style={{ backgroundColor: "#333" }}>
          <tr>
            {[
              "İşyeri No", "İşyeri Adı", "Kayıt Tarihi", "Durum", "Ortak 1", "Ortak 2",
              "Yönetici", "Adres", "Semt", "Şehir", "Posta Kodu",
              "Telefon 1", "Telefon 2", "Cep Tel", "Fax",
              "Vergi No", "TC Kimlik No", "İşyeri Tipi", "Komisyon", "İşlem"
            ].map((h, i) => (
              <th key={i} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workplaces.length === 0 ? (
            <tr>
              <td colSpan="20" style={{ textAlign: "center", padding: "12px", color: "#ccc" }}>
                Henüz kayıtlı işyeri yok.
              </td>
            </tr>
          ) : (
            workplaces.map((wp) => (
              <tr key={wp.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                <td style={tdStyle}>{wp.workplaceNo}</td>
                <td style={tdStyle}>{wp.name}</td>
                <td style={tdStyle}>{wp.registrationDate}</td>
                <td style={tdStyle}>
                  <span style={{
                    backgroundColor: wp.status === "açık" ? "green" : "red",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    color: "#fff",
                  }}>
                    {wp.status}
                  </span>
                </td>
                <td style={tdStyle}>{wp.partner1}</td>
                <td style={tdStyle}>{wp.partner2}</td>
                <td style={tdStyle}>{wp.managerName}</td>
                <td style={tdStyle}>{wp.address}</td>
                <td style={tdStyle}>{wp.district}</td>
                <td style={tdStyle}>{wp.city}</td>
                <td style={tdStyle}>{wp.postalCode}</td>
                <td style={tdStyle}>{wp.phone1}</td>
                <td style={tdStyle}>{wp.phone2}</td>
                <td style={tdStyle}>{wp.mobile}</td>
                <td style={tdStyle}>{wp.fax}</td>
                <td style={tdStyle}>{wp.taxNo}</td>
                <td style={tdStyle}>{wp.nationalId}</td>
                <td style={tdStyle}>{wp.workplaceType}</td>
                <td style={tdStyle}>{wp.commissionRate}%</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      setSelectedWorkplace(wp);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={btnStyle("#5bc0de")}
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => handleDelete(wp.id)}
                    style={btnStyle("#d9534f")}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "8px",
  border: "1px solid #555",
  whiteSpace: "nowrap",
  textAlign: "center"
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #555",
  textAlign: "center"
};

const btnStyle = (color) => ({
  backgroundColor: color,
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  margin: "2px",
  cursor: "pointer",
  borderRadius: "4px"
});

export default WorkplaceList;

