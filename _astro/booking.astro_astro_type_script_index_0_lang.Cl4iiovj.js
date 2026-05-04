import {
  a as loadPackages,
  b as loadAddons,
  c as loadText,
  f as fmtIDR,
  n as toNumber,
} from "./sheets.CwVe4WeZ.js";

const WA_NUMBER = "6281775202759";
const $ = (id) => document.getElementById(id);

let allPackages = [];
let allAddons = [];
let textKv = {};
let pkg = null;
let chosenAddons = [];

const state = {
  type: "full",
  qty: 1,
};

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

function unitPrice() {
  if (!pkg) return 0;
  if (state.type === "land") {
    const land = toNumber(pkg.price_land_tour);
    if (land > 0) return land;
  }
  const promo = toNumber(pkg.promo_price);
  return promo > 0 ? promo : toNumber(pkg.price);
}

/* ---------- Smart date formatter (DD/MM/YYYY) ---------- */
function isValidDate(d, m, y) {
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dim = new Date(y, m, 0).getDate();
  return d <= dim;
}
function parseSmartDate(s) {
  const m = String(s || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1]), mo = parseInt(m[2]), y = parseInt(m[3]);
  if (!isValidDate(d, mo, y)) return null;
  return new Date(y, mo - 1, d);
}
function attachSmartDate(input, hintEl, validator) {
  function formatDigits(d) {
    let out = "";
    if (d.length > 0) out += d.slice(0, 2);
    if (d.length >= 3) out += "/" + d.slice(2, 4);
    if (d.length >= 5) out += "/" + d.slice(4, 8);
    return out;
  }
  function handleInput() {
    const raw = input.value;
    const before = input.selectionStart || raw.length;
    const digitsBeforeCursor = raw.slice(0, before).replace(/\D/g, "").length;
    const allDigits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = formatDigits(allDigits);
    input.value = formatted;
    let count = 0, pos = 0;
    while (pos < formatted.length && count < digitsBeforeCursor) {
      if (/\d/.test(formatted[pos])) count++;
      pos++;
    }
    try { input.setSelectionRange(pos, pos); } catch (_) {}
    input.classList.remove("input-error");
    if (hintEl) hintEl.style.color = "";
  }
  function handleBlur() {
    const v = input.value;
    if (!v) {
      if (hintEl) hintEl.style.color = "";
      return;
    }
    const date = parseSmartDate(v);
    let msg = null;
    if (!date) {
      msg = "Format: DD/MM/YYYY (mis. 15/03/1998)";
    } else if (validator) {
      msg = validator(date);
    }
    if (hintEl) {
      hintEl.textContent = msg || "Tanggal valid.";
      hintEl.style.color = msg ? "#b91c1c" : "#059669";
    }
    input.classList.toggle("input-error", !!msg);
    return !msg;
  }
  input.addEventListener("input", handleInput);
  input.addEventListener("blur", handleBlur);
  return { validate: handleBlur };
}

function ageFrom(dob) {
  if (!dob) return null;
  const today = new Date();
  let a = today.getFullYear() - dob.getFullYear();
  const md = today.getMonth() - dob.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) a--;
  return a;
}

/* ---------- Step navigation ---------- */
function setStep(n) {
  document.querySelectorAll(".step-panel").forEach((s) => {
    s.classList.toggle("hidden", s.dataset.step !== String(n));
  });
  $("progressBar").style.width = `${n * 25}%`;
  $("progressLabel").textContent = `step ${n} / 4`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (n === 4) renderInvoicePreview();
}

/* ---------- Step 1 ---------- */
function setType(t) {
  state.type = t;
  $("typeFull").setAttribute("aria-pressed", String(t === "full"));
  $("typeLand").setAttribute("aria-pressed", String(t === "land"));
  $("typeNote").textContent =
    t === "land"
      ? "Tanpa tiket internasional. Cocok kalau kamu mau atur penerbangan sendiri."
      : "Termasuk tiket pesawat PP dari Indonesia.";
  recomputeStep1();
  renderSummary();
}

function setQty(n) {
  const q = Math.max(1, Math.min(20, Number(n) || 1));
  state.qty = q;
  if ($("qtyInput").value !== String(q)) $("qtyInput").value = q;
  recomputeStep1();
  renderSummary();
}

function recomputeStep1() {
  if (!pkg) return;
  const u = unitPrice();
  const total = u * state.qty;
  $("step1Total").textContent = u > 0 ? fmtIDR(total) : "Hubungi kami";
  const normal = toNumber(pkg.price);
  const promo = toNumber(pkg.promo_price);

  let breakdown = u > 0
    ? `${fmtIDR(u)} × ${state.qty} ${state.type === "land" ? "(Land Tour)" : ""}`
    : "Belum ada harga publik untuk tipe ini.";
  if (state.type === "full" && promo > 0 && normal > promo) {
    breakdown += ` · normal ${fmtIDR(normal * state.qty)}`;
  }
  $("step1Breakdown").textContent = breakdown;
}

function selectPackage(p) {
  pkg = p || null;
  if (!pkg) {
    $("pkgSelectedBox").classList.add("hidden");
    $("btn1Next").disabled = true;
    return;
  }
  if (pkg.hero_img) { $("pkgImg").src = pkg.hero_img; $("pkgImg").style.display = ""; }
  else $("pkgImg").style.display = "none";
  $("pkgName").textContent = pkg.title;
  $("pkgMeta").textContent = [pkg.flag, pkg.country, pkg.duration, pkg.trip_date].filter(Boolean).join(" · ");
  $("pkgSelectedBox").classList.remove("hidden");

  if (toNumber(pkg.price_land_tour) <= 0) {
    $("typeLand").style.display = "none";
    if (state.type === "land") setType("full");
  } else {
    $("typeLand").style.display = "";
  }
  $("btn1Next").disabled = false;
  recomputeStep1();
  renderSummary();
}

/* ---------- Step 2 validation ---------- */
function checkStep2() {
  const name = $("namaPemesan").value.trim();
  const wa = $("nomorWA").value.trim();
  const dobOk = !$("tanggalLahir").value || parseSmartDate($("tanggalLahir").value);
  const expOk = !$("masaBerlakuPaspor").value ||
    (parseSmartDate($("masaBerlakuPaspor").value) &&
      validatePassportExpiry(parseSmartDate($("masaBerlakuPaspor").value)) === null);
  $("btn2Next").disabled = !(name && wa.length >= 10 && dobOk && expOk);

  // Senior detection (70+)
  const dob = parseSmartDate($("tanggalLahir").value);
  const age = ageFrom(dob);
  const seniorBox = $("seniorWarning");
  if (age !== null && age >= 70) {
    seniorBox.classList.remove("hidden");
    $("seniorAge").textContent = age;
  } else {
    seniorBox.classList.add("hidden");
  }
}

function validateDob(date) {
  if (!date) return "Tanggal tidak valid.";
  const today = new Date();
  if (date > today) return "Tanggal lahir tidak boleh di masa depan.";
  const tooOld = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  if (date < tooOld) return "Tanggal lahir tidak masuk akal.";
  return null;
}
function validatePassportExpiry(date) {
  if (!date) return "Tanggal tidak valid.";
  const today = new Date();
  if (date <= today) return "Paspor sudah kedaluwarsa.";
  const max = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());
  if (date > max) return "Masa berlaku paspor maksimal 10 tahun dari hari ini.";
  return null;
}

/* ---------- Right summary ---------- */
function renderSummary() {
  const body = $("summaryBody");
  const total = $("summaryTotal");
  if (!pkg) {
    body.innerHTML = '<p class="text-sm text-ink-3">Pilih paket dulu untuk melihat ringkasan.</p>';
    total.classList.add("hidden");
    return;
  }
  const u = unitPrice();
  const addonsTotal = chosenAddons.reduce((s, a) => s + (a.price || 0), 0);
  const grand = u * state.qty + addonsTotal;
  const typeLabel = state.type === "land" ? "Land Tour" : "Full Package";

  body.innerHTML = `
    <div class="flex items-start gap-3">
      ${pkg.hero_img ? `<img src="${esc(pkg.hero_img)}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0">` : ""}
      <div class="min-w-0">
        <p class="font-display font-bold text-sm leading-tight text-balance">${esc(pkg.title)}</p>
        <p class="font-mono text-2xs text-ink-4 mt-1">${esc([pkg.flag, pkg.country].filter(Boolean).join(" "))}</p>
        ${pkg.trip_date ? `<p class="font-mono text-2xs text-ink-4">📅 ${esc(pkg.trip_date)}</p>` : ""}
      </div>
    </div>
    <div class="mt-4 space-y-1.5 text-sm">
      <div class="flex justify-between"><span class="text-ink-3">Tipe</span><span class="font-mono text-xs">${typeLabel}</span></div>
      <div class="flex justify-between"><span class="text-ink-3">Harga × ${state.qty} peserta</span><span class="font-mono text-xs">${fmtIDR(u * state.qty)}</span></div>
      ${chosenAddons.length ? '<p class="font-mono text-2xs text-ink-4 mt-3 mb-1 uppercase tracking-[.14em]">Add-ons</p>' : ""}
      ${chosenAddons.map((a) => `<div class="flex justify-between"><span class="text-ink-3 truncate pr-2">+ ${esc(a.name)}</span><span class="font-mono text-xs flex-shrink-0">${fmtIDR(a.price)}</span></div>`).join("")}
    </div>`;
  $("totalAmount").textContent = fmtIDR(grand);
  total.classList.remove("hidden");
}

/* ---------- Step 3 add-ons ---------- */
function renderAddons() {
  const root = $("addonsList");
  const list = allAddons.filter(
    (a) => !a.package_id || a.package_id === pkg?.id || a.package_id === "*"
  );
  if (!list.length) {
    root.innerHTML = '<p class="text-sm text-ink-3 italic">Belum ada add-on untuk paket ini.</p>';
    return;
  }
  root.innerHTML = list.map((a, i) => `
      <label class="card p-4 flex items-start gap-3 cursor-pointer hover:border-strong transition">
        <input type="checkbox" data-addon="${i}" class="mt-1 w-4 h-4 accent-orange-600">
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between gap-3">
            <span class="font-medium text-sm">${esc(a.name)}</span>
            <span class="font-mono text-xs text-ink-2">${fmtIDR(a.price)}</span>
          </div>
          ${a.description ? `<p class="text-xs text-ink-3 mt-1">${esc(a.description)}</p>` : ""}
        </div>
      </label>`).join("");
  root.querySelectorAll("[data-addon]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const i = Number(cb.dataset.addon);
      const a = list[i];
      if (cb.checked) chosenAddons.push(a);
      else chosenAddons = chosenAddons.filter((x) => x.name !== a.name);
      renderSummary();
    });
  });
}

/* ---------- Step 4 invoice ---------- */
function renderInvoicePreview() {
  if (!pkg) return;
  const name = $("namaPemesan").value.trim();
  const wa = $("nomorWA").value.trim();
  const email = $("emailPemesan").value.trim();
  const dob = $("tanggalLahir").value.trim();
  const noPas = $("noPaspor").value.trim();
  const masaPas = $("masaBerlakuPaspor").value.trim();

  const inv = "INV-" + Date.now().toString().slice(-8);
  const date = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  $("invPreviewNumber").textContent = inv;
  $("invPreviewDate").textContent = date;
  $("invPreviewName").textContent = name;
  $("invPreviewContact").textContent = `${wa}${email ? " · " + email : ""}`;
  const infoLine = [
    dob ? `Lahir ${dob}` : "",
    noPas ? `Paspor ${noPas}` : "",
    masaPas ? `berlaku ${masaPas}` : "",
  ].filter(Boolean).join(" · ");
  $("invPreviewPaspor").textContent = infoLine;

  const u = unitPrice();
  const typeLabel = state.type === "land" ? "Land Tour" : "Full Package";
  const items = [
    { name: `${pkg.title} (${typeLabel})`, qty: state.qty, price: u, sub: pkg.trip_date || "" },
    ...chosenAddons.map((a) => ({ name: a.name, qty: 1, price: a.price, sub: "" })),
  ];

  let total = 0;
  $("invPreviewItems").innerHTML =
    `<tr class="border-b border-soft text-ink-3">
       <th class="text-left py-2 font-mono text-2xs uppercase tracking-[.14em]">Deskripsi</th>
       <th class="text-right py-2 font-mono text-2xs uppercase tracking-[.14em]">Qty</th>
       <th class="text-right py-2 font-mono text-2xs uppercase tracking-[.14em]">Harga</th>
       <th class="text-right py-2 font-mono text-2xs uppercase tracking-[.14em]">Subtotal</th>
     </tr>` +
    items.map((it) => {
      const s = (it.qty || 1) * (it.price || 0);
      total += s;
      return `<tr class="border-b border-soft">
          <td class="py-2.5 align-top">${esc(it.name)}${it.sub ? `<div class="font-mono text-2xs text-ink-4 mt-0.5">${esc(it.sub)}</div>` : ""}</td>
          <td class="py-2.5 text-right font-mono text-xs">${it.qty}</td>
          <td class="py-2.5 text-right font-mono text-xs">${fmtIDR(it.price)}</td>
          <td class="py-2.5 text-right font-mono text-xs">${fmtIDR(s)}</td>
        </tr>`;
    }).join("");
  $("invPreviewTotal").textContent = fmtIDR(total);

  // Payment schedule (per peserta)
  const TIPPING = 1900000;
  const dpPerPax = 2000000;
  const phase1Per = 5000000;
  const phase2Per = 5000000;
  const remainingTotal = Math.max(0, total - (dpPerPax + phase1Per + phase2Per) * state.qty);
  $("paymentSchedule").innerHTML = `
    <div class="space-y-2 text-sm">
      <div class="flex justify-between"><span class="text-ink-3">DP / Booking Fee · ${fmtIDR(dpPerPax)} × ${state.qty} <span class="font-mono text-2xs text-ink-4">(non-refundable)</span></span><span class="font-mono text-xs">${fmtIDR(dpPerPax * state.qty)}</span></div>
      <div class="flex justify-between"><span class="text-ink-3">Tahap 1 · ${fmtIDR(phase1Per)} × ${state.qty} <span class="font-mono text-2xs text-ink-4">(H-90, + visa & asuransi)</span></span><span class="font-mono text-xs">${fmtIDR(phase1Per * state.qty)}</span></div>
      <div class="flex justify-between"><span class="text-ink-3">Tahap 2 · ${fmtIDR(phase2Per)} × ${state.qty} <span class="font-mono text-2xs text-ink-4">(H-60)</span></span><span class="font-mono text-xs">${fmtIDR(phase2Per * state.qty)}</span></div>
      <div class="flex justify-between"><span class="text-ink-3">Tahap 3 · sisa pelunasan + add-ons + tipping ${fmtIDR(TIPPING)} <span class="font-mono text-2xs text-ink-4">(H-30)</span></span><span class="font-mono text-xs">${fmtIDR(remainingTotal + TIPPING * state.qty)}</span></div>
    </div>
    <p class="text-2xs text-ink-3 leading-relaxed mt-3">Pelunasan tidak dapat menunggu hasil persetujuan visa, karena pembayaran tiket pesawat, hotel, kereta, serta land arrangement wajib diselesaikan sesuai tenggat masing-masing vendor.</p>`;

  // Bank info
  const bankName = textKv.payment_bank_name || "BCA";
  const bankAcc = textKv.payment_bank_acc || "1234567890";
  const bankHolder = textKv.payment_bank_holder || "CV SUNDAF HOLIDAY GROUP";
  $("payBank").textContent = `${bankName} · ${bankAcc}`;
  $("payHolder").textContent = `a.n. ${bankHolder}`;

  // Receipt deep link
  const itemsParam = encodeURIComponent(
    JSON.stringify(items.map((it) => ({ name: it.name, qty: it.qty, price: it.price })))
  );
  $("btnOpenReceipt").href =
    `/receipt/?inv=${encodeURIComponent(inv)}&date=${encodeURIComponent(date)}` +
    `&name=${encodeURIComponent(name)}` +
    `&contact=${encodeURIComponent(wa + (email ? " · " + email : ""))}` +
    `&items=${itemsParam}&status=PENDING`;
}

/* ---------- WhatsApp ---------- */
function buildWaMessage() {
  const name = $("namaPemesan").value.trim();
  const wa = $("nomorWA").value.trim();
  const email = $("emailPemesan").value.trim();
  const dob = $("tanggalLahir").value.trim();
  const noPas = $("noPaspor").value.trim();
  const masaPas = $("masaBerlakuPaspor").value.trim();
  const note = $("catatanPemesan").value.trim();
  const inv = $("invPreviewNumber")?.textContent || "";
  const total = $("invPreviewTotal")?.textContent || "";
  const typeLabel = state.type === "land" ? "Land Tour" : "Full Package";
  const lines = [
    "Halo SUNDAF TRIP, saya mau booking paket berikut:",
    "",
    inv ? `*Invoice:* ${inv}` : "",
    `*Paket:* ${pkg.title}`,
    `*Destinasi:* ${pkg.flag || ""} ${pkg.country || ""}`,
    pkg.trip_date ? `*Tanggal:* ${pkg.trip_date}` : "",
    `*Tipe Tour:* ${typeLabel}`,
    `*Peserta:* ${state.qty} orang`,
    "",
    `*Pemesan:* ${name}`,
    `*WhatsApp:* ${wa}`,
    email ? `*Email:* ${email}` : "",
    dob ? `*Tanggal Lahir:* ${dob}` : "",
    noPas ? `*No. Paspor:* ${noPas}` : "",
    masaPas ? `*Berlaku Paspor:* ${masaPas}` : "",
  ];
  if (chosenAddons.length) {
    lines.push("", "*Add-ons:*");
    chosenAddons.forEach((a) => lines.push(`- ${a.name} — ${fmtIDR(a.price)}`));
  }
  if (note) lines.push("", `*Catatan:* ${note}`);
  if (total) lines.push("", `*Total Estimasi:* ${total}`);
  lines.push("", "Mohon konfirmasi ketersediaan & detail pembayaran. Terima kasih 🙏");
  return lines.filter(Boolean).join("\n");
}

const init = async () => {
  const qs = new URLSearchParams(window.location.search);
  const idFromUrl = qs.get("id");
  const qtyFromUrl = Number(qs.get("qty") || "0");
  const typeFromUrl = qs.get("type");
  if (qtyFromUrl > 0) state.qty = qtyFromUrl;
  if (typeFromUrl === "land" || typeFromUrl === "full") state.type = typeFromUrl;
  $("qtyInput").value = state.qty;

  $("typeFull").addEventListener("click", () => setType("full"));
  $("typeLand").addEventListener("click", () => setType("land"));
  $("qtyMinus").addEventListener("click", () => setQty(state.qty - 1));
  $("qtyPlus").addEventListener("click", () => setQty(state.qty + 1));
  $("qtyInput").addEventListener("input", (e) => setQty(e.target.value));
  $("btn1Next").addEventListener("click", () => setStep(2));
  $("btn2Next").addEventListener("click", () => { renderAddons(); setStep(3); });
  $("btn3Next").addEventListener("click", () => setStep(4));
  $("btnPrint").addEventListener("click", () => window.print());
  document.querySelectorAll("[data-step-back]").forEach((b) => {
    b.addEventListener("click", () => setStep(Number(b.dataset.stepBack)));
  });
  ["namaPemesan", "nomorWA", "tanggalLahir", "masaBerlakuPaspor"].forEach((id) =>
    $(id).addEventListener("input", checkStep2)
  );

  $("btnCheckout").addEventListener("click", () => {
    if (!pkg) return;
    const msg = encodeURIComponent(buildWaMessage());
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });

  $("noPaspor").addEventListener("input", (e) => {
    const v = e.target.value;
    const upper = v.toUpperCase();
    if (v !== upper) {
      const c = e.target.selectionStart;
      e.target.value = upper;
      try { e.target.setSelectionRange(c, c); } catch (_) {}
    }
  });

  attachSmartDate($("tanggalLahir"), $("dobHint"), validateDob);
  attachSmartDate($("masaBerlakuPaspor"), $("expHint"), validatePassportExpiry);

  setType(state.type);

  try {
    [allPackages, allAddons, textKv] = await Promise.all([loadPackages(), loadAddons(), loadText()]);
    applyCmsText(textKv);
    if (idFromUrl) {
      const p = allPackages.find((x) => x.id === idFromUrl);
      if (p) {
        $("pkgPickerBox").classList.add("hidden");
        $("backLink").href = `/trip/?id=${encodeURIComponent(p.id)}`;
        $("backLink").innerHTML =
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg> kembali ke detail';
        $("pkgChange").href = "/#destinations";
        selectPackage(p);
        return;
      }
    }
    $("pkgPickerBox").classList.remove("hidden");
    const sel = $("pkgSelect");
    sel.innerHTML =
      '<option value="">— Pilih paket —</option>' +
      allPackages.map((p) =>
        `<option value="${esc(p.id)}">${esc(p.flag || "")} ${esc(p.title)}${p.trip_date ? " · " + esc(p.trip_date) : ""}</option>`
      ).join("");
    sel.addEventListener("change", () => {
      const p = allPackages.find((x) => x.id === sel.value);
      if (p) selectPackage(p);
      else { pkg = null; $("pkgSelectedBox").classList.add("hidden"); $("btn1Next").disabled = true; }
    });
  } catch (e) {
    console.error("[SUNDAF] booking load failed:", e);
    $("pkgPickerBox").classList.remove("hidden");
    $("pkgSelect").innerHTML = '<option value="">⚠️ Gagal memuat paket — coba refresh</option>';
  }
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
