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
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#fff" }}>Müşteri İşlemleri</h2>
      <CustomerForm
        onCustomerAdded={handleRefresh}
        selectedCustomer={selectedCustomer}
      />
      <hr style={{ borderColor: "#ccc" }} />
      <CustomerList refresh={refresh} onEdit={handleEdit} />
    </div>
  );
};

export default CustomersPage;
