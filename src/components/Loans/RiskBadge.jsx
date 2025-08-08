import React from "react";

const colorFor = (score) => {
  if (score >= 70) return { bg: "#e8f5e9", fg: "#1b5e20" };
  if (score >= 40) return { bg: "#fff8e1", fg: "#795548" };
  return { bg: "#ffebee", fg: "#b71c1c" };
};

export default function RiskBadge({ score = 0, label = "", compact }) {
  const { bg, fg } = colorFor(score);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: compact ? "2px 8px" : "6px 10px",
      borderRadius: 999, background: bg, color: fg,
      fontWeight: 600, fontSize: compact ? 12 : 14,
    }} title={`Risk Skoru: ${score}`}>
      <span style={{width:8,height:8,borderRadius:999,background:fg}} />
      {label} • {score}
    </span>
  );
}
