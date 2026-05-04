import {
  a as loadPackages,
  c as loadText,
  s as sortPackages,
  f as fmtIDR,
  n as toNumber,
  isPast,
  isSoldOut,
  isActive,
} from "./sheets.CwVe4WeZ.js";

/* ----- CMS text replacement ----- */
function applyCmsText(map) {
  if (!map || !Object.keys(map).length) return;
  document.querySelectorAll("[data-cms]").forEach((el) => {
    const k = el.dataset.cms;
    if (!k) return;
    const v = map[k];
    if (v === undefined || v === "") return;
    if (el.dataset.cmsAttr) {
      el.setAttribute(el.dataset.cmsAttr, v);
    } else if (k.startsWith("contact_phone_")) {
      el.textContent = v;
      el.setAttribute("href", "tel:" + v.replace(/\s|-/g, ""));
    } else if (k === "contact_email") {
      el.textContent = v;
      el.setAttribute("href", "mailto:" + v);
    } else if (el.tagName === "IMG") {
      el.src = v;
    } else {
      el.textContent = v;
    }
  });
}

let allPackages = [];

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function leadPrice(p) {
  const promo = toNumber(p.promo_price);
  const land = toNumber(p.price_land_tour);
  const full = toNumber(p.price);
  return promo > 0 ? promo : full > 0 ? full : land;
}
function priceLabel(p) {
  if (toNumber(p.promo_price) > 0) return "Harga promo";
  return "Mulai dari";
}

/* ---- Pretty status badges ---- */
function statusBadge(p) {
  if (isPast(p)) {
    return `<span style="position:absolute;top:14px;right:14px;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:linear-gradient(135deg,rgba(0,0,0,.78),rgba(0,0,0,.62));color:#fff;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,.18);">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Past Trip
            </span>`;
  }
  if (isSoldOut(p)) {
    return `<span style="position:absolute;top:14px;right:14px;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:#0a0a0a;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25);">
              Sold Out
            </span>`;
  }
  return "";
}

function leftBadges(p) {
  if (!isActive(p)) return "";
  const out = [];
  if (toNumber(p.promo_price) > 0 && toNumber(p.price) > toNumber(p.promo_price)) {
    out.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;background:linear-gradient(135deg,rgb(var(--brand)),#dc2626);color:#fff;box-shadow:0 4px 12px rgba(220,38,38,.35);">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L3 9 L12 9 L8 22 L21 11 L13 11 z"/></svg>
                Promo
              </span>`);
  } else if (p.badge) {
    out.push(`<span style="display:inline-flex;align-items:center;padding:5px 11px;border-radius:999px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:rgb(var(--surface));color:rgb(var(--ink-1,24 24 27));box-shadow:0 2px 8px rgba(0,0,0,.08);">${esc(p.badge)}</span>`);
  }
  return out.length
    ? `<div style="position:absolute;top:14px;left:14px;display:flex;flex-direction:column;gap:8px;">${out.join("")}</div>`
    : "";
}

function chips(p) {
  const items = [];
  if (p.flag || p.country) {
    items.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgb(var(--surface-muted));font-size:12px;font-weight:500;">${esc(p.flag || "")} ${esc(p.country || "")}</span>`);
  }
  if (p.duration) {
    items.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgb(var(--surface-muted));font-size:12px;font-weight:500;">⏱ ${esc(p.duration)}</span>`);
  }
  if (p.city_highlight) {
    const cities = String(p.city_highlight).split(/[,\n;|]/).map((s) => s.trim()).filter(Boolean);
    if (cities.length) {
      items.push(`<span title="${esc(cities.join(', '))}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgb(var(--surface-muted));font-size:12px;font-weight:500;">📍 ${esc(cities.slice(0, 2).join(' · '))}${cities.length > 2 ? ` +${cities.length - 2}` : ''}</span>`);
    }
  }
  if (["yes", "true", "1", "halal"].includes(p.halal)) {
    items.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:#ecfdf5;color:#065f46;font-size:12px;font-weight:500;">🕌 Halal Friendly</span>`);
  }
  return items.join("");
}

function seatsLine(p) {
  if (!isActive(p)) return "";
  const n = toNumber(p.seats_left);
  if (!n) return "";
  if (n <= 5) {
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:12px;font-weight:500;">🔥 Sisa ${n} seat</span>`;
  }
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;background:rgb(var(--surface-muted));font-size:12px;font-weight:500;">Sisa ${n} seat</span>`;
}

function priceArea(p) {
  const lead = leadPrice(p);
  const normal = toNumber(p.price);
  const showStrike = lead > 0 && normal > 0 && lead < normal;
  return `
    <p style="font-family:ui-monospace,monospace;font-size:10px;color:rgb(var(--ink-4,160 160 170));margin-bottom:2px;">${priceLabel(p)}</p>
    <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
      <p style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:18px;line-height:1.2;color:rgb(var(--brand));margin:0;">${lead > 0 ? esc(fmtIDR(lead)) : "Hubungi kami"}</p>
      ${showStrike ? `<p style="font-family:ui-monospace,monospace;font-size:11px;color:rgb(var(--ink-4,160 160 170));text-decoration:line-through;margin:0;">${esc(fmtIDR(normal))}</p>` : ""}
    </div>`;
}

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
      const ctaLabel = isPast(p) ? "Lihat Cerita" : isSoldOut(p) ? "Lihat Detail" : "Lihat Perjalanan";
      const img = p.hero_img
        ? `<img src="${esc(p.hero_img)}" alt="${esc(p.title)}" loading="lazy"
             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             ${inactive ? 'style="filter:grayscale(100%);opacity:.85;"' : ""}>`
        : "";

      return `
        <article class="card card-hoverable overflow-hidden flex flex-col group"
                 ${inactive ? 'style="opacity:.94;"' : ""}>
          <a href="${link}" class="block">
            <div class="relative aspect-[4/3] overflow-hidden bg-surface-muted">${img}${leftBadges(p)}${statusBadge(p)}</div>
          </a>
          <div class="p-4 sm:p-5 flex-1 flex flex-col">
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${chips(p)}${seatsLine(p)}</div>
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
  const io = new IntersectionObserver((entries) => {
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
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

const init = async () => {
  // Hide the duplicate small stat strip in hero (keep only the big cards in #about)
  const heroStatStrip = document.querySelector('section[data-astro-cid-j7pv25f6] .mt-12.flex.flex-wrap.items-center');
  if (heroStatStrip) heroStatStrip.remove();

  document.querySelectorAll(".filter-tab").forEach((b) => {
    b.addEventListener("click", () => applyFilter(b.dataset.category || "all"));
  });
  animateStats();

  try {
    const [packages, cmsText] = await Promise.all([loadPackages(), loadText()]);
    console.log("[SUNDAF] Packages:", packages.length, "· CMS keys:", Object.keys(cmsText).length);
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
