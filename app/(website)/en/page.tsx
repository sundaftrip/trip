import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "@/components/website/clean/PreserveScrollLink";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import supportStyles from "@/components/website/clean/SupportPages.module.css";
import doc from "@/components/website/clean/DocFormat.module.css";
import { prisma } from "@/lib/prisma";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import { withPageSocialMetadata } from "@/lib/site-metadata";
import { publicTourVisibilityWhere } from "@/lib/public-tours";
import { isCrawlTourBookable } from "@/lib/crawl-catalog";
import { SUNDAF_TRANSFER_INSTRUCTIONS } from "@/lib/company-transfer";
import {
  SUNDAF_AHU_REGISTRATION,
  SUNDAF_DMC,
  appointmentOnlyOfficeAddress,
} from "@/lib/business-identity";
import { englishTourFacts, formatIdrEnglish } from "@/lib/english-overview";

// Edits in the CMS purge this page through revalidatePublicContent(); the hour
// is only a safety net, matching the other public pages.
export const revalidate = 3600;

const SITE_URL = "https://sundaftrip.com";
const PAGE_URL = `${SITE_URL}/en`;
const TITLE = "Sundaf Trip in English: Russia, Central Asia and Northern Lights Trips from Indonesia";
const DESCRIPTION =
  "English overview of Sundaf Trip, an Indonesian travel company (CV Sundaf Holiday Group) running group and private trips to Russia, the northern lights in Murmansk, Central Asia and beyond, with visa assistance for Indonesian passport holders.";

export const metadata: Metadata = withPageSocialMetadata({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
});

const getCompany = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: { key: { in: ["company_nib", "company_whatsapp", "company_phone", "company_email", "company_address"] } },
      });
      return Object.fromEntries(rows.filter((row) => row.value).map((row) => [row.key, row.value])) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  },
  ["english-overview-company-v1"],
  { revalidate: 3600, tags: ["company-info"] },
);

async function getUpcomingTours(now: Date) {
  try {
    const tours = await prisma.tour.findMany({
      where: {
        AND: [
          publicTourVisibilityWhere(),
          { status: { not: "FULL" } },
          { OR: [{ tripDate: null }, { tripDate: { gt: now } }] },
        ],
      },
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true, duration: true,
        tripDate: true, price: true, promoPrice: true, addOns: true, hotel: true, status: true, badge: true,
      },
      orderBy: { tripDate: "asc" },
      take: 20,
    });
    return tours.filter((tour) => isCrawlTourBookable(tour, now)).map((tour) => englishTourFacts(tour, now));
  } catch {
    return [];
  }
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits.startsWith("8") ? `62${digits}` : digits;
  return normalized ? `https://wa.me/${normalized}` : "";
}

const SERVICES = [
  {
    title: "Open trips on fixed dates",
    body: "Small groups that depart from Indonesia on published dates, with an Indonesian-speaking tour leader. Russia (Moscow, Saint Petersburg, Murmansk and Teriberka for the northern lights) is the core programme, alongside Central Asia, Vietnam, Japan and Canada.",
  },
  {
    title: "Private and custom trips",
    body: "Itineraries planned for families, companies and private groups, with dates, pace and budget set around the group.",
  },
  {
    title: "Visa document assistance",
    body: "Help for Indonesian passport holders preparing visa applications, including Russia, Schengen Europe, the United States and Canada. Approval is always decided by the embassy, consulate or immigration authority.",
  },
  {
    title: "Ground services in Russia",
    body: "Halal Indonesian catering in Moscow and Saint Petersburg, transport, Indonesian-speaking guides and practical help on the ground, confirmed in writing before booking.",
  },
  {
    title: "Latin America 2027",
    body: "Group programmes to Peru, and to Brazil, Colombia, Peru and Chile, with or without flights from Jakarta.",
  },
];

const BOOKING_STEPS = [
  "Ask about a route or date on WhatsApp or by email. An initial consultation does not hold seats or take payment.",
  "Receive the itinerary, departure date, included services, mandatory costs and optional extras in writing.",
  "Pay only after you agree to the details. Every payment instruction comes from an official Sundaf Trip channel.",
  SUNDAF_TRANSFER_INSTRUCTIONS.en,
];

const USEFUL_PAGES = [
  { href: "/tours", label: "All departures and prices", note: "in Indonesian" },
  { href: "/open-trip-aurora-rusia", label: "Northern lights trips in Russia", note: "in Indonesian" },
  { href: "/tour-rusia-dari-indonesia", label: "Russia tours from Indonesia", note: "in Indonesian" },
  { href: "/visa", label: "Visa requirements by country", note: "in Indonesian" },
  { href: "/reviews", label: "Traveller reviews", note: "in Indonesian" },
  { href: "/legalitas-dan-keamanan", label: "Legal identity and booking safety", note: "in Indonesian" },
];

export default async function EnglishOverviewPage() {
  const now = new Date();
  const [company, tours] = await Promise.all([getCompany(), getUpcomingTours(now)]);
  const nib = company.company_nib || "1601260060842";
  const email = company.company_email || "info@sundaftrip.com";
  const whatsapp = company.company_whatsapp || company.company_phone || "+62 817-7520-2759";
  const waHref = whatsappHref(whatsapp);
  const whatsappDisplay = waHref ? `+${waHref.replace("https://wa.me/", "")}` : whatsapp;
  const office = appointmentOnlyOfficeAddress(company.company_address);

  const facts = [
    { label: "Brand", value: "Sundaf Trip (spelled with an f: Sundaf)" },
    { label: "Operated by", value: "CV Sundaf Holiday Group" },
    { label: "Business registration (NIB)", value: nib },
    { label: "Ministry of Law registration", value: SUNDAF_AHU_REGISTRATION.number, href: SUNDAF_AHU_REGISTRATION.verificationUrl },
    { label: "Official website", value: SITE_URL, href: SITE_URL },
    { label: "WhatsApp", value: whatsappDisplay, href: waHref || undefined },
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "Service hours", value: "Monday to Friday, 09:00 to 17:00 Western Indonesia Time (UTC+7)" },
    { label: "Office (by appointment only)", value: office },
    { label: "Languages", value: "Indonesian and English" },
  ];

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@id": `${SITE_URL}#organization` },
    publisher: { "@id": `${SITE_URL}#organization` },
    ...(tours.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            name: "Upcoming Sundaf Trip departures",
            itemListElement: tours.map((tour, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: { "@id": `${SITE_URL}${tour.path}#trip`, url: `${SITE_URL}${tour.path}`, name: tour.title },
            })),
          },
        }
      : {}),
  };

  return (
    <div lang="en" className={`${supportStyles.atlasPage} min-h-screen`} style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "English overview", url: "/en" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageSchema) }} />

      <section className={supportStyles.hero} aria-labelledby="en-page-title">
        <p className={doc.eyebrow}>English overview / Sundaf Trip</p>
        <h1 id="en-page-title" className={`${doc.title} ${supportStyles.title}`}>
          Sundaf Trip: Russia, Central Asia and northern lights trips from Indonesia
        </h1>
        <p className={`${doc.lead} ${supportStyles.lede} mt-6`}>
          Sundaf Trip is an Indonesian travel company operated by CV Sundaf Holiday Group. We run small-group open trips and
          private journeys for Indonesian travellers, mainly to Russia, with halal-friendly meals, time for prayers and
          Indonesian-speaking tour leaders, and we help Indonesian passport holders prepare their visa applications.
        </p>
      </section>

      <section className={supportStyles.section} aria-labelledby="en-facts-title">
        <h2 id="en-facts-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Company at a glance</h2>
        <table className={`${doc.table} ${supportStyles.factsTable}`}>
          <tbody>
            {facts.map(({ label, value, href }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={doc.textLink}>
                      {value}
                    </a>
                  ) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={supportStyles.section} aria-labelledby="en-services-title">
        <h2 id="en-services-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>What we do</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SERVICES.map((service) => (
            <article key={service.title} className="at-card p-5">
              <h3 className={supportStyles.cardTitleSmall}>{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={supportStyles.section} aria-labelledby="en-departures-title">
        <h2 id="en-departures-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Upcoming departures</h2>
        {tours.length ? (
          <>
            <div className="overflow-x-auto">
              <table className={doc.table}>
                <thead>
                  <tr>
                    <th scope="col">Trip</th>
                    <th scope="col">Departure</th>
                    <th scope="col">From, per person</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour) => (
                    <tr key={tour.path}>
                      <td>
                        <Link href={tour.path} className={doc.textLink}>{tour.title}</Link>
                        <div className="text-sm" style={{ color: "var(--at-subtext)" }}>
                          {[tour.country, tour.route, tour.statusLabel].filter(Boolean).join(" · ")}
                        </div>
                      </td>
                      <td>
                        {tour.departure}
                        <div className="text-sm" style={{ color: "var(--at-subtext)" }}>{tour.duration ?? "Length on trip page"}</div>
                      </td>
                      <td>
                        {tour.fromPrice ? formatIdrEnglish(tour.fromPrice) : "On request"}
                        {tour.includesMandatoryAddOns ? <div className="text-sm" style={{ color: "var(--at-subtext)" }}>incl. mandatory extras</div> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Prices are in Indonesian rupiah (IDR). Each trip page lists room options, mandatory costs, exclusions and
              optional activities. Availability and prices are confirmed in writing before payment.
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
            New departures are published on the <Link href="/tours" className={doc.textLink}>tours page</Link>.
          </p>
        )}
      </section>

      <section className={supportStyles.section} aria-labelledby="en-booking-title">
        <h2 id="en-booking-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>How booking and payment work</h2>
        <ol className={supportStyles.docList}>
          {BOOKING_STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className={supportStyles.section} aria-labelledby="en-dmc-title">
        <h2 id="en-dmc-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>For foreign tour operators</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Our sister brand <a href={SUNDAF_DMC.url} className={doc.textLink}>{SUNDAF_DMC.name}</a>, run by the same company,
          is an {SUNDAF_DMC.descriptionEn.charAt(0).toLowerCase()}{SUNDAF_DMC.descriptionEn.slice(1)}.
        </p>
      </section>

      <section className={supportStyles.section} aria-labelledby="en-pages-title">
        <h2 id="en-pages-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Useful pages</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {USEFUL_PAGES.map((page) => (
            <Link key={page.href} href={page.href} className="at-card p-5 transition hover:opacity-80">
              <h3 className={supportStyles.cardTitleSmall}>{page.label}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--at-subtext)" }}>{page.note}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
