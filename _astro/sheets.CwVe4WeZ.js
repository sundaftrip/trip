/* SUNDAF TRIP — Sheets data loader (GViz live mode)
 * Reads directly from the master Google Sheet via GViz JSON API.
 * Tries multiple tab-name variants so user-renamed tabs still resolve.
 */
const SHEET_ID = "1QjwJW1tTxbLUvKfFCvLkT8ACH_ptu2gfTIZDujHDUek";
const LEGACY_PUB_ID =
  "2PACX-1vTKRP4SnKWgy9HKhRRzJ2pEKtOxRGk5a88lckeGBxN4Hzo378qlltdKN_6rQ_NF9rqCGnpuXZn54AIn";

const TABS = {
  packages: {
    name: "packages",
    altNames: ["Packages", "PACKAGES", "paket", "Paket", "Catalog", "catalog"],
    gid: "0",
  },
  addons: {
    name: "addons",
    altNames: ["Addons", "Add-ons", "add_ons", "Add_ons", "addon", "Addon"],
    gid: "1535546600",
  },
  text: {
    name: "text",
    altNames: ["Text", "TEXT", "settings", "Settings", "config", "Config", "cms"],
    gid: "441927481",
  },
  blog: {
    name: "blog",
    altNames: ["Blog", "BLOG", "Blogs", "blogs", "artikel", "Artikel"],
    gid: "342839124",
  },
  receipts: {
    name: "receipts",
    altNames: ["Receipts", "Receipt", "RECEIPTS", "invoice", "Invoice"],
    gid: "1000",
  },
  terms: {
    name: "terms_conditions",
    altNames: [
      "Terms_Conditions",
      "Terms_conditions",
      "terms_and_conditions",
      "Terms_and_conditions",
      "Terms_and_condition",
      "terms_and_condition",
      "terms_condition",
      "Terms_condition",
      "TermsConditions",
      "Terms",
      "terms",
      "tnc",
      "TNC",
    ],
    gid: "",
  },
};

// `headers=1` paksa GViz pakai baris 1 sebagai header.
// Tanpa ini, tab dengan kolom semua-teks (text, terms_conditions) suka mis-detect.
const gvizUrl = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
const csvUrl = (gid) =>
  `https://docs.google.com/spreadsheets/d/e/${LEGACY_PUB_ID}/pub?gid=${gid}&single=true&output=csv`;

// ---------- helpers ----------
function parseGviz(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Invalid GViz response");
  const obj = JSON.parse(text.slice(start, end + 1));
  if (obj.status === "error") {
    const msg = (obj.errors || []).map((e) => e.detailed_message || e.message).join(" | ");
    throw new Error(msg || "GViz error");
  }
  if (!obj.table) throw new Error("No table in GViz response");

  let headers = (obj.table.cols || []).map((c, i) => {
    const lbl = String(c.label || "").trim();
    return lbl ? lbl.toLowerCase().replace(/\s+/g, "_") : "";
  });
  let rows = obj.table.rows || [];

  // Fallback: if headers all empty (GViz failed to detect),
  // use first data row as headers and skip it.
  const allEmpty = headers.every((h) => !h);
  if (allEmpty && rows.length) {
    const first = rows[0].c || [];
    headers = first.map((cell, i) => {
      if (!cell) return `col_${i}`;
      const v = cell.f != null ? cell.f : cell.v;
      return v ? String(v).trim().toLowerCase().replace(/\s+/g, "_") : `col_${i}`;
    });
    rows = rows.slice(1);
    console.info("[SUNDAF] gviz used first row as headers (fallback)");
  }

  // Final safety: name any empty header slot
  headers = headers.map((h, i) => h || `col_${i}`);

  return rows
    .map((row) => {
      const out = {};
      (row.c || []).forEach((cell, i) => {
        const key = headers[i] || `col_${i}`;
        if (!cell) { out[key] = ""; return; }
        const v = cell.f != null ? cell.f : cell.v;
        out[key] = v == null ? "" : String(v);
      });
      return out;
    })
    .filter((r) => Object.values(r).some((v) => v && String(v).trim()));
}

function parseCsv(text) {
  const rows = [];
  let i = 0, n = text.length, cur = [], field = "", quoted = false;
  while (i < n) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { quoted = true; i++; continue; }
    if (ch === ",") { cur.push(field); field = ""; i++; continue; }
    if (ch === "\n" || ch === "\r") {
      cur.push(field); field = "";
      if (cur.length > 1 || cur[0] !== "") rows.push(cur);
      cur = [];
      if (ch === "\r" && text[i + 1] === "\n") i++;
      i++; continue;
    }
    field += ch; i++;
  }
  if (field || cur.length) {
    cur.push(field);
    if (cur.length > 1 || cur[0] !== "") rows.push(cur);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((h, idx) => { o[h] = (r[idx] || "").trim(); });
    return o;
  }).filter((r) => Object.values(r).some((v) => v));
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
  const names = [tab.name, ...(tab.altNames || [])];
  let lastErr;
  for (const name of names) {
    try {
      const txt = await fetchText(gvizUrl(name));
      const rows = parseGviz(txt);
      if (rows.length) {
        if (name !== tab.name) console.info(`[SUNDAF] tab "${tab.name}" resolved via alt name "${name}"`);
        return rows;
      }
    } catch (e) { lastErr = e; }
  }
  // CSV fallback
  if (tab.gid) {
    try { return parseCsv(await fetchText(csvUrl(tab.gid))); }
    catch (e) { lastErr = e; }
  }
  console.warn(`[SUNDAF] tab "${tab.name}" failed: ${lastErr?.message || lastErr}`);
  throw lastErr || new Error(`Tab "${tab.name}" tidak ditemukan`);
}

// ---------- public loaders ----------
async function loadPackages() {
  const rows = await loadTab(TABS.packages);
  return rows.map((r) => ({
    id: (r.id || "").trim(),
    title: (r.title || "").trim(),
    country: (r.country || "").trim(),
    flag: (r.flag || "").trim(),
    category: (r.category || "").toLowerCase().trim(),
    duration: (r.duration || "").trim(),
    trip_date: (r.trip_date || r.date || "").trim(),
    price: r.price || r.price_full_package || r.price_full || "",
    price_land_tour: r.price_land_tour || r.land_tour || r.price_land || "",
    promo_price: r.promo_price || r.promo || "",
    seats_left: r.seats_left || r.sisa_seat || "",
    seats_total: r.seats_total || r.kuota || "",
    badge: (r.badge || "").trim(),
    status: (r.status || "").toLowerCase().trim(),
    hero_img: (r.hero_img || r.image || "").trim(),
    gallery: r.gallery || "",
    city_highlight: r.city_highlight || r.cities || r.city || "",
    halal: (r.halal || r.halal_friendly || "").toString().toLowerCase().trim(),
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
    package_id: (r.package_id || "").trim(),
    name: (r.name || "").trim(),
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
      slug: (r.slug || "").trim(),
      title: (r.title || "").trim(),
      excerpt: r.excerpt || "",
      cover: r.cover || "",
      category: (r.category || "").trim(),
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
      pkg_id: ((r.pkg_id || r.package_id || r.paket_id || "*") || "*").toString().trim(),
      type: (r.type || "").toLowerCase().trim(),
      name: r.name || "",
      content: r.content || "",
      stars: Number(String(r.stars || "0").replace(/[^\d.-]/g, "")) || 0,
      photo: r.photo || "",
      extra: r.extra || "",
    }));
  } catch (e) {
    console.warn("[SUNDAF] terms_conditions tidak ada / belum ter-load:", e?.message || e);
    return [];
  }
}

// ---------- date helpers (auto-past detection) ----------
const ID_MONTHS = {
  jan: 0, januari: 0, january: 0,
  feb: 1, februari: 1, february: 1,
  mar: 2, maret: 2, march: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5, june: 5,
  jul: 6, juli: 6, july: 6,
  agu: 7, agustus: 7, aug: 7, august: 7,
  sep: 8, september: 8, sept: 8,
  okt: 9, oktober: 9, oct: 9, october: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11, december: 11,
};

/* Parse trip_date string and return the LATEST date represented.
 * Handles formats:
 *   "15 - 23 Apr 2026"
 *   "15-23 April 2026"
 *   "15 Apr - 23 Apr 2026"
 *   "Apr 2026"
 *   "April 2026"
 *   "2026-04-23"
 *   "23/04/2026"
 *   "15 Apr 2026 - 23 Apr 2026"
 * Returns Date or null.
 */
function parseTripEnd(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();

  // ISO yyyy-mm-dd
  const iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]));

  // dd/mm/yyyy
  const dmy = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]));

  // Find year + month
  const yearMatch = s.match(/(\d{4})/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1]);

  const monthRe = new RegExp("\\b(" + Object.keys(ID_MONTHS).join("|") + ")\\b", "g");
  const months = [...s.matchAll(monthRe)].map((m) => ID_MONTHS[m[1]]);
  if (!months.length) return null;
  const lastMonth = months[months.length - 1];

  // Find day numbers (1-31)
  const dayMatches = [...s.matchAll(/\b(\d{1,2})\b/g)]
    .map((m) => parseInt(m[1]))
    .filter((d) => d >= 1 && d <= 31);
  // Last day before year — heuristically pick the highest day ≤ 31 that's not the year part
  const cleanedDays = dayMatches.filter((d) => d !== parseInt(String(year).slice(-2)));
  const day = cleanedDays.length ? Math.max(...cleanedDays) : 28;

  return new Date(year, lastMonth, day);
}

function isAutoPast(p) {
  // If status explicitly set, respect it
  const s = (p.status || "").toLowerCase().trim();
  if (s === "past") return true;
  if (s === "sold-out" || s === "sold out") return false; // still relevant
  // Otherwise check trip_date
  const end = parseTripEnd(p.trip_date);
  if (!end) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end < today;
}

function statusOf(p) {
  return (p.status || "").toLowerCase().trim();
}
function isPast(p) { return statusOf(p) === "past" || isAutoPast(p); }
function isSoldOut(p) {
  const s = statusOf(p);
  return s === "sold-out" || s === "sold out" || s === "soldout";
}
function isActive(p) { return !isPast(p) && !isSoldOut(p); }

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
  parseTripEnd,
  SHEET_ID,
};
