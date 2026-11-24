/* Episode feed: pulls /api/episodes and renders cards. Used on home and episodes page. */
(function () {
  const SEG = {
    interview: { label: "Interview", cls: "interview" },
    rundown: { label: "The Rundown", cls: "rundown" },
    npa: { label: "NPA Market Update", cls: "npa" },
    ai: { label: "AI This Month", cls: "ai" },
    short: { label: "Clip", cls: "interview" }
  };
  let cache = null;
  const ic = (n) => window.fixitIcon ? window.fixitIcon(n, 14) : "";

  async function getEpisodes() {
    if (cache) return cache;
    const r = await fetch("/api/episodes");
    if (!r.ok) throw new Error("feed");
    cache = await r.json();
    return cache;
  }

  function card(ep) {
    const seg = SEG[ep.segment] || SEG.interview;
    const date = ep.published ? new Date(ep.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    const thumb = ep.thumbnail ? `style="background-image:url('${ep.thumbnail}')"` : "";
    const yt = ep.youtubeUrl ? `<a class="btn btn-ghost btn-sm" href="${ep.youtubeUrl}" target="_blank" rel="noopener">${ic("youtube")} Watch</a>` : "";
    const sp = ep.spotifyUrl ? `<a class="btn btn-ghost btn-sm" href="${ep.spotifyUrl}" target="_blank" rel="noopener">${ic("spotify")} Listen</a>` : "";
    const ap = ep.appleUrl ? `<a class="btn btn-ghost btn-sm" href="${ep.appleUrl}" target="_blank" rel="noopener">${ic("apple")} Apple</a>` : "";
    const link = ep.youtubeUrl || ep.spotifyUrl || ep.appleUrl || "#";
    return `<article class="card">
      <a class="thumb" href="${link}" target="_blank" rel="noopener" ${thumb}><span class="play"><span>▶</span></span></a>
      <div class="body">
        <div class="meta"><span class="tag ${seg.cls}">${seg.label}</span><span>${date}</span>${ep.duration ? `<span>${ep.duration}</span>` : ""}</div>
        <h3><a href="${link}" target="_blank" rel="noopener">${esc(ep.title)}</a></h3>
        <p>${esc(ep.description || "")}</p>
        <div class="links">${yt}${sp}${ap}</div>
      </div>
    </article>`;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  async function renderList(target, opts = {}) {
    const box = typeof target === "string" ? document.querySelector(target) : target;
    if (!box) return;
    box.innerHTML = Array.from({ length: opts.limit || 6 }).map(() => `<div class="card"><div class="thumb skeleton"></div><div class="body"><div class="skeleton" style="width:40%"></div><div class="skeleton" style="height:40px"></div></div></div>`).join("");
    try {
      const data = await getEpisodes();
      let eps = data.episodes || [];
      if (opts.segment && opts.segment !== "all") eps = eps.filter(e => e.segment === opts.segment);
      if (opts.excludeShorts !== false) eps = eps.filter(e => e.segment !== "short");
      if (opts.query) { const q = opts.query.toLowerCase(); eps = eps.filter(e => (e.title + " " + (e.description || "")).toLowerCase().includes(q)); }
      if (opts.limit) eps = eps.slice(0, opts.limit);
      box.innerHTML = eps.length ? eps.map(card).join("") : `<div class="empty">No episodes match yet. Try another filter or <a href="${window.FIXIT_LINKS.youtube}" target="_blank" rel="noopener">browse on YouTube</a>.</div>`;
      return eps;
    } catch (e) {
      box.innerHTML = `<div class="empty">The feed is warming up. Watch the newest shows on <a href="${window.FIXIT_LINKS.youtube}" target="_blank" rel="noopener">YouTube</a> or <a href="${window.FIXIT_LINKS.spotify}" target="_blank" rel="noopener">Spotify</a>.</div>`;
    }
  }

  async function renderLatest(playerSel, captionSel) {
    try {
      const data = await getEpisodes();
      const ep = (data.episodes || []).find(e => e.segment !== "short" && e.youtubeId);
      if (!ep) return;
      const p = document.querySelector(playerSel);
      if (p) p.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ep.youtubeId}?rel=0" title="${esc(ep.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      const c = document.querySelector(captionSel);
      if (c) c.innerHTML = `<b>Latest:</b> ${esc(ep.title)}`;
    } catch (e) { /* keep fallback embed */ }
  }

  window.FixitEpisodes = { getEpisodes, renderList, renderLatest, SEG };
})();
