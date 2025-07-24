import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://6881d02966a7eb81224c12c1.mockapi.io/workplaces";

const initialForm = {
  workplaceNo: "",
  name: "",
  registrationDate: new Date().toISOString().split("T")[0],
  status: "açık",
  partner1: "",
  partner2: "",
  managerName: "",
  address: "",
  district: "",
  city: "",
  postalCode: "",
  phone1: "",
  phone2: "",
  mobile: "",
  fax: "",
  taxNo: "",
  nationalId: "",
  workplaceType: "normal",
  commissionRate: "",
};

const WorkplaceForm = ({ onRefresh }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sadece sayı girilmesi gereken alanlar
    if (["taxNo", "nationalId", "postalCode", "phone1", "phone2", "mobile", "fax", "commissionRate"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "İşyeri adı zorunludur";
    if (!formData.workplaceNo) newErrors.workplaceNo = "İşyeri numarası girilmelidir";
    if (!formData.taxNo || formData.taxNo.length !== 10) newErrors.taxNo = "Vergi no 10 haneli olmalıdır";
    if (!formData.nationalId || formData.nationalId.length !== 11) newErrors.nationalId = "TC kimlik no 11 haneli olmalıdır";
    if (!formData.commissionRate) newErrors.commissionRate = "Komisyon oranı girilmelidir";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(API_URL, formData);
      setFormData(initialForm);
      onRefresh();
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  };

  return (
    <div className="form-container" style={{ marginBottom: "30px" }}>
      <h3 style={{ marginBottom: "10px" }}>İşyeri Tanımlama Formu</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {[
          { label: "İşyeri No", name: "workplaceNo" },
          { label: "İşyeri Adı", name: "name" },
          { label: "Kayıt Tarihi", name: "registrationDate", type: "date" },
          { label: "Kayıt Durumu", name: "status", type: "select", options: ["açık", "kapalı"] },
          { label: "Ortak 1", name: "partner1" },
          { label: "Ortak 2", name: "partner2" },
          { label: "Yönetici Adı", name: "managerName" },
          { label: "Adres", name: "address" },
          { label: "Semt", name: "district" },
          { label: "Şehir", name: "city" },
          { label: "Posta Kodu", name: "postalCode" },
          { label: "Telefon 1", name: "phone1" },
          { label: "Telefon 2", name: "phone2" },
          { label: "Cep Telefonu", name: "mobile" },
          { label: "Fax", name: "fax" },
          { label: "Vergi No", name: "taxNo" },
          { label: "TC Kimlik No", name: "nationalId" },
          { label: "İşyeri Tipi", name: "workplaceType", type: "select", options: ["normal", "sanal"] },
          { label: "Komisyon Oranı (%)", name: "commissionRate" },
        ].map(({ label, name, type = "text", options }) => (
          <div key={name} className="flex flex-col">
            <label className="text-sm font-semibold mb-1">{label}</label>
            {type === "select" ? (
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white border border-gray-600"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white border border-gray-600"
              />
            )}
            {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name]}</span>}
          </div>
        ))}
        <div className="col-span-2 flex justify-end mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkplaceForm;

