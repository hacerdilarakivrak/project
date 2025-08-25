// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const xml2js = require("xml2js");           // <-- eklendi
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS -------------------- */
// Authorization header'ına izin ver ve preflight'ları karşıla
app.use(
  cors({
    origin: ["http://localhost:5176"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// JSON gövde
app.use(express.json());
app.use(morgan("dev"));

/* -------------------- AUTH MIDDLEWARE -------------------- */
// Authorization: Bearer <AUTH_TOKEN>
function authGuard(req, res, next) {
  // Preflight isteklerini auth'suz geçir
  if (req.method === "OPTIONS") return res.sendStatus(204);

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token || token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* -------------------- MockAPI istemcileri -------------------- */
const api1 = axios.create({
  baseURL: process.env.MOCKAPI_BASE_URL_1, // workplaces burada
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
const api2 = axios.create({
  baseURL: process.env.MOCKAPI_BASE_URL_2, // customers, accounts, transactions burada
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/* -------------------- Health -------------------- */
app.get("/health", (_, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

/* -------------------- API Routes (auth'lu) -------------------- */
app.use("/api", authGuard);

/* ======================================================================
   DÖVİZ KURLARI (TCMB)
   ----------------------------------------------------------------------
   - /api/exchange-rates?codes=USD,EUR,GBP
   - /api/exchange-rates/all
   - /api/convert?from=USD&to=TRY&amount=100
   ====================================================================== */
const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const CACHE_MS = 15 * 60 * 1000; // 15 dk

let rateCache = {
  data: null, // { asOf, base: "TRY", rates: { USD: {...}, ... } }
  ts: 0,
};

// "34,5678" -> 34.5678
const parseNum = (v) => {
  if (v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

async function fetchTcmb() {
  const resp = await axios.get(TCMB_URL, { responseType: "text" });
  const parsed = await xml2js.parseStringPromise(resp.data);
  const root = parsed?.Tarih_Date;
  const asOf = root?.$?.Date || new Date().toISOString().slice(0, 10);
  const list = root?.Currency || [];

  const all = {};
  for (const cur of list) {
    const code = cur?.$?.CurrencyCode;
    if (!code) continue;
    all[code] = {
      banknoteBuying: parseNum(cur?.BanknoteBuying?.[0]),
      banknoteSelling: parseNum(cur?.BanknoteSelling?.[0]),
      forexBuying: parseNum(cur?.ForexBuying?.[0]),
      forexSelling: parseNum(cur?.ForexSelling?.[0]),
      unit: parseNum(cur?.Unit?.[0]) || 1,
      name: cur?.Isim?.[0] || code,
    };
  }
  return { asOf, base: "TRY", rates: all };
}

async function getRatesFresh() {
  const now = Date.now();
  if (rateCache.data && now - rateCache.ts < CACHE_MS) return rateCache.data;
  const data = await fetchTcmb();
  rateCache = { data, ts: now };
  return data;
}

function pickCodes(full, codes) {
  const out = {};
  for (const c of codes) if (full.rates[c]) out[c] = full.rates[c];
  return { asOf: full.asOf, base: full.base, rates: out };
}

// GET /api/exchange-rates?codes=USD,EUR,GBP
app.get("/api/exchange-rates", async (req, res) => {
  const codes = (req.query.codes || "USD,EUR,GBP")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  try {
    const all = await getRatesFresh();
    res.json(pickCodes(all, codes));
  } catch (err) {
    if (rateCache.data) {
      return res.status(200).json({
        ...pickCodes(rateCache.data, codes),
        stale: true,
        message: "TCMB bağlantı hatası; önbellekten verildi.",
      });
    }
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

// GET /api/exchange-rates/all
app.get("/api/exchange-rates/all", async (_req, res) => {
  try {
    const all = await getRatesFresh();
    res.json(all);
  } catch (err) {
    if (rateCache.data) return res.status(200).json({ ...rateCache.data, stale: true });
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

// GET /api/convert?from=USD&to=TRY&amount=100
app.get("/api/convert", async (req, res) => {
  try {
    const { from = "USD", to = "TRY", amount = "1" } = req.query;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "amount > 0 olmalı" });

    const all = await getRatesFresh();
    const rates = all.rates;

    const upper = (s) => String(s || "").toUpperCase();
    const f = upper(from);
    const t = upper(to);

    const mid = (code) => {
      const r = rates[code];
      if (!r) return null;
      // genel kur → forexSelling öncelik; yoksa banknoteSelling → forexBuying → banknoteBuying
      return r.forexSelling ?? r.banknoteSelling ?? r.forexBuying ?? r.banknoteBuying ?? null;
    };

    if (f === "TRY" && t === "TRY") return res.json({ amount: amt, result: amt });

    if (f === "TRY") {
      const rt = mid(t);
      if (!rt) return res.status(400).json({ error: `Kur bulunamadı: ${t}` });
      return res.json({ from: f, to: t, amount: amt, rate: rt, result: amt / rt });
    }

    if (t === "TRY") {
      const rf = mid(f);
      if (!rf) return res.status(400).json({ error: `Kur bulunamadı: ${f}` });
      return res.json({ from: f, to: t, amount: amt, rate: rf, result: amt * rf });
    }

    const rf = mid(f);
    const rt = mid(t);
    if (!rf || !rt) return res.status(400).json({ error: `Kur bulunamadı: ${!rf ? f : t}` });

    const inTry = amt * rf;
    const result = inTry / rt;
    res.json({ from: f, to: t, amount: amt, rateFrom: rf, rateTo: rt, result });
  } catch (err) {
    res.status(500).json({ error: "Dönüşüm yapılamadı." });
  }
});

/* -------------------- API: CUSTOMERS (api2) -------------------- */
app.get("/api/customers", async (req, res) => {
  try {
    const r = await api2.get("/customers", { params: req.query });
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/customers", e?.response?.status, e?.response?.data || e?.message);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customers fetch failed", detail: e?.response?.data ?? null });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const r = await api2.get(`/customers/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer fetch failed", detail: e?.response?.data ?? null });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const r = await api2.post("/customers", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer create failed", detail: e?.response?.data ?? null });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const r = await api2.put(`/customers/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer update failed", detail: e?.response?.data ?? null });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await api2.delete(`/customers/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer delete failed", detail: e?.response?.data ?? null });
  }
});

/* -------------------- API: ACCOUNTS (api2) -------------------- */
app.get("/api/accounts", async (req, res) => {
  try {
    const r = await api2.get("/accounts", { params: req.query });
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/accounts", e?.response?.status, e?.response?.data || e?.message);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Accounts fetch failed", detail: e?.response?.data ?? null });
  }
});

app.get("/api/accounts/:id", async (req, res) => {
  try {
    const r = await api2.get(`/accounts/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account fetch failed", detail: e?.response?.data ?? null });
  }
});

app.post("/api/accounts", async (req, res) => {
  try {
    const r = await api2.post("/accounts", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account create failed", detail: e?.response?.data ?? null });
  }
});

app.put("/api/accounts/:id", async (req, res) => {
  try {
    const r = await api2.put(`/accounts/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account update failed", detail: e?.response?.data ?? null });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    await api2.delete(`/accounts/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account delete failed", detail: e?.response?.data ?? null });
  }
});

/* -------------------- API: WORKPLACES (api1) -------------------- */
// LIST
app.get("/api/workplaces", async (req, res) => {
  try {
    const r = await api1.get("/workplaces", { params: req.query });
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/workplaces", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplaces fetch failed", detail: e?.response?.data ?? null });
  }
});

// Yardımcı: SADECE ID'LER (teşhis için) — BUNU /:id'DEN ÖNCE TUT!
app.get("/api/workplaces/_ids", async (_req, res) => {
  try {
    const list = await api1.get("/workplaces").then((r) => r.data);
    res.json(Array.isArray(list) ? list.map((x) => x.id) : []);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace ids fetch failed", detail: e?.response?.data ?? null });
  }
});

// Tekil GET
app.get("/api/workplaces/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();
    const r = await api1.get(`/workplaces/${encodeURIComponent(id)}`);
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/workplaces/:id", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace fetch failed", detail: e?.response?.data ?? null });
  }
});

// CREATE
app.post("/api/workplaces", async (req, res) => {
  try {
    // undefined alanları düşür; id/createdAt/updatedAt göndermeyelim
    const clean = (obj) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
    const payload = clean({ ...req.body });
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const r = await api1.post("/workplaces", payload);
    res.status(201).json(r.data);
  } catch (e) {
    console.error("POST /api/workplaces", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace create failed", detail: e?.response?.data ?? null });
  }
});

// UPDATE (isteğe bağlı)
app.put("/api/workplaces/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();
    const r = await api1.put(`/workplaces/${encodeURIComponent(id)}`, req.body);
    res.json(r.data);
  } catch (e) {
    console.error("PUT /api/workplaces/:id", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace update failed", detail: e?.response?.data ?? null });
  }
});

// DELETE (akıllı: id veya workplaceNo ile siler)
app.delete("/api/workplaces/:key", async (req, res) => {
  const key = String(req.params.key).trim();
  console.log("DELETE workplaces key =", JSON.stringify(key));
  try {
    // 1) Direkt id olarak dene
    await api1.delete(`/workplaces/${encodeURIComponent(key)}`);
    return res.status(204).end();
  } catch (e) {
    // 2) 404 ise, workplaceNo olabilir—listeyi çekip gerçek id'yi bul
    if (e?.response?.status === 404) {
      try {
        const list = await api1.get("/workplaces").then((r) => r.data);
        // id eşleşmesi (güvenlik için tekrar dene)
        let target = Array.isArray(list) ? list.find((x) => String(x.id) === key) : null;
        // workplaceNo eşleşmesi (UI id yerine işyeri no gönderiyorsa)
        if (!target && Array.isArray(list)) {
          target = list.find((x) => String(x.workplaceNo) === key);
        }

        if (target?.id) {
          await api1.delete(`/workplaces/${encodeURIComponent(String(target.id))}`);
          return res.status(204).end();
        }
        return res.status(404).json({
          error: "Not found on MockAPI",
          tried: key,
          availableIds: Array.isArray(list) ? list.map((x) => x.id) : [],
          availableWorkplaceNos: Array.isArray(list) ? list.map((x) => x.workplaceNo) : [],
          hint: "UI’dan index değil gerçek row.id veya workplaceNo gönderildiğinden emin ol",
        });
      } catch (inner) {
        console.error("DELETE fallback list fetch error:", inner?.response?.data || inner);
        return res.status(404).json({ error: "Not found and list fetch failed" });
      }
    }
    console.error("DELETE /api/workplaces/:key", e?.response?.status, e?.response?.data || e?.message);
    return res.status(e?.response?.status || 500).json({
      error: "Workplace delete failed",
      detail: e?.response?.data ?? null,
    });
  }
});

/* -------------------- API: TRANSACTIONS (api2) -------------------- */
// LIST
app.get("/api/transactions", async (req, res) => {
  try {
    const r = await api2.get("/transactions", { params: req.query });
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/transactions", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transactions fetch failed", detail: e?.response?.data ?? null });
  }
});

// Tekil GET (opsiyonel ama faydalı)
app.get("/api/transactions/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();
    const r = await api2.get(`/transactions/${encodeURIComponent(id)}`);
    res.json(r.data);
  } catch (e) {
    console.error("GET /api/transactions/:id", e?.response?.status, e?.response?.data);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction fetch failed", detail: e?.response?.data ?? null });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const r = await api2.post("/transactions", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    console.error("POST /api/transactions", e?.response?.status, e?.response?.data || e?.message);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction create failed", detail: e?.response?.data ?? null });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const r = await api2.put(`/transactions/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    console.error("PUT /api/transactions/:id", e?.response?.status, e?.response?.data || e?.message);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction update failed", detail: e?.response?.data ?? null });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await api2.delete(`/transactions/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    console.error("DELETE /api/transactions/:id", e?.response?.status, e?.response?.data || e?.message);
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction delete failed", detail: e?.response?.data ?? null });
  }
});

/* -------------------- Server -------------------- */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});













