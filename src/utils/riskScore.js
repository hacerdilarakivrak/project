import { monthlyPayment } from "./loanMath";

export function calcRiskScore({ income, otherDebts, loanAmount, term, annualRate, lateCount }) {
  const safe = (x) => (isFinite(x) && !isNaN(x) ? +x : 0);
  income = safe(income);
  otherDebts = safe(otherDebts);
  loanAmount = safe(loanAmount);
  term = Math.max(1, safe(term));
  annualRate = safe(annualRate || 0.36);
  lateCount = Math.max(0, safe(lateCount));

  const estInstallment = monthlyPayment(loanAmount, annualRate, term);
  const dti = (otherDebts + estInstallment) / Math.max(1, income);

  let score = 100;
  if (dti > 0.4) score -= Math.min(50, (dti - 0.4) * 120);
  score -= Math.min(32, lateCount * 8);
  if (term > 60) score -= Math.min(15, Math.floor((term - 60) / 12) * 5);
  const affordability = loanAmount / Math.max(1, income * term);
  if (affordability > 0.5) score -= Math.min(20, (affordability - 0.5) * 40);

  score = Math.round(Math.max(0, Math.min(100, score)));
  const label = score >= 70 ? "Düşük Risk" : score >= 40 ? "Orta Risk" : "Yüksek Risk";

  return { score, label, dti, estInstallment };
}
