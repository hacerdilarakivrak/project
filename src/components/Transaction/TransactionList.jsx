import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "./TransactionList.css";

const TransactionList = ({ refresh }) => {
  const [islemler, setIslemler] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editFromId, setEditFromId] = useState("");
  const [editToId, setEditToId] = useState("");

  const itemsPerPage = 10;

  /* ---------------- helpers (LS + tarih) ---------------- */
  const safeRead = (key, fallback = []) => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  };
  const safeWrite = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  const parseTxDate = (raw) => {
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split("-").map((n) => parseInt(n, 10));
      return new Date(y, m - 1, d);
    }
    const d = new Date(raw);
    return isNaN(d) ? null : d;
  };

  /* ---------------- data fetch ---------------- */
  useEffect(() => {
    fetchAll();
  }, [refresh]);

  const fetchAll = () => {
    try {
      const tx = safeRead("transactions", []);
      const acc = safeRead("accounts", []);
      setIslemler(Array.isArray(tx) ? tx : []);
      setAccounts(Array.isArray(acc) ? acc : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Veri alınamadı:", err);
      toast.error("İşlemler/hesaplar alınamadı!");
    }
  };

  /* ---------------- accounts helpers ---------------- */
  const displayName = (acc) =>
    acc?.hesapAdi || acc?.name || `Hesap ${acc?.id || ""}`;

  const accountOptions = useMemo(
    () =>
      accounts
        .map((a) => ({ id: a.id, label: displayName(a) }))
        .sort((x, y) => String(x.label).localeCompare(String(y.label))),
    [accounts]
  );

  const findAccountIdByName = (name) => {
    const m = accounts.find((a) => displayName(a) === name);
    return m?.id ?? "";
  };

  const findAccountByName = (name) =>
    accounts.find((a) => displayName(a) === name);

  const writeAccounts = (next) => {
    safeWrite("accounts", next);
    setAccounts(next);
  };

  const updateBalanceByName = (accName, newBalance) => {
    const next = accounts.map((a) =>
      displayName(a) === accName ? { ...a, bakiye: Number(newBalance) || 0 } : a
    );
    writeAccounts(next);
  };

  /* ---------------- filtreleme ---------------- */
  useEffect(() => {
    const filtered = islemler.filter((t) => {
      const dt = parseTxDate(t.date || t.tarih);
      if (startDate && (!dt || dt < startDate)) return false;
      if (endDate && (!dt || dt > endDate)) return false;

      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const from = String(t.from || "").toLowerCase();
        const to = String(t.to || "").toLowerCase();
        if (!from.includes(s) && !to.includes(s)) return false;
      }
      return true;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [islemler, startDate, endDate, searchTerm]);

  /* ---------------- edit ---------------- */
  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setEditAmount(tx.amount ?? tx.tutar ?? "");
    setEditFromId(findAccountIdByName(tx.from));
    setEditToId(findAccountIdByName(tx.to));
  };

  const handleSaveEdit = () => {
    if (!editFromId || !editToId) {
      toast.error("Kaynak ve hedef hesap seçiniz.");
      return;
    }
    if (Number(editAmount) <= 0) {
      toast.error("Tutar 0'dan büyük olmalı.");
      return;
    }

    try {
      const txs = safeRead("transactions", []);
      const idx = txs.findIndex((x) => x.id === editingTransaction.id);
      if (idx >= 0) {
        const fromAcc = accounts.find(
          (a) => String(a.id) === String(editFromId)
        );
        const toAcc = accounts.find((a) => String(a.id) === String(editToId));

        txs[idx] = {
          ...txs[idx],
          from: fromAcc ? displayName(fromAcc) : txs[idx].from,
          to: toAcc ? displayName(toAcc) : txs[idx].to,
          tutar: Number(editAmount),
        };

        safeWrite("transactions", txs);
        setEditingTransaction(null);
        fetchAll();
        toast.success("İşlem güncellendi.");
      }
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      toast.error("Güncelleme hatası");
    }
  };

  /* ---------------- delete ---------------- */
  const handleDelete = (tx) => {
    if (!window.confirm("Bu işlemi silmek istediğinizden emin misiniz?")) return;

    const amount = Number(tx.tutar ?? tx.amount ?? 0) || 0;

    try {
      if (tx.type === "transfer") {
        const from = findAccountByName(tx.from);
        const to = findAccountByName(tx.to);
        if (from) updateBalanceByName(tx.from, Number(from.bakiye || 0) + amount);
        if (to) updateBalanceByName(tx.to, Number(to.bakiye || 0) - amount);
      } else if (tx.type === "paraYatirma") {
        const a = findAccountByName(tx.from);
        if (a) updateBalanceByName(tx.from, Number(a.bakiye || 0) - amount);
      } else if (tx.type === "paraCekme" || tx.type === "faturaOdeme") {
        const a = findAccountByName(tx.from);
        if (a) updateBalanceByName(tx.from, Number(a.bakiye || 0) + amount);
      } else {
        console.warn("Bilinmeyen transaction type:", tx.type);
      }

      const txs = safeRead("transactions", []);
      const nextTxs = txs.filter((t) => t.id !== tx.id);
      safeWrite("transactions", nextTxs);

      setIslemler(nextTxs);
      setFilteredTransactions((prev) => prev.filter((t) => t.id !== tx.id));

      toast.success("İşlem silindi.");
    } catch (err) {
      console.error("Silme hatası:", err);
      toast.error("İşlem silinirken bir hata oluştu.");
    }
  };

  /* ---------------- UI helpers ---------------- */
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    setFilteredTransactions(islemler);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / itemsPerPage)
  );

  return (
    <div className="transaction-list-container">
      <h2>İşlem Listesi</h2>

      <div className="filters">
        <div className="date-row">
          <div>
            <label>Başlangıç Tarihi: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              isClearable
              className="date-picker-input"
              calendarClassName="date-picker-calendar"
              placeholderText="Tarih seçiniz"
            />
          </div>
          <div>
            <label>Bitiş Tarihi: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              isClearable
              className="date-picker-input"
              calendarClassName="date-picker-calendar"
              placeholderText="Tarih seçiniz"
            />
          </div>
        </div>

        <div className="musteri-filter">
          <label>Hesap Ara (Kaynak/Hedef): </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hesap adı yazın"
          />
        </div>

        <div className="filter-buttons">
          <button className="clear-button" onClick={clearFilters}>
            Temizle
          </button>
        </div>
      </div>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Kaynak Hesap</th>
            <th>Hedef Hesap</th>
            <th>Tutar</th>
            <th>Tarih</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
                Kayıtlı işlem yok.
              </td>
            </tr>
          ) : (
            currentTransactions.map((t) => {
              const d = parseTxDate(t.date || t.tarih);
              return (
                <tr key={t.id}>
                  <td>{t.from || "-"}</td>
                  <td>{t.to || "-"}</td>
                  <td>{Number(t.tutar ?? 0).toLocaleString("tr-TR")} ₺</td>
                  <td>{d ? d.toLocaleDateString("tr-TR") : "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(t)}
                    >
                      Güncelle
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(t)}
                      style={{ marginLeft: 8 }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {editingTransaction && (
        <div className="edit-form">
          <h3>İşlem Güncelle</h3>

          <label>Kaynak Hesap:</label>
          <select
            value={editFromId}
            onChange={(e) => setEditFromId(e.target.value)}
          >
            <option value="">Seçiniz</option>
            {accountOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <label>Hedef Hesap:</label>
          <select
            value={editToId}
            onChange={(e) => setEditToId(e.target.value)}
          >
            <option value="">Seçiniz</option>
            {accountOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <label>Tutar:</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
          />

          <div className="edit-buttons">
            <button onClick={handleSaveEdit} className="save-button">
              Kaydet
            </button>
            <button
              onClick={() => setEditingTransaction(null)}
              className="cancel-button"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
