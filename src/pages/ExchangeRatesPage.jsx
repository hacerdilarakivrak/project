import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../api";

const midRate = (r) =>
  Number(
    r?.forexSelling ??
      r?.banknoteSelling ??
      r?.forexBuying ??
      r?.banknoteBuying ??
      0
  );

const ExchangeRatesPage = () => {
  const [exchangeRates, setExchangeRates] = useState({ USD: 0, EUR: 0, GBP: 0 });
  const [prevRates, setPrevRates] = useState({ USD: 0, EUR: 0, GBP: 0 });
  const [rateHistory, setRateHistory] = useState([]);
  const [asOf, setAsOf] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      setError("");
      const res = await api.get("/exchange-rates", {
        params: { codes: "USD,EUR,GBP" },
      });

      const rates = res.data?.rates || {};
      const data = {
        USD: midRate(rates.USD),
        EUR: midRate(rates.EUR),
        GBP: midRate(rates.GBP),
      };

      setPrevRates((prev) =>
        prev.USD === 0 && prev.EUR === 0 && prev.GBP === 0 ? data : exchangeRates
      );
      setExchangeRates(data);
      setAsOf(res.data?.asOf || "");

      const now = new Date();
      const entry = {
        time: now.toLocaleTimeString(),
        timestamp: now.getTime(),
        ...data,
      };
      setRateHistory((prev) => {
        const updated = [...prev, entry];
        const tenMinAgo = now.getTime() - 10 * 60 * 1000;
        return updated.filter((e) => e.timestamp >= tenMinAgo);
      });
    } catch (err) {
      console.error("Döviz kurları alınamadı:", err);
      setError("Döviz kurları alınamadı.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
      <h2>Döviz Kurları {asOf && <small style={{ opacity: 0.7 }}>({asOf})</small>}</h2>
      {error && (
        <div style={{ background: "#612", border: "1px solid #a55", padding: 8, marginTop: 8 }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <CurrencyCard currency="USD" rate={exchangeRates.USD} prevRate={prevRates.USD} />
        <CurrencyCard currency="EUR" rate={exchangeRates.EUR} prevRate={prevRates.EUR} />
        <CurrencyCard currency="GBP" rate={exchangeRates.GBP} prevRate={prevRates.GBP} />
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Döviz Kuru Değişimi (son 10 dk)</h3>
        <LineChart width={800} height={300} data={rateHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="USD" stroke="#0088FE" />
          <Line type="monotone" dataKey="EUR" stroke="#00C49F" />
          <Line type="monotone" dataKey="GBP" stroke="#FF8042" />
        </LineChart>
      </div>
    </div>
  );
};

const CurrencyCard = ({ currency, rate, prevRate }) => {
  const flagUrls = {
    USD: "https://flagcdn.com/w80/us.png",
    EUR: "https://flagcdn.com/w80/eu.png",
    GBP: "https://flagcdn.com/w80/gb.png",
  };

  const trend = rate > prevRate ? "up" : rate < prevRate ? "down" : "same";
  const pct =
    prevRate ? (((rate - prevRate) / prevRate) * 100).toFixed(2) : "0.00";
  const formattedChange =
    trend === "up" ? `+${pct}%` : trend === "down" ? `${pct}%` : "0.00%";

  return (
    <div
      style={{
        background: "#222",
        padding: "20px",
        borderRadius: "8px",
        width: "160px",
        border: "1px solid #444",
        textAlign: "center",
      }}
    >
      <img
        src={flagUrls[currency]}
        alt={`${currency} flag`}
        style={{
          width: "80px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "4px",
          marginBottom: "10px",
        }}
      />
      <h3>{currency}</h3>
      <p style={{ fontSize: "20px", fontWeight: "bold", margin: "5px 0" }}>
        {rate.toLocaleString("tr-TR")}
        {trend === "up" && <span style={{ color: "lime" }}> ▲</span>}
        {trend === "down" && <span style={{ color: "red" }}> ▼</span>}
        {trend === "same" && <span style={{ color: "gray" }}> ▬</span>}
      </p>
      <p
        style={{
          fontSize: "14px",
          color: trend === "up" ? "lime" : trend === "down" ? "red" : "gray",
        }}
      >
        {formattedChange}
      </p>
    </div>
  );
};

export default ExchangeRatesPage;



