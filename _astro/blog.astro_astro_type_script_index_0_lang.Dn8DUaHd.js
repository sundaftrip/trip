import{l as r}from"./sheets.CwVe4WeZ.js";let i=[],n="all";function l(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function c(){const e=document.getElementById("blogList"),a=n==="all"?i:i.filter(t=>(t.category||"").toLowerCase()===n);if(!a.length){e.innerHTML='<div class="sm:col-span-2 text-center py-16 text-ink-3"><div class="text-3xl mb-2">📝</div><p>Belum ada artikel di kategori ini.</p></div>';return}e.innerHTML=a.map(t=>`
        <a href="/artikel?slug=${encodeURIComponent(t.slug)}" class="card card-hoverable overflow-hidden block group">
          <div class="aspect-[16/9] overflow-hidden bg-surface-muted">
            ${t.cover?`<img src="${l(t.cover)}" alt="${l(t.title)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">`:""}
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              ${t.category?`<span class="code-badge-brand">${l(t.category)}</span>`:""}
              ${t.read_time?`<span class="font-mono text-2xs text-ink-4">${l(t.read_time)}</span>`:""}
            </div>
            <h2 class="font-display font-bold text-lg leading-tight tracking-tight mb-2 text-balance group-hover:text-[rgb(var(--brand))] transition">${l(t.title)}</h2>
            ${t.excerpt?`<p class="text-sm text-ink-2 line-clamp-3">${l(t.excerpt)}</p>`:""}
            ${t.date?`<p class="font-mono text-2xs text-ink-4 mt-3">${l(t.date)}</p>`:""}
          </div>
        </a>
      `).join("")}function o(e){n=e,document.querySelectorAll(".sidebar-link[data-cat], .filter-chip[data-cat]").forEach(a=>{a.classList.toggle("active",a.dataset.cat===e)}),c()}const s=async()=>{document.querySelectorAll(".sidebar-link[data-cat], .filter-chip[data-cat]").forEach(e=>{e.addEventListener("click",()=>o(e.dataset.cat||"all"))});try{i=await r(),c()}catch(e){console.error("[SUNDAF]",e),document.getElementById("blogList").innerHTML='<div class="sm:col-span-2 text-center py-16"><div class="text-3xl mb-2">⚠️</div><p class="text-ink-2">Gagal memuat artikel dari Sheets.</p></div>'}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s();
