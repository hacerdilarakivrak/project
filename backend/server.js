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

function authGuard(req, res, next) {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

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

app.get("/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

const apiRouter = express.Router();

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
  const asOf = root?.$?.Date || root?.$?.Tarih || new Date().toISOString().slice(0, 10);
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
        message: "TCMB erişilemedi, önbellekten verildi.",
      });
    }
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

apiRouter.get("/exchange-rates/all", async (_req, res) => {
  try {
    const all = await getRatesFresh();
    res.json(all);
  } catch (err) {
    if (rateCache.data) return res.status(200).json({ ...rateCache.data, stale: true });
    res.status(500).json({ error: "Döviz verisi alınamadı." });
  }
});

apiRouter.get("/convert", async (req, res) => {
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

apiRouter.get("/customers", async (req, res) => {
  try {
    const r = await api2.get("/customers", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Customers fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/customers/:id", async (req, res) => {
  try {
    const r = await api2.get(`/customers/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Customer fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.post("/customers", async (req, res) => {
  try {
    const r = await api2.post("/customers", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Customer create failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.put("/customers/:id", async (req, res) => {
  try {
    const r = await api2.put(`/customers/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Customer update failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.delete("/customers/:id", async (req, res) => {
  try {
    await api2.delete(`/customers/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Customer delete failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/accounts", async (req, res) => {
  try {
    const r = await api2.get("/accounts", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Accounts fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/accounts/:id", async (req, res) => {
  try {
    const r = await api2.get(`/accounts/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Account fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.post("/accounts", async (req, res) => {
  try {
    const r = await api2.post("/accounts", req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Account create failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.put("/accounts/:id", async (req, res) => {
  try {
    const r = await api2.put(`/accounts/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Account update failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.delete("/accounts/:id", async (req, res) => {
  try {
    await api2.delete(`/accounts/${req.params.id}`);
    res.status(204).end();
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Account delete failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/workplaces", async (req, res) => {
  try {
    const r = await api1.get("/workplaces", { params: req.query });
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Workplaces fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/workplaces/_ids", async (_req, res) => {
  try {
    const list = await api1.get("/workplaces").then((r) => r.data);
    res.json(Array.isArray(list) ? list.map((x) => x.id) : []);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Workplace ids fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/workplaces/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();
    const r = await api1.get(`/workplaces/${encodeURIComponent(id)}`);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Workplace fetch failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.post("/workplaces", async (req, res) => {
  try {
    const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
    const payload = clean({ ...req.body });
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const r = await api1.post("/workplaces", payload);
    res.status(201).json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Workplace create failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.put("/workplaces/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();
    const r = await api1.put(`/workplaces/${encodeURIComponent(id)}`, req.body);
    res.json(r.data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: "Workplace update failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.delete("/workplaces/:key", async (req, res) => {
  const key = String(req.params.key).trim();
  try {
    await api1.delete(`/workplaces/${encodeURIComponent(key)}`);
    return res.status(204).end();
  } catch (e) {
    if (e?.response?.status === 404) {
      try {
        const list = await api1.get("/workplaces").then((r) => r.data);
        let target = Array.isArray(list) ? list.find((x) => String(x.id) === key) : null;
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
          hint: "UI’dan index değil gerçek row.id veya workplaceNo gönder.",
        });
      } catch (inner) {
        return res.status(404).json({ error: "Not found and list fetch failed" });
      }
    }
    return res.status(e?.response?.status || 500).json({ error: "Workplace delete failed", detail: e?.response?.data ?? null });
  }
});

apiRouter.get("/_routes", (req, res) => {
  res.json({
    ok: true,
    routes: [
      "GET  /api/exchange-rates?codes=USD,EUR,GBP",
      "GET  /api/exchange-rates/all",
      "GET  /api/convert?from=USD&to=TRY&amount=100",
      "GET  /api/customers",
      "GET  /api/customers/:id",
      "POST /api/customers",
      "PUT  /api/customers/:id",
      "DELETE /api/customers/:id",
      "GET  /api/accounts",
      "GET  /api/accounts/:id",
      "POST /api/accounts",
      "PUT  /api/accounts/:id",
      "DELETE /api/accounts/:id",
      "GET  /api/workplaces",
      "GET  /api/workplaces/_ids",
      "GET  /api/workplaces/:id",
      "POST /api/workplaces",
      "PUT  /api/workplaces/:id",
      "DELETE /api/workplaces/:key",
    ],
  });
});

app.use("/api", authGuard, apiRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
