import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    try {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Müşteri Listesi", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

      autoTable(doc, {
        startY: 25,
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
        ]),
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: "center",
          valign: "middle",
          overflow: "linebreak"
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 22 },
          4: { cellWidth: 15 },
          5: { cellWidth: 25 },
          6: { cellWidth: 28 },
          15: { cellWidth: 35 }, // Email
          16: { cellWidth: 40 }, // Adres
        },
        theme: "striped"
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
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tümü</option>
          <option value="G">Gerçek</option>
          <option value="T">Tüzel</option>
        </select>
        <button onClick={exportPDF} className="btn-pdf">PDF Olarak İndir</button>
        <button onClick={exportExcel} className="btn-excel">Excel Olarak İndir</button>
      </div>

      {loading ? (
        <p style={{ color: "#ccc" }}>Yükleniyor...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : filteredCustomers.length === 0 ? (
        <p style={{ color: "#ccc" }}>Henüz müşteri kaydı yok.</p>
      ) : (
        <>
          <table className="customer-table">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.musteriNo}</td>
                  <td>{c.ad}</td>
                  <td>{c.soyad}</td>
                  <td>{c.unvan}</td>
                  <td>{c.musteriTuru === "G" ? "Gerçek" : "Tüzel"}</td>
                  <td>{c.vergiKimlikNo}</td>
                  <td>{c.tcKimlikNo}</td>
                  <td>{c.babaAdi}</td>
                  <td>{c.anneAdi}</td>
                  <td>{c.dogumTarihi}</td>
                  <td>{c.dogumYeri}</td>
                  <td>{c.cinsiyet === "K" ? "Kadın" : c.cinsiyet === "E" ? "Erkek" : "-"}</td>
                  <td>{c.ogrenimDurumu}</td>
                  <td>{c.medeniDurum}</td>
                  <td>{c.telefon}</td>
                  <td>{c.email}</td>
                  <td className="address-column">{c.adres}</td>
                  <td>{c.kayitTarihi}</td>
                  <td>
                    <button onClick={() => onEdit(c)} className="btn-update">Güncelle</button>
                    <button onClick={() => handleDelete(c.id)} className="btn-delete">Sil</button>
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

export default CustomerList;
