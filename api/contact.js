// Handles every form on the site: contact, guest, sponsor, newsletter.
// Delivery options (set any that apply as Vercel env vars):
//   SUPABASE_URL + SUPABASE_SERVICE_KEY  -> inserts into table fixit_submissions
//   HUBSPOT_PORTAL_ID + HUBSPOT_FORM_GUID -> submits to a HubSpot form (email, firstname, lastname, company, phone, message)
//   RESEND_API_KEY + NOTIFY_EMAIL          -> emails Jacob a copy
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  if (body.website) return res.status(200).json({ message: "Thanks." }); // honeypot

  const type = String(body.type || "contact").slice(0, 30);
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email." });
  if (type !== "newsletter" && !String(body.message || body.pitch || body.name || "").trim()) return res.status(400).json({ error: "Please fill in the form." });

  const record = {
    type, email,
    name: clip(body.name, 120), company: clip(body.company, 120), phone: clip(body.phone, 40),
    role: clip(body.role, 120), topic: clip(body.topic, 200), message: clip(body.message || body.pitch, 4000),
    budget: clip(body.budget, 60), links: clip(body.links, 500), page: clip(body.page, 200),
    user_agent: clip(req.headers["user-agent"], 300), created_at: new Date().toISOString()
  };

  const results = await Promise.allSettled([toSupabase(record), toHubSpot(record), toEmail(record)]);
  const delivered = results.some(r => r.status === "fulfilled" && r.value === true);
  const outcome = results.map((r, i) => ["supabase", "hubspot", "email"][i] + ":" + (r.status === "fulfilled" ? (r.value ? "ok" : "skip") : "fail " + (r.reason && r.reason.message))).join(" ");
  console.log(delivered ? "fixit_submission_ok" : "fixit_submission", outcome, JSON.stringify({ type: record.type, email: record.email, page: record.page }));

  const msgs = {
    newsletter: "You are on the list. Watch for the next Rundown.",
    guest: "Got it. Jacob reviews guest pitches every week and will reach out if it is a fit.",
    sponsor: "Thanks. We will send the sponsor kit and open dates within two business days.",
    contact: "Got it. Thanks for reaching out, we will reply soon."
  };
  res.status(200).json({ message: msgs[type] || msgs.contact, delivered });
};

function clip(v, n) { return v == null ? null : String(v).trim().slice(0, n); }

async function toSupabase(r) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/fixit_submissions`, {
    method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(r)
  });
  if (!res.ok) throw new Error("supabase " + res.status);
  return true;
}

async function toHubSpot(r) {
  const portal = process.env.HUBSPOT_PORTAL_ID, form = process.env.HUBSPOT_FORM_GUID;
  if (!portal || !form) return false;
  const [firstname, ...rest] = (r.name || "").split(" ");
  const base = [["email", r.email], ["firstname", firstname], ["lastname", rest.join(" ")], ["company", r.company], ["phone", r.phone]];
  if (r.type !== "newsletter") base.push(["message", `[${r.type}] ${r.topic || ""} ${r.message || ""}`.trim()]);
  // Tag the contact as a podcast subscriber. These properties may not exist yet; fall back to the plain submit if HubSpot rejects them.
  const tagged = base.concat([["dealership_fixit_subscriber", "true"], ["dealership_fixit_signup_source", `${r.type} form on ${r.page || "/"}`]]);
  const submit = async (pairs) => {
    const fields = pairs.filter(([, v]) => v).map(([name, value]) => ({ name, value }));
    return fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields, context: { pageUri: "https://dealershipfixit.com" + (r.page || "/"), pageName: "Dealership fiXit " + r.type } })
    });
  };
  let res = await submit(tagged);
  if (res.status === 400) res = await submit(base);
  if (!res.ok) throw new Error("hubspot " + res.status + " " + (await res.text()).slice(0, 200));
  return true;
}

async function toEmail(r) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return false;
  const lines = Object.entries(r).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.FROM_EMAIL || "Dealership fiXit <onboarding@resend.dev>", to: [to], reply_to: r.email, subject: `[fiXit ${r.type}] ${r.name || r.email}`, text: lines })
  });
  if (!res.ok) throw new Error("resend " + res.status);
  return true;
}
