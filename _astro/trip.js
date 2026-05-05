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
  const mt = $("mTotal");
  if (mt) mt.textContent = u > 0 ? fmtIDR(total) : "—";
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
  const bbBook = $("bbBook");
  if (bbBook) bbBook.href = bookHref;
  const mBook = $("mBook");
  if (mBook) mBook.href = bookHref;

  const askMsg = encodeURIComponent(
    `Halo SUNDAF TRIP, saya tertarik konsultasi soal paket *${pkg.title}*${pkg.trip_date ? ` (${pkg.trip_date})` : ""}.`
  );
  const bbAsk = $("bbAsk");
  if (bbAsk) bbAsk.href = `https://wa.me/${WA_NUMBER}?text=${askMsg}`;
}

function renderHeroBadges() {
  const wrap = $("dHeroBadges");
  if (!wrap) return;
  const out = [];
  if (toNumber(pkg.promo_price) > 0 && toNumber(pkg.price) > toNumber(pkg.promo_price) && isActive(pkg)) {
    out.push(`<span style="display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:12px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;background:linear-gradient(135deg,rgb(var(--brand)),#dc2626);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.4);">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L3 9 L12 9 L8 22 L21 11 L13 11 z"/></svg>
                Promo
              </span>`);
  }
  if (pkg.badge && isActive(pkg) && !out.length) {
    out.push(`<span style="display:inline-flex;align-items:center;padding:7px 14px;border-radius:12px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:rgb(var(--surface));color:rgb(var(--ink-1,24 24 27));box-shadow:0 2px 8px rgba(0,0,0,.1);">${esc(pkg.badge)}</span>`);
  }
  wrap.innerHTML = out.join("");

  const status = $("dHeroStatus");
  if (!status) return;
  if (isPast(pkg)) {
    status.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:12px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;background:rgba(0,0,0,.72);color:rgba(255,255,255,.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          Past Trip
                        </span>`;
  } else if (isSoldOut(pkg)) {
    status.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:12px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;background:#0a0a0a;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
  const el = $("dChips");
  if (el) el.innerHTML = c.join("");
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
  const el = $("dItinerary");
  if (!el) return;
  el.innerHTML = steps
    .map((s, i) => `
      <details class="timeline-accordion" ${i === 0 ? 'open' : ''}>
        <summary class="timeline-summary">
          <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:rgb(var(--brand-soft,254 243 232));color:rgb(var(--brand));font-family:ui-monospace,monospace;font-size:11px;font-weight:700;flex-shrink:0;">D${i + 1}</span>
            <span style="font-weight:600;font-size:14px;color:rgb(var(--ink-1));">Hari ${i + 1}</span>
          </div>
          <svg class="accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <div class="timeline-content">
          <p style="font-size:14px;color:rgb(var(--ink-2));line-height:1.7;">${esc(s)}</p>
        </div>
      </details>`).join("");
  const sec = $("dItinerarySec");
  if (sec) sec.classList.remove("hidden");
}

function renderListInto(boxId, listId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  const el = $(listId);
  if (!el) return;
  el.innerHTML = items.map((s) =>
    `<li style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--brand))" stroke-width="2.5" style="flex-shrink:0;margin-top:2px;"><path d="M20 6 9 17l-5-5"/></svg>
      <span style="line-height:1.6;font-size:14px;color:rgb(var(--ink-2));">${esc(s)}</span>
    </li>`
  ).join("");
  const box = $(boxId);
  if (box) box.classList.remove("hidden");
}

function renderExclusions(boxId, listId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  const el = $(listId);
  if (!el) return;
  el.innerHTML = items.map((s) =>
    `<li style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--ink-4))" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M18 6 6 18M6 6l12 12"/></svg>
      <span style="line-height:1.6;font-size:14px;color:rgb(var(--ink-3));">${esc(s)}</span>
    </li>`
  ).join("");
  const box = $(boxId);
  if (box) box.classList.remove("hidden");
}

function renderTextSection(boxId, contentId, raw) {
  const items = parseList(raw);
  if (!items.length) return;
  const root = $(contentId);
  if (!root) return;
  if (items.length === 1) {
    root.innerHTML = `<p style="line-height:1.7;font-size:14px;color:rgb(var(--ink-2));">${esc(items[0])}</p>`;
  } else {
    root.innerHTML = items.map((s) =>
      `<p style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
        <span style="color:rgb(var(--brand));font-size:8px;margin-top:6px;flex-shrink:0;">●</span>
        <span style="line-height:1.7;font-size:14px;color:rgb(var(--ink-2));">${esc(s)}</span>
      </p>`
    ).join("");
  }
  const box = $(boxId);
  if (box) box.classList.remove("hidden");
}

function renderGallery() {
  galleryUrls = parseList(pkg.gallery);
  if (!galleryUrls.length) return;
  const el = $("dGallery");
  if (!el) return;
  el.innerHTML = galleryUrls
    .map((url, i) => `<button data-gidx="${i}" type="button" class="gallery-cell"><img src="${esc(url)}" loading="lazy" class="gallery-img w-full hover:opacity-90 transition" alt=""></button>`)
    .join("");
  const sec = $("dGallerySec");
  if (sec) sec.classList.remove("hidden");
  el.querySelectorAll("[data-gidx]").forEach((btn) => {
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

/* ----- Terms matching ----- */
function termsFor(pkgId, type) {
  // Match terms by: exact pkg_id, wildcard "*", empty pkg_id, or category prefix match
  const pkgCategory = (pkg && pkg.category) ? pkg.category.toUpperCase() : "";
  return termsAll.filter((t) => {
    if ((t.type || "").toLowerCase() !== type) return false;
    const tid = (t.pkg_id || "").trim();
    // Global (wildcard or empty)
    if (!tid || tid === "*") return true;
    // Exact package match
    if (tid === pkgId) return true;
    // Category-based match (e.g. "RU" matches packages with category "ru")
    if (pkgCategory && tid.toUpperCase() === pkgCategory) return true;
    return false;
  });
}

function renderFaq() {
  const list = termsFor(pkg.id, "faq");
  const el = $("dFaq");
  const sec = $("dFaqSec");
  if (!list.length || !el || !sec) return;
  el.innerHTML = list.map((f) => `
      <details class="card p-4 faq-accordion">
        <summary style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:500;font-size:14px;cursor:pointer;user-select:none;">
          <span>${esc(f.name || "Pertanyaan")}</span>
          <svg class="accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;transition:transform .2s;"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <div style="padding-top:12px;font-size:14px;color:rgb(var(--ink-2));line-height:1.7;white-space:pre-line;">${esc(f.content)}</div>
      </details>`).join("");
  sec.classList.remove("hidden");
}

function renderTesti() {
  const list = termsFor(pkg.id, "testimonial");
  const el = $("dTesti");
  const sec = $("dTestiSec");
  if (!list.length || !el || !sec) return;
  el.innerHTML = list.map((t) => {
    const stars = t.stars > 0 ? "★".repeat(Math.min(5, t.stars)) + "☆".repeat(Math.max(0, 5 - t.stars)) : "";
    const photo = t.photo
      ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
      : `<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;background:rgb(var(--brand));color:#fff;">${esc((t.name || "?").charAt(0).toUpperCase())}</div>`;
    return `
      <div class="card" style="padding:20px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          ${photo}
          <div style="min-width:0;">
            <p style="font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.name || "Anonymous")}</p>
            ${stars ? `<p style="font-size:12px;color:#f59e0b;letter-spacing:1px;">${stars}</p>` : ""}
            ${t.extra ? `<p style="font-family:ui-monospace,monospace;font-size:10px;color:rgb(var(--ink-4));">${esc(t.extra)}</p>` : ""}
          </div>
        </div>
        <p style="font-size:14px;color:rgb(var(--ink-2));line-height:1.7;font-style:italic;">"${esc(t.content)}"</p>
      </div>`;
  }).join("");
  sec.classList.remove("hidden");
}

function renderTnc() {
  const list = termsFor(pkg.id, "tnc");
  const el = $("dTnc");
  const sec = $("dTncSec");
  if (!el || !sec) return;

  // Debug log to help troubleshoot
  console.log("[SUNDAF] T&C lookup for pkg", pkg.id, "— found", list.length, "items. Total terms:", termsAll.length);
  if (!termsAll.length) {
    console.warn("[SUNDAF] termsAll is empty — terms_conditions tab might not be loaded");
  }
  if (termsAll.length && !list.length) {
    console.info("[SUNDAF] terms exist but none match type=tnc for pkg", pkg.id);
    console.info("[SUNDAF] available types:", [...new Set(termsAll.map(t => t.type))]);
    console.info("[SUNDAF] available pkg_ids:", [...new Set(termsAll.map(t => t.pkg_id))]);
  }

  if (!list.length) return;

  el.innerHTML = list.map((t) => `
      <div style="padding:4px 0;">
        ${t.name ? `<p style="font-weight:600;font-size:14px;color:rgb(var(--ink-1));margin-bottom:6px;">${esc(t.name)}</p>` : ""}
        <div style="font-size:14px;color:rgb(var(--ink-2));line-height:1.7;white-space:pre-line;">${esc(t.content)}</div>
      </div>`).join('<hr style="border:0;border-top:1px solid rgb(var(--border));margin:12px 0;">');
  sec.classList.remove("hidden");
}

function fillBookingBox() {
  const bbTitle = $("bbTitle");
  if (bbTitle) bbTitle.textContent = pkg.title || "—";
  const bbDate = $("bbDate");
  if (bbDate) bbDate.textContent = pkg.trip_date || "";

  const landBtn = $("bbTypeLand");
  const fullBtn = $("bbTypeFull");
  if (landBtn && toNumber(pkg.price_land_tour) <= 0) {
    landBtn.style.display = "none";
    if (fullBtn) fullBtn.style.flex = "1";
  }

  const seats = toNumber(pkg.seats_left);
  const seatEl = $("bbSeats");
  const bbBook = $("bbBook");

  if (isPast(pkg)) {
    if (seatEl) {
      seatEl.style.color = "#71717a";
      seatEl.innerHTML = `<span style="display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Trip ini sudah selesai. Lihat sebagai inspirasi 💫
      </span>`;
    }
    if (bbBook) bbBook.classList.add("opacity-50", "pointer-events-none");
  } else if (isSoldOut(pkg)) {
    if (seatEl) {
      seatEl.style.color = "#0a0a0a";
      seatEl.innerHTML = `<span style="display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        Sold out. Bisa join waiting list via WhatsApp.
      </span>`;
    }
    if (bbBook) bbBook.classList.add("opacity-50", "pointer-events-none");
  } else if (seats > 0 && seats <= 5) {
    if (seatEl) {
      seatEl.style.color = "#b91c1c";
      seatEl.textContent = `🔥 Tinggal ${seats} seat`;
    }
  } else if (seats > 0) {
    if (seatEl) {
      seatEl.style.color = "#71717a";
      seatEl.textContent = `Sisa ${seats} seat`;
    }
  }
}

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = (params.get("id") || "").trim();

  // Safety timeout — never let loader hang
  const safety = setTimeout(() => {
    const loadEl = $("loading");
    if (loadEl && !loadEl.classList.contains("hidden")) {
      console.warn("[SUNDAF] safety timeout — forcing render");
      loadEl.classList.add("hidden");
      if (!pkg) {
        const nf = $("notFound");
        if (nf) nf.classList.remove("hidden");
      }
    }
  }, 12000);

  try {
    const [pRes, tRes, qRes] = await Promise.allSettled([loadPackages(), loadText(), loadTerms()]);
    const packages = pRes.status === "fulfilled" ? pRes.value : [];
    textKv = tRes.status === "fulfilled" ? tRes.value : {};
    termsAll = qRes.status === "fulfilled" ? qRes.value : [];
    if (pRes.status === "rejected") console.warn("[SUNDAF] loadPackages failed:", pRes.reason);
    if (tRes.status === "rejected") console.warn("[SUNDAF] loadText failed:", tRes.reason);
    if (qRes.status === "rejected") console.warn("[SUNDAF] loadTerms failed:", qRes.reason);
    console.log("[SUNDAF] trip data:", packages.length, "pkg ·", Object.keys(textKv).length, "text ·", termsAll.length, "terms");

    applyCmsText(textKv);
    pkg = packages.find((p) => p.id === id);

    clearTimeout(safety);
    const loadEl = $("loading");
    if (loadEl) loadEl.classList.add("hidden");
    if (!pkg) {
      const nf = $("notFound");
      if (nf) nf.classList.remove("hidden");
      return;
    }

    document.title = `${pkg.title} — SUNDAF TRIP`;

    const dHero = $("dHero");
    if (dHero && pkg.hero_img) {
      dHero.src = pkg.hero_img;
      dHero.alt = pkg.title;
      // Apply grayscale for past trips
      if (isPast(pkg)) {
        dHero.style.filter = "grayscale(1) brightness(.9)";
      }
    }
    renderHeroBadges();
    renderChips();
    renderCityHighlight();
    const dTitle = $("dTitle");
    if (dTitle) dTitle.textContent = pkg.title;
    const dHL = $("dHighlights");
    if (dHL && pkg.highlights) dHL.textContent = pkg.highlights;

    if (pkg.story) {
      const dStory = $("dStory");
      const dStorySec = $("dStorySec");
      if (dStory) dStory.textContent = pkg.story;
      if (dStorySec) dStorySec.classList.remove("hidden");
    }

    renderGallery();
    renderItinerary();
    renderTextSection("dHotelSec", "dHotel", pkg.hotel);
    renderListInto("dIncBox", "dInclusions", pkg.inclusions);
    renderExclusions("dExcBox", "dExclusions", pkg.exclusions);
    renderTextSection("dVisaSec", "dVisa", pkg.visa_info);
    renderFaq();
    renderTesti();
    renderTnc();

    fillBookingBox();
    if (toNumber(pkg.price) <= 0 && toNumber(pkg.price_land_tour) > 0) setType("land");
    else setType("full");

    const detail = $("detail");
    if (detail) detail.classList.remove("hidden");
    const mobileCta = $("mobileCta");
    if (mobileCta) mobileCta.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    clearTimeout(safety);
    console.error("[SUNDAF] trip detail load failed:", err);
    const loadEl = $("loading");
    if (loadEl) {
      loadEl.innerHTML = `
        <div class="text-3xl mb-2">⚠️</div>
        <p class="text-ink-2 font-medium">Gagal memuat detail.</p>
        <p class="text-sm text-ink-3 mt-1">${esc(err?.message || err)}</p>
        <a href="/#destinations" class="btn btn-primary mt-5">Kembali ke katalog</a>`;
    }
  }
};

// Event listeners with null checks
const bbTypeFull = $("bbTypeFull");
const bbTypeLand = $("bbTypeLand");
const bbQtyMinus = $("bbQtyMinus");
const bbQtyPlus = $("bbQtyPlus");
const bbQtyInput = $("bbQty");

if (bbTypeFull) bbTypeFull.addEventListener("click", () => setType("full"));
if (bbTypeLand) bbTypeLand.addEventListener("click", () => setType("land"));
if (bbQtyMinus) bbQtyMinus.addEventListener("click", () => setQty(state.qty - 1));
if (bbQtyPlus) bbQtyPlus.addEventListener("click", () => setQty(state.qty + 1));
if (bbQtyInput) bbQtyInput.addEventListener("input", (e) => setQty(e.target.value));

// Lightbox listeners
const lb = $("lightbox");
if (lb) {
  const lbClose = $("lbClose");
  const lbPrev = $("lbPrev");
  const lbNext = $("lbNext");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", () => lightboxNav(-1));
  if (lbNext) lbNext.addEventListener("click", () => lightboxNav(1));
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
