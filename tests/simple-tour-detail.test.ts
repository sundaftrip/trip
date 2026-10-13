import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const source = read("components/website/clean/CleanTourDetail.tsx");
const styles = read("components/website/clean/CleanSite.module.css");
const tabs = read("components/website/clean/TourDetailTabs.tsx");
const tabStyles = read("components/website/clean/TourDetailInteractive.module.css");

test("tour detail opens with the photo carousel, then text-first information", () => {
  const gallery = source.indexOf('<TourHeroGallery images={heroImages} title={tour.title} variant="top" />');
  const hero = source.indexOf("<section className={styles.detailHero}");
  assert.ok(gallery > 0 && hero > gallery, "carousel sits above the title block");

  // Itinerary is a plain, always-open day list (no per-day accordion).
  assert.match(source, /<ol className=\{styles\.detailItinerary\}>/);
  assert.match(source, /<h3><span>Hari \{item\.day\}<\/span> \/ \{dayTitle\}<\/h3>/);
  assert.match(source, /<div className=\{styles\.detailDayMeta\}>/);
  assert.doesNotMatch(source, /<StableDetails className=\{styles\.detailDay\}/);

  // Included / not included stay colour coded; reviews only show when published.
  assert.match(source, /className=\{styles\.detailIncludedBox\}/);
  assert.match(source, /className=\{styles\.detailExcludedBox\}/);
  assert.match(source, /\{reviews\.length > 0 && \(\s*<section className=\{styles\.detailContentSection\} id="ulasan"/);
});

test("days are separated by thin rules instead of a coloured side line", () => {
  const day = styles.match(/\n\.detailDay \{([^}]*)\}/)?.[1] ?? "";
  assert.ok(day, "detailDay rule exists");
  assert.doesNotMatch(day, /border-left/);
  assert.match(styles, /\.detailDay \+ \.detailDay \{ border-top: 1px solid var\(--clean-line\); \}/);
  assert.doesNotMatch(styles, /detailDayPill|#20b8b5/);
});

test("parts follow the order itinerary, price & date, include & exclude, payment terms", () => {
  const order = ['id="itinerary"', 'id="harga-tanggal"', 'id="fasilitas"', 'id="pembayaran"'].map((id) => source.indexOf(id));
  assert.ok(order.every((index) => index > 0), "every part is rendered");
  assert.deepEqual([...order].sort((a, b) => a - b), order);

  const tabBlock = source.slice(source.indexOf("const sectionTabs = ["), source.indexOf("].filter((item) => item.show)"));
  const tabIds = [...tabBlock.matchAll(/id: "([a-z-]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tabIds, ["itinerary", "harga-tanggal", "fasilitas", "pembayaran"]);
  assert.match(source, /label: hasPaymentTerms \? "Term Pembayaran" : "Ketentuan"/);
});

test("follows the Sundaf DMC portfolio format", () => {
  const tokens = styles.match(/\n\.tourDetail \{(\s*--doc-[^}]*)\}/)?.[1] ?? "";
  assert.match(tokens, /--doc-amber: #eab067;/);
  assert.match(tokens, /--doc-green: #2e6751;/);

  // Section titles: amber highlighter tag, rounded on the left, cut at an angle on the right.
  const tag = styles.match(/\.tourDetail\.tourDetail \.detailSectionTitle \{([^}]*)\}/)?.[1] ?? "";
  assert.match(tag, /border-radius: 999px 0 0 999px;/);
  assert.match(tag, /background: var\(--doc-amber\);/);
  assert.match(tag, /text-transform: uppercase;/);
  assert.match(tag, /clip-path: polygon\(0 0, 100% 0, calc\(100% - 18px\) 100%, 0 100%\);/);

  // Tables with a dark green header row and tinted rows.
  assert.match(source, /<table className=\{styles\.detailDocTable\}>/);
  assert.match(source, /<th scope="col">Tahap<\/th><th scope="col">Jatuh tempo<\/th><th scope="col">Nominal<\/th>/);
  assert.match(styles, /\.detailDocTable thead th \{[^}]*background: var\(--doc-green\);/);
  assert.match(styles, /\.detailRoomPriceLegend \{[^}]*float: left;[^}]*background: var\(--doc-green, #2e6751\);/);
  assert.match(source, /eyebrow: `\$\{tripType\} \/ \$\{tour\.country\}`/);
});

test("keeps the page plain: no section icons, FAQ filler or decorative boxes", () => {
  assert.doesNotMatch(source, /className=\{styles\.detailSectionTitle\}[^>]*>\s*<[A-Z]/);
  assert.doesNotMatch(source, /tourFaqs|Pertanyaan umum|Simpan dan bandingkan|Masih ingin membandingkan|detailHeroCta|detailRouteLine/);
  assert.doesNotMatch(source, /detailHeroIntro|detailSectionKicker|detailNoteBox|detailMobileUtilities|detailDayPill/);
  assert.doesNotMatch(source, /\b(Compass|Route|CalendarDays|ListChecks|BedDouble|Info|Wallet|CircleHelp|MapPin|Clock|Users)\b/);
});

test("phones get short tabs that fit on one row", () => {
  assert.match(source, /label: "Harga & Tanggal", shortLabel: "Harga"/);
  assert.match(tabs, /<span className=\{styles\.tabLabelShort\}>\{tab\.shortLabel \|\| tab\.label\}<\/span>/);
  const phone = tabStyles.slice(tabStyles.indexOf("@media (max-width: 700px)"));
  assert.match(phone, /\.tabLabel \{\s*display: none;\s*\}/);
  assert.match(phone, /\.tabLabelShort \{\s*display: inline;\s*\}/);
  assert.match(tabs, /trackSundafEvent\("tour_view"/);
});

test("motion is light, optional, and never hides the booking bar", () => {
  assert.match(source, /<ScrollReveal rootId="tour-detail" key=\{tour\.id\} \/>/);
  assert.match(source, /<div className=\{styles\.tourDetail\} id="tour-detail">/);
  // The fixed mobile booking bar renders inside the price section: no transform or fade there.
  assert.doesNotMatch(source, /id="harga-tanggal"[^>]*data-reveal/);
  assert.match(source, /<li className=\{styles\.detailDay\} key=\{`[^`]+`\} data-reveal>/);

  const motion = styles.slice(styles.indexOf("/* Tour detail motion (ScrollReveal)"));
  assert.match(motion, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.tourDetail\[data-reveal-ready\] \[data-reveal\]/);
  assert.match(motion, /@media print \{\s*\.tourDetail \[data-reveal\]/);
  assert.match(read("components/website/clean/ScrollReveal.tsx"), /prefers-reduced-motion: reduce/);
});
