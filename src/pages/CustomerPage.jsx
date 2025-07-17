import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";

function CustomerPage() {
  const [customers, setCustomers] = useState([
    {
      id: 1001,
      name: "Ahmet Yılmaz",
      type: "Gerçek",
      email: "ahmet@example.com",
      phone: "05551234567"
    },
    {
      id: 1002,
      name: "ABC Ltd. Şti.",
      type: "Tüzel",
      email: "iletisim@abcltd.com",
      phone: "02123456789"
    }
  ]);

  const handleAddCustomer = (newCustomer) => {
    setCustomers([...customers, newCustomer]);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Müşteri İşlemleri</h1>

      <h2>Müşteri Formu</h2>
      <CustomerForm onAddCustomer={handleAddCustomer} />

      <h2>Mevcut Müşteriler</h2>
      <CustomerList customers={customers} />
    </div>
  );
}

export default CustomerPage;

