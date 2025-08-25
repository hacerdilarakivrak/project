const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const xml2js = require("xml2js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5176"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

// ---- Auth Guard ----
function authGuard(req, res, next) {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---- Downstream APIs ----
const api1 = axios.create({
  baseURL: process.env.MOCKAPI_BASE_URL_1,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
const api2 = axios.create({
  baseURL: process.env.MOCKAPI_BASE_URL_2,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

app.get("/health", (_, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// ---- Router ----
const apiRouter = express.Router();

// ---- TCMB Exchange Rates (cached) ----
const AX = axios.create({
  timeout: 15000,
  headers: { "User-Agent": "x-bank-education-app/1.0" },
});
const TCMB_TODAY = "https://www.tcmb.gov.tr/kurlar/today.xml";
const CACHE_MS = 15 * 60 * 1000;
let rateCache = { data: null, ts: 0 };

const toNum = (v) => {
  if (v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

const parseTcmbXml = async (xml) => {
  const parsed = await xml2js.parseStringPromise(xml);
  const root = parsed?.Tarih_Date;
  const asOf =
    root?.$?.Date || root?.$?.Tarih || new Date().toISOString().slice(0, 10);
  const list = root?.Currency || [];
  const rates = {};
  for (const cur of list) {
    const code = cur?.$?.CurrencyCode;
    if (!code) continue;
    rates[code] = {
      banknoteBuying: toNum(cur?.BanknoteBuying?.[0]),
      banknoteSelling: toNum(cur?.BanknoteSelling?.[0]),
      forexBuying: toNum(cur?.ForexBuying?.[0]),
      forexSelling: toNum(cur?.ForexSelling?.[0]),
      unit: toNum(cur?.Unit?.[0]) || 1,
      name: cur?.Isim?.[0] || code,
    };
  }
  return { asOf, base: "TRY", rates };
};

const buildDatedUrl = (d) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `https://www.tcmb.gov.tr/kurlar/${yyyy}${mm}/${dd}${mm}${yyyy}.xml`;
};

const fetchTcmbWithFallback = async () => {
  try {
    const r = await AX.get(TCMB_TODAY, { responseType: "text" });
    return await parseTcmbXml(r.data);
  } catch (_) {
    for (let i = 0; i < 6; i++) {
      try {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const url = buildDatedUrl(d);
        const r2 = await AX.get(url, { responseType: "text" });
        return await parseTcmbXml(r2.data);
      } catch {}
    }
    throw new Error("TCMB fetch failed");
  }
};

const getRatesFresh = async () => {
  const now = Date.now();
  if (rateCache.data && now - rateCache.ts < CACHE_MS) return rateCache.data;
  const data = await fetchTcmbWithFallback();
  rateCache = { data, ts: now };
  return data;
};

const pickCodes = (full, codes) => {
  const out = {};
  for (const c of codes) if (full.rates[c]) out[c] = full.rates[c];
  return { asOf: full.asOf, base: full.base, rates: out };
};

apiRouter.get("/exchange-rates", async (req, res) => {
  const codes = (req.query.codes || "USD,EUR,GBP")
    .split(",")
    .map((s) => s.trim().toUpperCase());
  try {
    const all = await getRatesFresh();
    res.json(pickCodes(all, codes));
  } catch {
    if (rateCache.data)
      return res
        .status(200)
        .json({ ...pickCodes(rateCache.data, codes), stale: true });
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

apiRouter.get("/exchange-rates/all", async (_req, res) => {
  try {
    const all = await getRatesFresh();
    res.json(all);
  } catch {
    if (rateCache.data)
      return res.status(200).json({ ...rateCache.data, stale: true });
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

// ---- Customers ----
apiRouter.get("/customers", async (req, res) => {
  try {
    const r = await api2.get("/customers", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customers fetch failed" });
  }
});

apiRouter.get("/customers/:id", async (req, res) => {
  try {
    const r = await api2.get(`/customers/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer fetch failed" });
  }
});

apiRouter.post("/customers", async (req, res) => {
  try {
    const r = await api2.post("/customers", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer create failed" });
  }
});

apiRouter.put("/customers/:id", async (req, res) => {
  try {
    const r = await api2.put(`/customers/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer update failed" });
  }
});

apiRouter.delete("/customers/:id", async (req, res) => {
  try {
    await api2.delete(`/customers/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Customer delete failed" });
  }
});

// ---- Accounts ----
apiRouter.get("/accounts", async (req, res) => {
  try {
    const r = await api2.get("/accounts", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Accounts fetch failed" });
  }
});

apiRouter.get("/accounts/:id", async (req, res) => {
  try {
    const r = await api2.get(`/accounts/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account fetch failed" });
  }
});

apiRouter.post("/accounts", async (req, res) => {
  try {
    const r = await api2.post("/accounts", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account create failed" });
  }
});

apiRouter.put("/accounts/:id", async (req, res) => {
  try {
    const r = await api2.put(`/accounts/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account update failed" });
  }
});

apiRouter.delete("/accounts/:id", async (req, res) => {
  try {
    await api2.delete(`/accounts/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Account delete failed" });
  }
});

// ---- Transactions ----
apiRouter.get("/transactions", async (req, res) => {
  try {
    const r = await api2.get("/transactions", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transactions fetch failed" });
  }
});

apiRouter.get("/transactions/:id", async (req, res) => {
  try {
    const r = await api2.get(`/transactions/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction fetch failed" });
  }
});

apiRouter.post("/transactions", async (req, res) => {
  try {
    const r = await api2.post("/transactions", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction create failed" });
  }
});

apiRouter.put("/transactions/:id", async (req, res) => {
  try {
    const r = await api2.put(`/transactions/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction update failed" });
  }
});

apiRouter.delete("/transactions/:id", async (req, res) => {
  try {
    await api2.delete(`/transactions/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Transaction delete failed" });
  }
});

// ---- Workplaces (FULL CRUD) ----
apiRouter.get("/workplaces", async (req, res) => {
  try {
    const r = await api1.get("/workplaces", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplaces fetch failed" });
  }
});

apiRouter.get("/workplaces/:id", async (req, res) => {
  try {
    const r = await api1.get(`/workplaces/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace fetch failed" });
  }
});

apiRouter.post("/workplaces", async (req, res) => {
  try {
    const r = await api1.post("/workplaces", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace create failed" });
  }
});

apiRouter.put("/workplaces/:id", async (req, res) => {
  try {
    const r = await api1.put(`/workplaces/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace update failed" });
  }
});

apiRouter.delete("/workplaces/:id", async (req, res) => {
  try {
    await api1.delete(`/workplaces/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res
      .status(e?.response?.status || 500)
      .json({ error: "Workplace delete failed" });
  }
});

// ---- Route List ----
apiRouter.get("/_routes", (_req, res) => {
  res.json({
    ok: true,
    routes: [
      "GET    /api/exchange-rates?codes=USD,EUR,GBP",
      "GET    /api/exchange-rates/all",
      "GET    /api/customers",
      "POST   /api/customers",
      "GET    /api/customers/:id",
      "PUT    /api/customers/:id",
      "DELETE /api/customers/:id",
      "GET    /api/accounts",
      "POST   /api/accounts",
      "GET    /api/accounts/:id",
      "PUT    /api/accounts/:id",
      "DELETE /api/accounts/:id",
      "GET    /api/transactions",
      "POST   /api/transactions",
      "GET    /api/transactions/:id",
      "PUT    /api/transactions/:id",
      "DELETE /api/transactions/:id",
      "GET    /api/workplaces",
      "POST   /api/workplaces",
      "GET    /api/workplaces/:id",
      "PUT    /api/workplaces/:id",
      "DELETE /api/workplaces/:id",
    ],
  });
});

// ---- Mount & Error Handlers ----
app.use("/api", authGuard, apiRouter);

app.use((req, res) =>
  res
    .status(404)
    .json({ error: `Not Found: ${req.method} ${req.originalUrl}` })
);

app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
