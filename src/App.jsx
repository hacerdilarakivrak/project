import React from "react";
import CustomerForm from "./components/CustomerForm";
import AccountsPage from "./pages/AccountsPage"; // <-- bunu ekliyoruz

function App() {
  return (
    <div className="App">
      <h2>Müşteri Tanımlama</h2>
      <CustomerForm />

      <hr />

      <h2>Hesap Tanımlama</h2>
      <AccountsPage /> {/* <-- Hesap ekranını buraya yerleştiriyoruz */}
    </div>
  );
}

export default App;

