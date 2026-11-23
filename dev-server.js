// Local preview: serves dist/ with clean URLs and runs api/*.js like Vercel does. node dev-server.js
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "dist");
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".mp4": "video/mp4" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname.startsWith("/api/")) {
    const fn = require(path.join(root, u.pathname + ".js"));
    let body = ""; for await (const c of req) body += c;
    req.body = body ? JSON.parse(body) : undefined;
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    return fn(req, res);
  }
  let p = u.pathname === "/" ? "/index.html" : u.pathname;
  if (!path.extname(p)) p += ".html";
  const f = path.join(root, p);
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end(fs.readFileSync(path.join(root, "404.html"))); }
  res.setHeader("Content-Type", mime[path.extname(f)] || "application/octet-stream");
  res.end(fs.readFileSync(f));
}).listen(4173, () => console.log("http://localhost:4173"));
