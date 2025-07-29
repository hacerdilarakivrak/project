import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);

  useEffect(() => {
    axios
      .get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/customers")
      .then((res) => setCustomers(res.data));

    axios
      .get("https://6878b80d63f24f1fdc9f236e.mockapi.io/api/v1/accounts")
      .then((res) => setAccounts(res.data));

    axios
      .get("https://6881d02966a7eb81224c12c1.mockapi.io/workplaces")
      .then((res) => setWorkplaces(res.data));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todaysAccounts = accounts.filter((acc) => acc.kayitTarihi === today).length;

  const weeklyData = customers
    .filter((c) => c.kayitTarihi)
    .reduce((acc, customer) => {
      const date = new Date(customer.kayitTarihi);
      const monday = new Date(date);
      const day = monday.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      monday.setDate(monday.getDate() + diff);

      const mondayStr = monday.toISOString().split("T")[0];
      const existing = acc.find((d) => d.weekStart === mondayStr);

      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ weekStart: mondayStr, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart))
    .slice(-4);

  const accountTypeData = [
    {
      name: "Vadeli",
      value: accounts.filter((a) => a.hesapTuru?.toLowerCase() === "vadeli").length,
    },
    {
      name: "Vadesiz",
      value: accounts.filter((a) => a.hesapTuru?.toLowerCase() === "vadesiz").length,
    },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  return (
    <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
      <h2>Dashboard</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Card title="Toplam Müşteri" value={customers.length} />
        <Card title="Toplam Hesap" value={accounts.length} />
        <Card title="Toplam İşyeri" value={workplaces.length} />
        <Card title="Bugün Açılan Hesaplar" value={todaysAccounts} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "50px",
          marginTop: "50px",
        }}
      >
        <div>
          <h3>Haftalık Müşteri Artışı</h3>
          <BarChart width={400} height={250} data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="weekStart"
              tickFormatter={(date) => {
                const d = new Date(date);
                const end = new Date(d);
                end.setDate(end.getDate() + 6);
                return `${d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })} - ${end.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}`;
              }}
            />
            <YAxis domain={[0, "dataMax + 1"]} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value} müşteri`, "Haftalık"]}
              labelFormatter={(date) => {
                const d = new Date(date);
                const end = new Date(d);
                end.setDate(end.getDate() + 6);
                return `${d.toLocaleDateString("tr-TR")} - ${end.toLocaleDateString("tr-TR")}`;
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>

        <div>
          <h3>Hesap Türleri</h3>
          <PieChart width={400} height={250}>
            <Pie
              data={accountTypeData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {accountTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
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
























