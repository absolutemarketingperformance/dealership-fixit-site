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
          <a href="${LINKS.youtube}" target="_blank" rel="noopener" aria-label="YouTube" title="YouTube">▶</a>
          <a href="${LINKS.spotify}" target="_blank" rel="noopener" aria-label="Spotify" title="Spotify">♫</a>
          <a href="${LINKS.apple}" target="_blank" rel="noopener" aria-label="Apple Podcasts" title="Apple Podcasts">\uF8FF</a>
          <a href="${LINKS.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">in</a>
          <a href="${LINKS.instagram}" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">◎</a>
          <a href="${LINKS.tiktok}" target="_blank" rel="noopener" aria-label="TikTok" title="TikTok">♪</a>
          <a href="${LINKS.facebook}" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">f</a>
          <a href="${LINKS.x}" target="_blank" rel="noopener" aria-label="X" title="X">X</a>
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
