"use client";

import { useEffect } from "react";

/* Auto-translate seluruh teks halaman ke EN saat bahasa = "en", dan kembalikan
   ke ID saat "id". Mesin: /api/translate (Google gtx + cache DB). Hasil juga
   di-cache di memori + localStorage agar instan.

   Pengecualian: elemen ber-atribut [data-no-translate] / [translate="no"],
   tag non-teks (script/style/code/pre/textarea), dan istilah brand. */

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG", "PATH"]);
const STOP = new Set(["SUNDAF", "Sundaf", "Sundaf Trip", "KOL.ID", "WhatsApp", "EN", "ID", "IN"]);
const hasLetters = (s: string) => /[A-Za-zÀ-ÿ]/.test(s);

const memCache = new Map<string, string>();
const originals = new WeakMap<Text, string>();
let applying = false;

function loadLS() {
  try {
    const raw = localStorage.getItem("tcache_en");
    if (raw) { const o = JSON.parse(raw); for (const k in o) memCache.set(k, o[k]); }
  } catch { /* ignore */ }
}
function saveLS() {
  try {
    const o: Record<string, string> = {};
    memCache.forEach((v, k) => { o[k] = v; });
    localStorage.setItem("tcache_en", JSON.stringify(o));
  } catch { /* ignore */ }
}

function shouldSkip(node: Text): boolean {
  let el = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.getAttribute("data-no-translate") !== null) return true;
    if (el.getAttribute("translate") === "no") return true;
    if (el.isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

function collectTextNodes(): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = n as Text;
      const raw = t.nodeValue ?? "";
      const trimmed = raw.trim();
      if (trimmed.length < 2 || !hasLetters(trimmed)) return NodeFilter.FILTER_REJECT;
      if (STOP.has(trimmed)) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let cur: Node | null;
  while ((cur = walker.nextNode())) out.push(cur as Text);
  return out;
}

function applyTranslation(node: Text, translated: string) {
  const raw = node.nodeValue ?? "";
  const lead = raw.match(/^\s*/)?.[0] ?? "";
  const trail = raw.match(/\s*$/)?.[0] ?? "";
  applying = true;
  node.nodeValue = lead + translated + trail;
  applying = false;
}

async function translatePage() {
  const nodes = collectTextNodes();
  if (nodes.length === 0) return;

  const need = new Set<string>();
  const pending: { node: Text; key: string }[] = [];
  for (const node of nodes) {
    const raw = node.nodeValue ?? "";
    const key = raw.trim();
    if (!originals.has(node)) originals.set(node, raw);
    // sudah diterjemahkan (isi sekarang == hasil cache)?
    const cached = memCache.get(key);
    if (cached != null) { if ((node.nodeValue ?? "").trim() !== cached) applyTranslation(node, cached); continue; }
    pending.push({ node, key });
    need.add(key);
  }
  if (need.size === 0) return;

  const texts = Array.from(need);
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, target: "en" }),
    });
    const data = (await res.json()) as { translations?: Record<string, string> };
    const map = data.translations ?? {};
    for (const k of texts) if (map[k] != null) memCache.set(k, map[k]);
    saveLS();
    for (const { node, key } of pending) {
      const tr = memCache.get(key);
      if (tr != null && document.contains(node)) applyTranslation(node, tr);
    }
  } catch { /* abaikan; biarkan teks asli */ }
}

function restorePage() {
  // kembalikan semua node yang punya original tersimpan
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let cur: Node | null;
  applying = true;
  while ((cur = walker.nextNode())) {
    const t = cur as Text;
    const orig = originals.get(t);
    if (orig != null && t.nodeValue !== orig) t.nodeValue = orig;
  }
  applying = false;
}

export default function AutoTranslate() {
  useEffect(() => {
    loadLS();
    let lang = (localStorage.getItem("lang") as "id" | "en" | null) ?? "id";
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      if (lang === "en") translatePage();
      else restorePage();
    };
    const schedule = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 250);
    };

    // observer untuk konten baru (navigasi Next / render dinamis)
    const obs = new MutationObserver((muts) => {
      if (applying) return;
      if (lang !== "en") return;
      // hanya jadwalkan kalau ada perubahan struktur/teks yang relevan
      for (const m of muts) {
        if (m.type === "childList" && (m.addedNodes.length > 0)) { schedule(); return; }
        if (m.type === "characterData") { schedule(); return; }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });

    const onLang = () => {
      const next = (localStorage.getItem("lang") as "id" | "en" | null) ?? "id";
      if (next === lang) return;
      lang = next;
      run();
    };
    window.addEventListener("sundaf:langchange", onLang);
    window.addEventListener("storage", onLang);

    // jalankan sekali di awal kalau sudah EN
    run();

    return () => {
      obs.disconnect();
      window.removeEventListener("sundaf:langchange", onLang);
      window.removeEventListener("storage", onLang);
      if (debounce) clearTimeout(debounce);
    };
  }, []);

  return null;
}
