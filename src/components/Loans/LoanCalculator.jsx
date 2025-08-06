import React, { useEffect, useState } from "react";

const LoanCalculator = ({ amount, term, interest }) => {
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    if (amount > 0 && interest > 0 && term > 0) {
      const principal = parseFloat(amount);
      const monthlyInterest = parseFloat(interest) / 100 / 12;
      const totalMonths = parseInt(term);

      const payment =
        (principal * monthlyInterest) /
        (1 - Math.pow(1 + monthlyInterest, -totalMonths));

      const totalPay = payment * totalMonths;
      const totalInt = totalPay - principal;

      setMonthlyPayment(payment.toFixed(2));
      setTotalPayment(totalPay.toFixed(2));
      setTotalInterest(totalInt.toFixed(2));
    } else {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  }, [amount, interest, term]);

  return (
    <div style={calculatorContainer}>
      <h3>Kredi Hesaplama</h3>
      <p><strong>Kredi Tutarı:</strong> {amount || 0} ₺</p>
      <p><strong>Vade:</strong> {term || 0} Ay</p>
      <p><strong>Faiz Oranı:</strong> {interest || 0} %</p>

      <hr style={{ border: "1px solid #444", margin: "10px 0" }} />

      <p><strong>Aylık Ödeme:</strong> {monthlyPayment} ₺</p>
      <p><strong>Toplam Geri Ödeme:</strong> {totalPayment} ₺</p>
      <p><strong>Toplam Faiz:</strong> {totalInterest} ₺</p>
    </div>
  );
};

const calculatorContainer = {
  background: "#222",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
  color: "#fff",
};

export default LoanCalculator;
