// Market tracker. Reads the "Dealership fiXit Rundown Stock Ticker" Google Sheet.
// Best source: File > Share > Publish to web > CSV (recalculates GOOGLEFINANCE on Google's side). Put that URL in MARKET_SHEET_CSV_URL.
// Fallback: gviz CSV on the sheet ID (sheet must be shared "anyone with the link"). Last fallback: bundled snapshot.
const SHEET_ID = process.env.MARKET_SHEET_ID || "1v2Y14Tx8ZznBGmUUCDT2vbQVJWKeXOqId-BLXgNO0pI";
const CSV_URL = process.env.MARKET_SHEET_CSV_URL || `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const fallback = require("./_market-fallback.json");

let memo = { at: 0, data: null };

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  if (memo.data && Date.now() - memo.at < 10 * 60 * 1000) return res.status(200).json(memo.data);
  try {
    const r = await fetch(CSV_URL, { headers: { "User-Agent": "DealershipFixitSite/1.0" } });
    if (!r.ok) throw new Error("sheet " + r.status);
    const rows = parseCSV(await r.text());
    const data = shape(rows);
    if (!data.rows.length) throw new Error("empty");
    memo = { at: Date.now(), data };
    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json({ ...fallback, source: "snapshot", note: String(e.message || e) });
  }
};

// Sheet columns: Group | Company | Ticker | Price | Day change % | Prior close | Ticker line | Scroll
function shape(rows) {
  const out = [];
  let group = "";
  for (const r of rows) {
    const [g, name, ticker, price, chg, prior, , scroll] = r;
    if (!name || /^company$/i.test(name)) continue;
    if (g) group = g;
    const p = num(price), c = num(chg);
    if (p == null && c == null) continue;
    out.push({
      group, name: name.trim(), ticker: (ticker || "").trim(), symbolShort: shortSym(ticker),
      price: p, changePct: c, priorClose: num(prior),
      scroll: !/^(false|no|0)$/i.test((scroll || "true").trim())
    });
  }
  return { asOf: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), source: "sheet", rows: out };
}
function shortSym(t) {
  if (!t) return "";
  t = t.trim();
  if (/^INDEX/i.test(t)) return "";
  const m = t.match(/^(NYSE|NASDAQ|NYSEARCA):([A-Z.]+)$/i);
  if (m) return m[2].toUpperCase();
  if (/^[A-Z]{1,5}$/.test(t)) return t; // OTC pink sheets
  return ""; // overseas exchanges, show name only
}
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
