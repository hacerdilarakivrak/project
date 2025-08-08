import { monthlyPayment } from "./loanMath";

export function calcRiskScore({
  income,
  otherDebts,
  loanAmount,
  term,
  annualRate,
  lateCount,
}) {
  const safe = (x) => (isFinite(x) && !isNaN(x) ? +x : 0);

  income = safe(income);
  otherDebts = safe(otherDebts);
  loanAmount = safe(loanAmount);
  term = Math.max(1, safe(term));
  annualRate = safe(annualRate ?? 0.36);
  lateCount = Math.max(0, safe(lateCount));

  const estInstallment = monthlyPayment(loanAmount, annualRate, term);
  const dti = (otherDebts + estInstallment) / Math.max(1, income);

  let score = 100;
  const breakdown = [];

  if (dti > 0.4) {
    const dtiPenalty = Math.min(50, (dti - 0.4) * 120);
    score -= dtiPenalty;
    breakdown.push(`DTI ${(dti * 100).toFixed(1)}%: -${dtiPenalty.toFixed(1)}`);
  } else {
    breakdown.push(`DTI ${(dti * 100).toFixed(1)}%: 0`);
  }

  if (lateCount > 0) {
    const latePenalty = Math.min(32, lateCount * 8);
    score -= latePenalty;
    breakdown.push(`Geçmiş gecikme ${lateCount} adet: -${latePenalty}`);
  } else {
    breakdown.push("Geçmiş gecikme: 0");
  }

  if (term > 60) {
    const termPenalty = Math.min(15, Math.floor((term - 60) / 12) * 5);
    score -= termPenalty;
    breakdown.push(`Uzun vade (${term} ay): -${termPenalty}`);
  } else {
    breakdown.push(`Vade (${term} ay): 0`);
  }

  const affordability = loanAmount / Math.max(1, income * term);
  if (affordability > 0.5) {
    const affPenalty = Math.min(20, (affordability - 0.5) * 40);
    score -= affPenalty;
    breakdown.push(
      `Tutar/(Gelir*Vade) ${(affordability * 100).toFixed(1)}%: -${affPenalty.toFixed(1)}`
    );
  } else {
    breakdown.push(
      `Tutar/(Gelir*Vade) ${(affordability * 100).toFixed(1)}%: 0`
    );
  }

  score = Math.round(Math.max(0, Math.min(100, score)));
  const label = score >= 70 ? "Düşük Risk" : score >= 40 ? "Orta Risk" : "Yüksek Risk";

  return { score, label, dti, estInstallment, breakdown };
}
