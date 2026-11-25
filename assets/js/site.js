/* Shared chrome for every page: background, header, footer, ticker, forms */
(function () {
  const LINKS = {
    youtube: "https://www.youtube.com/@dealershipfixit",
    spotify: "https://open.spotify.com/show/32L4getcOmBCYL3fRxDlyH",
    apple: "https://podcasts.apple.com/us/podcast/id1449367603",
    linktree: "https://linktr.ee/dealershipfixit",
    linkedin: "https://www.linkedin.com/company/dealershipfixit",
    jacob: "https://www.linkedin.com/in/jacob-b-berry/",
    tiktok: "https://www.tiktok.com/@dealershipfixit",
    instagram: "https://www.instagram.com/dealership_fixit/",
    facebook: "https://www.facebook.com/dealershipfixit",
    x: "https://x.com/dealershipfixit",
    motohunt: "https://dealers.motohunt.com/fixit?utm_source=site&utm_medium=referral&utm_campaign=dealership_fixit",
    isc: "https://www.internetsalescoaching.com/?utm_source=site&utm_medium=referral&utm_campaign=dealership_fixit",
    amp: "https://www.absolutemarketingperformance.com/?utm_source=site&utm_medium=referral&utm_campaign=dealership_fixit",
    zii: "https://ziidms.com/fixit"
  };
  window.FIXIT_LINKS = LINKS;

  // Brand icons (24x24 paths)
  const ICONS = {
    youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    apple: "M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z",
    linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
    tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-1.99 6.15-1.58.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
  };
  const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
  window.fixitIcon = icon;
  document.addEventListener("DOMContentLoaded", () => document.querySelectorAll("[data-icon]").forEach(el => { el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon, el.dataset.iconSize || 18) + " "); }));

  const page = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  const NAV = [
    ["/", "Home"],
    ["/episodes", "Episodes"],
    ["/market", "Market Tracker"],
    ["/start-here", "Start Here"],
    ["/about", "About"],
    ["/guest", "Be a Guest"],
    ["/sponsor", "Sponsor"],
    ["/contact", "Contact"]
  ];

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  // Background layers (video first if present)
  const bg = el(`<div class="bg-layers">
    <video class="bgvideo" autoplay muted loop playsinline preload="metadata" poster="/assets/img/hero-poster.jpg" aria-hidden="true"></video>
    <div class="bgshade"></div>
    <div class="sky"></div><div class="stars"></div><div class="sun"></div><div class="horizon"></div><div class="grid"></div>
  </div>`);
  document.body.prepend(bg);
  const vid = bg.querySelector("video");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    vid.src = "/assets/video/hero-bg.mp4";
    document.body.classList.add("has-video");
    vid.addEventListener("error", () => document.body.classList.remove("has-video"));
  }

  // Header
  const header = el(`<header class="nav"><div class="wrap">
    <a class="brand" href="/" aria-label="Dealership fiXit home">
      <img src="/assets/img/df-256.png" alt="" width="40" height="40">
      <span class="word"><b>DEALERSHIP</b><i>fiXit</i></span>
    </a>
    <button class="burger" aria-label="Menu" aria-expanded="false">☰</button>
    <nav>
      ${NAV.map(([h, l]) => `<a href="${h}" ${page === h ? 'class="active"' : ""}>${l}</a>`).join("")}
      <a class="btn btn-pink btn-sm" href="${LINKS.youtube}?sub_confirmation=1" target="_blank" rel="noopener">Subscribe</a>
    </nav>
  </div></header>`);
  document.body.insertBefore(header, bg.nextSibling);
  const burger = header.querySelector(".burger");
  const nav = header.querySelector("nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });

  // Ticker strip (every page, right under the header)
  const ticker = el(`<div class="ticker" aria-label="Powersports market ticker"><div class="label">MARKET</div><div class="track" id="tickerTrack"><span class="item muted">Loading market data…</span></div></div>`);
  header.after(ticker);
  loadTicker();

  // Footer
  const year = new Date().getFullYear();
  const footer = el(`<footer><div class="wrap">
    <div class="cols">
      <div>
        <a class="brand" href="/"><img src="/assets/img/df-256.png" alt="" width="44" height="44"><span class="word"><b>DEALERSHIP</b><i>fiXit</i></span></a>
        <p class="muted" style="margin-top:14px;max-width:420px">Real talk for powersports and motorcycle dealers. Interviews, the weekly Rundown, the NPA market update, and AI This Month. Hosted by Jacob Berry.</p>
        <div class="social">
          <a href="${LINKS.youtube}" target="_blank" rel="noopener" aria-label="YouTube" title="YouTube">${icon("youtube")}</a>
          <a href="${LINKS.spotify}" target="_blank" rel="noopener" aria-label="Spotify" title="Spotify">${icon("spotify")}</a>
          <a href="${LINKS.apple}" target="_blank" rel="noopener" aria-label="Apple Podcasts" title="Apple Podcasts">${icon("apple")}</a>
          <a href="${LINKS.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">${icon("linkedin")}</a>
          <a href="${LINKS.instagram}" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">${icon("instagram")}</a>
          <a href="${LINKS.tiktok}" target="_blank" rel="noopener" aria-label="TikTok" title="TikTok">${icon("tiktok")}</a>
          <a href="${LINKS.facebook}" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">${icon("facebook")}</a>
          <a href="${LINKS.x}" target="_blank" rel="noopener" aria-label="X" title="X">${icon("x")}</a>
        </div>
      </div>
      <div><h4>Listen</h4><ul>
        <li><a href="/episodes">All episodes</a></li>
        <li><a href="/episodes?s=interview">Interviews</a></li>
        <li><a href="/episodes?s=rundown">The Rundown</a></li>
        <li><a href="/episodes?s=npa">NPA Market Update</a></li>
        <li><a href="/episodes?s=ai">AI This Month</a></li>
      </ul></div>
      <div><h4>Show</h4><ul>
        <li><a href="/start-here">Start here</a></li>
        <li><a href="/about">About Jacob</a></li>
        <li><a href="/market">Market tracker</a></li>
        <li><a href="/guest">Be a guest</a></li>
        <li><a href="/sponsor">Sponsor the show</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul></div>
      <div><h4>For dealers</h4><ul>
        <li><a href="${LINKS.motohunt}" target="_blank" rel="noopener">List inventory free on MotoHunt</a></li>
        <li><a href="${LINKS.isc}" target="_blank" rel="noopener">Free sales resources</a></li>
        <li><a href="${LINKS.amp}" target="_blank" rel="noopener">AMP Digital marketing</a></li>
        <li><a href="${LINKS.zii}" target="_blank" rel="noopener">Zii DMS (sponsor)</a></li>
      </ul></div>
    </div>
    <p class="disclaimer" style="margin-top:30px">Dealership fiXit is an independent podcast. Opinions are those of the host and guests and do not represent any employer, manufacturer, or sponsor. Market data is shown for information only and is not investment advice. Some links are to sponsors or companies the host works with. Nothing here is legal, tax, or financial advice. Check with your own advisors before you act.</p>
    <div class="legal">
      <span>© ${year} Dealership fiXit. All rights reserved.</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/disclosures">Disclosures</a> · <a href="${LINKS.linktree}" target="_blank" rel="noopener">Linktree</a></span>
    </div>
  </div></footer>`);
  document.body.appendChild(footer);

  // Newsletter popup for new visitors (once per 14 days, not on legal pages, not after signup)
  (function popup() {
    if (/^\/(privacy|terms|disclosures)/.test(location.pathname)) return;
    let seen = null; try { seen = localStorage.getItem("fixit_popup"); } catch (e) {}
    if (seen && Date.now() - Number(seen) < 14 * 864e5) return;
    const wrap = el(`<div class="popup-wrap" role="dialog" aria-modal="true" aria-labelledby="popupTitle"><div class="popup">
      <button class="x" aria-label="Close">\u00d7</button>
      <img src="/assets/img/wordmark.webp" alt="Dealership fiXit">
      <h3 id="popupTitle">Get the Rundown before Monday's meeting</h3>
      <p>One short email a week: the dealer news that matters, the stock moves, and every new show the minute it drops. Sign up today and get the Ultimate Used Inventory Playbook free.</p>
      <form data-fixit="newsletter" novalidate>
        <input type="text" name="name" placeholder="First name" required aria-label="First name" autocomplete="given-name">
        <input type="email" name="email" placeholder="you@yourdealership.com" required aria-label="Email" autocomplete="email">
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">
        <button class="btn btn-pink" type="submit" style="justify-content:center">Send me the Rundown + the free playbook</button>
        <div class="form-msg"></div>
        <small>No spam. Unsubscribe any time.</small>
      </form>
    </div></div>`);
    const close = () => { wrap.classList.remove("open"); try { localStorage.setItem("fixit_popup", String(Date.now())); } catch (e) {} };
    wrap.querySelector(".x").addEventListener("click", close);
    wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    document.body.appendChild(wrap);
    let shown = false;
    const show = () => { if (shown) return; shown = true; wrap.classList.add("open"); wrap.querySelector("input[type=email]").focus(); };
    setTimeout(show, 9000);
    addEventListener("scroll", () => { if (scrollY > document.body.scrollHeight * 0.35) show(); }, { passive: true });
    document.addEventListener("mouseleave", e => { if (e.clientY <= 0) show(); });
    window.fixitPopupClose = close;
  })();

  // Newsletter + generic form handling
  document.addEventListener("submit", async (e) => {
    const f = e.target;
    if (!f.matches("form[data-fixit]")) return;
    e.preventDefault();
    const msg = f.querySelector(".form-msg") || f.appendChild(el('<div class="form-msg"></div>'));
    const btn = f.querySelector("button[type=submit]");
    const data = Object.fromEntries(new FormData(f).entries());
    data.type = f.dataset.fixit;
    data.page = location.pathname;
    const hutk = (document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/) || [])[1];
    if (hutk) data.hutk = hutk;
    if (data.website) return; // honeypot
    btn && (btn.disabled = true);
    msg.className = "form-msg";
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      msg.textContent = j.message || "Got it. Thanks, we will be in touch.";
      msg.classList.add("ok");
      f.reset();
      if (data.type === "newsletter") { try { localStorage.setItem("fixit_popup", String(Date.now() + 365 * 864e5)); } catch (e) {} if (f.closest(".popup")) setTimeout(() => window.fixitPopupClose && window.fixitPopupClose(), 1800); }
    } catch (err) {
      msg.textContent = err.message || "Could not send. Email us instead.";
      msg.classList.add("err");
    } finally {
      btn && (btn.disabled = false);
    }
  });

  async function loadTicker() {
    const track = document.getElementById("tickerTrack");
    try {
      const r = await fetch("/api/market");
      const j = await r.json();
      if (!j.rows || !j.rows.length) throw new Error("no rows");
      const items = j.rows.filter(x => x.scroll !== false).map(x => {
        const up = (x.changePct || 0) >= 0;
        const sym = x.symbolShort ? `<span class="sym">${x.symbolShort}</span>` : "";
        const chg = x.changePct == null ? "" : `<span class="chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(x.changePct).toFixed(2)}%</span>`;
        const price = x.price == null ? "" : ` ${fmt(x.price)}`;
        return `<span class="item">${x.name}${sym}${price}${chg}</span><span class="sep">|</span>`;
      }).join("");
      const asof = j.asOf ? `<span class="item muted">as of ${j.asOf}</span><span class="sep">|</span>` : "";
      track.innerHTML = items + asof + items + asof; // doubled for seamless loop
      const secs = Math.max(40, Math.min(180, track.scrollWidth / 2 / 70));
      track.style.animationDuration = secs + "s";
    } catch (e) {
      track.innerHTML = `<span class="item muted">Market tracker loading soon. See the <a href="/market">Market Tracker</a>.</span>`;
    }
  }
  function fmt(n) { return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  window.fmtNum = fmt;

  function logoSVG(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lgSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd24a"/><stop offset=".55" stop-color="#ff7a2f"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
        <linearGradient id="lgChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".48" stop-color="#dfe7ff"/><stop offset=".52" stop-color="#5b7cff"/><stop offset="1" stop-color="#fff"/></linearGradient>
        <mask id="mBars"><rect width="100" height="100" fill="#fff"/><rect y="58" width="100" height="4" fill="#000"/><rect y="68" width="100" height="5" fill="#000"/><rect y="80" width="100" height="6" fill="#000"/></mask>
      </defs>
      <circle cx="50" cy="52" r="44" fill="url(#lgSun)" mask="url(#mBars)"/>
      <text x="50" y="66" text-anchor="middle" font-family="Audiowide, system-ui, sans-serif" font-size="44" fill="url(#lgChrome)" stroke="#2a0a4a" stroke-width="2.5" paint-order="stroke">DF</text>
    </svg>`;
  }
  window.logoSVG = logoSVG;
})();
