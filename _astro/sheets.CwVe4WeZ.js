/* SUNDAF TRIP — Sheets data loader (GViz live mode)
 * - Reads directly from the master Google Sheet via GViz JSON API
 * - No need to "Publish to web" anymore. Just share the sheet
 *   "Anyone with the link — Viewer" and updates show up live.
 * - Falls back to legacy published CSV if GViz fails.
 */
const SHEET_ID = "1QjwJW1tTxbLUvKfFCvLkT8ACH_ptu2gfTIZDujHDUek";
const LEGACY_PUB_ID =
  "2PACX-1vTKRP4SnKWgy9HKhRRzJ2pEKtOxRGk5a88lckeGBxN4Hzo378qlltdKN_6rQ_NF9rqCGnpuXZn54AIn";

const TABS = {
  packages: { name: "packages", gid: "0" },
  addons: { name: "addons", gid: "1535546600" },
  text: { name: "text", gid: "441927481" },
  blog: { name: "blog", gid: "342839124" },
  receipts: { name: "receipts", gid: "1000" },
  terms: { name: "terms_conditions", gid: "" },
};

const gvizUrl = (tab) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab.name)}`;

const csvUrl = (gid) =>
  `https://docs.google.com/spreadsheets/d/e/${LEGACY_PUB_ID}/pub?gid=${gid}&single=true&output=csv`;

// ---------- helpers ----------
function parseGviz(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Invalid GViz response");
  const obj = JSON.parse(text.slice(start, end + 1));
  if (!obj.table) throw new Error("No table in GViz response");
  const headers = (obj.table.cols || []).map((c) =>
    String(c.label || c.id || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
  );
  return (obj.table.rows || [])
    .map((row) => {
      const out = {};
      (row.c || []).forEach((cell, i) => {
        const key = headers[i] || `col_${i}`;
        if (!key) return;
        if (!cell) {
          out[key] = "";
          return;
        }
        const v = cell.f != null ? cell.f : cell.v;
        out[key] = v == null ? "" : String(v).trim();
      });
      return out;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

function parseCsv(text) {
  const rows = [];
  let i = 0,
    n = text.length,
    cur = [],
    field = "",
    quoted = false;
  while (i < n) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') { quoted = true; i++; continue; }
    if (ch === ",") { cur.push(field); field = ""; i++; continue; }
    if (ch === "\n" || ch === "\r") {
      cur.push(field); field = "";
      if (cur.length > 1 || cur[0] !== "") rows.push(cur);
      cur = [];
      if (ch === "\r" && text[i + 1] === "\n") i++;
      i++;
      continue;
    }
    field += ch; i++;
  }
  if (field || cur.length) {
    cur.push(field);
    if (cur.length > 1 || cur[0] !== "") rows.push(cur);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );
  return rows
    .slice(1)
    .map((r) => {
      const o = {};
      headers.forEach((h, idx) => { o[h] = (r[idx] || "").trim(); });
      return o;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

async function fetchText(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-cache", signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally { clearTimeout(t); }
}

async function loadTab(tab) {
  try {
    const txt = await fetchText(gvizUrl(tab));
    const rows = parseGviz(txt);
    if (rows.length) return rows;
    throw new Error("Empty GViz");
  } catch (errGviz) {
    if (!tab.gid) {
      console.warn(`[SUNDAF] tab "${tab.name}" gviz failed and no fallback gid:`, errGviz);
      throw errGviz;
    }
    try {
      const txt = await fetchText(csvUrl(tab.gid));
      return parseCsv(txt);
    } catch (errCsv) {
      console.warn(`[SUNDAF] tab "${tab.name}" failed:`, errGviz, errCsv);
      throw errGviz;
    }
  }
}

// ---------- public loaders ----------
async function loadPackages() {
  const rows = await loadTab(TABS.packages);
  return rows.map((r) => ({
    id: r.id || "",
    title: r.title || "",
    country: r.country || "",
    flag: r.flag || "",
    category: (r.category || "").toLowerCase(),
    duration: r.duration || "",
    trip_date: r.trip_date || r.date || "",
    // Pricing — Full Package = with int'l ticket; Land Tour = without
    price: r.price || r.price_full_package || r.price_full || "",
    price_land_tour: r.price_land_tour || r.land_tour || r.price_land || "",
    promo_price: r.promo_price || r.promo || "",
    seats_left: r.seats_left || r.sisa_seat || "",
    seats_total: r.seats_total || r.kuota || "",
    badge: r.badge || "",
    status: (r.status || "").toLowerCase().trim(),
    hero_img: r.hero_img || r.image || "",
    gallery: r.gallery || "",
    // Catalog chips
    city_highlight: r.city_highlight || r.cities || r.city || "",
    halal: (r.halal || r.halal_friendly || "").toString().toLowerCase().trim(),
    // Detail page content
    story: r.story || r.storytelling || r.intro || "",
    highlights: r.highlights || r.highlight || "",
    itinerary: r.itinerary || "",
    hotel: r.hotel || r.hotels || "",
    inclusions: r.inclusions || r.include || "",
    exclusions: r.exclusions || r.exclude || "",
    visa_info: r.visa_info || r.visa || "",
    notes: r.notes || r.note || "",
  }));
}

async function loadAddons() {
  const rows = await loadTab(TABS.addons);
  return rows.map((r) => ({
    package_id: r.package_id || "",
    name: r.name || "",
    price: Number(String(r.price || "0").replace(/[^\d.-]/g, "")) || 0,
    description: r.description || "",
  }));
}

async function loadText() {
  const rows = await loadTab(TABS.text);
  const out = {};
  rows.forEach((r) => {
    const k = (r.key || "").trim();
    const v = (r.value || "").trim();
    if (k) out[k] = v;
  });
  return out;
}

async function loadBlog() {
  const rows = await loadTab(TABS.blog);
  return rows
    .map((r) => ({
      slug: r.slug || "",
      title: r.title || "",
      excerpt: r.excerpt || "",
      cover: r.cover || "",
      category: r.category || "",
      date: r.date || "",
      body: r.body || "",
      read_time: r.read_time || "",
      author: r.author || "",
    }))
    .filter((r) => r.slug && r.title);
}

async function loadReceipts() {
  try {
    const rows = await loadTab(TABS.receipts);
    return rows.map((r) => ({
      inv: (r.inv || r.invoice || r.invoice_no || "").trim(),
      date: r.date || "",
      name: r.name || r.pemesan || "",
      contact: r.contact || r.whatsapp || r.wa || "",
      package: r.package || r.paket || "",
      qty: Number(String(r.qty || "1").replace(/[^\d.-]/g, "")) || 1,
      price: Number(String(r.price || "0").replace(/[^\d.-]/g, "")) || 0,
      addons: r.addons || "",
      total: Number(String(r.total || "0").replace(/[^\d.-]/g, "")) || 0,
      paid: Number(String(r.paid || "0").replace(/[^\d.-]/g, "")) || 0,
      status: (r.status || "PENDING").toUpperCase(),
      notes: r.notes || "",
    }));
  } catch (e) { return []; }
}

async function loadTerms() {
  try {
    const rows = await loadTab(TABS.terms);
    return rows.map((r) => ({
      pkg_id: (r.pkg_id || r.package_id || "*").trim(),
      type: (r.type || "").toLowerCase().trim(), // testimonial, faq, tnc
      name: r.name || "",
      content: r.content || "",
      stars: Number(String(r.stars || "0").replace(/[^\d.-]/g, "")) || 0,
      photo: r.photo || "",
      extra: r.extra || "",
    }));
  } catch (e) { return []; }
}

// ---------- helpers exposed ----------
function statusOf(p) {
  return (p.status || "").toLowerCase().trim();
}

function isPast(p) { return statusOf(p) === "past"; }
function isSoldOut(p) {
  const s = statusOf(p);
  return s === "sold-out" || s === "sold out" || s === "soldout";
}
function isActive(p) { return !isPast(p) && !isSoldOut(p); }

/* Sort: Active (newest first) → Past (newest first) → Sold-out (newest first) */
function sortPackages(list) {
  const tier = (p) => (isActive(p) ? 1 : isPast(p) ? 2 : 3);
  const yr = (s) => {
    if (!s) return 0;
    const m = String(s).match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 0;
  };
  return [...list].sort((a, b) => {
    const ta = tier(a), tb = tier(b);
    if (ta !== tb) return ta - tb;
    return yr(b.trip_date) - yr(a.trip_date);
  });
}

function fmtIDR(v) {
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  if (!isFinite(n) || n === 0) return String(v ?? "");
  return "Rp " + n.toLocaleString("id-ID");
}

function toNumber(v) {
  return Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;
}

export {
  loadPackages as a,
  loadAddons as b,
  loadText as c,
  fmtIDR as f,
  loadBlog as l,
  sortPackages as s,
  loadReceipts as r,
  loadTerms as q,
  toNumber as n,
  isPast,
  isSoldOut,
  isActive,
  SHEET_ID,
};
