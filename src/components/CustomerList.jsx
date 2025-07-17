import React from "react";

const CustomerList = ({ customers }) => {
  return (
    <div>
      <h2>Müşteri Listesi</h2>
      <ul>
        {customers
          .filter(
            (customer) => customer.name && customer.email // boş verileri filtrele
          )
          .map((customer) => (
            <li key={customer.id}>
              {customer.name} - {customer.email}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CustomerList;
