import React, { useState } from "react";
import CustomerForm from "../components/Customer/CustomerForm";
import CustomerList from "../components/Customer/CustomerList";

const CustomersPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleRefresh = () => {
    setRefresh(!refresh);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#2c2c2c", // dış arka plan
        padding: "32px 0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: ".3px",
            color: "#ffffff",
          }}
        >
          Müşteri İşlemleri
        </h1>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid #3a3a3a",
            background: "#1a1a1a", // panel zemini
            boxShadow: "0 10px 40px rgba(0,0,0,.35)",
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <CustomerForm
              onCustomerAdded={handleRefresh}
              selectedCustomer={selectedCustomer}
            />
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #2f2f2f",
              margin: "8px 0 24px",
            }}
          />

          <CustomerList refresh={refresh} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;

