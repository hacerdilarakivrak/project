import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ExchangeRatesPage = () => {
  const [exchangeRates, setExchangeRates] = useState({ USD: 0, EUR: 0, GBP: 0 });
  const [prevRates, setPrevRates] = useState({ USD: 0, EUR: 0, GBP: 0 });
  const [rateHistory, setRateHistory] = useState([]);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRates = () => {
    axios
      .get("http://localhost:5000/api/exchange-rates")
      .then((res) => {
        setPrevRates(exchangeRates);
        setExchangeRates(res.data);

        const now = new Date();
        const newEntry = {
          time: now.toLocaleTimeString(),
          timestamp: now.getTime(),
          ...res.data,
        };

        setRateHistory((prev) => {
          const updatedHistory = [...prev, newEntry];
          const tenMinutesAgo = now.getTime() - 10 * 60 * 1000;
          return updatedHistory.filter((entry) => entry.timestamp >= tenMinutesAgo);
        });
      })
      .catch((err) => console.error("Döviz kurları alınamadı:", err));
  };

  return (
    <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
      <h2>Döviz Kurları</h2>

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
        <h3>Döviz Kuru Değişimi</h3>
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
  const percentageChange =
    prevRate !== 0 ? (((rate - prevRate) / prevRate) * 100).toFixed(2) : "0.00";

  const formattedChange =
    trend === "up" ? `+${percentageChange}%` : trend === "down" ? `${percentageChange}%` : "0.00%";

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
        {rate}{" "}
        {trend === "up" && <span style={{ color: "lime" }}>▲</span>}
        {trend === "down" && <span style={{ color: "red" }}>▼</span>}
        {trend === "same" && <span style={{ color: "gray" }}>▬</span>}
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
