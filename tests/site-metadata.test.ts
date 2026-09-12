import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_OG_IMAGE, withPageSocialMetadata } from "../lib/site-metadata";

test("page social cards use the page identity and a usable fallback image", () => {
  const result = withPageSocialMetadata({
    title: "Tentang Kami",
    description: "Cerita Sundaf Trip.",
    alternates: { canonical: "https://sundaftrip.com/about" },
  });

  assert.equal(result.openGraph?.title, "Tentang Kami");
  assert.equal(result.openGraph?.description, "Cerita Sundaf Trip.");
  assert.equal(result.openGraph?.url, "https://sundaftrip.com/about");
  assert.equal(result.twitter?.title, "Tentang Kami");
  assert.equal(result.twitter?.description, "Cerita Sundaf Trip.");
  assert.deepEqual(result.twitter?.images, result.openGraph?.images);
  assert.match(JSON.stringify(result.openGraph?.images), new RegExp(DEFAULT_OG_IMAGE));
});

test("destination cards retain their own image and article metadata on both platforms", () => {
  const image = { url: "/images/tours/murmansk.webp", alt: "Murmansk" };
  const result = withPageSocialMetadata({
    title: "Panduan Murmansk",
    description: "Panduan perjalanan Murmansk.",
    alternates: { canonical: "https://sundaftrip.com/destinations/murmansk" },
    openGraph: { type: "article", images: [image] },
  });

  assert.equal(result.openGraph?.url, "https://sundaftrip.com/destinations/murmansk");
  assert.ok(result.openGraph && "type" in result.openGraph);
  assert.equal(result.openGraph.type, "article");
  assert.deepEqual(result.openGraph.images, [image]);
  assert.deepEqual(result.twitter?.images, [image]);
});

test("absolute document titles and explicit social copy remain unchanged", () => {
  const result = withPageSocialMetadata({
    title: { absolute: "FAQ Sundaf Trip" },
    description: "Pertanyaan perjalanan.",
    alternates: { canonical: "https://sundaftrip.com/faq" },
    openGraph: { title: "Panduan tanya jawab Sundaf" },
    twitter: { card: "summary", title: "Tanya jawab Sundaf", images: ["/faq.png"] },
    robots: { index: true, follow: true },
  });

  assert.deepEqual(result.title, { absolute: "FAQ Sundaf Trip" });
  assert.equal(result.openGraph?.title, "Panduan tanya jawab Sundaf");
  assert.equal(result.twitter?.title, "Tanya jawab Sundaf");
  assert.deepEqual(result.twitter?.images, ["/faq.png"]);
  assert.deepEqual(result.robots, { index: true, follow: true });
});
