const express = require("express");
const axios = require("axios");
const cors = require("cors");
const xml2js = require("xml2js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===== Kullanıcı Yönetimi =====
let users = []; // { id, username, passwordHash }

// Token kontrol middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token gerekli" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token bulunamadı" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token geçersiz" });
    req.user = user;
    next();
  });
}

// Kayıt ol
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });

  const existingUser = users.find((u) => u.username === username);
  if (existingUser)
    return res.status(400).json({ message: "Kullanıcı zaten var" });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, passwordHash };
  users.push(newUser);

  res.json({ message: "Kayıt başarılı", user: { id: newUser.id, username } });
});

// Giriş yap
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user)
    return res.status(400).json({ message: "Geçersiz kullanıcı veya şifre" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch)
    return res.status(400).json({ message: "Geçersiz kullanıcı veya şifre" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Giriş başarılı", token });
});

// Profil (korumalı)
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profil bilgileri", user: req.user });
});

// ===== Döviz Kurları =====
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

// ===== Hesap & İşlemler =====
let accounts = [
  { id: 1, name: "Hesap 1", balance: 1000 },
  { id: 2, name: "Hesap 2", balance: 500 },
];

let transactions = [];

app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  const from = accounts.find((acc) => acc.id === fromAccountId);
  const to = accounts.find((acc) => acc.id === toAccountId);

  if (!from || !to) {
    return res.status(400).json({ message: "Hesap bulunamadı" });
  }

  if (from.balance < amount) {
    return res.status(400).json({ message: "Yetersiz bakiye" });
  }

  from.balance -= amount;
  to.balance += amount;

  const newTransaction = {
    id: transactions.length + 1,
    from: from.name,
    to: to.name,
    amount,
    date: new Date(),
  };

  transactions.push(newTransaction);
  res.json(newTransaction);
});

app.put("/api/transactions/:id", (req, res) => {
  const transactionId = parseInt(req.params.id);
  const { fromAccountId, toAccountId, amount } = req.body;

  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ message: "İşlem bulunamadı" });
  }

  const from = accounts.find((acc) => acc.id === fromAccountId);
  const to = accounts.find((acc) => acc.id === toAccountId);

  if (!from || !to) {
    return res.status(400).json({ message: "Hesap bulunamadı" });
  }

  if (from.balance < amount) {
    return res.status(400).json({ message: "Yetersiz bakiye" });
  }

  const oldFrom = accounts.find((acc) => acc.name === transaction.from);
  const oldTo = accounts.find((acc) => acc.name === transaction.to);
  if (oldFrom && oldTo) {
    oldFrom.balance += transaction.amount;
    oldTo.balance -= transaction.amount;
  }

  from.balance -= amount;
  to.balance += amount;

  transaction.from = from.name;
  transaction.to = to.name;
  transaction.amount = amount;
  transaction.date = new Date();

  res.json(transaction);
});

app.get("/api/accounts", (req, res) => {
  res.json(accounts);
});

// ===== Server =====
app.listen(PORT, () => {
  console.log(`Server çalışıyor http://localhost:${PORT}`);
});



