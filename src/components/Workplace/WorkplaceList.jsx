import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/workplaces";

const WorkplaceList = ({ refresh, onEdit, setSelectedWorkplace }) => {
  const [workplaces, setWorkplaces] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchWorkplaces();
  }, [refresh, page]);

  const fetchWorkplaces = async () => {
    setLoading(true);
    setError("");
    try {
      const paginatedRes = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
      setWorkplaces(paginatedRes.data);

      const allRes = await axios.get(API_URL);
      const allData = allRes.data;
      setTotalPages(Math.ceil(allData.length / limit));
      setTotalCount(allData.length);
      setOpenCount(allData.filter((wp) => wp.status === "açık").length);
      setClosedCount(allData.filter((wp) => wp.status === "kapalı").length);
    } catch (error) {
      console.error("Veriler alınamadı:", error);
      setError("İşyeri verileri alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu işyerini silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchWorkplaces();
      } catch (error) {
        console.error("Silme işlemi başarısız:", error);
        setError("İşyeri silinirken bir hata oluştu!");
      }
    }
  };

  const filteredWorkplaces = workplaces
    .filter(
      (wp) =>
        wp.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        wp.city.toLowerCase().includes(cityFilter.toLowerCase()) &&
        (statusFilter === "" || wp.status === statusFilter)
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.registrationDate) - new Date(b.registrationDate)
        : new Date(b.registrationDate) - new Date(a.registrationDate)
    );

  const resetFilters = () => {
    setNameFilter("");
    setCityFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date) ? date.toLocaleDateString("tr-TR") : "-";
  };

  return (
    <div style={{ marginTop: "40px", overflowX: "auto", paddingBottom: "30px" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>🏢 Tanımlı İşyerleri</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", color: "#fff", fontWeight: "bold" }}>
        <div>Toplam: {totalCount}</div>
        <div style={{ color: "#4caf50" }}>Açık: {openCount}</div>
        <div style={{ color: "#f44336" }}>Kapalı: {closedCount}</div>
        <div style={{ color: "#ccc" }}>Filtreli: {filteredWorkplaces.length}</div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="İşyeri adına göre filtrele"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value);
            setPage(1);
          }}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Şehre göre filtrele"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setPage(1);
          }}
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={inputStyle}
        >
          <option value="">Tüm Durumlar</option>
          <option value="açık">Açık</option>
          <option value="kapalı">Kapalı</option>
        </select>
        <button
          onClick={resetFilters}
          style={{
            ...inputStyle,
            cursor: "pointer",
            backgroundColor: "#444",
            border: "1px solid #666",
            fontWeight: "bold",
            width: "160px",
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

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      {loading ? (
        <div style={{ color: "#fff" }}>Yükleniyor...</div>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              minWidth: "1600px",
              backgroundColor: "#1e1e1e",
              color: "#f1f1f1",
            }}
          >
            <thead style={{ backgroundColor: "#333" }}>
              <tr>
                {[
                  "İşyeri No",
                  "İşyeri Adı",
                  "Kayıt Tarihi",
                  "Durum",
                  "Ortak 1",
                  "Ortak 2",
                  "Yönetici",
                  "Adres",
                  "Semt",
                  "Şehir",
                  "Posta Kodu",
                  "Telefon 1",
                  "Telefon 2",
                  "Cep Tel",
                  "Fax",
                  "Vergi No",
                  "TC Kimlik No",
                  "İşyeri Tipi",
                  "Komisyon",
                  "İşlem",
                ].map((h, i) => (
                  <th key={i} style={thStyle}>
                    {h}
                  </th>
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
                    <td style={tdStyle}>{formatDate(wp.registrationDate)}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          backgroundColor: wp.status === "açık" ? "green" : "red",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      >
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
                      <button onClick={() => handleDelete(wp.id)} style={btnStyle("#d9534f")}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages >= 1 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setPage(index + 1)}
                  style={{
                    margin: "0 5px",
                    padding: "5px 10px",
                    background: page === index + 1 ? "#4caf50" : "#444",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #888",
  backgroundColor: "#2a2a2a",
  color: "#fff",
  width: "250px",
};

const thStyle = {
  padding: "8px",
  border: "1px solid #555",
  whiteSpace: "nowrap",
  textAlign: "center",
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #555",
  textAlign: "center",
};

const btnStyle = (color) => ({
  backgroundColor: color,
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  margin: "2px",
  cursor: "pointer",
  borderRadius: "4px",
});

const sortBtnStyle = (active) => ({
  backgroundColor: active ? "#4caf50" : "#444",
  color: "#fff",
  border: "none",
  padding: "4px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal",
});

export default WorkplaceList;
