import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "./TransactionList.css";

const API_URL = "https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/transactions";

const TransactionList = ({ refresh }) => {
  const [islemler, setIslemler] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [musteriNo, setMusteriNo] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editAciklama, setEditAciklama] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setIslemler(res.data);
      setFilteredTransactions(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("İşlemler alınırken hata:", err);
      toast.error("İşlemler alınırken bir hata oluştu!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu işlemi silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("İşlem başarıyla silindi!");
        fetchTransactions();
      } catch (err) {
        console.error("İşlem silinirken hata oluştu:", err);
        toast.error("İşlem silinirken bir hata oluştu!");
      }
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.tutar);
    setEditAciklama(transaction.aciklama || "");
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_URL}/${editingTransaction.id}`, {
        ...editingTransaction,
        tutar: editAmount,
        aciklama: editAciklama,
      });
      toast.success("İşlem başarıyla güncellendi!");
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err) {
      console.error("İşlem güncellenirken hata:", err);
      toast.error("İşlem güncellenirken hata oluştu!");
    }
  };

  const getIslemTurText = (islem) => {
    switch (islem.tur) {
      case "paraYatirma":
        return `Para Yatırma (${islem.hesapAdi})`;
      case "paraCekme":
        return `Para Çekme (${islem.hesapAdi})`;
      case "transferGonderen":
        return `Transfer (Gönderen) - ${islem.hesapAdi}`;
      case "transferAlici":
        return `Transfer (Alıcı) - ${islem.hesapAdi}`;
      default:
        return islem.tur || "-";
    }
  };

  useEffect(() => {
    const filtered = islemler.filter((islem) => {
      const islemTarihi = new Date(islem.tarih);
      if (startDate && islemTarihi < startDate) return false;
      if (endDate && islemTarihi > endDate) return false;
      if (musteriNo && !islem.musteriID?.toString().includes(musteriNo))
        return false;
      return true;
    });
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, musteriNo, islemler]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMusteriNo("");
    setFilteredTransactions(islemler);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

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
          <label>Müşteri No: </label>
          <input
            type="text"
            value={musteriNo}
            onChange={(e) => setMusteriNo(e.target.value)}
            placeholder="Müşteri numarası giriniz"
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
            <th>İşlem</th>
            <th>Tutar</th>
            <th>Tarih</th>
            <th>Müşteri No</th>
            <th>Açıklama</th>
            <th>Bakiye Sonrası</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "12px" }}>
                Kayıtlı işlem yok.
              </td>
            </tr>
          ) : (
            currentTransactions.map((islem) => (
              <tr key={islem.id}>
                <td>{getIslemTurText(islem)}</td>
                <td>{islem.tutar} ₺</td>
                <td>{islem.tarih}</td>
                <td>{islem.musteriID || "-"}</td>
                <td>{islem.aciklama || "-"}</td>
                <td>{islem.bakiyeSonrasi ?? 0} ₺</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditClick(islem)}
                  >
                    Düzenle
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(islem.id)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingTransaction && (
        <div className="edit-form">
          <h3>İşlem Düzenle</h3>
          <label>Tutar:</label>
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
          />
          <label>Açıklama:</label>
          <input
            type="text"
            value={editAciklama}
            onChange={(e) => setEditAciklama(e.target.value)}
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
        {Array.from({ length: totalPages || 1 }, (_, index) => (
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
