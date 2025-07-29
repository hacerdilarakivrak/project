import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
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

  const customerGrowthData = customers.map((c) => ({
    date: new Date(c.createdAt).toLocaleDateString(),
    count: 1,
  }));

  const groupedCustomerData = Object.values(
    customerGrowthData.reduce((acc, cur) => {
      acc[cur.date] = acc[cur.date] || { date: cur.date, count: 0 };
      acc[cur.date].count += 1;
      return acc;
    }, {})
  );

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

  const COLORS = ["#0088FE", "#FF8042"];

  const workplaceAccountData = workplaces.map((work) => ({
    name: work.name,
    count: accounts.filter((a) => a.workplaceId === work.id).length,
  }));

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
          <h3>Müşteri Artışı</h3>
          <LineChart width={400} height={250} data={groupedCustomerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
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

        <div>
          <h3>İşyeri Bazlı Hesaplar</h3>
          <BarChart width={400} height={250} data={workplaceAccountData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
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






