import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";

const WorkplaceList = ({ refresh, onEdit, setSelectedWorkplace }) => {
  const [workplaces, setWorkplaces] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchWorkplaces();
  }, [refresh]);

  const fetchWorkplaces = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/workplaces");
      const list =
        Array.isArray(res) ? res :
        Array.isArray(res?.data) ? res.data :
        [];
      setWorkplaces(list);
      setPage(1);
    } catch (err) {
      console.error("Veriler alınamadı:", err);
      setWorkplaces([]);
      setError("İşyeri verileri alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = workplaces.length;
  const openCount = workplaces.filter((wp) => wp.status === "açık").length;
  const closedCount = workplaces.filter((wp) => wp.status === "kapalı").length;

  const filteredWorkplaces = useMemo(() => {
    const name = nameFilter.toLowerCase();
    const city = cityFilter.toLowerCase();
    const base = workplaces.filter((wp) => {
      const okName = (wp.name || "").toLowerCase().includes(name);
      const okCity = (wp.city || "").toLowerCase().includes(city);
      const okStatus = !statusFilter || wp.status === statusFilter;
      return okName && okCity && okStatus;
    });
    return base.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.registrationDate) - new Date(b.registrationDate)
        : new Date(b.registrationDate) - new Date(a.registrationDate)
    );
  }, [workplaces, nameFilter, cityFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredWorkplaces.length / limit));
  const currentItems = filteredWorkplaces.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [nameFilter, cityFilter, statusFilter, sortOrder]);

  const safeId = (id) => encodeURIComponent(String(id).trim());

  const handleDelete = async (id) => {
    if (!window.confirm("Bu işyerini silmek istediğinize emin misiniz?")) return;
    setError("");
    try {
      await api.delete(`/workplaces/${safeId(id)}`);
      setWorkplaces((prev) => prev.filter((w) => String(w.id) !== String(id)));
    } catch (err) {
      console.error("Silme işlemi başarısız:", err?.response?.data || err);
      const detail = err?.response?.data || {};
      const available = Array.isArray(detail?.availableIds)
        ? ` | Mevcut id'ler: ${detail.availableIds.join(", ")}`
        : "";
      setError(
        `İşyeri silinirken bir hata oluştu! (id=${id}) ${detail?.error || ""}${available}`
      );
    }
  };

  const resetFilters = () => {
    setNameFilter("");
    setCityFilter("");
    setStatusFilter("");
    setSortOrder("desc");
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date) ? date.toLocaleDateString("tr-TR") : "-";
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

  const columns = [
    "ID (MockAPI)",
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
  ];

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
              minWidth: "1700px",
              backgroundColor: "#1e1e1e",
              color: "#f1f1f1",
            }}
          >
            <thead style={{ backgroundColor: "#333" }}>
              <tr>
                {columns.map((h, i) => (
                  <th key={i} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "12px", color: "#ccc" }}>
                    Filtreye uygun işyeri bulunamadı.
                  </td>
                </tr>
              ) : (
                currentItems.map((wp) => (
                  <tr key={wp.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                    <td style={tdStyle}>{wp.id}</td>
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
                    <td style={tdStyle}>
                      {wp.commissionRate !== undefined && wp.commissionRate !== null
                        ? `${wp.commissionRate}%`
                        : "-"}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => {
                          setSelectedWorkplace?.(wp);
                          onEdit?.(wp);
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

export default WorkplaceList;
