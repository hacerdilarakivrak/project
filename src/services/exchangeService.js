import axios from "axios";

export const getExchangeRates = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/exchange-rates");
    return response.data;
  } catch (error) {
    console.error("Döviz kurları alınamadı:", error);
    return null;
  }
};
