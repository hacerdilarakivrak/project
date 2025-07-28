import React, { useEffect, useState } from "react";
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

const WorkplaceForm = ({ onRefresh, selectedWorkplace, setSelectedWorkplace }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedWorkplace) {
      setFormData(selectedWorkplace);
    }
  }, [selectedWorkplace]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const onlyNumbers = [
      "taxNo", "nationalId", "postalCode", "phone1",
      "phone2", "mobile", "fax", "commissionRate", "workplaceNo"
    ];

    const onlyLetters = [
      "partner1", "partner2", "managerName", "district", "city"
    ];

    if (onlyNumbers.includes(name) && !/^\d*$/.test(value)) return;
    if (onlyLetters.includes(name) && !/^[a-zA-ZığüşöçİĞÜŞÖÇ\s]*$/.test(value)) return;

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
      if (selectedWorkplace) {
        await axios.put(`${API_URL}/${selectedWorkplace.id}`, formData);
        setSelectedWorkplace(null);
      } else {
        await axios.post(API_URL, formData);
      }

      setFormData(initialForm);
      onRefresh();
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  };

  return (
    <div style={{
      backgroundColor: "#1e1e1e",
      color: "#ffffff",
      padding: "30px",
      borderRadius: "8px",
      maxWidth: "1000px",
      margin: "40px auto",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)"
    }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", textAlign: "center" }}>
        İşyeri Tanımlama
      </h2>

      <form onSubmit={handleSubmit} style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px"
      }}>
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
        ].map(({ label, name, type = "text", options }) => {
          const isDisabledForSanal = [
            "address", "district", "city", "postalCode",
            "phone1", "phone2", "mobile", "fax"
          ].includes(name) && formData.workplaceType === "sanal";

          return (
            <div key={name} style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: "4px", fontWeight: "bold", fontSize: "14px" }}>{label}</label>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={isDisabledForSanal}
                  style={{
                    ...inputStyle,
                    backgroundColor: isDisabledForSanal ? "#555" : inputStyle.backgroundColor,
                    cursor: isDisabledForSanal ? "not-allowed" : "text"
                  }}
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
                  disabled={isDisabledForSanal}
                  style={{
                    ...inputStyle,
                    backgroundColor: isDisabledForSanal ? "#555" : inputStyle.backgroundColor,
                    cursor: isDisabledForSanal ? "not-allowed" : "text"
                  }}
                />
              )}
              {errors[name] && <span style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors[name]}</span>}
            </div>
          );
        })}

        {/* Butonlar */}
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
          {selectedWorkplace && (
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setSelectedWorkplace(null);
              }}
              style={cancelButtonStyle}
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            style={submitButtonStyle}
          >
            {selectedWorkplace ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #888",
  backgroundColor: "#2a2a2a",
  color: "#fff",
  fontSize: "14px"
};

const cancelButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s",
};

const submitButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s",
};

export default WorkplaceForm;









