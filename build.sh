#!/usr/bin/env bash
# Inlines _head.html into every page's <!--HEAD--> marker, adds per-page canonical + og:title/description,
# and generates robots.txt and sitemap.xml. Output goes to ./dist (what gets deployed).
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
cp -r assets vercel.json dist/   # api/ stays at the repo root; Vercel runs it from there
python3 - <<'PY'
import re, glob, html, datetime
SITE = "https://dealershipfixit.com"
head = open("_head.html").read()
NOINDEX = {"404.html", "links.html"}
urls = []
for src in sorted(glob.glob("*.html")):
    if src.startswith("_"): continue
    s = open(src).read()
    slug = "" if src == "index.html" else src[:-5]
    url = f"{SITE}/{slug}"
    title = re.search(r"<title>(.*?)</title>", s, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)"', s, re.S)
    extra = [f'<link rel="canonical" href="{url}">']
    if title: extra.append(f'<meta property="og:title" content="{html.escape(html.unescape(title.group(1).strip()), quote=True)}">')
    if desc: extra.append(f'<meta property="og:description" content="{desc.group(1)}">')
    extra.append(f'<meta property="og:url" content="{url}">')
    if src in NOINDEX: extra.append('<meta name="robots" content="noindex,follow">')
    else: urls.append(url)
    open(f"dist/{src}", "w").write(s.replace("<!--HEAD-->", head + "\n" + "\n".join(extra)))
today = datetime.date.today().isoformat()
open("dist/sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod><changefreq>{'daily' if u.endswith(('.com/', '/episodes', '/market')) else 'monthly'}</changefreq></url>\n" for u in urls) + "</urlset>\n")
open("dist/robots.txt", "w").write(f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")
print(f"built {len(urls)} indexable pages, sitemap and robots.txt into dist/")
PY
