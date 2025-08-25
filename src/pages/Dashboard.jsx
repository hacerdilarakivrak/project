import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
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
    api.get("/customers").then((res) => setCustomers(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    api.get("/accounts").then((res) => setAccounts(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    api.get("/workplaces").then((res) => setWorkplaces(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const todayISO = new Date().toISOString().split("T")[0];

  const dateOnly = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      if (val.length >= 10) return val.slice(0, 10);
    }
    const d = new Date(val);
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  };

  const todaysAccounts = useMemo(
    () =>
      accounts.filter((acc) => {
        const d = dateOnly(acc.kayitTarihi || acc.createdAt || acc.registrationDate);
        return d === todayISO;
      }).length,
    [accounts, todayISO]
  );

  const weeklyData = useMemo(() => {
    const weeklyMap = new Map();
    (customers || [])
      .filter((c) => c.kayitTarihi || c.createdAt)
      .forEach((c) => {
        const iso = dateOnly(c.kayitTarihi || c.createdAt);
        if (!iso) return;
        const dt = new Date(iso);
        const day = dt.getDay(); 
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const monday = new Date(dt);
        monday.setDate(dt.getDate() + diffToMonday);
        const mondayStr = monday.toISOString().slice(0, 10);
        weeklyMap.set(mondayStr, (weeklyMap.get(mondayStr) || 0) + 1);
      });

    return Array.from(weeklyMap.entries())
      .map(([weekStart, count]) => ({ weekStart, count }))
      .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart))
      .slice(-4);
  }, [customers]);

  const accountTypeData = useMemo(() => {
    const vadeli = accounts.filter((a) => (a.hesapTuru || a.type || "").toString().toLowerCase() === "vadeli").length;
    const vadesiz = accounts.filter((a) => (a.hesapTuru || a.type || "").toString().toLowerCase() === "vadesiz").length;
    return [
      { name: "Vadeli", value: vadeli },
      { name: "Vadesiz", value: vadesiz },
    ];
  }, [accounts]);

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
            <Pie data={accountTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
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
