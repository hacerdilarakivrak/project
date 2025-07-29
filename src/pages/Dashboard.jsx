import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);

  useEffect(() => {
    axios.get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers")
      .then((res) => setCustomers(res.data));

    axios.get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts")
      .then((res) => setAccounts(res.data));

    axios.get("https://6881d02966a7eb81224c12c1.mockapi.io/workplaces")
      .then((res) => setWorkplaces(res.data));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todaysAccounts = accounts.filter(
    (acc) => acc.createdAt?.split("T")[0] === today
  ).length;

  return (
    <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", justifyContent: "center" }}>
        <Card title="Toplam Müşteri" value={customers.length} />
        <Card title="Toplam Hesap" value={accounts.length} />
        <Card title="Toplam İşyeri" value={workplaces.length} />
        <Card title="Bugün Açılan Hesaplar" value={todaysAccounts} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div
    style={{
      background: "#222",
      padding: "20px",
      borderRadius: "8px",
      width: "200px",
      border: "1px solid #444",
      textAlign: "center",
    }}
  >
    <h3>{title}</h3>
    <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>
  </div>
);

export default Dashboard;
