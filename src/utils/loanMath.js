export function monthlyPayment(P, annualRate, n) {
  const r = annualRate / 12;
  if (!r) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}
