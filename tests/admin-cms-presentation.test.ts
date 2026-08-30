import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import postcss from "postcss";
import ts from "typescript";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const shell = read("components/admin/AdminShell.tsx");
const actions = read("components/admin/StickyFormActions.tsx");
const cssPath = new URL("../components/admin/AdminWorkspace.module.css", import.meta.url);
const css = postcss.parse(existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "");

function declarations(selector: string) {
  const values: Record<string, string> = {};
  css.walkRules((rule) => {
    if (rule.selectors.includes(selector)) rule.walkDecls((decl) => { values[decl.prop] = decl.value; });
  });
  return values;
}

test("CMS has an isolated neutral workspace with readable type and no decorative effects", () => {
  assert.match(shell, /className=\{styles\.workspace\}/);
  assert.match(declarations(".workspace")["font-family"], /system-ui/);
  assert.doesNotMatch(css.toString(), /gradient\(|backdrop-filter|text-shadow/);
  assert.equal(declarations(".formSection")["border-radius"], "0");
  assert.equal(declarations(".formSection")["box-shadow"], "none");
  assert.equal(declarations(".content :global(.input)")["font-family"], "inherit");
  assert.equal(declarations(".content :global(.input)")["min-height"], undefined);
  assert.equal(declarations(".content :global(input.input)")["min-height"], "40px");
});

test("mobile navigation has names, route state, modal focus and a working close path", () => {
  assert.match(shell, /aria-label="Buka menu CMS"/);
  assert.match(shell, /aria-expanded=\{sidebarOpen\}/);
  assert.match(shell, /aria-controls="admin-mobile-navigation"/);
  assert.match(shell, /aria-label="Tutup menu CMS"/);
  assert.match(shell, /role="dialog"[\s\S]{0,150}aria-modal="true"/);
  assert.match(shell, /event\.key === "Escape"/);
  assert.match(shell, /event\.key !== "Tab"/);
  assert.match(shell, /focus\(\{ preventScroll: true \}\)/);
  assert.match(shell, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(shell, /role === "SUPERADMIN"/);
  assert.match(shell, /signOut\(\{ callbackUrl: "\/admin\/login" \}\)/);
});

test("login stays on the existing auth flow with connected labels and flat presentation", () => {
  const login = read("app/admin/login/page.tsx");
  assert.doesNotMatch(login, /gradient|shadow-xl|rounded-2xl/);
  assert.match(login, /htmlFor="cms-email"/);
  assert.match(login, /autoComplete="username"/);
  assert.match(login, /autoComplete="current-password"/);
  assert.match(login, /signIn\("credentials", \{/);
  assert.match(login, /window\.location\.assign\("\/admin"\)/);
});

test("save bar is flat and preserves submit, callback, loading and cancel behavior", () => {
  assert.equal(declarations(".saveBar").top, "0");
  assert.doesNotMatch(actions, /backdrop-blur|shadow-sm|bg-white\/95/);
  assert.match(actions, /type=\{onSave \? "button" : "submit"\}/);
  assert.match(actions, /onClick=\{onSave\}/);
  assert.match(actions, /disabled=\{loading \|\| disabled\}/);
  assert.match(actions, /href=\{cancelHref\}/);
  assert.match(actions, /loading \? loadingLabel : primaryLabel/);
});

test("dashboard uses compact metrics and preserves operational counts", () => {
  const dashboard = read("app/admin/page.tsx");
  assert.match(dashboard, /<dl className=\{styles\.metrics\}/);
  assert.doesNotMatch(dashboard, /colorMap|card\.icon|bg-purple|bg-orange/);
  for (const entity of ["tour", "blog", "receipt", "user"]) {
    assert.ok(dashboard.includes(`prisma.${entity}.count()`));
  }
  assert.match(dashboard, /take: 5, orderBy: \{ createdAt: "desc" \}/);
});

test("forms use plain sections with checked saves and serialized request bodies", () => {
  for (const file of ["TourForm", "CountryVisaForm", "BlogForm"]) {
    const form = read(`components/admin/${file}.tsx`);
    assert.match(form, /styles\.formSection/);
    assert.match(form, /onSubmit=\{handleSubmit\}/);
    assert.match(form, /method: isEdit \? "PUT" : "POST"/);
    assert.match(form, /await requestAdminAction\(/);
    assert.match(form, /body: JSON\.stringify\(/);
  }
});

test("list headers wrap and all targeted CMS embellishments are removed", () => {
  for (const file of ["tours", "database-visa", "inquiries", "blog"]) {
    const page = read(`app/admin/${file}/page.tsx`);
    assert.match(page, /styles\.pageHeader/);
    assert.doesNotMatch(page, /bg-gradient|shadow-sm|Sparkles/);
    assert.match(page, /overflow-x-auto/);
  }
  const scraper = read("components/admin/ScrapeVisaButton.tsx");
  assert.doesNotMatch(scraper, /bg-gradient|backdrop-blur|shadow-2xl|Sparkles/);
  assert.match(scraper, /onClick=\{runScrape\}/);
  assert.match(scraper, /onClick=\{\(\) => applyDiff\(d, ch\)\}/);
});

test("moderation header and draft picker are restrained without losing working controls", () => {
  const discussion = read("app/admin/visa-discussions/page.tsx");
  const scraper = read("components/admin/ScraperTool.tsx");
  assert.doesNotMatch(discussion, /bg-gradient|shadow-sm/);
  assert.match(discussion, /styles\.pageHeader/);
  assert.match(discussion, /canModerate=\{canModerate\}/);
  assert.match(discussion, /checkPermission\(session, "visa_discussion_view"\)/);
  assert.match(discussion, /checkPermission\(session, "visa_discussion_moderate"\)/);
  assert.match(discussion, /aria-current=\{active \? "page" : undefined\}/);
  assert.doesNotMatch(scraper, /Sparkles|violet/);
  assert.match(scraper, /aria-pressed=\{active\}/);
  for (const action of ["onClick={handleScrape}", "onClick={rewriteSelected}", "onClick={() => setStyle(s.id)}", "onRewrite={() => rewritePost(post)}"]) {
    assert.ok(scraper.includes(action), `Missing action: ${action}`);
  }
  const tree = ts.createSourceFile("ScraperTool.tsx", scraper, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let buttons = 0;
  function inspect(node: ts.Node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === "button") {
      buttons++;
      assert.ok(node.children.some((child) => !ts.isJsxText(child) || child.text.trim().length > 0), "Empty decorative button found");
    }
    ts.forEachChild(node, inspect);
  }
  inspect(tree);
  assert.equal(buttons, 5);
});
