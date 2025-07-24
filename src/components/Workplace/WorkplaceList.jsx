import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/workplaces";

const WorkplaceList = ({ refresh, onEdit }) => {
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
        fetchWorkplaces();
      } catch (error) {
        console.error("Silme işlemi başarısız:", error);
      }
    }
  };

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>🏢 Tanımlı İşyeri Listesi</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
        minWidth: "1200px",
        backgroundColor: "#1e1e1e",
        color: "#f1f1f1",
      }}>
        <thead style={{ backgroundColor: "#333" }}>
          <tr>
            {[
              "İşyeri No", "İşyeri Adı", "Kayıt Tarihi", "Durum", "Ortak 1", "Ortak 2",
              "Yönetici", "Şehir", "Tel1", "Cep Tel", "Vergi No", "İşyeri Tipi", "Komisyon", "İşlem"
            ].map((h, i) => (
              <th key={i} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workplaces.length === 0 ? (
            <tr>
              <td colSpan="14" style={{ textAlign: "center", padding: "12px", color: "#ccc" }}>
                Henüz kayıtlı işyeri yok.
              </td>
            </tr>
          ) : (
            workplaces.map((wp) => (
              <tr key={wp.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                <td style={tdStyle}>{wp.isyeriNo}</td>
                <td style={tdStyle}>{wp.isyeriAdi}</td>
                <td style={tdStyle}>{wp.kayitTarihi}</td>
                <td style={tdStyle}>
                  <span style={{
                    backgroundColor: wp.kayitDurumu === "Açık" ? "green" : "red",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    color: "#fff",
                  }}>
                    {wp.kayitDurumu}
                  </span>
                </td>
                <td style={tdStyle}>{wp.ortak1}</td>
                <td style={tdStyle}>{wp.ortak2}</td>
                <td style={tdStyle}>{wp.yoneticiAdi}</td>
                <td style={tdStyle}>{wp.sehir}</td>
                <td style={tdStyle}>{wp.tel1}</td>
                <td style={tdStyle}>{wp.cepTel}</td>
                <td style={tdStyle}>{wp.vergiNo}</td>
                <td style={tdStyle}>{wp.isyeriTipi}</td>
                <td style={tdStyle}>{wp.komisyonOrani}%</td>
                <td style={tdStyle}>
                  <button onClick={() => onEdit(wp)} style={btnStyle("#5bc0de")}>Güncelle</button>
                  <button onClick={() => handleDelete(wp.id)} style={btnStyle("#d9534f")}>Sil</button>
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
