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

test("desktop CTA is painted as solid teal without a measured or moving overlay", () => {
  const action = declarations(".desktopNav a.desktopAction");
  assert.equal(action.background, "var(--shell-primary)");
  assert.equal(action.color, "var(--shell-white)");
  assert.equal(action["box-shadow"], "none");
  assert.doesNotMatch(JSON.stringify(action), /gradient|translate|scale|cubic-bezier/);
  assert.doesNotMatch(navbar, /desktopNavIndicator|updateDesktopIndicator|desktopLinkRefs|selectedDesktopHref|ResizeObserver|useLayoutEffect/);
});

test("CTA hover and active routes keep legible text without moving the button", () => {
  const hover = declarations(".desktopNav a.desktopAction:hover");
  assert.equal(hover.background, "var(--shell-primary-strong)");
  assert.equal(hover.color, "var(--shell-white)");
  assert.ok(!hover.transform || hover.transform === "none");
  assert.equal(declarations('.desktopNav a[aria-current="page"]').color, "var(--shell-primary)");
  assert.doesNotMatch(css.toString(), /desktopNavIndicator|desktop-indicator|data-selected/);
});

test("keeps desktop sizing, keyboard focus and real route semantics", () => {
  assert.equal(declarations(".desktopNav a")["min-height"], "44px");
  assert.equal(declarations(".desktopNav a.desktopAction")["border-radius"], "999px");
  assert.equal(declarations(".desktopNav a:focus-visible").outline, "3px solid var(--shell-aurora)");
  assert.match(navbar, /const desktopActionLink = \{ href: "\/tours", label: "Lihat jadwal & biaya" \}/);
  assert.match(navbar, /aria-current=\{isActive\(link\.href\) \? "page" : undefined\}/);
  assert.match(navbar, /href=\{link\.href\}\s+scroll=\{false\}/);
  assert.match(navbar, /const desktopNavigationLinks = \[\.\.\.desktopLinks, desktopActionLink\]/);
});

test("keeps mobile menu and desktop breakpoint independent of the CTA styling", () => {
  const action = css.nodes.flatMap((node) => node.type === "atrule" && node.name === "media" && node.params === "(min-width: 1024px)"
    ? (node.nodes ?? []).filter((child) => child.type === "rule" && child.selector === ".desktopNav a.desktopAction") : []);
  assert.equal(action.length, 1);
  assert.match(navbar, /aria-controls="clean-mobile-drawer"/);
  assert.match(navbar, /if \(!open\) return/);
  assert.match(navbar, /previouslyFocused\.focus\(\{ preventScroll: true \}\)/);
});
