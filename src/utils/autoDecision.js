import { calcRiskScore } from "./riskScore";

export function getAutoDecision(loan) {
  const income = Number(loan.income) || 0;
  const otherDebts = Number(loan.otherDebts) || 0;
  const loanAmount = Number(loan.amount) || 0;
  const term = parseInt(loan.term, 10) || 0;
  const annualRate = (Number(loan.interestRate) || 0) / 100;
  const lateCount = Number(loan.lateCount) || 0;
  const insurance = String(loan.insurance || "");

  const rs = calcRiskScore({
    income,
    otherDebts,
    loanAmount,
    term,
    annualRate,
    lateCount,
  });

  const reasons = [];
  let status = "İnceleme";

  if (!income || !loanAmount || !term) {
    reasons.push("Eksik temel veri (gelir/tutar/vade).");
    return { status, reason: reasons.join(" ") };
  }

  if (rs.dti > 0.6) reasons.push("DTI > %60.");
  if (lateCount >= 4) reasons.push("4+ geçmiş gecikme.");
  if (reasons.length > 0) {
    status = "Reddedildi";
    return { status, reason: reasons.join(" ") };
  }

  if (rs.score >= 80 && rs.dti <= 0.4 && insurance.toLowerCase() === "var") {
    status = "Ön Onay";
    reasons.push("Yüksek skor, düşük DTI, sigortalı.");
  } else if (rs.score >= 60) {
    status = "İnceleme";
    reasons.push("Orta skor: manuel inceleme gerekli.");
  } else {
    status = "Reddedildi";
    reasons.push("Düşük skor.");
  }

  return { status, reason: reasons.join(" ") };
}
