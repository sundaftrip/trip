const O="modulepreload",j=function(t){return"/"+t},$={},C=function(e,a,s){let d=Promise.resolve();if(a&&a.length>0){let i=function(o){return Promise.all(o.map(n=>Promise.resolve(n).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const p=document.querySelector("meta[property=csp-nonce]"),b=p?.nonce||p?.getAttribute("nonce");d=i(a.map(o=>{if(o=j(o),o in $)return;$[o]=!0;const n=o.endsWith(".css"),h=n?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${o}"]${h}`))return;const g=document.createElement("link");if(g.rel=n?"stylesheet":O,n||(g.as="script"),g.crossOrigin="",g.href=o,b&&g.setAttribute("nonce",b),document.head.appendChild(g),n)return new Promise((A,P)=>{g.addEventListener("load",A),g.addEventListener("error",()=>P(new Error(`Unable to preload CSS for ${o}`)))})}))}function c(i){const p=new Event("vite:preloadError",{cancelable:!0});if(p.payload=i,window.dispatchEvent(p),!p.defaultPrevented)throw i}return d.then(i=>{for(const p of i||[])p.status==="rejected"&&c(p.reason);return e().catch(c)})},G="https://api.groq.com/openai/v1/chat/completions",x="sundaf_groq_key",J=[{id:"llama-3.3-70b-versatile",label:"Llama 3.3 70B (Recommended)",tag:"fast"},{id:"llama-3.1-8b-instant",label:"Llama 3.1 8B (Fastest)",tag:"instant"},{id:"mixtral-8x7b-32768",label:"Mixtral 8x7B",tag:"balanced"},{id:"gemma2-9b-it",label:"Gemma 2 9B",tag:"balanced"}];function E(){return localStorage.getItem(x)||""}function H(t){t?localStorage.setItem(x,t.trim()):localStorage.removeItem(x)}const _={viral:'Gaya hook viral TikTok/Instagram Indonesia: short, scroll-stopping, sering pakai pertanyaan retoris atau angka kejutan. Contoh: "POV: kamu lagi di Moscow…", "1 dari 100 orang Indonesia pernah ke sini".',storytelling:'Gaya storytelling personal: pakai "Aku/Gue", emosi, momen detail, vibes liburan.',fact:"Gaya edukatif/fakta menarik tentang destinasi. Number-driven, surprising facts.",fomo:'Gaya FOMO/urgency: "Sebelum harga naik", "spot terakhir", "limited slot".',premium:"Gaya premium/aspirational: tone elegan, fokus exclusive experience, hidden gems."},z=`Kamu adalah copywriter Indonesia spesialis caption Instagram untuk travel agency.
Output kamu HARUS:
- Bahasa Indonesia gaul tapi gak alay
- Setiap hook MAX 12 kata
- Tanpa hashtag, tanpa emoji berlebih (max 1 emoji per hook)
- Variasi gaya: pertanyaan, pernyataan kontroversial, angka, POV, statement bold
- Output dalam JSON object dengan key "hooks" berisi array string
- Format WAJIB: {"hooks": ["hook 1", "hook 2", "hook 3"]}`;async function q(t){const e=E();if(!e)throw new Error("NO_KEY");const a=t.vibe||"viral",s=t.count||5,d=t.model||J[0].id,c=`Buatkan ${s} hook caption Instagram untuk paket wisata "${t.destination}".

${_[a]}

Return JSON: {"hooks": [...${s} strings...]}`,i=await fetch(G,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:d,messages:[{role:"system",content:z},{role:"user",content:c}],temperature:.9,max_tokens:600,response_format:{type:"json_object"}})});if(!i.ok){const n=await i.text().catch(()=>"");throw new Error(`Groq ${i.status}: ${n.slice(0,200)}`)}const b=(await i.json())?.choices?.[0]?.message?.content||"";let o=[];try{const n=JSON.parse(b);if(Array.isArray(n))o=n;else if(Array.isArray(n.hooks))o=n.hooks;else if(Array.isArray(n.captions))o=n.captions;else for(const h of Object.values(n))if(Array.isArray(h)){o=h;break}}catch{o=b.split(`
`).map(n=>n.replace(/^[-*\d.\s"]+|"$/g,"").trim()).filter(n=>n.length>5)}return o.filter(n=>typeof n=="string"&&n.length>0).slice(0,s)}const R=["POV: kamu akhirnya berangkat ke {destination}","{destination}: spot yang bikin lupa caranya pulang","1 dari 100 orang Indonesia pernah ke {destination}","Sebelum {destination} jadi terlalu mainstream","Tabungan vs {destination}: tabungan kalah","Yang gak ke {destination} 2026, kelewatan","Cerita yang bakal kamu ulang seumur hidup","Bukti #SemuaBisaJalan, bahkan ke {destination}","Hari pertama di {destination} udah bikin nangis","Foto-foto {destination} yang gak ada di Google","Trip {destination} versi gak nyesel","Reminder: {destination} masih ada slot bulan ini"];function N(t,e=6){return[...R].sort(()=>Math.random()-.5).slice(0,e).map(s=>s.replace(/\{destination\}/g,t))}const k={ember:{bg:"#fff7ed",fg:"#1c1917",accent:"#c2410c",subtle:"#fed7aa"},ocean:{bg:"#ecfeff",fg:"#0c0a09",accent:"#0e7490",subtle:"#a5f3fc"},ink:{bg:"#1c1917",fg:"#fafaf9",accent:"#fb923c",subtle:"#44403c"}},S={cover:"Cover Hook","big-text":"Big Statement",list:"List / Bullets",quote:"Quote / Testi",cta:"Call to Action"};let y="ember",r=[{layout:"cover",title:"5 Alasan Wajib ke Moscow",subtitle:"Sebelum kamu kelewat moment ini",number:"01"},{layout:"big-text",title:'"Lebih dari sekadar liburan."',subtitle:"Cerita yang bakal kamu ulang seumur hidup"},{layout:"list",title:"Yang Bikin Beda",bullets:["Guide lokal yang ngerti vibes","Tiket + hotel sudah include","Group kecil, tidak ramai","Itinerary fleksibel"]},{layout:"quote",title:"Solo trip pertama gue dan… aman banget",subtitle:"— @rini, traveler 2025"},{layout:"cta",title:"Slot Maret Tinggal 2",subtitle:"Booking via WhatsApp sekarang",cta:"wa.me/SUNDAF"}],l=0;const v=()=>document.getElementById("canvas");function w(t,e,a,s){const d=k[s],c=d.accent,i=d.fg,p=d.bg,b=d.subtle,o=`
        <div class="flex items-center gap-2 absolute" style="bottom: 32px; left: 32px;">
          <div style="width:28px;height:28px;border-radius:8px;background:${c};color:white;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:12px;">ST</div>
          <span style="font-family:'Plus Jakarta Sans';font-weight:700;font-size:13px;color:${i};">SUNDAF TRIP</span>
        </div>
      `,n=`<div class="absolute font-mono" style="top: 32px; right: 32px; font-size: 12px; color: ${i}; opacity: .55;">${String(e+1).padStart(2,"0")} / ${String(a).padStart(2,"0")}</div>`;switch(t.layout){case"cover":return`
          <div class="relative w-full h-full" style="background: ${p}; color: ${i};">
            ${n}
            <div class="absolute" style="top: 32px; left: 32px; font-family: 'JetBrains Mono'; font-size: 11px; letter-spacing: .14em; color: ${c}; text-transform: uppercase;">// ${t.number||"01"}</div>
            <div style="position: absolute; left: 32px; right: 32px; top: 50%; transform: translateY(-50%);">
              <h1 contenteditable="true" data-field="title" style="font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 64px; line-height: 1.05; letter-spacing: -0.04em; outline: none;">${u(t.title)}</h1>
              ${t.subtitle?`<p contenteditable="true" data-field="subtitle" style="margin-top: 18px; font-size: 22px; line-height: 1.3; opacity: .75; outline: none;">${u(t.subtitle)}</p>`:""}
            </div>
            <div class="absolute" style="bottom: 32px; right: 32px; width: 240px; height: 8px; background: ${b}; border-radius: 999px;">
              <div style="width: ${(e+1)/a*100}%; height: 100%; background: ${c}; border-radius: 999px;"></div>
            </div>
            ${o}
          </div>`;case"big-text":return`
          <div class="relative w-full h-full" style="background: ${p}; color: ${i};">
            ${n}
            <div style="position: absolute; left: 48px; right: 48px; top: 50%; transform: translateY(-50%); text-align: center;">
              <h1 contenteditable="true" data-field="title" style="font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 80px; line-height: 1.0; letter-spacing: -0.04em; outline: none;">${u(t.title)}</h1>
              ${t.subtitle?`<p contenteditable="true" data-field="subtitle" style="margin-top: 28px; font-size: 20px; line-height: 1.4; opacity: .65; outline: none;">${u(t.subtitle)}</p>`:""}
            </div>
            ${o}
          </div>`;case"list":return`
          <div class="relative w-full h-full" style="background: ${p}; color: ${i}; padding: 64px 48px;">
            ${n}
            <h2 contenteditable="true" data-field="title" style="font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 44px; line-height: 1.1; letter-spacing: -0.03em; outline: none; max-width: 80%;">${u(t.title)}</h2>
            <ul style="margin-top: 40px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 18px;">
              ${(t.bullets||[]).map((h,g)=>`
                <li style="display: flex; align-items: start; gap: 16px; font-size: 22px; line-height: 1.4;">
                  <span style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; background: ${c}; color: white; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono'; font-size: 13px; font-weight: 600; margin-top: 2px;">${String(g+1).padStart(2,"0")}</span>
                  <span contenteditable="true" data-field="bullet" data-bullet-idx="${g}" style="outline: none;">${u(h)}</span>
                </li>`).join("")}
            </ul>
            ${o}
          </div>`;case"quote":return`
          <div class="relative w-full h-full" style="background: ${p}; color: ${i};">
            ${n}
            <div style="position: absolute; left: 48px; right: 48px; top: 50%; transform: translateY(-50%);">
              <div style="font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 120px; line-height: 0.8; color: ${c}; opacity: .25;">"</div>
              <h2 contenteditable="true" data-field="title" style="font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 42px; line-height: 1.2; letter-spacing: -0.02em; outline: none; margin-top: -40px;">${u(t.title)}</h2>
              ${t.subtitle?`<p contenteditable="true" data-field="subtitle" style="margin-top: 28px; font-family: 'JetBrains Mono'; font-size: 16px; opacity: .65; outline: none;">${u(t.subtitle)}</p>`:""}
            </div>
            ${o}
          </div>`;case"cta":return`
          <div class="relative w-full h-full" style="background: ${c}; color: white;">
            ${n.replace(`color: ${i}`,"color: white")}
            <div style="position: absolute; left: 48px; right: 48px; top: 50%; transform: translateY(-50%); text-align: center;">
              <p style="font-family: 'JetBrains Mono'; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; opacity: .8;">// next step</p>
              <h1 contenteditable="true" data-field="title" style="font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 72px; line-height: 1.05; letter-spacing: -0.04em; outline: none; margin-top: 16px;">${u(t.title)}</h1>
              ${t.subtitle?`<p contenteditable="true" data-field="subtitle" style="margin-top: 24px; font-size: 22px; opacity: .9; outline: none;">${u(t.subtitle)}</p>`:""}
              ${t.cta?`<div contenteditable="true" data-field="cta" style="display: inline-block; margin-top: 40px; padding: 18px 36px; background: white; color: ${c}; border-radius: 999px; font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 22px; outline: none;">${u(t.cta)}</div>`:""}
            </div>
            <div class="absolute" style="bottom: 32px; left: 32px; display: flex; align-items: center; gap: 8px;">
              <div style="width:28px;height:28px;border-radius:8px;background:white;color:${c};display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:12px;">ST</div>
              <span style="font-family:'Plus Jakarta Sans';font-weight:700;font-size:13px;color:white;">SUNDAF TRIP</span>
            </div>
          </div>`}}function u(t){return String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function m(){const t=r[l];t&&(v().innerHTML=w(t,l,r.length,y),v().setAttribute("data-theme",y),K(),L(),B(),I(),document.getElementById("canvasLabel").textContent=`slide ${l+1} / ${r.length}`)}function K(){v().querySelectorAll('[contenteditable="true"]').forEach(t=>{t.addEventListener("blur",()=>{const e=t.dataset.field,a=r[l];if(e==="bullet"){const s=Number(t.dataset.bulletIdx);a.bullets=a.bullets||[],a.bullets[s]=t.innerText.trim()}else e==="cta"?a.cta=t.innerText.trim():a[e]=t.innerText.trim();L(),B(),I()}),t.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&t.dataset.field!=="bullet"&&(e.preventDefault(),t.blur())})})}function L(){const t=document.getElementById("slideList");t.innerHTML=r.map((e,a)=>`
        <div class="slide-item ${a===l?"active":""}" data-i="${a}">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="font-mono text-2xs" style="color: ${a===l?"rgb(var(--brand))":"rgb(var(--ink-3))"};">${String(a+1).padStart(2,"0")} · ${S[e.layout]}</p>
              <p class="text-xs truncate ${a===l?"font-medium":""}">${u(e.title)}</p>
            </div>
            ${r.length>1?`<button class="del-slide w-6 h-6 rounded hover:bg-surface flex-shrink-0 flex items-center justify-center" data-del="${a}" title="Hapus"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></button>`:""}
          </div>
        </div>
      `).join(""),t.querySelectorAll(".slide-item").forEach(e=>{e.addEventListener("click",a=>{a.target.closest(".del-slide")||(l=Number(e.dataset.i),m())})}),t.querySelectorAll(".del-slide").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const s=Number(e.dataset.del);r.splice(s,1),l>=r.length&&(l=r.length-1),m()})})}function B(){const t=document.getElementById("thumbStrip");t.innerHTML=r.map((e,a)=>`
        <button class="thumb-btn flex-shrink-0 ${a===l?"active":""}" data-i="${a}">
          <div class="thumb-mini" style="background: ${k[y].bg}; color: ${k[y].fg};">
            <span style="font-family:'JetBrains Mono'; font-size: 8px; opacity: .55;">${String(a+1).padStart(2,"0")}</span>
            <span class="thumb-title">${u(e.title.slice(0,30))}</span>
          </div>
        </button>
      `).join(""),t.querySelectorAll(".thumb-btn").forEach(e=>{e.addEventListener("click",()=>{l=Number(e.dataset.i),m()})})}function I(){const t=document.getElementById("slideEditor"),e=r[l];if(!e){t.innerHTML="";return}t.innerHTML=`
        <p class="eyebrow mb-3">Edit Slide ${l+1}</p>
        <label class="block text-xs text-ink-3 mb-1">Layout</label>
        <select id="layoutSelect" class="input mb-3 text-xs">
          ${["cover","big-text","list","quote","cta"].map(d=>`<option value="${d}" ${d===e.layout?"selected":""}>${S[d]}</option>`).join("")}
        </select>
        <label class="block text-xs text-ink-3 mb-1">Title</label>
        <textarea id="editTitle" class="input mb-3 text-xs" rows="2">${u(e.title)}</textarea>
        <label class="block text-xs text-ink-3 mb-1">Subtitle</label>
        <textarea id="editSubtitle" class="input mb-3 text-xs" rows="2">${u(e.subtitle||"")}</textarea>
        ${e.layout==="list"?`
          <label class="block text-xs text-ink-3 mb-1">Bullets (1 per baris)</label>
          <textarea id="editBullets" class="input mb-3 text-xs" rows="4">${u((e.bullets||[]).join(`
`))}</textarea>
        `:""}
        ${e.layout==="cta"?`
          <label class="block text-xs text-ink-3 mb-1">CTA Button</label>
          <input id="editCta" class="input mb-3 text-xs" value="${u(e.cta||"")}">
        `:""}
      `,document.getElementById("layoutSelect").addEventListener("change",d=>{r[l].layout=d.target.value,r[l].layout==="list"&&!r[l].bullets&&(r[l].bullets=["","",""]),m()});const a=(d,c)=>{const i=document.getElementById(d);i&&i.addEventListener("input",()=>{r[l][c]=i.value,m()})};a("editTitle","title"),a("editSubtitle","subtitle"),a("editCta","cta");const s=document.getElementById("editBullets");s&&s.addEventListener("input",()=>{r[l].bullets=s.value.split(`
`).map(d=>d.trim()).filter(Boolean),m()})}document.querySelectorAll(".theme-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".theme-btn").forEach(e=>e.classList.remove("active")),t.classList.add("active"),y=t.dataset.theme,m()})});document.getElementById("prevSlide").addEventListener("click",()=>{l>0&&(l--,m())});document.getElementById("nextSlide").addEventListener("click",()=>{l<r.length-1&&(l++,m())});document.getElementById("addSlide").addEventListener("click",()=>{r.push({layout:"big-text",title:"Slide baru",subtitle:"Klik untuk edit"}),l=r.length-1,m()});function f(t){const e=document.getElementById("toast");document.getElementById("toastMsg").textContent=t,e.classList.remove("hidden"),setTimeout(()=>e.classList.add("hidden"),2400)}function T(t){const e=document.getElementById("hookResults");if(!t.length){e.innerHTML='<p class="text-xs text-ink-3 italic">Tidak ada hasil.</p>';return}e.innerHTML=t.map(a=>`<button class="hook-pill" data-hook="${u(a)}">${u(a)}</button>`).join(""),e.querySelectorAll(".hook-pill").forEach(a=>{a.addEventListener("click",()=>{r[l].title=a.dataset.hook,m(),f("Hook applied to slide")})})}document.getElementById("genLocal").addEventListener("click",()=>{const t=document.getElementById("hookDest").value.trim();if(!t){f("Isi destinasi dulu");return}T(N(t,6))});document.getElementById("genGroq").addEventListener("click",async()=>{const t=document.getElementById("hookDest").value.trim(),e=document.getElementById("hookVibe").value;if(!t){f("Isi destinasi dulu");return}if(!E()){document.getElementById("keyModal").classList.remove("hidden");return}const a=document.getElementById("hookResults");a.innerHTML='<p class="text-xs text-ink-3 italic">⚡ Generating via Groq…</p>';try{const s=await q({destination:t,vibe:e,count:6});T(s),f(`✓ ${s.length} hooks generated`)}catch(s){a.innerHTML=`<p class="text-xs text-red-600 italic">⚠ ${s.message}</p>`,s.message==="NO_KEY"&&document.getElementById("keyModal").classList.remove("hidden")}});document.getElementById("setKey").addEventListener("click",()=>{document.getElementById("keyInput").value=E(),document.getElementById("keyModal").classList.remove("hidden")});document.getElementById("keyCancel").addEventListener("click",()=>document.getElementById("keyModal").classList.add("hidden"));document.getElementById("keySave").addEventListener("click",()=>{const t=document.getElementById("keyInput").value.trim();H(t),document.getElementById("keyModal").classList.add("hidden"),f(t?"✓ Key tersimpan":"✓ Key dihapus")});async function M(t,e,a){const s=await C(()=>import("./html2canvas-pro.esm.BQ1Kz8to.js"),[]),d=s.default||s,c=document.createElement("div");c.style.cssText="position:fixed;left:-9999px;top:0;width:1080px;height:1080px;";const i=document.createElement("div");i.style.cssText="width:1080px;height:1080px;",i.innerHTML=w(r[t],t,r.length,y),c.appendChild(i),document.body.appendChild(c),await document.fonts?.ready?.catch(()=>{});const b=(await d(i,{scale:1,backgroundColor:null,useCORS:!0,logging:!1})).toDataURL("image/jpeg",.92);document.body.removeChild(c);const o=document.createElement("a");o.href=b,o.download=`sundaf-carousel-${String(t+1).padStart(2,"0")}.jpg`,o.click()}document.getElementById("exportCurrent").addEventListener("click",async()=>{f("Generating JPG…");try{await M(l),f("✓ Exported")}catch(t){console.error(t),f("⚠ Export gagal")}});document.getElementById("exportAll").addEventListener("click",async()=>{f("Generating "+r.length+" JPG…");try{for(let t=0;t<r.length;t++)await M(t),await new Promise(e=>setTimeout(e,200));f("✓ Semua slide diexport")}catch(t){console.error(t),f("⚠ Export gagal")}});m();
