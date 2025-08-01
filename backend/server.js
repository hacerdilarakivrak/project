const express = require("express");
const axios = require("axios");
const cors = require("cors");
const xml2js = require("xml2js");

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/api/exchange-rates", async (req, res) => {
  try {
    const response = await axios.get("https://www.tcmb.gov.tr/kurlar/today.xml");
    xml2js.parseString(response.data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "XML parse hatası" });
      }

      const currencies = result.Tarih_Date.Currency;
      const getRate = (code) => {
        const currency = currencies.find((c) => c.$.CurrencyCode === code);
        return currency?.BanknoteSelling?.[0] || null;
      };

      res.json({
        USD: getRate("USD"),
        EUR: getRate("EUR"),
        GBP: getRate("GBP"),
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Veri çekme hatası" });
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor http://localhost:${PORT}`);
});
