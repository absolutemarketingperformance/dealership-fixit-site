// Merges the YouTube channel feed with the podcast RSS (Spotify/Apple) into one episode list.
// Env: YOUTUBE_CHANNEL_ID (default set), PODCAST_RSS_URL (Spotify for Creators RSS), YOUTUBE_API_KEY (optional, for more than 15 videos).
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UC8RWgq6pFKN8dHurvKa858A";
const RSS_URL = process.env.PODCAST_RSS_URL || "";
const YT_KEY = process.env.YOUTUBE_API_KEY || "";
const APPLE_ID = process.env.APPLE_PODCAST_ID || "1449367603";

let memo = { at: 0, data: null };

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  try {
    if (memo.data && Date.now() - memo.at < 15 * 60 * 1000) return res.status(200).json(memo.data);
    const [yt, rss, apple] = await Promise.all([fetchYouTube().catch(() => []), fetchPodcast().catch(() => []), fetchApple().catch(() => [])]);
    const episodes = merge(yt, mergePod(apple, rss));
    const data = { count: episodes.length, updated: new Date().toISOString(), episodes };
    memo = { at: Date.now(), data };
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "feed_failed", detail: String(e.message || e) });
  }
};

async function fetchYouTube() {
  if (YT_KEY) {
    const u = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${YT_KEY}`;
    const r = await fetch(u);
    if (r.ok) {
      const j = await r.json();
      return (j.items || []).map(it => ({
        youtubeId: it.id.videoId,
        title: decode(it.snippet.title),
        description: decode(it.snippet.description || ""),
        published: it.snippet.publishedAt,
        thumbnail: (it.snippet.thumbnails.high || it.snippet.thumbnails.medium || {}).url
      }));
    }
  }
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, { headers: { "User-Agent": "DealershipFixitSite/1.0" } });
  if (!r.ok) throw new Error("yt " + r.status);
  const xml = await r.text();
  return blocks(xml, "entry").map(b => ({
    youtubeId: tag(b, "yt:videoId"),
    title: decode(tag(b, "title")),
    description: decode(tag(b, "media:description")),
    published: tag(b, "published"),
    thumbnail: attr(b, "media:thumbnail", "url")
  })).filter(e => e.youtubeId);
}

async function fetchPodcast() {
  if (!RSS_URL) return [];
  const r = await fetch(RSS_URL, { headers: { "User-Agent": "DealershipFixitSite/1.0" } });
  if (!r.ok) throw new Error("rss " + r.status);
  const xml = await r.text();
  return blocks(xml, "item").map(b => ({
    guid: tag(b, "guid"),
    title: decode(tag(b, "title")),
    description: strip(decode(tag(b, "description") || tag(b, "itunes:summary") || "")),
    published: tag(b, "pubDate") ? new Date(tag(b, "pubDate")).toISOString() : null,
    duration: fmtDur(tag(b, "itunes:duration")),
    audioUrl: attr(b, "enclosure", "url"),
    spotifyUrl: (tag(b, "link") || "").includes("spotify") ? tag(b, "link") : null,
    thumbnail: attr(b, "itunes:image", "href")
  }));
}

// Apple's public lookup returns the whole back catalog with no API key.
async function fetchApple() {
  const r = await fetch(`https://itunes.apple.com/lookup?id=${APPLE_ID}&media=podcast&entity=podcastEpisode&limit=300`, { headers: { "User-Agent": "DealershipFixitSite/1.0" } });
  if (!r.ok) throw new Error("apple " + r.status);
  const j = await r.json();
  return (j.results || []).filter(x => x.kind === "podcast-episode").map(x => ({
    guid: x.episodeGuid || String(x.trackId),
    title: x.trackName,
    description: strip(x.description || x.shortDescription || ""),
    published: x.releaseDate,
    duration: x.trackTimeMillis ? `${Math.round(x.trackTimeMillis / 60000)} min` : null,
    audioUrl: x.episodeUrl || null,
    appleUrl: x.trackViewUrl || null,
    spotifyUrl: null,
    thumbnail: x.artworkUrl600 || x.artworkUrl160 || null
  }));
}

// Fold RSS items (Spotify links) into the Apple list by title.
function mergePod(apple, rss) {
  const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const out = apple.map(a => ({ ...a }));
  for (const r of rss) {
    const m = out.find(a => norm(a.title) === norm(r.title));
    if (m) { m.spotifyUrl = m.spotifyUrl || r.spotifyUrl; m.duration = m.duration || r.duration; }
    else out.push(r);
  }
  return out;
}

// Match a YouTube video to a podcast item by normalized title, else keep both.
function merge(yt, pod) {
  const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const out = [];
  const used = new Set();
  for (const v of yt) {
    const nv = norm(v.title);
    const m = pod.find((p, i) => !used.has(i) && (norm(p.title) === nv || nv.includes(norm(p.title).slice(0, 40)) || norm(p.title).includes(nv.slice(0, 40))));
    const ep = {
      id: v.youtubeId,
      title: v.title,
      description: (m && m.description) || v.description || "",
      published: v.published,
      thumbnail: v.thumbnail || (m && m.thumbnail),
      youtubeId: v.youtubeId,
      youtubeUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      spotifyUrl: m ? m.spotifyUrl : null,
      appleUrl: m ? m.appleUrl : null,
      audioUrl: m ? m.audioUrl : null,
      duration: m ? m.duration : null,
      isShort: /#shorts/i.test(v.title + " " + v.description) || (!m && (v.description || "").length < 60 && /clip|short/i.test(v.title))
    };
    if (m) used.add(pod.indexOf(m));
    out.push(ep);
  }
  pod.forEach((p, i) => { if (!used.has(i)) out.push({ id: p.guid || p.title, title: p.title, description: p.description, published: p.published, thumbnail: p.thumbnail, spotifyUrl: p.spotifyUrl, appleUrl: p.appleUrl, audioUrl: p.audioUrl, duration: p.duration, isShort: false }); });
  out.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
  return out.map(e => ({ ...e, segment: e.isShort ? "short" : classify(e.title, e.description) }));
}

// Title decides first. The description only breaks ties, since show notes mention every segment.
function classify(title, desc) {
  const rules = [
    ["ai", /ai this month|ai this week|brent wees/],
    ["npa", /\bnpa\b|national powersport auctions|market update|market report|wholesale market/],
    ["rundown", /\brundown\b|weekly news\b|news desk|this week in powersports/]
  ];
  const t = (title || "").toLowerCase();
  for (const [seg, re] of rules) if (re.test(t)) return seg;
  // Show notes name every segment, so for descriptions check the Rundown first (its notes always say "Rundown").
  const d = (desc || "").toLowerCase();
  for (const [seg, re] of [rules[2], rules[0], rules[1]]) if (re.test(d)) return seg;
  return "interview";
}

function blocks(xml, name) { const re = new RegExp(`<${name}[\\s>][\\s\\S]*?<\\/${name}>`, "g"); return xml.match(re) || []; }
function tag(b, name) { const m = b.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`)); return m ? m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1").trim() : ""; }
function attr(b, name, a) { const m = b.match(new RegExp(`<${name}[^>]*\\s${a}="([^"]+)"`)); return m ? m[1] : null; }
function decode(s) { return (s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'"); }
function strip(s) { return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function fmtDur(d) { if (!d) return null; if (/^\d+$/.test(d)) { const n = +d; return `${Math.floor(n / 60)} min`; } const p = d.split(":").map(Number); if (p.length === 3) return `${p[0] * 60 + p[1]} min`; if (p.length === 2) return `${p[0]} min`; return d; }
