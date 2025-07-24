import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/workplaces";

const WorkplaceList = ({ refresh, onRefresh, setSelectedWorkplace }) => {
  const [workplaces, setWorkplaces] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Yeni sayaç state'leri
  const [totalCount, setTotalCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);

  useEffect(() => {
    fetchWorkplaces();
  }, [refresh]);

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      setWorkplaces(data);
      setTotalCount(data.length);
      setOpenCount(data.filter(wp => wp.status === "açık").length);
      setClosedCount(data.filter(wp => wp.status === "kapalı").length);
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

  const filteredWorkplaces = workplaces
    .filter((wp) =>
      wp.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      wp.city.toLowerCase().includes(cityFilter.toLowerCase()) &&
      (statusFilter === "" || wp.status === statusFilter)
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.registrationDate) - new Date(b.registrationDate)
        : new Date(b.registrationDate) - new Date(a.registrationDate)
    );

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>Tanımlı İşyeri Listesi</h2>

      {/* 🔹 Sayaçlar */}
      <div style={{
        display: "flex",
        gap: "20px",
        marginBottom: "16px",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "16px"
      }}>
        <div>Toplam: {totalCount}</div>
        <div style={{ color: "#4caf50" }}>Açık: {openCount}</div>
        <div style={{ color: "#f44336" }}>Kapalı: {closedCount}</div>
      </div>

      {/* 🔹 Filtre Alanları */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="İşyeri adına göre filtrele"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Şehre göre filtrele"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="">Tüm Durumlar</option>
          <option value="açık">Açık</option>
          <option value="kapalı">Kapalı</option>
        </select>
        <button
          onClick={() => {
            setNameFilter("");
            setCityFilter("");
            setStatusFilter("");
          }}
          style={{
            ...inputStyle,
            cursor: "pointer",
            backgroundColor: "#444",
            border: "1px solid #666",
            fontWeight: "bold",
            width: "160px"
          }}
        >
          Filtreleri Sıfırla
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#ccc", fontSize: "14px" }}>Tarihe göre:</span>
          <button onClick={() => setSortOrder("desc")} style={sortBtnStyle(sortOrder === "desc")}>
            En Yeni
          </button>
          <button onClick={() => setSortOrder("asc")} style={sortBtnStyle(sortOrder === "asc")}>
            En Eski
          </button>
        </div>
      </div>

      {/* 🔹 Tablo */}
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
          {filteredWorkplaces.length === 0 ? (
            <tr>
              <td colSpan="20" style={{ textAlign: "center", padding: "12px", color: "#ccc" }}>
                Filtreye uygun işyeri bulunamadı.
              </td>
            </tr>
          ) : (
            filteredWorkplaces.map((wp) => (
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

// Stil nesneleri
const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #888",
  backgroundColor: "#2a2a2a",
  color: "#fff",
  width: "250px"
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

const sortBtnStyle = (active) => ({
  backgroundColor: active ? "#4caf50" : "#444",
  color: "#fff",
  border: "none",
  padding: "4px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal"
});

export default WorkplaceList;





