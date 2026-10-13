import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the Sundaf DMC document format is shared by the public pages", () => {
  const globals = read("app/globals.css");
  const shell = globals.match(/\.public-site-shell \{([^}]*)\}/)?.[1] ?? "";
  assert.match(shell, /--doc-amber: #eab067;/);
  assert.match(shell, /--doc-green: #2e6751;/);
  // Anchors opened from another page clear the fixed header before hydration too.
  assert.match(globals, /html:has\(\.public-site-shell\) \{\s*scroll-padding-top: 92px;/);

  const doc = read("components/website/clean/DocFormat.module.css");
  const tag = doc.match(/\.tag\.tag\.tag \{([^}]*)\}/)?.[1] ?? "";
  assert.match(tag, /border-radius: 999px 0 0 999px;/);
  assert.match(tag, /background: var\(--doc-amber\);/);
  assert.match(tag, /clip-path: polygon\(0 0, 100% 0, calc\(100% - 18px\) 100%, 0 100%\);/);
  assert.match(doc, /\.table thead th \{[^}]*background: var\(--doc-green\);/);
});

test("the tours catalog uses the document format", () => {
  const catalog = read("components/website/clean/CleanToursCatalog.tsx");
  assert.match(catalog, /import doc from "\.\/DocFormat\.module\.css";/);
  assert.match(catalog, /<p className=\{doc\.eyebrow\}>Jadwal &amp; biaya tour<\/p>/);
  assert.match(catalog, /<h1 id="catalog-page-title" className=\{doc\.title\}>/);
  assert.match(catalog, /<h2 id="catalog-results-title" className=\{doc\.tag\}>/);
  assert.match(catalog, /<h2 id="catalog-faq-title" className=\{doc\.tag\}>/);
  assert.match(catalog, /styles\.consultationRow\} \$\{doc\.boxSand\}/);

  const css = read("components/website/clean/ToursCatalog.module.css");
  assert.doesNotMatch(css.slice(css.indexOf(".consultation {"), css.indexOf(".consultationRow {")), /background: var\(--catalog-navy\)/);
});

test("the catalog header fills the desktop width with a note and three described trip types", () => {
  const catalog = read("components/website/clean/CleanToursCatalog.tsx");
  assert.match(catalog, /<p className=\{styles\.heroLede\}>/);
  assert.match(catalog, /note: "Berangkat bersama grup di tanggal yang sudah ditetapkan\."/);
  assert.match(catalog, /<small>\{tab\.note\}<\/small>/);

  const css = read("components/website/clean/ToursCatalog.module.css");
  // No narrow 860px column on wide screens any more.
  assert.doesNotMatch(css, /\.hero \.shell \{\s*width: min\(860px/);
  assert.match(css, /\.trustCounts \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.trustCounts a\[aria-current="page"\] \{[^}]*background: var\(--doc-green\);/);
  // The old muted paragraph rule must not override the lede.
  assert.doesNotMatch(css, /\.heroLayout > div > p:last-child/);
});

test("the about page uses the document format on the atlas theme", () => {
  const page = read("app/(website)/about/page.tsx");
  assert.match(page, /import CleanAbout from "@\/components\/website\/clean\/CleanAbout";/);
  assert.match(page, /if \(isAtlas\) \{[\s\S]*?<BreadcrumbSchema crumbs=\{crumbs\} \/>[\s\S]*?<CleanAbout/);

  const about = read("components/website/clean/CleanAbout.tsx");
  assert.match(about, /<p className=\{doc\.eyebrow\}>Tentang kami \/ Sundaf Trip<\/p>/);
  assert.match(about, /<h1 id="about-page-title" className=\{`\$\{doc\.title\} \$\{styles\.title\}`\}>/);
  for (const id of ["about-story-title", "about-gallery-title", "about-routes-title", "about-values-title", "about-form-title"]) {
    assert.match(about, new RegExp(`<h2 id="${id}" className=\\{doc\\.tag\\}>`));
  }
  assert.match(about, /<table className=\{`\$\{doc\.table\} \$\{styles\.table\}`\}>/);
  // Anchors and language hints from the previous page stay in place.
  assert.match(about, /id="sundaf-group"/);
  assert.match(about, /className=\{doc\.tag\} data-no-translate translate="no">SUNDAF Holiday Group<\/h2>/);
  assert.match(about, /aria-labelledby="about-company-title" lang="en"/);
  assert.match(about, /<ScrollReveal rootId="about-page" \/>/);

  const css = read("components/website/clean/CleanAbout.module.css");
  const fade = css.match(/@keyframes about-fade \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(fade, /opacity: 0/);
  assert.doesNotMatch(fade, /transform/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
});

test("the journal uses the document format on the atlas theme", () => {
  const index = read("app/(website)/blog/page.tsx");
  assert.match(index, /if \(theme === "atlas"\) \{[\s\S]*?<CleanBlogIndex posts=\{posts\} categories=\{categoryOptions\} description=\{BLOG_DESC\} \/>/);
  const article = read("app/(website)/blog/[slug]/page.tsx");
  // The article keeps its breadcrumb and JSON-LD in the new layout.
  assert.match(article, /if \(isAtlas\) \{[\s\S]*?\{structuredData\}\s*<CleanBlogArticle/);

  const cleanIndex = read("components/website/clean/CleanBlogIndex.tsx");
  assert.match(cleanIndex, /<p className=\{doc\.eyebrow\}>Jurnal \/ Sundaf Trip<\/p>/);
  assert.match(cleanIndex, /appearance="doc"/);
  const filter = read("app/(website)/blog/BlogCategoryFilter.tsx");
  assert.match(filter, /data-filtered=\{selectedCategory === null \? undefined : "true"\}/);

  const cleanArticle = read("components/website/clean/CleanBlogArticle.tsx");
  assert.match(cleanArticle, /<h2 id="blog-tours-title" className=\{doc\.tag\}>/);
  assert.match(cleanArticle, /<h2 id="blog-related-title" className=\{doc\.tag\}>/);
  assert.match(cleanArticle, /<BlogArticleToc headings=\{headings\} appearance="doc" \/>/);
  assert.match(cleanArticle, /variant="doc"/);

  const css = read("components/website/clean/CleanBlog.module.css");
  // Section titles inside the article are amber tags with one cut corner.
  const h2 = css.match(/\.body\.body\.body :global\(h2\) \{([^}]*)\}/)?.[1] ?? "";
  assert.match(h2, /background: var\(--doc-amber\);/);
  assert.match(h2, /clip-path: polygon\(0 0, 100% 0, calc\(100% - 18px\) 100%, 0 100%\);/);
  assert.match(css, /\.body :global\(ul\) \{\s*list-style: disc;/);
  assert.match(css, /\.body :global\(ol\) \{\s*list-style: decimal;/);
  assert.doesNotMatch(css, /border-left/);
});

test("journal tour suggestions lead with the subtotal and bookable trips", () => {
  const article = read("app/(website)/blog/[slug]/page.tsx");
  assert.match(article, /mandatoryTotal: mandatoryAddOnsTotal\(resolveCanadaRockiesAddOns\(tour\.addOns, tour\.slug\)\)/);
  assert.match(article, /\.\.\.ctaTours\.filter\(\(tour\) => tour\.state !== "sold"\)/);
  const cleanArticle = read("components/website/clean/CleanBlogArticle.tsx");
  assert.match(cleanArticle, /<CleanTourCard key=\{tour\.id\} tour=\{tour\} compact catalog \/>/);
});

test("support pages and the FAQ use the document format on the atlas theme", () => {
  const support = read("components/website/clean/SupportPages.module.css");
  assert.match(support, /--support-primary: var\(--doc-green, #2e6751\);/);
  const card = support.match(/\.atlasPage :global\(\.at-card\) \{([^}]*)\}/)?.[1] ?? "";
  assert.match(card, /border: 0;/);
  assert.match(card, /background: var\(--doc-sand, #f5f5ef\);/);
  // Legal text (terms) gets amber tags for its sections.
  assert.match(support, /\.proseContent\.proseContent :global\(h2\) \{[^}]*background: var\(--doc-amber, #eab067\);/);

  for (const page of ["reviews", "legalitas-dan-keamanan", "privacy", "terms", "contact"]) {
    const source = read(`app/(website)/${page}/page.tsx`);
    assert.match(source, /className=\{doc\.eyebrow\}|isAtlas \? doc\.eyebrow/, page);
    assert.match(source, /doc\.title/, page);
  }
  const legal = read("app/(website)/legalitas-dan-keamanan/page.tsx");
  assert.match(legal, /<table className=\{`\$\{doc\.table\} \$\{supportStyles\.factsTable\}`\}>/);
  assert.match(legal, /<h2 id="legal-facts-title" className=\{`\$\{doc\.tag\} \$\{supportStyles\.tagBlock\}`\}>/);

  const contact = read("components/website/ContactSection.tsx");
  assert.match(contact, /<h2 id="contact-section-title" className=\{`\$\{doc\.tag\} \$\{supportStyles\.tagBlock\}`\}>Kanal resmi<\/h2>/);

  const faq = read("app/(website)/faq/page.tsx");
  assert.match(faq, /if \(isAtlas\) \{[\s\S]*?appearance="doc"/);
  const explorer = read("app/(website)/faq/FaqExplorer.tsx");
  assert.match(explorer, /<h2 id=\{`\$\{section\.id\}-title`\} className=\{doc\.tag\}>/);
  const faqCss = read("app/(website)/faq/FaqDoc.module.css");
  assert.match(faqCss, /\.item:nth-child\(even\) \{\s*background: var\(--doc-sand\);/);
});
