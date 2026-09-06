import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import postcss from "postcss";

const navbar = readFileSync(new URL("../components/website/clean/CleanNavbar.tsx", import.meta.url), "utf8");
const css = postcss.parse(readFileSync(new URL("../components/website/clean/CleanShell.module.css", import.meta.url), "utf8"));

function declarations(selector: string) {
  const values: Record<string, string> = {};
  css.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls((declaration) => { values[declaration.prop] = declaration.value; });
    }
  });
  return values;
}

test("desktop CTA shares plain text navigation styling without a card or moving overlay", () => {
  assert.deepEqual(declarations(".desktopNav a.desktopAction"), {});
  const link = declarations(".desktopNav a");
  assert.equal(link.color, "var(--shell-ink-soft)");
  assert.match(link.transition, /^color /);
  assert.doesNotMatch(JSON.stringify(link), /background|box-shadow|gradient|translate|scale|cubic-bezier/);
  assert.doesNotMatch(navbar, /desktopNavIndicator|updateDesktopIndicator|desktopLinkRefs|selectedDesktopHref|ResizeObserver|useLayoutEffect/);
});

test("navigation uses quiet hover text and an underline for the active route", () => {
  assert.deepEqual(declarations(".desktopNav a.desktopAction:hover"), {});
  assert.deepEqual(declarations(".desktopNav a:hover"), { color: "var(--shell-primary)" });
  assert.deepEqual(declarations('.desktopNav a[aria-current="page"]'), { color: "var(--shell-primary)" });
  const underline = declarations('.desktopNav a[aria-current="page"]::after');
  assert.equal(underline.height, "2px");
  assert.equal(underline.background, "currentColor");
  assert.doesNotMatch(css.toString(), /desktopNavIndicator|desktop-indicator|data-selected/);
});

test("keeps desktop sizing, keyboard focus and real route semantics", () => {
  assert.equal(declarations(".desktopNav a")["min-height"], "44px");
  assert.equal(declarations(".desktopNav a:focus-visible").outline, "2px solid var(--shell-primary)");
  assert.match(navbar, /const desktopActionLink = \{ href: "\/tours", label: "Lihat jadwal & biaya" \}/);
  assert.match(navbar, /aria-current=\{isActive\(link\.href\) \? "page" : undefined\}/);
  assert.match(navbar, /href=\{link\.href\}\s+scroll=\{false\}/);
  assert.match(navbar, /const desktopNavigationLinks = \[\.\.\.desktopLinks, desktopActionLink\]/);
});

test("keeps mobile menu and desktop breakpoint independent of the CTA styling", () => {
  const action = css.nodes.flatMap((node) => node.type === "atrule" && node.name === "media" && node.params === "(min-width: 1024px)"
    ? (node.nodes ?? []).filter((child) => child.type === "rule" && child.selector === ".desktopNav a") : []);
  assert.equal(action.length, 1);
  assert.match(navbar, /aria-controls="clean-mobile-drawer"/);
  assert.match(navbar, /if \(!open\) return/);
  assert.match(navbar, /previouslyFocused\.focus\(\{ preventScroll: true \}\)/);
});
