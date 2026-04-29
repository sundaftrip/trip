import {
  a as loadPackages,
  c as loadText,
  s as sortPackages,
  f as fmtIDR,
  n as toNumber,
  isPast,
  isSoldOut,
} from "./sheets.CwVe4WeZ.js";

/* ----- CMS text replacement (data-cms="key" → sheet.text.key) ----- */
function applyCmsText(map) {
  if (!map || !Object.keys(map).length) return;
  document.querySelectorAll("[data-cms]").forEach((el) => {
    const k = el.dataset.cms;
    if (!k) return;
    const v = map[k];
    if (v === undefined || v === "") return;
    if (el.dataset.cmsAttr) el.setAttribute(el.dataset.cmsAttr, v);
    else if (el.tagName === "IMG") el.src = v;
    else el.textContent = v;
  });
}

let allPackages = [];

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

/* lowest meaningful price (promo > land tour > full) */
function leadPrice(p) {
  const promo = toNumber(p.promo_price);
  const land = toNumber(p.price_land_tour);
  const full = toNumber(p.price);
  return promo > 0 ? promo : land > 0 ? land : full;
}
function priceLabel(p) {
  if (toNumber(p.promo_price) > 0) return "Harga promo";
  if (toNumber(p.price_land_tour) > 0) return "Land tour mulai";
  return "Mulai dari";
}

function statusBadge(p) {
  if (isPast(p)) {
    return `<span class="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]"
              style="background:rgb(0 0 0 / 0.65);color:#fff;backdrop-filter:blur(4px);">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Past Trip
            </span>`;
  }
  if (isSoldOut(p)) {
    return `<span class="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]"
              style="background:#0a0a0a;color:#fff;backdrop-filter:blur(4px);">
              Sold Out
            </span>`;
  }
  return "";
}

function leftBadges(p) {
  const out = [];
  if (toNumber(p.promo_price) > 0 && toNumber(p.price) > toNumber(p.promo_price)) {
    out.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]"
                style="background:rgb(var(--brand));color:#fff;">PROMO</span>`);
  }
  if (toNumber(p.price_land_tour) > 0 && toNumber(p.price) > 0) {
    out.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]"
                style="background:rgb(var(--surface) / 0.95);color:rgb(var(--ink-1, 24 24 27));">LAND + FULL</span>`);
  } else if (p.badge && !isPast(p) && !isSoldOut(p)) {
    out.push(`<span class="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]"
                style="background:rgb(var(--surface) / 0.95);">${esc(p.badge)}</span>`);
  }
  return out.length
    ? `<div class="absolute top-3 left-3 flex flex-col gap-1.5">${out.join("")}</div>`
    : "";
}

function chips(p) {
  const items = [];
  if (p.flag || p.country) {
    items.push(`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style="background:rgb(var(--surface-muted));">${esc(p.flag || "")} ${esc(p.country || "")}</span>`);
  }
  if (p.duration) {
    items.push(`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style="background:rgb(var(--surface-muted));">⏱ ${esc(p.duration)}</span>`);
  }
  if (p.city_highlight) {
    const cities = String(p.city_highlight).split(/[,\n;]/).map(s => s.trim()).filter(Boolean);
    if (cities.length) {
      items.push(`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style="background:rgb(var(--surface-muted));" title="${esc(cities.join(', '))}">📍 ${esc(cities.slice(0, 2).join(' · '))}${cities.length > 2 ? ` +${cities.length - 2}` : ''}</span>`);
    }
  }
  if (p.halal === "yes" || p.halal === "true" || p.halal === "1" || p.halal === "halal") {
    items.push(`<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style="background:#ecfdf5;color:#065f46;">🕌 Halal Friendly</span>`);
  }
  return items.join("");
}

function seatsLine(p) {
  if (!isActive(p)) return "";
  const n = toNumber(p.seats_left);
  if (!n) return "";
  if (n <= 5) {
    return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style="background:#fef2f2;color:#b91c1c;">🔥 Sisa ${n} seat</span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style="background:rgb(var(--surface-muted));">Sisa ${n} seat</span>`;
}

function isActive(p) { return !isPast(p) && !isSoldOut(p); }

function priceArea(p) {
  const lead = leadPrice(p);
  const normal = toNumber(p.price);
  const showStrike = lead < normal && lead > 0;
  return `
    <p class="font-mono text-2xs text-ink-4 mb-0.5">${priceLabel(p)}</p>
    <div class="flex items-baseline gap-2 flex-wrap">
      <p class="font-display font-bold text-lg sm:text-xl" style="color:rgb(var(--brand));">${lead > 0 ? esc(fmtIDR(lead)) : "Hubungi kami"}</p>
      ${showStrike ? `<p class="font-mono text-2xs text-ink-4 line-through">${esc(fmtIDR(normal))}</p>` : ""}
    </div>`;
}

/* Card renderer — bigger thumbnail, scannable chips, grayscale for past/sold-out */
function renderCards(list) {
  const root = document.getElementById("packages");
  if (!list.length) {
    root.innerHTML =
      '<div class="col-span-full text-center py-16 text-ink-3"><div class="text-4xl mb-2">🗺️</div><p>Belum ada paket untuk kategori ini.</p></div>';
    return;
  }
  root.innerHTML = list
    .map((p) => {
      const inactive = !isActive(p);
      const link = `/trip/?id=${encodeURIComponent(p.id)}`;
      const ctaLabel = isPast(p)
        ? "Lihat Cerita"
        : isSoldOut(p)
        ? "Lihat Detail"
        : "Lihat Perjalanan";
      const img = p.hero_img
        ? `<img src="${esc(p.hero_img)}" alt="${esc(p.title)}" loading="lazy"
             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             style="${inactive ? "filter: grayscale(100%); opacity: .85;" : ""}">`
        : "";

      return `
        <article class="card card-hoverable overflow-hidden flex flex-col group"
                 ${inactive ? 'style="opacity:.92;"' : ""}>
          <a href="${link}" class="block">
            <div class="relative aspect-[4/3] overflow-hidden bg-surface-muted">${img}${leftBadges(p)}${statusBadge(p)}</div>
          </a>
          <div class="p-4 sm:p-5 flex-1 flex flex-col">
            <div class="flex items-center gap-1.5 mb-3 flex-wrap">${chips(p)}${seatsLine(p)}</div>
            <h3 class="font-display font-bold text-base sm:text-lg leading-tight tracking-tight mb-1.5 text-balance">
              <a href="${link}" class="hover:text-[rgb(var(--brand))] transition">${esc(p.title || "")}</a>
            </h3>
            ${p.trip_date ? `<p class="font-mono text-2xs text-ink-4 mb-2">${esc(p.trip_date)}</p>` : ""}
            ${p.highlights ? `<p class="text-sm text-ink-2 line-clamp-2 mb-3">${esc(p.highlights)}</p>` : ""}
            <div class="mt-auto flex items-end justify-between gap-3 pt-3 border-t border-soft">
              <div class="min-w-0">${priceArea(p)}</div>
              <a href="${link}" class="btn btn-ghost text-xs whitespace-nowrap flex-shrink-0">
                ${ctaLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

function applyFilter(cat) {
  document.querySelectorAll(".filter-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.category === cat);
  });
  const list = cat === "all" ? allPackages : allPackages.filter((p) => p.category === cat);
  renderCards(sortPackages(list));
}

function animateStats() {
  const els = document.querySelectorAll(".stat-number[data-count]");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count || "0", 10);
        const suffix = el.dataset.suffix || "";
        const dur = 1400;
        const t0 = performance.now();
        io.unobserve(el);
        const tick = (t) => {
          const k = Math.min((t - t0) / dur, 1);
          const eased = k * k * (3 - 2 * k);
          el.textContent = Math.floor(eased * target) + suffix;
          if (k < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

const init = async () => {
  document.querySelectorAll(".filter-tab").forEach((b) => {
    b.addEventListener("click", () => applyFilter(b.dataset.category || "all"));
  });
  animateStats();

  try {
    const [packages, cmsText] = await Promise.all([loadPackages(), loadText()]);
    console.log("[SUNDAF] Packages:", packages.length, "· CMS:", Object.keys(cmsText).length);
    allPackages = packages;
    applyCmsText(cmsText);
    applyFilter("all");
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("[SUNDAF] Sheets fetch failed:", err);
    const root = document.getElementById("packages");
    root.innerHTML = `<div class="col-span-full text-center py-16">
        <div class="text-4xl mb-2">⚠️</div>
        <p class="text-ink-2 font-medium mb-2">Gagal memuat katalog.</p>
        <p class="text-sm text-ink-3 mb-4">Pastikan spreadsheet di-share <strong>"Anyone with the link — Viewer"</strong>.</p>
        <details class="text-left max-w-md mx-auto mt-4"><summary class="cursor-pointer font-mono text-xs text-ink-4">Detail error</summary>
          <pre class="font-mono text-2xs text-red-600 bg-surface-muted p-3 rounded mt-2 overflow-auto">${String(err?.message || err)}</pre>
        </details>
      </div>`;
  }
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
