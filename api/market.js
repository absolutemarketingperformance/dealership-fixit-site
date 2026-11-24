// Market tracker. Live quotes (15 to 20 minute delayed) pulled straight from Yahoo Finance's public chart endpoint, no key needed.
// The basket lives in api/_tickers.json. Add a row there and push to add a company.
// Fallbacks, in order: the Google Sheet CSV (MARKET_SHEET_CSV_URL), then the bundled snapshot.
const TICKERS = require("./_tickers.json");
const fallback = require("./_market-fallback.json");
const SHEET_ID = process.env.MARKET_SHEET_ID || "1v2Y14Tx8ZznBGmUYCDT2vbQVJWKeXOqId-BLXgNO0pI";
const CSV_URL = process.env.MARKET_SHEET_CSV_URL || `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const UA = { "User-Agent": "Mozilla/5.0 (DealershipFixitSite/1.0)", Accept: "application/json" };

let memo = { at: 0, data: null };

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  const force = req.query && req.query.refresh === "1";
  if (!force && memo.data && Date.now() - memo.at < 15 * 60 * 1000) return res.status(200).json(memo.data);

  try {
    const data = await fromYahoo();
    if (data.rows.length >= TICKERS.length * 0.6) { memo = { at: Date.now(), data }; return res.status(200).json(data); }
    throw new Error("too few quotes: " + data.rows.length);
  } catch (e1) {
    try {
      const data = await fromSheet();
      memo = { at: Date.now(), data };
      return res.status(200).json({ ...data, note: "yahoo failed: " + e1.message });
    } catch (e2) {
      return res.status(200).json({ ...fallback, source: "snapshot", note: `yahoo: ${e1.message}; sheet: ${e2.message}` });
    }
  }
};

async function fromYahoo() {
  const results = await Promise.all(TICKERS.map(async t => {
    const q = (await quote(t.symbol)) || (t.alt ? await quote(t.alt) : null);
    if (!q) return null;
    return { group: t.group, name: t.name, ticker: t.symbol, symbolShort: t.short || "", price: q.price, changePct: q.changePct, priorClose: q.prev, currency: q.currency, marketTime: q.time, scroll: t.scroll !== false };
  }));
  const rows = results.filter(Boolean);
  const latest = rows.reduce((m, r) => Math.max(m, r.marketTime || 0), 0);
  const asOf = latest ? new Date(latest * 1000).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " ET" : null;
  return { asOf, source: "yahoo", updated: new Date().toISOString(), rows };
}

async function quote(symbol) {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`, { headers: UA });
    if (!r.ok) return null;
    const j = await r.json();
    const m = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
    if (!m || m.regularMarketPrice == null) return null;
    // previousClose is yesterday's close; chartPreviousClose is the close before the requested range (with range=1d, also yesterday).
    const prev = m.previousClose != null ? m.previousClose : m.chartPreviousClose;
    const price = m.regularMarketPrice;
    const changePct = prev ? ((price - prev) / prev) * 100 : null;
    return { price: round(price), prev: round(prev), changePct: changePct == null ? null : Math.round(changePct * 100) / 100, currency: m.currency, time: m.regularMarketTime };
  } catch (e) { return null; }
}
function round(n) { return n == null ? null : Math.round(n * 100) / 100; }

// Sheet columns: Group | Company | Ticker | Price | Day change % | Prior close | Ticker line | Scroll
async function fromSheet() {
  const r = await fetch(CSV_URL, { headers: { "User-Agent": "DealershipFixitSite/1.0" } });
  if (!r.ok) throw new Error("sheet " + r.status);
  const rows = parseCSV(await r.text());
  const out = []; let group = "";
  for (const row of rows) {
    const [g, name, ticker, price, chg, prior, , scroll] = row;
    if (!name || /^company$/i.test(name)) continue;
    if (g) group = g;
    const p = num(price), c = num(chg);
    if (p == null && c == null) continue;
    out.push({ group, name: name.trim(), ticker: (ticker || "").trim(), symbolShort: shortSym(ticker), price: p, changePct: c, priorClose: num(prior), scroll: !/^(false|no|0)$/i.test((scroll || "true").trim()) });
  }
  if (!out.length) throw new Error("empty sheet");
  return { asOf: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), source: "sheet", rows: out };
}
function shortSym(t) { if (!t) return ""; t = t.trim(); if (/^INDEX/i.test(t)) return ""; const m = t.match(/^(NYSE|NASDAQ|NYSEARCA):([A-Z.]+)$/i); if (m) return m[2].toUpperCase(); if (/^[A-Z]{1,5}$/.test(t)) return t; return ""; }
function num(s) { if (s == null) return null; const n = parseFloat(String(s).replace(/[,%$\s]/g, "")); return isNaN(n) ? null : n; }
function parseCSV(text) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
