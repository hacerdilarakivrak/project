function CustomerList({ customers }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Müşteri No</th>
          <th>Ad Soyad / Ünvan</th>
          <th>Tür</th>
          <th>Email</th>
          <th>Telefon</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => (
          <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.name}</td>
            <td>{c.type}</td>
            <td>{c.email}</td>
            <td>{c.phone}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CustomerList;
