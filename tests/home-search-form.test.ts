import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import postcss from "postcss";
import ts from "typescript";

const home = readFileSync(
  new URL("../components/website/clean/CleanHome.tsx", import.meta.url),
  "utf8",
);
const form = readFileSync(
  new URL("../components/website/clean/home/HomeSearchForm.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../components/website/clean/home/CleanHome.module.css", import.meta.url),
  "utf8",
);

test("removes only the redundant contact and legal strip below the finder", () => {
  assert.doesNotMatch(home, /finderMeta|legalProof|Belum yakin\? Tanya rute via WhatsApp\./);
  assert.doesNotMatch(styles, /\.finderMeta\b|\.legalProof\b/);
  assert.match(home, /getHomeFaqs\(nib, legalName\)/);
  assert.match(home, /data-analytics-placement="home-final"/);
  assert.match(home, /Konsultasi rute via WhatsApp/);
  assert.match(home, /<HomeSearchForm\s+destinations=\{destinationOptions\}\s+months=\{monthOptions\}/);
});

test("keeps the native destination and month search without decorative icons", () => {
  assert.match(form, /action="\/tours"\s+method="get"\s+onSubmit=\{submitSearch\}/);
  assert.match(form, /aria-label="Cari rute yang pas"/);
  assert.equal(form.match(/<label className=\{styles\.finderField\}>/g)?.length, 2);
  assert.match(form, /<small>TUJUAN<\/small>\s*<select name="destination" defaultValue="all">/);
  assert.match(form, /<small>WAKTU BERANGKAT<\/small>\s*<select name="month" defaultValue="all">/);
  assert.match(form, /<option value="all">Semua destinasi<\/option>/);
  assert.match(form, /<option value="all">Semua bulan<\/option>/);
  assert.match(form, /value=\{destination\.value\}/);
  assert.match(form, /value=\{month\.value\}/);
  assert.match(form, /<button type="submit">\s*Lihat perjalanan\s*<\/button>/);
  assert.doesNotMatch(form, /lucide-react|<MapPin|<CalendarDays|<Search/);
});

test("preserves campaign attribution and native GET submission", () => {
  assert.match(form, /new FormData\(event\.currentTarget\)/);
  assert.match(form, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(form, /startsWith\("utm_"\)/);
  assert.match(form, /event\.currentTarget\.appendChild\(input\)/);
  assert.match(form, /trackSundafEvent\("home_search_submit"/);
  assert.doesNotMatch(form, /preventDefault|router\.(?:push|replace)|scrollTo/);
});

test("uses unboxed fields with visible focus and comfortable touch targets", () => {
  const field = styles.match(/\.finderField\s*\{([^}]+)\}/)?.[1];
  const select = styles.match(/\.finderField select\s*\{([^}]+)\}/)?.[1];
  const button = styles.match(/\.finderCard > button\s*\{([^}]+)\}/)?.[1];
  assert.ok(field);
  assert.ok(select);
  assert.ok(button);
  assert.match(field, /border:\s*0;/);
  assert.match(field, /border-radius:\s*0(?: !important)?;/);
  assert.match(field, /background:\s*transparent;/);
  assert.match(select, /min-height:\s*44px;/);
  assert.ok(Number(button.match(/min-height:\s*(\d+)px;/)?.[1]) >= 48);
  assert.doesNotMatch(select, /appearance:\s*none/);
  assert.match(styles, /:focus-visible\s*\{[^}]*outline:\s*3px solid/);
});

test("places the single search form inside the hero after its copy", () => {
  const tree = ts.createSourceFile("CleanHome.tsx", home, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hero: ts.JsxElement | undefined;
  const forms: ts.JsxSelfClosingElement[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === "section"
      && node.openingElement.attributes.getText(tree).includes('aria-labelledby="home-hero-title"')) hero = node;
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === "HomeSearchForm") forms.push(node);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  assert.ok(hero);
  assert.equal(forms.length, 1);
  assert.ok(forms[0].pos > hero.pos && forms[0].end < hero.end);
  assert.ok(forms[0].pos > home.indexOf("<p>{heroBody}</p>"));
});

function cssRule(selector: string, media?: string) {
  const result: Record<string, string> = {};
  postcss.parse(styles).walkRules(selector, (rule) => {
    const parent = rule.parent;
    const query = parent?.type === "atrule" ? parent.params : undefined;
    if (query !== media) return;
    rule.walkDecls((decl) => { result[decl.prop] = decl.value; });
  });
  return result;
}

test("uses an in-flow pill over the hero with a decorative gradient shadow", () => {
  assert.equal(cssRule(".hero").height, "auto");
  assert.equal(cssRule(".heroShell")["flex-direction"], "column");
  assert.equal(cssRule(".finderCard")["border-radius"], "999px");
  assert.equal(cssRule(".finderCard > button")["border-radius"], "999px");
  const shadow = cssRule(".finderZone::before");
  assert.match(shadow.background, /linear-gradient/);
  assert.match(shadow.filter, /blur\(/);
  assert.equal(shadow["pointer-events"], "none");
  assert.equal(cssRule(".finderZone").background, undefined);
  assert.equal(cssRule(".finderZone")["margin-top"], undefined);
});

test("keeps the compact finder left-aligned with the hero copy and photo space below", () => {
  const zone = cssRule(".finderZone");
  const shell = cssRule(".heroShell");
  assert.equal(zone.width, "min(768px, 100%)");
  assert.equal(zone["align-self"], "flex-start");
  assert.equal(shell["justify-content"], "flex-start");
  assert.equal(shell["padding-block"], "80px 112px");
  assert.equal(shell.gap, "40px");
  assert.equal(cssRule(".finderCard").padding, "8px 10px 8px 24px");
  assert.equal(cssRule(".finderCard > button")["min-width"], "156px");
});

test("homepage offsets only the real header height without a white strip above the hero", () => {
  const shell = readFileSync(new URL("../components/website/clean/CleanShell.module.css", import.meta.url), "utf8");
  const headerHeight = shell.match(/\.header\s*\{[^}]*\bheight:\s*(\d+px);/)?.[1];
  assert.equal(headerHeight, "68px");
  assert.equal(cssRule(".home")["padding-top"], headerHeight);
  assert.equal(cssRule(".home", "(max-width: 920px)")["padding-top"], undefined);
});

test("mobile finder stays rounded and stacked without fixed-height clipping or offsets", () => {
  const mobile = "(max-width: 759px)";
  assert.equal(cssRule(".finderCard", mobile)["grid-template-columns"], "minmax(0, 1fr)");
  assert.equal(cssRule(".finderCard", mobile)["border-radius"], "28px");
  assert.equal(cssRule(".finderCard", mobile)["margin-top"], undefined);
  assert.equal(cssRule(".hero", mobile).height, undefined);
  assert.equal(cssRule(".hero", "(min-width: 921px)").height, undefined);
  assert.equal(cssRule(".finderCard", "(max-width: 1040px)")["grid-template-columns"], undefined);
});
