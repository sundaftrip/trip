#!/usr/bin/env node
/**
 * Mode malam lembut untuk situs publik (tema Atlas / komponen Clean).
 *
 * Skrip ini membaca setiap CSS module situs publik (components/website dan
 * app/(website)), lalu
 * menambahkan satu blok di akhir file berisi versi malam dari setiap deklarasi
 * warna, dengan selektor `:global(.dark) <selektor asli>`. Warna diturunkan
 * per peran properti (latar, teks, garis, bayangan) ke palet malam yang lembut:
 * latar slate kebiruan (bukan hitam pekat), teks putih gading (bukan putih
 * murni), dan aksen teal yang diredam.
 *
 * Jalankan ulang setiap kali CSS module berubah:  npm run night:css
 * Blok lama (di antara penanda night:start / night:end) selalu dibuang dulu,
 * jadi skrip ini aman dijalankan berkali-kali.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
// Semua CSS module situs publik (bukan admin).
const DIRS = ["components/website", "app/(website)"].map((d) => path.join(ROOT, d));
const START = "/* ── night:start · dibuat otomatis oleh scripts/night-css.mjs, jangan diedit manual ── */";
const END = "/* ── night:end ── */";
const CHECK = process.argv.includes("--check");

// Variabel yang sudah sadar mode malam (diatur di layout/globals) dibiarkan.
const EXTERNAL_VAR = /^--(site-|at-|tw-|font-|warm-|background$|foreground$|nav-)/;

/* ───────────────────────── warna ───────────────────────── */
const NAMED = { white: "#ffffff", black: "#000000" };

function parseColor(tok) {
  const t = tok.trim().toLowerCase();
  if (NAMED[t]) return parseColor(NAMED[t]);
  let m = t.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = t.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/);
  if (m) {
    let a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  return null;
}

const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const fromLin = (c) => { const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, v)) * 255); };

function toOklch({ r, g, b, a }) {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, Bb);
  let h = (Math.atan2(Bb, A) * 180) / Math.PI; if (h < 0) h += 360;
  return { L, C, h, a };
}

function oklchToRgbRaw(L, C, h) {
  const A = C * Math.cos((h * Math.PI) / 180), B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function fromOklch({ L, C, h, a }) {
  let c = C, rgb = oklchToRgbRaw(L, c, h);
  for (let i = 0; i < 30 && rgb.some((v) => v < -0.0005 || v > 1.0005); i++) { c *= 0.9; rgb = oklchToRgbRaw(L, c, h); }
  const [r, g, b] = rgb.map(fromLin);
  if (a >= 0.999) return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const NEUTRAL_C = 0.045;
const NIGHT_HUE = 245; // slate kebiruan yang lembut
const BASE_L = 0.255; // terang latar halaman malam (hitam pekat = 0)

function tint(c, max) {
  return c.C < 0.008 ? { C: 0.014, h: NIGHT_HUE } : { C: Math.min(c.C * 1.2, max), h: c.h };
}

const MAP = {
  surface(c) {
    if (c.C < NEUTRAL_C) {
      if (c.L >= 0.55) return { L: BASE_L + (1 - c.L) * 0.9, ...tint(c, 0.03), a: c.a };
      return { L: clamp(0.33 + (c.L - 0.25) * 0.35, 0.3, 0.38), ...tint(c, 0.03), a: c.a };
    }
    if (c.L >= 0.85) return { L: BASE_L + 0.045, C: Math.min(c.C * 0.5, 0.045), h: c.h, a: c.a };
    return { L: Math.min(c.L, 0.74) * 0.96, C: c.C * 0.88, h: c.h, a: c.a };
  },
  text(c) {
    if (c.C < NEUTRAL_C) {
      if (c.L < 0.65) return { L: clamp(0.93 - (c.L - 0.25) * 0.75, 0.68, 0.91), ...tint(c, 0.015), a: c.a };
      return { L: Math.min(c.L, 0.95), ...tint(c, 0.012), a: c.a };
    }
    if (c.L < 0.66) return { L: 0.8, C: Math.min(c.C * 1.1, 0.1), h: c.h, a: c.a };
    return { L: Math.min(c.L, 0.9), C: c.C * 0.92, h: c.h, a: c.a };
  },
  line(c) {
    if (c.C < NEUTRAL_C) {
      if (c.L >= 0.6) return { L: BASE_L + 0.1 + (1 - c.L) * 0.4, ...tint(c, 0.02), a: c.a };
      return { L: 0.62, ...tint(c, 0.015), a: c.a };
    }
    return { L: clamp(c.L, 0.5, 0.75), C: c.C * 0.9, h: c.h, a: c.a };
  },
  shadow(c) {
    if (c.L < 0.5) return { ...c, a: Math.min(1, c.a * 1.6) };
    return MAP.surface(c);
  },
};

const COLOR_TOKEN = /#[0-9a-fA-F]{3,8}\b|rgba?\([^()]*\)|\b(?:white|black)\b/g;

function mapColors(value, role) {
  return value.replace(COLOR_TOKEN, (tok) => {
    const c = parseColor(tok);
    if (!c) return tok;
    return fromOklch(MAP[role](toOklch(c)));
  });
}

/* ───────────────────────── parser CSS sederhana ───────────────────────── */
function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ""); }

function parseItems(s, i = 0) {
  const items = [];
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    if (s[i] === "}") return [items, i + 1];
    let depth = 0, quote = null, j = i;
    for (; j < s.length; j++) {
      const ch = s[j];
      if (quote) { if (ch === quote && s[j - 1] !== "\\") quote = null; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (depth === 0 && (ch === "{" || ch === ";" || ch === "}")) break;
    }
    const prelude = s.slice(i, j).trim();
    if (s[j] === "{") {
      const [children, next] = parseItems(s, j + 1);
      items.push({ prelude, children });
      i = next;
    } else {
      if (prelude) items.push({ decl: prelude });
      i = s[j] === ";" ? j + 1 : j;
    }
  }
  return [items, i];
}

function splitTop(str, sep) {
  const out = []; let depth = 0, cur = "";
  for (const ch of str) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseDecl(text) {
  const k = text.indexOf(":");
  if (k < 0) return null;
  const prop = text.slice(0, k).trim().toLowerCase();
  let value = text.slice(k + 1).trim();
  const important = /!important\s*$/i.test(value);
  if (important) value = value.replace(/\s*!important\s*$/i, "");
  return { prop, value, important };
}

const SKIP_AT = /^@(keyframes|-webkit-keyframes|font-face|property|import|charset|page)\b/i;

/* ───────────────────────── peran properti ───────────────────────── */
function roleOf(prop) {
  if (prop === "color" || prop === "fill" || prop === "stroke" || prop === "caret-color" ||
      prop === "-webkit-text-fill-color" || prop.startsWith("text-decoration") || prop === "accent-color") return "text";
  if (prop === "background" || prop === "background-color" || prop === "background-image") return "surface";
  if (/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?$/.test(prop) || prop === "outline" || prop === "outline-color" || prop === "column-rule" || prop === "column-rule-color") return "line";
  if (prop === "box-shadow" || prop === "text-shadow") return "shadow";
  return null;
}

// Teks bergradien (background-clip: text): warna latar sebenarnya adalah warna teks.
function clipsText(decls) {
  return decls.some((d) => /^(-webkit-)?background-clip$/.test(d.prop) && /\btext\b/.test(d.value));
}
function roleIn(prop, clipText) {
  const role = roleOf(prop);
  return role === "surface" && clipText ? "text" : role;
}

/* ───────────────────────── variabel ───────────────────────── */
const VAR_REF = /var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/;

function collectDefs(items, into, sel = null) {
  for (const it of items) {
    if (it.decl) {
      const d = parseDecl(it.decl);
      if (d && d.prop.startsWith("--") && sel) (into[d.prop] ||= []).push({ value: d.value, sel });
    } else if (it.children && !SKIP_AT.test(it.prelude)) {
      collectDefs(it.children, into, it.prelude.startsWith("@") ? sel : it.prelude);
    }
  }
}

function makeResolver(localDefs, globalDefs) {
  const pick = (name) => {
    const defs = localDefs[name] || globalDefs[name];
    if (!defs) return undefined;
    const vals = new Set(defs.map((d) => d.value));
    return vals.size === 1 ? defs[0].value : null; // null = ambigu
  };
  return function resolve(value, depth = 0) {
    if (depth > 8) return value;
    let out = value, guard = 0;
    let m;
    const external = [];
    while ((m = out.match(VAR_REF)) && guard++ < 40) {
      const [whole, name, fallback] = m;
      let rep;
      if (EXTERNAL_VAR.test(name)) rep = null;
      else {
        const v = pick(name);
        if (v) rep = resolve(v, depth + 1);
        else if (v === undefined && fallback !== undefined) rep = resolve(fallback, depth + 1);
        else rep = null;
      }
      if (rep === null) {
        // simpan apa adanya, ganti sementara dengan penanda supaya loop maju
        external.push(whole);
        out = out.replace(whole, `\u0000${external.length - 1}\u0000`);
      } else out = out.replace(whole, rep);
    }
    return out.replace(/\u0000(\d+)\u0000/g, (_, n) => external[+n]);
  };
}

function varRoleCounts(items, counts) {
  const decls = items.filter((it) => it.decl).map((it) => parseDecl(it.decl)).filter(Boolean);
  const clipText = clipsText(decls);
  for (const d of decls) {
    const role = roleIn(d.prop, clipText);
    if (!role) continue;
    for (const m of d.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const c = (counts[m[1]] ||= { text: 0, surface: 0, line: 0, shadow: 0 });
      c[role]++;
    }
  }
  for (const it of items) if (it.children && !SKIP_AT.test(it.prelude)) varRoleCounts(it.children, counts);
}

function guessVarRole(name, counts) {
  const c = counts[name];
  if (c) {
    const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    if (best[1] > 0) return best[0];
  }
  if (/(line|border|rule)/.test(name)) return "line";
  if (/(paper|white|soft|ice|sand|sage|bg|surface|card|pale|cream|mist|background)/.test(name)) return "surface";
  return "text";
}

/* ───────────────────────── pembuat blok malam ───────────────────────── */
function darkSelector(selector) {
  return splitTop(selector, ",").map((s) => `:global(.dark) ${s}`).join(",\n");
}

function buildRule(selector, decls, resolve) {
  const clipText = clipsText(decls);
  const colorDecls = decls.filter((d) => roleOf(d.prop));
  if (!colorDecls.length) return null;

  // Latar terang (mis. badge amber) → teks di aturan yang sama tidak diubah.
  let brightBg = false;
  for (const d of colorDecls) {
    if (roleIn(d.prop, clipText) !== "surface") continue;
    const mapped = mapColors(resolve(d.value), "surface");
    for (const tok of mapped.match(COLOR_TOKEN) || []) {
      const c = parseColor(tok); if (!c) continue;
      const o = toOklch(c);
      if (o.a >= 0.6 && o.L >= 0.62) brightBg = true;
    }
  }

  const lines = colorDecls.map((d) => {
    const role = roleIn(d.prop, clipText);
    const resolved = resolve(d.value);
    let value = role === "text" && brightBg ? resolved : mapColors(resolved, role);
    if (d.prop === "color" && brightBg && /^(inherit|currentcolor)$/i.test(value.trim())) value = "#172025";
    return `  ${d.prop}: ${value}${d.important ? " !important" : ""};`;
  });
  // Latar terang tanpa warna teks sendiri (mis. stabilo <mark>): pakai tinta gelap,
  // sebab teks warisan dari induk sudah dibuat terang.
  if (brightBg && !colorDecls.some((d) => d.prop === "color")) lines.push("  color: #172025;");
  return `${darkSelector(selector)} {\n${lines.join("\n")}\n}`;
}

function walk(items, resolve, varRole, ctxAt = []) {
  const out = [];
  for (const it of items) {
    if (it.decl) continue;
    if (SKIP_AT.test(it.prelude)) continue;
    if (it.prelude.startsWith("@")) {
      const inner = walk(it.children, resolve, varRole, [...ctxAt, it.prelude]);
      if (inner.length) out.push(`${it.prelude} {\n${inner.join("\n\n").replace(/^/gm, "  ")}\n}`);
      continue;
    }
    const decls = it.children.filter((c) => c.decl).map((c) => parseDecl(c.decl)).filter(Boolean);
    const blocks = [];
    const rule = buildRule(it.prelude, decls, resolve);
    if (rule) blocks.push(rule);
    // Variabel warna yang didefinisikan di aturan ini (untuk dipakai inline di TSX).
    const varLines = decls
      .filter((d) => d.prop.startsWith("--") && !EXTERNAL_VAR.test(d.prop) && d.value.match(COLOR_TOKEN))
      .map((d) => {
        const role = varRole(d.prop);
        const mapped = mapColors(resolve(d.value), role);
        return mapped === d.value ? null : `  ${d.prop}: ${mapped};`;
      })
      .filter(Boolean);
    if (varLines.length) blocks.push(`${darkSelector(it.prelude)} {\n${varLines.join("\n")}\n}`);
    out.push(...blocks);
  }
  return out;
}

/* ───────────────────────── jalankan ───────────────────────── */
function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listFiles(p);
    return e.name.endsWith(".module.css") ? [p] : [];
  });
}

function withoutNight(src) {
  const a = src.indexOf(START);
  if (a < 0) return src;
  const b = src.indexOf(END, a);
  return (src.slice(0, a).trimEnd() + "\n" + (b < 0 ? "" : src.slice(b + END.length).trimStart())).trimEnd() + "\n";
}

// Variabel global dari globals.css (.public-site-shell --doc-*)
const globalDefs = {};
const globalsCss = stripComments(fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8"));
collectDefs(parseItems(globalsCss)[0].filter((it) => it.prelude && !/\.dark\b/.test(it.prelude)), globalDefs);

let changed = 0;
for (const file of DIRS.flatMap(listFiles)) {
  const original = fs.readFileSync(file, "utf8");
  const base = withoutNight(original);
  // File yang desainnya memang sudah gelap (mis. footer) memberi tanda night:skip
  // dan mengatur mode malamnya sendiri secara manual.
  if (base.includes("night:skip")) {
    if (base !== original) { changed++; if (!CHECK) fs.writeFileSync(file, base); }
    continue;
  }
  const [items] = parseItems(stripComments(base));
  const localDefs = {};
  collectDefs(items, localDefs);
  const resolve = makeResolver(localDefs, globalDefs);
  const counts = {};
  varRoleCounts(items, counts);
  const blocks = walk(items, resolve, (name) => guessVarRole(name, counts));
  const next = blocks.length ? `${base.trimEnd()}\n\n${START}\n${blocks.join("\n\n")}\n${END}\n` : base;
  if (next !== original) {
    changed++;
    if (!CHECK) fs.writeFileSync(file, next);
    console.log(`${CHECK ? "perlu diperbarui" : "diperbarui"}: ${path.relative(ROOT, file)} (${blocks.length} aturan malam)`);
  }
}
if (CHECK && changed) { console.error("Blok mode malam belum mutakhir. Jalankan: npm run night:css"); process.exit(1); }
console.log(changed ? `${changed} file ${CHECK ? "belum mutakhir" : "diperbarui"}.` : "Semua blok mode malam sudah mutakhir.");
