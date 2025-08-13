import React from "react";

function dayDiff(a, b) {
  const da = new Date(a), db = new Date(b);
  return Math.floor((db - da) / (1000 * 60 * 60 * 24));
}

function accruedInterest(deposit, todayISO) {
  if (deposit.type !== "Vadeli") return 0;
  const days = Math.max(0, Math.min(
    dayDiff(deposit.startDate, todayISO),
    dayDiff(deposit.startDate, deposit.maturityDate)
  ));
  return deposit.amount * (deposit.interestRate / 100) * (days / 365);
}

export default function DepositDetailModal({ open, onClose, deposit, onCloseAccount }) {
  if (!open || !deposit) return null;

  const today = new Date().toISOString().slice(0, 10);
  const interest = accruedInterest(deposit, today);
  const atMaturity = deposit.type === "Vadeli"
    ? (deposit.amount + deposit.amount * (deposit.interestRate / 100) * (deposit.termMonths / 12))
    : deposit.amount;
  const canWithdrawToday = deposit.type === "Vadesiz" || today >= deposit.maturityDate;

  return (
    <div className="modal">
      <div className="modal-body">
        <h3>Mevduat Detayı</h3>
        <p><b>Müşteri:</b> {deposit.customerName}</p>
        <p><b>Tür:</b> {deposit.type}</p>
        <p><b>Tutar:</b> ₺{deposit.amount.toLocaleString()}</p>
        {deposit.type === "Vadeli" && (
          <>
            <p><b>Faiz Oranı:</b> %{deposit.interestRate}</p>
            <p><b>Başlangıç:</b> {deposit.startDate} — <b>Vade Sonu:</b> {deposit.maturityDate}</p>
            <p><b>Bugüne Kadar İşleyen Faiz (≈):</b> ₺{interest.toFixed(2)}</p>
            <p><b>Vade Sonu Tahmini:</b> ₺{atMaturity.toFixed(2)}</p>
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Kapat</button>
          <button
            onClick={() => onCloseAccount?.(deposit.id)}
            disabled={!canWithdrawToday}
            title={canWithdrawToday ? "" : "Vade dolmadan kapatılamaz"}
          >
            Hesabı Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
