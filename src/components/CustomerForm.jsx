import { useState } from "react";

function CustomerForm({ onAddCustomer }) {
  const [form, setForm] = useState({
    name: "",
    type: "Gerçek",
    email: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: Date.now(),
      ...form
    };
    onAddCustomer(newCustomer);
    setForm({
      name: "",
      type: "Gerçek",
      email: "",
      phone: ""
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Ad Soyad / Ünvan:
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Tür:
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Gerçek">Gerçek</option>
          <option value="Tüzel">Tüzel</option>
        </select>
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Telefon:
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <button type="submit">Müşteri Ekle</button>
    </form>
  );
}

export default CustomerForm;


