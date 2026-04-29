import {
  a as loadPackages,
  c as loadText,
  q as loadTerms,
  f as fmtIDR,
  n as toNumber,
  isPast,
  isSoldOut,
} from "./sheets.CwVe4WeZ.js";

const WA_NUMBER = "6281775202759";

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function isActive(p) {
  return !isPast(p) && !isSoldOut(p);
}

/* Multi-line lists: Alt+Enter, ;, |, • */
function parseList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/\r?\n|\s*[•·|;]\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

let pkg = null;
let textKv = {};
let termsAll = [];
let state = { type: "full", qty: 2 };

function unitPrice() {
  if (!pkg) return 0;
  if (state.type === "land") {
    const land = toNumber(pkg.price_land_tour);
    if (land > 0) return land;
  }
  // Full Package: prefer promo if available, else normal
  const promo = toNumber(pkg.promo_price);
  return promo > 0 ? promo : toNumber(pkg.price);
}

function setType(t) {
  state.type = t;
  document.getElementById("bbTypeFull").setAttribute("aria-pressed", String(t === "full"));
  document.getElementById("bbTypeLand").setAttribute("aria-pressed", String(t === "land"));
  const note = document.getElementById("bbTypeNote");
  if (t === "land") {
    note.textContent = "Tanpa tiket internasional. Cocok kalau kamu mau atur penerbangan sendiri.";
  } else {
    note.textContent = "Termasuk tiket pesawat PP dari Indonesia.";
  }
  recompute();
}

function setQty(n) {
  const q = Math.max(1, Math.min(20, Number(n) || 1));
  state.qty = q;
  const inp = document.getElementById("bbQty");
  if (inp) inp.value = q;
  recompute();
}

function recompute() {
  if (!pkg) return;
  const u = unitPrice();
  const total = u * state.qty;
  document.getElementById("bbTotal").textContent = u > 0 ? fmtIDR(total) : "Hubungi kami";
  document.getElementById("mTotal").textContent = u > 0 ? fmtIDR(total) : "—";
  const breakdown = u > 0
    ? `${fmtIDR(u)} × ${state.qty} ${state.type === "land" ? "(Land Tour)" : ""}`
    : "Belum ada harga publik untuk tipe ini.";
  document.getElementById("bbBreakdown").textContent = breakdown;

  // Update CTA links with current state
  const params = new URLSearchParams({
    id: pkg.id,
    qty: String(state.qty),
    type: state.type,
  });
  const bookHref = `/booking/?${params.toString()}`;
  document.getElementById("bbBook").href = bookHref;
  document.getElementById("mBook").href = bookHref;

  const askMsg = encodeURIComponent(
    `Halo SUNDAF TRIP, saya tertarik konsultasi soal paket *${pkg.title}*${pkg.trip_date ? ` (${pkg.trip_date})` : ""}.`
  );
  document.getElementById("bbAsk").href = `https://wa.me/${WA_NUMBER}?text=${askMsg}`;
}

function renderHeroBadges() {
  const wrap = document.getElementById("dHeroBadges");
  const out = [];
  if (toNumber(pkg.promo_price) > 0 && toNumber(pkg.price) > toNumber(pkg.promo_price)) {
    out.push(`<span class="inline-flex items-center px-3 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]" style="background:rgb(var(--brand));color:#fff;">PROMO</span>`);
  }
  if (toNumber(pkg.price_land_tour) > 0) {
    out.push(`<span class="inline-flex items-center px-3 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]" style="background:rgb(var(--surface) / 0.95);color:rgb(var(--ink-1, 24 24 27));">LAND TOUR TERSEDIA</span>`);
  }
  if (pkg.badge && isActive(pkg)) {
    out.push(`<span class="inline-flex items-center px-3 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]" style="background:rgb(var(--surface) / 0.95);">${esc(pkg.badge)}</span>`);
  }
  wrap.innerHTML = out.join("");

  const status = document.getElementById("dHeroStatus");
  if (isPast(pkg)) {
    status.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]" style="background:rgb(0 0 0 / 0.7);color:#fff;backdrop-filter:blur(4px);">Past Trip</span>`;
  } else if (isSoldOut(pkg)) {
    status.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-2xs uppercase tracking-[.14em]" style="background:#0a0a0a;color:#fff;">Sold Out</span>`;
  } else {
    status.innerHTML = "";
  }
}

function renderChips() {
  const c = [];
  if (pkg.flag || pkg.country) {
    c.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="background:rgb(var(--surface-muted));">${esc(pkg.flag || "")} ${esc(pkg.country || "")}</span>`);
  }
  if (pkg.duration) {
    c.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="background:rgb(var(--surface-muted));">⏱ ${esc(pkg.duration)}</span>`);
  }
  if (pkg.trip_date) {
    c.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="background:rgb(var(--surface-muted));">📅 ${esc(pkg.trip_date)}</span>`);
  }
  if (pkg.halal === "yes" || pkg.halal === "true" || pkg.halal === "1" || pkg.halal === "halal") {
    c.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="background:#ecfdf5;color:#065f46;">🕌 Halal Friendly</span>`);
  }
  if (isActive(pkg)) {
    const seats = toNumber(pkg.seats_left);
    if (seats > 0) {
      const cls = seats <= 5 ? "background:#fef2f2;color:#b91c1c;" : "background:rgb(var(--surface-muted));";
      c.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="${cls}">${seats <= 5 ? "🔥 " : ""}Sisa ${seats} seat</span>`);
    }
  }
  document.getElementById("dChips").innerHTML = c.join("");
}

function renderItinerary() {
  const steps = parseList(pkg.itinerary);
  if (!steps.length) return;
  const root = document.getElementById("dItinerary");
  root.innerHTML = steps
    .map(
      (s, i) => `
      <div class="timeline-item">
        <p class="font-mono text-2xs text-ink-4 uppercase tracking-[.14em] mb-1">Hari ${i + 1}</p>
        <p class="text-sm text-ink-2 leading-relaxed">${esc(s)}</p>
      </div>`
    )
    .join("");
  document.getElementById("dItinerarySec").classList.remove("hidden");
}

function renderListInto(boxId, listId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  const ul = document.getElementById(listId);
  ul.innerHTML = items
    .map(
      (s) => `<li class="flex items-start gap-2.5">
      <span class="font-mono text-ink-4 mt-0.5 select-none">▸</span>
      <span class="leading-relaxed">${esc(s)}</span>
    </li>`
    )
    .join("");
  document.getElementById(boxId).classList.remove("hidden");
}

function renderGallery() {
  const list = parseList(pkg.gallery);
  if (!list.length) return;
  const root = document.getElementById("dGallery");
  root.innerHTML = list
    .map((url) => `<a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" loading="lazy" class="gallery-img w-full hover:opacity-80 transition" alt=""></a>`)
    .join("");
  document.getElementById("dGallerySec").classList.remove("hidden");
}

function renderHotel() {
  if (!pkg.hotel) return;
  document.getElementById("dHotel").textContent = pkg.hotel;
  document.getElementById("dHotelSec").classList.remove("hidden");
}

function renderVisa() {
  if (!pkg.visa_info) return;
  document.getElementById("dVisa").textContent = pkg.visa_info;
  document.getElementById("dVisaSec").classList.remove("hidden");
}

function renderStory() {
  if (!pkg.story) return;
  document.getElementById("dStory").textContent = pkg.story;
  document.getElementById("dStorySec").classList.remove("hidden");
}

function termsFor(pkgId, type) {
  return termsAll.filter(
    (t) => t.type === type && (t.pkg_id === "*" || t.pkg_id === "" || t.pkg_id === pkgId)
  );
}

function renderFaq() {
  const list = termsFor(pkg.id, "faq");
  if (!list.length) return;
  const root = document.getElementById("dFaq");
  root.innerHTML = list
    .map(
      (f) => `
      <details class="card p-4">
        <summary class="flex items-center justify-between gap-3 font-medium text-sm">
          <span>${esc(f.name || "Pertanyaan")}</span>
          <svg class="accordion-icon w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <p class="text-sm text-ink-2 mt-3 whitespace-pre-line leading-relaxed">${esc(f.content)}</p>
      </details>`
    )
    .join("");
  document.getElementById("dFaqSec").classList.remove("hidden");
}

function renderTesti() {
  const list = termsFor(pkg.id, "testimonial");
  if (!list.length) return;
  const root = document.getElementById("dTesti");
  root.innerHTML = list
    .map((t) => {
      const stars = t.stars > 0 ? "★".repeat(Math.min(5, t.stars)) + "☆".repeat(Math.max(0, 5 - t.stars)) : "";
      const photo = t.photo
        ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" class="w-10 h-10 rounded-full object-cover flex-shrink-0">`
        : `<div class="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0" style="background:rgb(var(--brand));color:#fff;">${esc((t.name || "?").charAt(0).toUpperCase())}</div>`;
      return `
      <div class="card p-5">
        <div class="flex items-center gap-3 mb-3">
          ${photo}
          <div class="min-w-0">
            <p class="font-medium text-sm truncate">${esc(t.name || "Anonymous")}</p>
            ${stars ? `<p class="stars text-xs">${stars}</p>` : ""}
            ${t.extra ? `<p class="font-mono text-2xs text-ink-4">${esc(t.extra)}</p>` : ""}
          </div>
        </div>
        <p class="text-sm text-ink-2 leading-relaxed italic">"${esc(t.content)}"</p>
      </div>`;
    })
    .join("");
  document.getElementById("dTestiSec").classList.remove("hidden");
}

function renderTnc() {
  const list = termsFor(pkg.id, "tnc");
  if (!list.length) return;
  const root = document.getElementById("dTnc");
  root.innerHTML = list
    .map(
      (t) => `
      <div>
        ${t.name ? `<p class="font-medium text-ink-1 mb-1">${esc(t.name)}</p>` : ""}
        <p class="whitespace-pre-line">${esc(t.content)}</p>
      </div>`
    )
    .join('<hr class="border-soft my-3">');
  document.getElementById("dTncSec").classList.remove("hidden");
}

function fillBookingBox() {
  document.getElementById("bbTitle").textContent = pkg.title || "—";
  document.getElementById("bbDate").textContent = pkg.trip_date || "";

  // Hide Land Tour button if no land price
  const landBtn = document.getElementById("bbTypeLand");
  const fullBtn = document.getElementById("bbTypeFull");
  if (toNumber(pkg.price_land_tour) <= 0) {
    landBtn.style.display = "none";
    fullBtn.style.flex = "1";
  }

  // Seat info
  const seats = toNumber(pkg.seats_left);
  const seatEl = document.getElementById("bbSeats");
  if (isPast(pkg)) {
    seatEl.style.color = "#71717a";
    seatEl.textContent = "Trip ini sudah selesai. Lihat sebagai inspirasi 💫";
    document.getElementById("bbBook").classList.add("opacity-50", "pointer-events-none");
  } else if (isSoldOut(pkg)) {
    seatEl.style.color = "#0a0a0a";
    seatEl.textContent = "Sold out. Bisa join waiting list via WhatsApp.";
    document.getElementById("bbBook").classList.add("opacity-50", "pointer-events-none");
  } else if (seats > 0 && seats <= 5) {
    seatEl.style.color = "#b91c1c";
    seatEl.textContent = `🔥 Tinggal ${seats} seat`;
  } else if (seats > 0) {
    seatEl.style.color = "#71717a";
    seatEl.textContent = `Sisa ${seats} seat`;
  }
}

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = (params.get("id") || "").trim();

  try {
    const [packages, text, terms] = await Promise.all([loadPackages(), loadText(), loadTerms()]);
    textKv = text;
    termsAll = terms;
    pkg = packages.find((p) => p.id === id);

    document.getElementById("loading").classList.add("hidden");
    if (!pkg) {
      document.getElementById("notFound").classList.remove("hidden");
      return;
    }

    // Apply title
    document.title = `${pkg.title} — SUNDAF TRIP`;

    // Hero
    if (pkg.hero_img) {
      document.getElementById("dHero").src = pkg.hero_img;
      document.getElementById("dHero").alt = pkg.title;
    }
    renderHeroBadges();
    renderChips();
    document.getElementById("dTitle").textContent = pkg.title;
    if (pkg.highlights) document.getElementById("dHighlights").textContent = pkg.highlights;

    renderStory();
    renderGallery();
    renderItinerary();
    renderHotel();
    renderListInto("dIncBox", "dInclusions", pkg.inclusions);
    renderListInto("dExcBox", "dExclusions", pkg.exclusions);
    renderVisa();
    renderFaq();
    renderTesti();
    renderTnc();

    fillBookingBox();
    // Default to Full unless only land available
    if (toNumber(pkg.price) <= 0 && toNumber(pkg.price_land_tour) > 0) setType("land");
    else setType("full");

    document.getElementById("detail").classList.remove("hidden");
    document.getElementById("mobileCta").classList.remove("hidden");

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("[SUNDAF] trip detail load failed:", err);
    document.getElementById("loading").innerHTML = `
      <div class="text-3xl mb-2">⚠️</div>
      <p class="text-ink-2 font-medium">Gagal memuat detail.</p>
      <p class="text-sm text-ink-3 mt-1">${esc(err?.message || err)}</p>
      <a href="/#destinations" class="btn btn-primary mt-5">Kembali ke katalog</a>`;
  }
};

document.getElementById("bbTypeFull").addEventListener("click", () => setType("full"));
document.getElementById("bbTypeLand").addEventListener("click", () => setType("land"));
document.getElementById("bbQtyMinus").addEventListener("click", () => setQty(state.qty - 1));
document.getElementById("bbQtyPlus").addEventListener("click", () => setQty(state.qty + 1));
document.getElementById("bbQty").addEventListener("input", (e) => setQty(e.target.value));

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
