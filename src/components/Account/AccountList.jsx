import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api";

const ACCOUNTS_URL = `/accounts`;
const PAGE_SIZE = 10;

const AccountList = ({ refresh, onEdit, musteriNoFilter }) => {
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setPage(1);
  }, [musteriNoFilter]);

  const abortRef = useRef(null);
  const listParams = useMemo(() => {
    const p = { page, limit: PAGE_SIZE };
    if (musteriNoFilter) p.musteriNo = musteriNoFilter;
    return p;
  }, [page, musteriNoFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [refresh, listParams]);

  const fetchAccounts = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErrMsg("");

    try {
      const pageRes = await api.get(ACCOUNTS_URL, {
        params: listParams,
        signal: controller.signal,
      });
      setAccounts(Array.isArray(pageRes.data) ? pageRes.data : []);

      const allParams = {};
      if (musteriNoFilter) allParams.musteriNo = musteriNoFilter;

      const allRes = await api.get(ACCOUNTS_URL, {
        params: allParams,
        signal: controller.signal,
      });
      const total = Array.isArray(allRes.data) ? allRes.data.length : 0;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
      console.error("Veriler_alinamadi:", error);
      setErrMsg("Veriler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu hesabı silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`${ACCOUNTS_URL}/${id}`);
      if (accounts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchAccounts();
      }
    } catch (error) {
      console.error("Silme_islemi_basarisiz:", error);
      alert("Silme işlemi başarısız.");
    }
  };

  return (
    <div style={{ marginTop: "40px", overflowX: "auto", paddingBottom: "30px" }}>
      <h2 style={{ marginBottom: "16px", color: "#fff" }}>📑 Tanımlı Hesaplar</h2>

      {loading && <p style={{ color: "#ccc" }}>Yükleniyor...</p>}
      {!loading && errMsg && <p style={{ color: "tomato" }}>{errMsg}</p>}

      {!loading && !errMsg && accounts.length === 0 ? (
        <p style={{ color: "#ccc" }}>Henüz hesap kaydı yok.</p>
      ) : !loading && !errMsg ? (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              minWidth: "1300px",
              backgroundColor: "#1e1e1e",
              color: "#f1f1f1",
            }}
          >
            <thead style={{ backgroundColor: "#333" }}>
              <tr>
                {[
                  "Müşteri No",
                  "Ek No",
                  "Kayıt Tarihi",
                  "Kayıt Durumu",
                  "Hesap Adı",
                  "Döviz",
                  "Bakiye",
                  "Bloke",
                  "Faiz (%)",
                  "IBAN",
                  "Hesap Türü",
                  "Kapanma Tarihi",
                  "Faizli Bakiye",
                  "İşlem",
                ].map((header, i) => (
                  <th key={i} style={thStyle}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
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
                  <td style={cellStyle}>{acc.bakiye}</td>
                  <td style={cellStyle}>{acc.blokeTutar}</td>
                  <td style={cellStyle}>{acc.faizOrani}</td>
                  <td style={cellStyle}>{acc.iban}</td>
                  <td style={cellStyle}>{acc.hesapTuru || "-"}</td>
                  <td style={cellStyle}>
                    {acc.kayitDurumu === "Kapalı" ? acc.kapanmaTarihi || "-" : "-"}
                  </td>
                  <td style={cellStyle}>{acc.faizliBakiye}</td>
                  <td style={cellStyle}>
                    <button onClick={() => onEdit(acc)} style={buttonStyle("dodgerblue")}>
                      Güncelle
                    </button>
                    <button onClick={() => handleDelete(acc.id)} style={buttonStyle("crimson")}>
                      Sil
                    </button>
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
      ) : null}
    </div>
  );
};

const thStyle = {
  padding: "8px",
  border: "1px solid #555",
  textAlign: "center",
  whiteSpace: "nowrap",
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
