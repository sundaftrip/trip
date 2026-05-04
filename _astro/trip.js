import {
  a as loadPackages,
  c as loadText,
  q as loadTerms,
  f as fmtIDR,
  n as toNumber,
  isPast,
  isSoldOut,
  isActive,
} from "./sheets.CwVe4WeZ.js";

const WA_NUMBER = "6281775202759";
const $ = (id) => document.getElementById(id);

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function applyCmsText(map) {
  if (!map || !Object.keys(map).length) return;
  document.querySelectorAll("[data-cms]").forEach((el) => {
    const k = el.dataset.cms;
    if (!k) return;
    const v = map[k];
    if (v === undefined || v === "") return;
    if (k.startsWith("contact_phone_")) {
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
let galleryUrls = [];
let state = { type: "full", qty: 1 };

function unitPrice() {
  if (!pkg) return 0;
  if (state.type === "land") {
    const land = toNumber(pkg.price_land_tour);
    if (land > 0) return land;
  }
  const promo = toNumber(pkg.promo_price);
  return promo > 0 ? promo : toNumber(pkg.price);
}

function setType(t) {
  state.type = t;
  $("bbTypeFull").setAttribute("aria-pressed", String(t === "full"));
  $("bbTypeLand").setAttribute("aria-pressed", String(t === "land"));
  $("bbTypeNote").textContent =
    t === "land"
      ? "Tanpa tiket internasional. Cocok kalau kamu mau atur penerbangan sendiri."
      : "Termasuk tiket pesawat PP dari Indonesia.";
  recompute();
}

function setQty(n) {
  const q = Math.max(1, Math.min(20, Number(n) || 1));
  state.qty = q;
  const inp = $("bbQty");
  if (inp) inp.value = q;
  recompute();
}

function recompute() {
  if (!pkg) return;
  const u = unitPrice();
  const total = u * state.qty;
  $("bbTotal").textContent = u > 0 ? fmtIDR(total) : "Hubungi kami";
  $("mTotal").textContent = u > 0 ? fmtIDR(total) : "—";
  const breakdown = u > 0
    ? `${fmtIDR(u)} × ${state.qty} ${state.type === "land" ? "(Land Tour)" : ""}`
    : "Belum ada harga publik untuk tipe ini.";
  $("bbBreakdown").textContent = breakdown;

  // Show original price strikethrough if promo
  const normal = toNumber(pkg.price);
  const promo = toNumber(pkg.promo_price);
  const priceStrike = $("bbStrike");
  if (priceStrike) {
    if (state.type === "full" && promo > 0 && normal > promo) {
      priceStrike.textContent = `Normal: ${fmtIDR(normal * state.qty)}`;
      priceStrike.style.display = "";
    } else {
      priceStrike.style.display = "none";
    }
  }

  const params = new URLSearchParams({ id: pkg.id, qty: String(state.qty), type: state.type });
  const bookHref = `/booking/?${params.toString()}`;
  $("bbBook").href = bookHref;
  $("mBook").href = bookHref;

  const askMsg = encodeURIComponent(
    `Halo SUNDAF TRIP, saya tertarik konsultasi soal paket *${pkg.title}*${pkg.trip_date ? ` (${pkg.trip_date})` : ""}.`
  );
  $("bbAsk").href = `https://wa.me/${WA_NUMBER}?text=${askMsg}`;
}

function renderHeroBadges() {
  const wrap = $("dHeroBadges");
  const out = [];
  if (toNumber(pkg.promo_price) > 0 && toNumber(pkg.price) > toNumber(pkg.promo_price) && isActive(pkg)) {
    out.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;background:linear-gradient(135deg,rgb(var(--brand)),#dc2626);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.4);">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L3 9 L12 9 L8 22 L21 11 L13 11 z"/></svg>
                Promo
              </span>`);
  }
  if (pkg.badge && isActive(pkg) && !out.length) {
    out.push(`<span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:rgb(var(--surface));color:rgb(var(--ink-1,24 24 27));box-shadow:0 2px 8px rgba(0,0,0,.1);">${esc(pkg.badge)}</span>`);
  }
  wrap.innerHTML = out.join("");

  const status = $("dHeroStatus");
  if (isPast(pkg)) {
    status.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:linear-gradient(135deg,rgba(0,0,0,.78),rgba(0,0,0,.6));color:#fff;backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.2);">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          Past Trip
                        </span>`;
  } else if (isSoldOut(pkg)) {
    status.innerHTML = `<span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:#0a0a0a;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);">
                          Sold Out
                        </span>`;
  } else { status.innerHTML = ""; }
}

function renderChips() {
  const c = [];
  if (pkg.flag || pkg.country) {
    c.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:rgb(var(--surface-muted));font-size:13px;font-weight:500;">${esc(pkg.flag || "")} ${esc(pkg.country || "")}</span>`);
  }
  if (pkg.duration) {
    c.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:rgb(var(--surface-muted));font-size:13px;font-weight:500;">⏱ ${esc(pkg.duration)}</span>`);
  }
  if (pkg.trip_date) {
    c.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:rgb(var(--surface-muted));font-size:13px;font-weight:500;">📅 ${esc(pkg.trip_date)}</span>`);
  }
  if (["yes", "true", "1", "halal"].includes(pkg.halal)) {
    c.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:#ecfdf5;color:#065f46;font-size:13px;font-weight:500;">🕌 Halal Friendly</span>`);
  }
  if (isActive(pkg)) {
    const seats = toNumber(pkg.seats_left);
    if (seats > 0) {
      const cls = seats <= 5
        ? "background:#fef2f2;color:#b91c1c;"
        : "background:rgb(var(--surface-muted));";
      c.push(`<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;font-size:13px;font-weight:500;${cls}">${seats <= 5 ? "🔥 " : ""}Sisa ${seats} seat</span>`);
    }
  }
  $("dChips").innerHTML = c.join("");
}

function renderCityHighlight() {
  if (!pkg.city_highlight) return;
  const cities = parseList(pkg.city_highlight).filter(Boolean);
  if (!cities.length) return;
  const target = $("dCityHighlight");
  if (!target) return;
  target.innerHTML = cities.map((c) =>
    `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;background:rgb(var(--surface-muted));font-size:12px;color:rgb(var(--ink-2,64 64 70));">📍 ${esc(c)}</span>`
  ).join("");
  target.classList.remove("hidden");
}

function renderItinerary() {
  const steps = parseList(pkg.itinerary);
  if (!steps.length) return;
  $("dItinerary").innerHTML = steps
    .map((s, i) => `
      <div class="timeline-item">
        <p class="font-mono text-2xs text-ink-4 uppercase tracking-[.14em] mb-1">Hari ${i + 1}</p>
        <p class="text-sm text-ink-2 leading-relaxed">${esc(s)}</p>
      </div>`).join("");
  $("dItinerarySec").classList.remove("hidden");
}

function renderListInto(boxId, listId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  $(listId).innerHTML = items.map((s) =>
    `<li class="flex items-start gap-2.5"><span class="font-mono text-ink-4 mt-0.5 select-none">▸</span><span class="leading-relaxed">${esc(s)}</span></li>`
  ).join("");
  $(boxId).classList.remove("hidden");
}

function renderTextSection(boxId, contentId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  const root = $(contentId);
  if (items.length === 1) {
    root.innerHTML = `<p class="leading-relaxed">${esc(items[0])}</p>`;
  } else {
    root.innerHTML = items.map((s) =>
      `<p class="flex items-start gap-2.5 mb-2 last:mb-0"><span class="font-mono text-ink-4 mt-0.5 select-none">▸</span><span class="leading-relaxed">${esc(s)}</span></p>`
    ).join("");
  }
  $(boxId).classList.remove("hidden");
}

function renderGallery() {
  galleryUrls = parseList(pkg.gallery);
  if (!galleryUrls.length) return;
  $("dGallery").innerHTML = galleryUrls
    .map((url, i) => `<button data-gidx="${i}" type="button" class="gallery-cell"><img src="${esc(url)}" loading="lazy" class="gallery-img w-full hover:opacity-90 transition" alt=""></button>`)
    .join("");
  $("dGallerySec").classList.remove("hidden");
  $("dGallery").querySelectorAll("[data-gidx]").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(Number(btn.dataset.gidx)));
  });
}

/* ----- Lightbox ----- */
let lightboxIdx = 0;
function openLightbox(i) {
  lightboxIdx = i;
  $("lightboxImg").src = galleryUrls[i] || "";
  $("lightboxCounter").textContent = `${i + 1} / ${galleryUrls.length}`;
  $("lightbox").classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  $("lightbox").classList.remove("is-open");
  document.body.style.overflow = "";
}
function lightboxNav(d) {
  lightboxIdx = (lightboxIdx + d + galleryUrls.length) % galleryUrls.length;
  $("lightboxImg").src = galleryUrls[lightboxIdx] || "";
  $("lightboxCounter").textContent = `${lightboxIdx + 1} / ${galleryUrls.length}`;
}

function termsFor(pkgId, type) {
  return termsAll.filter(
    (t) => t.type === type && (t.pkg_id === "*" || t.pkg_id === "" || t.pkg_id === pkgId)
  );
}

function renderFaq() {
  const list = termsFor(pkg.id, "faq");
  if (!list.length) return;
  $("dFaq").innerHTML = list.map((f) => `
      <details class="card p-4">
        <summary class="flex items-center justify-between gap-3 font-medium text-sm">
          <span>${esc(f.name || "Pertanyaan")}</span>
          <svg class="accordion-icon w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <p class="text-sm text-ink-2 mt-3 whitespace-pre-line leading-relaxed">${esc(f.content)}</p>
      </details>`).join("");
  $("dFaqSec").classList.remove("hidden");
}

function renderTesti() {
  const list = termsFor(pkg.id, "testimonial");
  if (!list.length) return;
  $("dTesti").innerHTML = list.map((t) => {
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
  }).join("");
  $("dTestiSec").classList.remove("hidden");
}

function renderTnc() {
  const list = termsFor(pkg.id, "tnc");
  if (!list.length) return;
  $("dTnc").innerHTML = list.map((t) => `
      <div>
        ${t.name ? `<p class="font-medium text-ink-1 mb-1">${esc(t.name)}</p>` : ""}
        <p class="whitespace-pre-line">${esc(t.content)}</p>
      </div>`).join('<hr class="border-soft my-3">');
  $("dTncSec").classList.remove("hidden");
}

function fillBookingBox() {
  $("bbTitle").textContent = pkg.title || "—";
  $("bbDate").textContent = pkg.trip_date || "";

  const landBtn = $("bbTypeLand");
  const fullBtn = $("bbTypeFull");
  if (toNumber(pkg.price_land_tour) <= 0) {
    landBtn.style.display = "none";
    fullBtn.style.flex = "1";
  }

  const seats = toNumber(pkg.seats_left);
  const seatEl = $("bbSeats");
  if (isPast(pkg)) {
    seatEl.style.color = "#71717a";
    seatEl.textContent = "Trip ini sudah selesai. Lihat sebagai inspirasi 💫";
    $("bbBook").classList.add("opacity-50", "pointer-events-none");
  } else if (isSoldOut(pkg)) {
    seatEl.style.color = "#0a0a0a";
    seatEl.textContent = "Sold out. Bisa join waiting list via WhatsApp.";
    $("bbBook").classList.add("opacity-50", "pointer-events-none");
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
    applyCmsText(textKv);
    pkg = packages.find((p) => p.id === id);

    $("loading").classList.add("hidden");
    if (!pkg) {
      $("notFound").classList.remove("hidden");
      return;
    }

    document.title = `${pkg.title} — SUNDAF TRIP`;

    if (pkg.hero_img) {
      $("dHero").src = pkg.hero_img;
      $("dHero").alt = pkg.title;
    }
    renderHeroBadges();
    renderChips();
    renderCityHighlight();
    $("dTitle").textContent = pkg.title;
    if (pkg.highlights) $("dHighlights").textContent = pkg.highlights;

    if (pkg.story) { $("dStory").textContent = pkg.story; $("dStorySec").classList.remove("hidden"); }
    renderGallery();
    renderItinerary();
    renderTextSection("dHotelSec", "dHotel", pkg.hotel);
    renderListInto("dIncBox", "dInclusions", pkg.inclusions);
    renderListInto("dExcBox", "dExclusions", pkg.exclusions);
    renderTextSection("dVisaSec", "dVisa", pkg.visa_info);
    renderFaq();
    renderTesti();
    renderTnc();

    fillBookingBox();
    if (toNumber(pkg.price) <= 0 && toNumber(pkg.price_land_tour) > 0) setType("land");
    else setType("full");

    $("detail").classList.remove("hidden");
    $("mobileCta").classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("[SUNDAF] trip detail load failed:", err);
    $("loading").innerHTML = `
      <div class="text-3xl mb-2">⚠️</div>
      <p class="text-ink-2 font-medium">Gagal memuat detail.</p>
      <p class="text-sm text-ink-3 mt-1">${esc(err?.message || err)}</p>
      <a href="/#destinations" class="btn btn-primary mt-5">Kembali ke katalog</a>`;
  }
};

$("bbTypeFull").addEventListener("click", () => setType("full"));
$("bbTypeLand").addEventListener("click", () => setType("land"));
$("bbQtyMinus").addEventListener("click", () => setQty(state.qty - 1));
$("bbQtyPlus").addEventListener("click", () => setQty(state.qty + 1));
$("bbQty").addEventListener("input", (e) => setQty(e.target.value));

// Lightbox listeners
const lb = $("lightbox");
if (lb) {
  $("lbClose").addEventListener("click", closeLightbox);
  $("lbPrev").addEventListener("click", () => lightboxNav(-1));
  $("lbNext").addEventListener("click", () => lightboxNav(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") lightboxNav(-1);
    else if (e.key === "ArrowRight") lightboxNav(1);
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
