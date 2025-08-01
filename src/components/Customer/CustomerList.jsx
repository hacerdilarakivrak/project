import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers";

const CustomerList = ({ refresh, onEdit }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [refresh, page]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterType]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const [pageRes, allRes] = await Promise.all([
        axios.get(`${API_URL}?page=${page}&limit=${limit}`),
        axios.get(API_URL),
      ]);

      setCustomers(pageRes.data);
      setTotalPages(Math.ceil(allRes.data.length / limit));
    } catch (err) {
      console.error("Müşteriler alınamadı:", err);
      setError("Müşteri verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        [c.musteriNo, c.ad, c.soyad, c.unvan]
          .filter(Boolean)
          .some((field) =>
            field.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((c) => c.musteriTuru === filterType);
    }

    setFilteredCustomers(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCustomers();
      } catch (err) {
        console.error("Silme işlemi başarısız:", err);
        alert("Müşteri silinirken bir hata oluştu.");
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    try {
      doc.text("Müşteri Listesi", 14, 10);

      autoTable(doc, {
        startY: 20,
        head: [[
          "Müşteri No", "Ad", "Soyad", "Ünvan", "Tür", "Vergi No", "TC Kimlik No",
          "Baba Adı", "Anne Adı", "Doğum Tarihi", "Doğum Yeri", "Cinsiyet",
          "Öğrenim Durumu", "Medeni Durum", "Telefon", "Email", "Adres", "Kayıt Tarihi"
        ]],
        body: filteredCustomers.map(c => [
          c.musteriNo, c.ad, c.soyad, c.unvan,
          c.musteriTuru === "G" ? "Gerçek" : "Tüzel",
          c.vergiKimlikNo, c.tcKimlikNo, c.babaAdi, c.anneAdi,
          c.dogumTarihi, c.dogumYeri,
          c.cinsiyet === "K" ? "Kadın" : c.cinsiyet === "E" ? "Erkek" : "-",
          c.ogrenimDurumu, c.medeniDurum, c.telefon,
          c.email, c.adres, c.kayitTarihi
        ])
      });
      doc.save("musteri-listesi.pdf");
    } catch (err) {
      console.error("PDF oluşturulurken hata:", err);
      alert("PDF oluşturulurken bir hata oluştu.");
    }
  };

  const exportExcel = () => {
    const data = filteredCustomers.map(c => ({
      "Müşteri No": c.musteriNo,
      "Ad": c.ad,
      "Soyad": c.soyad,
      "Ünvan": c.unvan,
      "Tür": c.musteriTuru === "G" ? "Gerçek" : "Tüzel",
      "Vergi No": c.vergiKimlikNo,
      "TC Kimlik No": c.tcKimlikNo,
      "Baba Adı": c.babaAdi,
      "Anne Adı": c.anneAdi,
      "Doğum Tarihi": c.dogumTarihi,
      "Doğum Yeri": c.dogumYeri,
      "Cinsiyet": c.cinsiyet === "K" ? "Kadın" : c.cinsiyet === "E" ? "Erkek" : "-",
      "Öğrenim Durumu": c.ogrenimDurumu,
      "Medeni Durum": c.medeniDurum,
      "Telefon": c.telefon,
      "Email": c.email,
      "Adres": c.adres,
      "Kayıt Tarihi": c.kayitTarihi
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Müşteriler");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "musteri-listesi.xlsx");
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

      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Ara (Ad, Soyad, Ünvan, Müşteri No)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="all">Tümü</option>
          <option value="G">Gerçek</option>
          <option value="T">Tüzel</option>
        </select>
        <button onClick={exportPDF} style={btnStyle("#007bff")}>PDF Olarak İndir</button>
        <button onClick={exportExcel} style={btnStyle("#28a745")}>Excel Olarak İndir</button>
      </div>

      {loading ? (
        <p style={{ color: "#ccc" }}>Yükleniyor...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : filteredCustomers.length === 0 ? (
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
              {filteredCustomers.map((c) => (
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
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #555",
  textAlign: "center",
};

const btnStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: "#fff",
  border: "none",
  padding: "4px 10px",
  margin: "0 3px",
  borderRadius: "4px",
  cursor: "pointer",
});

export default CustomerList;

