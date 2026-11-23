# Dealership fiXit Podcast site

Same stack as the PGA dealer portal: plain HTML, CSS and JS on Vercel (team amp-digital), plus three small serverless functions in `api/`.

Live: https://dealership-fixit-site.vercel.app
Vercel project: dealership-fixit-site (prj_R7qRbB1amFa6ILw0GBIAFCdf1Lpc)

## Pages
- `/` home: latest episode player, newest shows, four show lanes, market table, newsletter, sponsors
- `/episodes` all episodes with filters (Interviews, Rundown, NPA, AI This Month, Clips) and search
- `/market` full stock tracker
- `/start-here`, `/about`, `/guest`, `/sponsor`, `/contact`
- `/privacy`, `/terms`, `/disclosures`, `404`
- Short links: `/rundown`, `/npa`, `/ai`, `/interviews`

## How it works
- `assets/js/site.js` injects the header, ticker strip, footer and background on every page, and handles every form.
- `api/episodes.js` pulls the YouTube channel feed (and the podcast RSS when `PODCAST_RSS_URL` is set), merges them, tags each episode by segment, and caches for 15 minutes.
- `api/market.js` reads the "Dealership fiXit Rundown Stock Ticker" Google Sheet as CSV. Falls back to `api/_market-fallback.json` when the sheet is not reachable.
- `api/contact.js` takes every form post (contact, guest, sponsor, newsletter) and sends it to whichever of these is configured: Supabase, HubSpot form, Resend email. Until one is set, submissions show in Vercel function logs.

## Environment variables (Vercel project settings)
| Key | What it does |
|---|---|
| `PODCAST_RSS_URL` | Spotify for Creators RSS feed. Adds Spotify links, durations and the full back catalog. |
| `YOUTUBE_API_KEY` | Optional. Lets the feed pull 50 videos instead of the 15 the public RSS gives. |
| `MARKET_SHEET_CSV_URL` | The sheet's "Publish to web" CSV link. Best option, it recalculates on Google's side. |
| `MARKET_SHEET_ID` | Alternative to the above. The sheet must be shared "anyone with the link". |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Store submissions in table `fixit_submissions`. |
| `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_GUID` | Push submissions into a HubSpot form. |
| `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL` | Email each submission to Jacob. |

Supabase table, if used:
```sql
create table fixit_submissions (
  id bigint generated always as identity primary key,
  type text, email text, name text, company text, phone text, role text,
  topic text, message text, budget text, links text, page text, user_agent text,
  created_at timestamptz default now()
);
```

## Brand
80s synthwave: pink `#ff2bd6`, purple `#7b2cff`, cyan `#2de2ff`, sunset yellow/orange on the DF badge, deep navy `#0a0418`. Fonts: Audiowide (chrome "DEALERSHIP"), Yellowtail (script "fiXit"), Space Grotesk (body). Background is CSS: starfield, striped sun, animated perspective grid.

Drop a looping MP4 at `assets/video/hero-bg.mp4` and the site switches to the video background on its own (same feel as the Linktree page).

## Local preview
```
./build.sh          # inlines _head.html into every page, writes dist/
node dev-server.js  # http://localhost:4173 with the api/ functions running
```

## Deploy
Best: connect this folder to a GitHub repo under absolutemarketingperformance and link it to the Vercel project, exactly like pga-dealer-site. Every push to main deploys.
Manual: `cd dist && vercel --prod --scope amp-digital`.
