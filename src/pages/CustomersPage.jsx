import React, { useState } from "react";
import CustomerForm from "../components/Customer/CustomerForm";
import CustomerList from "../components/Customer/CustomerList";

const CustomersPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Müşteri İşlemleri</h2>
      <CustomerForm onCustomerAdded={handleRefresh} />
      <hr />
      <CustomerList refresh={refresh} />
    </div>
  );
};

export default CustomersPage;
