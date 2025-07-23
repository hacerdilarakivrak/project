import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts";

const AccountList = ({ refresh, onEdit, musteriNoFilter }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, [refresh]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(API_URL);
      setAccounts(response.data);
    } catch (error) {
      console.error("Veriler alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu hesabı silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchAccounts();
      } catch (error) {
        console.error("Silme işlemi başarısız:", error);
      }
    }
  };

  const filteredAccounts = musteriNoFilter
    ? accounts.filter((acc) => acc.musteriNo === musteriNoFilter)
    : accounts;

  return (
    <div style={{ marginTop: "40px", overflowX: "auto" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>📑 Tanımlı Hesaplar</h2>
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
            {[
              "Müşteri No", "Ek No", "Kayıt Tarihi", "Kayıt Durumu", "Hesap Adı",
              "Döviz", "Bakiye", "Bloke", "Faiz (%)", "IBAN", "Kapanma Tarihi",
              "Faizli Bakiye", "İşlem"
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
          {filteredAccounts.length === 0 ? (
            <tr>
              <td colSpan="13" style={{ padding: "12px", textAlign: "center", color: "#ccc" }}>
                Eşleşen hesap bulunamadı.
              </td>
            </tr>
          ) : (
            filteredAccounts.map((acc) => (
              <tr key={acc.id} style={{ backgroundColor: "#2a2a2a", textAlign: "center" }}>
                <td style={cellStyle}>{acc.musteriNo}</td>
                <td style={cellStyle}>{acc.ekNo}</td>
                <td style={cellStyle}>{acc.kayitTarihi}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      backgroundColor: acc.kayitDurumu === "Açık" ? "green" : "red",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {acc.kayitDurumu}
                  </span>
                </td>
                <td style={cellStyle}>{acc.hesapAdi}</td>
                <td style={cellStyle}>{acc.dovizKodu}</td>
                <td style={cellStyle}>{acc.bakiyeTutar}</td>
                <td style={cellStyle}>{acc.blokeTutar}</td>
                <td style={cellStyle}>{acc.faizOrani}</td>
                <td style={cellStyle}>{acc.iban}</td>
                <td style={cellStyle}>{acc.kapanmaTarihi || "-"}</td>
                <td style={cellStyle}>{acc.faizliBakiye}</td>
                <td style={cellStyle}>
                  <button
                    onClick={() => onEdit(acc)}
                    style={buttonStyle("dodgerblue")}
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    style={buttonStyle("crimson")}
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

const cellStyle = {
  padding: "6px",
  border: "1px solid #555",
};

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  margin: "2px",
  cursor: "pointer",
  borderRadius: "4px",
});

export default AccountList;

