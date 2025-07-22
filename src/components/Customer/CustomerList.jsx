import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerList = ({ refresh }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, [refresh]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_URL);
      setCustomers(response.data);
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

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#fff" }}>📋 Kayıtlı Müşteriler</h2>

      {customers.length === 0 ? (
        <p style={{ color: "#ccc" }}>Henüz müşteri kaydı yok.</p>
      ) : (
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
          <thead style={{ backgroundColor: "#333", color: "#fff" }}>
            <tr>
              {[
                "Müşteri No", "Ad", "Soyad", "Ünvan", "Tür", "Vergi No", "TC Kimlik No",
                "Baba Adı", "Anne Adı", "Doğum Tarihi", "Doğum Yeri", "Cinsiyet",
                "Öğrenim Durumu", "Medeni Durum", "Telefon", "Email", "Adres",
                "Kayıt Tarihi", "İşlem"
              ].map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px",
                    border: "1px solid #555",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.musteriNo}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.ad}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.soyad}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.unvan}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.musteriTuru === "G" ? "Gerçek" : "Tüzel"}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.vergiKimlikNo}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.tcKimlikNo}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.babaAdi}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.anneAdi}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.dogumTarihi}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.dogumYeri}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.cinsiyet === "K" ? "Kadın" : "Erkek"}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.ogrenimDurumu}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.medeniDurum}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.telefon}</td>
                <td style={{ padding: "6px", border: "1px solid #555", whiteSpace: "pre-wrap" }}>{c.email}</td>
                <td style={{ padding: "6px", border: "1px solid #555", whiteSpace: "pre-wrap" }}>{c.adres}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>{c.kayitTarihi}</td>
                <td style={{ padding: "6px", border: "1px solid #555" }}>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      backgroundColor: "#d9534f",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerList;
