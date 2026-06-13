/* ============================================================
   main.js : isi CONFIG ke halaman, link WA, reveal, nav, FAQ
   ============================================================ */
(function () {
  var cfg = window.SUNDAF_CONFIG || {};

  /* 1. Link WhatsApp dengan pesan otomatis */
  var waHref =
    "https://wa.me/" +
    (cfg.waNumber || "").replace(/\D/g, "") +
    "?text=" +
    encodeURIComponent(
      cfg.waMessage ||
        "Assalamualaikum, saya ingin mendaftar minat trip perdana Sapa & Halong."
    );
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waHref);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* 2. Isi teks dari CONFIG ke elemen [data-config] */
  document.querySelectorAll("[data-config]").forEach(function (el) {
    var key = el.getAttribute("data-config");
    if (cfg[key]) el.textContent = cfg[key];
  });

  /* 3. Reveal saat scroll */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* 4. Nav berubah solid setelah lewat hero, sticky CTA muncul */
  var nav = document.querySelector(".nav");
  var sticky = document.querySelector(".sticky-cta");
  var hero = document.querySelector(".hero");
  function onScroll() {
    var past = window.scrollY > (hero ? hero.offsetHeight * 0.7 : 480);
    if (nav) nav.classList.toggle("nav--solid", past);
    if (sticky) sticky.classList.toggle("sticky-cta--show", past);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 5. FAQ: tutup item lain saat satu dibuka */
  var items = document.querySelectorAll(".faq__item");
  items.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) {
        items.forEach(function (o) { if (o !== d) o.open = false; });
      }
    });
  });
})();
