import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function sourceBetween(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing source marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("visa creation alias permanently redirects to the canonical service page", () => {
  const source = readSource("next.config.ts");
  const redirect = sourceBetween(
    source,
    'source: "/jasa-pembuatan-visa"',
    "},",
  );

  assert.match(redirect, /destination: "\/jasa-urus-visa-terpercaya"/);
  assert.match(redirect, /permanent: true/);
});

test("canonical visa service page has focused metadata and an Indonesia Service schema", () => {
  const source = readSource("app/(website)/jasa-urus-visa-terpercaya/page.tsx");
  const metadata = sourceBetween(source, "export const metadata", "const faqs");
  const schema = sourceBetween(source, "const serviceSchema", "export default function");

  assert.match(metadata, /title: "Jasa Pembuatan Visa untuk WNI"/);
  assert.match(metadata, /alternates: \{ canonical: CANONICAL_PATH \}/);
  assert.match(metadata, /url: PAGE_URL/);

  assert.match(schema, /"@type": "Service"/);
  assert.match(schema, /name: "Jasa Pembuatan Visa Sundaf Trip"/);
  assert.match(schema, /serviceType:/);
  assert.match(schema, /areaServed:/);
  assert.match(schema, /"@type": "Country"/);
  assert.match(schema, /name: "Indonesia"/);
  assert.match(schema, /audienceType: "Pemegang paspor Indonesia"/);
  assert.match(schema, /availableChannel:/);
  assert.doesNotMatch(schema, /"@type": "LocalBusiness"/);
  assert.doesNotMatch(schema, /\baddress\s*:/);

  assert.match(source, /secara online/i);
  assert.match(source, /tidak (?:mengandalkan|memiliki) kantor walk-in/i);
  assert.match(source, /tidak dapat menjamin approval/i);
});

test("organization schema declares service area without fabricating a physical location", () => {
  const source = readSource("components/website/OrganizationSchema.tsx");

  assert.match(source, /"@type": "Organization"/);
  assert.match(source, /areaServed: \{ "@type": "Country", name: "Indonesia" \}/);
  assert.match(source, /"Jasa pembuatan visa untuk WNI"/);
  assert.doesNotMatch(source, /company_address/);
  assert.doesNotMatch(source, /"@type": "PostalAddress"/);
  assert.doesNotMatch(source, /"@type": "GeoCoordinates"/);
  assert.doesNotMatch(source, /\bopeningHours(?:Specification)?\s*:/);
  assert.doesNotMatch(source, /\baddress\s*:/);
  assert.doesNotMatch(source, /\bgeo\s*:/);

  for (const relativePath of [
    "components/website/OrganizationSchema.tsx",
    "app/(website)/media-kit/page.tsx",
  ]) {
    assert.doesNotMatch(
      readSource(relativePath),
      /"@type"\s*:\s*(?:"TravelAgency"|\[[^\]]*"TravelAgency")/,
      `${relativePath} must not imply a location-based TravelAgency entity`,
    );
  }
});

test("retired static Vietnam landing redirects to the canonical page", () => {
  const source = readSource("next.config.ts");
  const redirect = sourceBetween(source, 'source: "/vietnam"', "},");

  assert.match(redirect, /destination: "\/open-trip-vietnam"/);
  assert.match(redirect, /permanent: true/);
  assert.equal(existsSync(path.join(repositoryRoot, "public/vietnam/index.html")), false);
  assert.equal(existsSync(path.join(repositoryRoot, "public/vietnam/sitemap.xml")), false);
  assert.doesNotMatch(readSource("public/robots.txt"), /\/vietnam\/sitemap\.xml/);
});

test("robots rules keep public content crawlable without exempting named bots from private paths", () => {
  const source = readSource("public/robots.txt");
  const groups = source.match(/^User-agent:/gm) ?? [];

  assert.equal(groups.length, 1);
  assert.match(source, /^User-agent: \*$/m);
  assert.match(source, /^Allow: \/$/m);
  for (const pathName of ["studio", "receipt", "admin", "api"]) {
    assert.match(source, new RegExp(`^Disallow: /${pathName}$`, "m"));
  }
});

test("public contact surfaces show an appointment-only office without adding it to organization schema", () => {
  const identity = readSource("lib/business-identity.ts");
  assert.match(identity, /Epiwalk Office Suite Lt\. 5 Unit A501/);
  assert.match(identity, /APPOINTMENT_ONLY_LABEL = "Appointment only"/);

  for (const relativePath of [
    "components/website/ContactSection.tsx",
    "components/website/clean/CleanFooter.tsx",
    "app/(website)/legalitas-dan-keamanan/page.tsx",
    "app/(website)/media-kit/page.tsx",
  ]) {
    const source = readSource(relativePath);
    assert.match(
      source,
      /APPOINTMENT_ONLY_(?:LABEL|OFFICE_ADDRESS)/,
      `${relativePath} must expose the appointment-only office information`,
    );
  }

  const organizationSchema = readSource("components/website/OrganizationSchema.tsx");
  assert.doesNotMatch(organizationSchema, /APPOINTMENT_ONLY_OFFICE_ADDRESS/);
  assert.doesNotMatch(organizationSchema, /company_address/);
});
