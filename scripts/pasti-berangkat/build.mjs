// Rakit tiga halaman "pasti berangkat" dari satu template dan satu mesin:
//   public/pastiberangkat/index.html  -> sundaftrip.com/pastiberangkat  (Almaty saja, tetap jalan walau 1 orang)
//   public/2tans/index.html           -> sundaftrip.com/2tans           (Kazakhstan + Kirgistan)
//   public/turharian/index.html       -> sundaftrip.com/turharian       (tur harian, tanpa hotel)
// Gaya dasar diambil apa adanya dari halaman Pool Kazakhstan (src/base.css), lalu ditambah src/page.css.
// Jalankan: npm run build:pasti-berangkat
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PRODUCTS } from "./products.mjs";

const src = (name) => readFileSync(new URL(`./src/${name}`, import.meta.url), "utf8");

/** Satu substitusi persis: placeholder harus ada tepat sekali. */
function replaceOnce(text, token, value) {
  const parts = text.split(token);
  if (parts.length !== 2) throw new Error(`${token} muncul ${parts.length - 1} kali`);
  return parts.join(value);
}

/** HTML lengkap satu halaman. */
export function buildPage(key) {
  const spec = PRODUCTS[key];
  if (!spec) throw new Error(`Halaman tidak dikenal: ${key}`);
  const { P, ...texts } = spec;
  let html = src("page.html");
  for (const [name, value] of Object.entries({ ...texts, KEY: key })) {
    const token = `{{@${name}}}`;
    if (!html.includes(token)) throw new Error(`${token} tidak ada di page.html`);
    html = html.split(token).join(value);
  }
  const left = html.match(/\{\{@\w+\}\}/g);
  if (left) throw new Error(`Belum terisi: ${left.join(", ")}`);
  const js = replaceOnce(src("page.js"), "/*__PRODUCT__*/{}", JSON.stringify(P));
  if (js.includes("</script")) throw new Error("page.js tidak boleh berisi </script");
  html = replaceOnce(html, "/*__BASE_CSS__*/", src("base.css").replace(/\n+$/, ""));
  html = replaceOnce(html, "/*__PAGE_CSS__*/", src("page.css").replace(/^\n+|\n+$/g, ""));
  html = replaceOnce(html, "/*__SCRIPT__*/", js.replace(/\n+$/, ""));
  html = replaceOnce(html, "__BCA_SRC__", src("bca.txt").trim());
  return html;
}

export const PAGE_KEYS = Object.keys(PRODUCTS);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : PAGE_KEYS;
  for (const key of keys) {
    const out = new URL(`../../public/${key}/index.html`, import.meta.url);
    mkdirSync(new URL(".", out), { recursive: true });
    const html = buildPage(key);
    writeFileSync(out, html);
    console.log(`public/${key}/index.html`, Buffer.byteLength(html), "bytes");
  }
}
