import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerList = ({ refresh, onEdit }) => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [refresh, page]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
      setCustomers(response.data);

      // Toplam kayıt sayısını öğrenmek için ekstra istek
      const allRes = await axios.get(API_URL);
      const totalCount = allRes.data.length;
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchCustomers();
    }
  };

  const headers = [
    "Müşteri No", "Ad", "Soyad", "Ünvan", "Tür", "Vergi No", "TC Kimlik No",
    "Baba Adı", "Anne Adı", "Doğum Tarihi", "Doğum Yeri", "Cinsiyet",
    "Öğrenim Durumu", "Medeni Durum", "Telefon", "Email", "Adres",
    "Kayıt Tarihi", "İşlem"
  ];

  return (
    <div style={{ marginTop: "40px", overflowX: "auto", paddingBottom: "30px" }}>
      <h2 style={{ marginBottom: "20px", color: "#fff" }}>📋 Kayıtlı Müşteriler</h2>

      {customers.length === 0 ? (
        <p style={{ color: "#ccc" }}>Henüz müşteri kaydı yok.</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              minWidth: "1200px",
              backgroundColor: "#1e1e1e",
              color: "#f1f1f1",
            }}
          >
            <thead style={{ backgroundColor: "#333" }}>
              <tr>
                {headers.map((header, i) => (
                  <th key={i} style={thStyle}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                  <td style={tdStyle}>{c.musteriNo}</td>
                  <td style={tdStyle}>{c.ad}</td>
                  <td style={tdStyle}>{c.soyad}</td>
                  <td style={tdStyle}>{c.unvan}</td>
                  <td style={tdStyle}>{c.musteriTuru === "G" ? "Gerçek" : "Tüzel"}</td>
                  <td style={tdStyle}>{c.vergiKimlikNo}</td>
                  <td style={tdStyle}>{c.tcKimlikNo}</td>
                  <td style={tdStyle}>{c.babaAdi}</td>
                  <td style={tdStyle}>{c.anneAdi}</td>
                  <td style={tdStyle}>{c.dogumTarihi}</td>
                  <td style={tdStyle}>{c.dogumYeri}</td>
                  <td style={tdStyle}>
                    {c.cinsiyet === "K" ? "Kadın" : c.cinsiyet === "E" ? "Erkek" : "-"}
                  </td>
                  <td style={tdStyle}>{c.ogrenimDurumu}</td>
                  <td style={tdStyle}>{c.medeniDurum}</td>
                  <td style={tdStyle}>{c.telefon}</td>
                  <td style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>{c.email}</td>
                  <td style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>{c.adres}</td>
                  <td style={tdStyle}>{c.kayitTarihi}</td>
                  <td style={tdStyle}>
                    <button onClick={() => onEdit(c)} style={btnStyle("#5bc0de")}>Güncelle</button>
                    <button onClick={() => handleDelete(c.id)} style={btnStyle("#d9534f")}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sayfalama Butonları */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  margin: "0 4px",
                  padding: "6px 12px",
                  backgroundColor: page === i + 1 ? "#4caf50" : "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const thStyle = {
  padding: "8px",
  border: "1px solid #555",
  textAlign: "center",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #555",
  textAlign: "center"
};

const btnStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: "#fff",
  border: "none",
  padding: "4px 10px",
  margin: "0 3px",
  borderRadius: "4px",
  cursor: "pointer"
});

export default CustomerList;


