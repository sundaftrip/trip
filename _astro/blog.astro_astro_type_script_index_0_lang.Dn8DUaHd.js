import { l as loadBlog } from "./sheets.CwVe4WeZ.js";

let posts = [];
let activeCat = "all";

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

/* Match category loosely — accept whatever the user types in sheet.
 * Filter button data-cat = "tips" should match: "Tips", "Tips Travel", "tips & how-to", etc.
 */
const CAT_KEYWORDS = {
  tips: ["tips", "how"],
  panduan: ["panduan", "guide", "destinasi"],
  cerita: ["cerita", "stories", "story", "traveler"],
  berita: ["berita", "update", "news"],
};
function matchCat(post, target) {
  if (target === "all") return true;
  const cat = (post.category || "").toLowerCase();
  if (!cat) return false;
  const keys = CAT_KEYWORDS[target] || [target];
  return keys.some((k) => cat.includes(k));
}

function render() {
  const root = document.getElementById("blogList");
  const list = posts.filter((p) => matchCat(p, activeCat));
  if (!list.length) {
    root.innerHTML = '<div class="sm:col-span-2 text-center py-16 text-ink-3"><div class="text-3xl mb-2">📝</div><p>Belum ada artikel di kategori ini.</p></div>';
    return;
  }
  root.innerHTML = list.map((p) => `
      <a href="/artikel?slug=${encodeURIComponent(p.slug)}" class="card card-hoverable overflow-hidden block group">
        <div class="aspect-[16/9] overflow-hidden bg-surface-muted">
          ${p.cover ? `<img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">` : ""}
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            ${p.category ? `<span class="code-badge-brand">${esc(p.category)}</span>` : ""}
            ${p.read_time ? `<span class="font-mono text-2xs text-ink-4">${esc(p.read_time)}</span>` : ""}
          </div>
          <h2 class="font-display font-bold text-lg leading-tight tracking-tight mb-2 text-balance group-hover:text-[rgb(var(--brand))] transition">${esc(p.title)}</h2>
          ${p.excerpt ? `<p class="text-sm text-ink-2 line-clamp-3">${esc(p.excerpt)}</p>` : ""}
          ${p.date ? `<p class="font-mono text-2xs text-ink-4 mt-3">${esc(p.date)}</p>` : ""}
        </div>
      </a>`).join("");
}

function setCat(cat) {
  activeCat = cat;
  document.querySelectorAll(".sidebar-link[data-cat], .filter-chip[data-cat]").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  render();
}

const init = async () => {
  document.querySelectorAll(".sidebar-link[data-cat], .filter-chip[data-cat]").forEach((b) => {
    b.addEventListener("click", () => setCat(b.dataset.cat || "all"));
  });
  try {
    posts = await loadBlog();
    render();
  } catch (e) {
    console.error("[SUNDAF]", e);
    document.getElementById("blogList").innerHTML =
      '<div class="sm:col-span-2 text-center py-16"><div class="text-3xl mb-2">⚠️</div><p class="text-ink-2">Gagal memuat artikel dari spreadsheet.</p><p class="text-xs text-ink-3 mt-2">' + esc(e?.message || e) + '</p></div>';
  }
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
