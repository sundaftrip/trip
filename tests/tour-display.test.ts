import assert from "node:assert/strict";
import test from "node:test";
import { localizePdfText } from "../lib/itinerary-pdf-localization";
import { addInferredMiddleHotelStay, buildItineraryDisplay } from "../lib/itinerary-insights";
import { normalizeItineraryDisplayTitle, normalizeTourDisplayTitle, replaceEditorialDashes } from "../lib/tour-display";

test("normalizes an all-lowercase imported tour title", () => {
  assert.equal(
    normalizeTourDisplayTitle("musim dingin hokkaido + tokyo"),
    "Musim Dingin Hokkaido + Tokyo",
  );
});

test("keeps Indonesian connector words lowercase", () => {
  assert.equal(
    normalizeTourDisplayTitle("vietnam dari utara ke selatan"),
    "Vietnam dari Utara ke Selatan",
  );
});

test("preserves intentional mixed case and product acronyms", () => {
  assert.equal(
    normalizeTourDisplayTitle("Asia Tengah 4-TAN"),
    "Asia Tengah 4-TAN",
  );
});

test("replaces editorial dashes without changing structural hyphens", () => {
  assert.equal(
    replaceEditorialDashes("Hanoi – Ninh Binh — Hoa Lu - Tam Coc"),
    "Hanoi, Ninh Binh, Hoa Lu, Tam Coc",
  );
  assert.equal(replaceEditorialDashes("Asia Tengah 4-TAN"), "Asia Tengah 4-TAN");
  assert.equal(
    replaceEditorialDashes("Hanoi – Ninh Binh", " · "),
    "Hanoi · Ninh Binh",
  );
});

test("removes a duplicated itinerary date with inconsistent punctuation", () => {
  assert.equal(
    normalizeItineraryDisplayTitle("4 September 2026): Jakarta – Almaty | Gerbang ke Asia Tengah"),
    "Jakarta – Almaty | Gerbang ke Asia Tengah",
  );
  assert.equal(
    normalizeItineraryDisplayTitle("(6 September 2026): Tur Kota Almaty – Kirgistan"),
    "Tur Kota Almaty – Kirgistan",
  );
});

test("removes a redundant day prefix", () => {
  assert.equal(normalizeItineraryDisplayTitle("Hari ke-3: Eksplorasi kota"), "Eksplorasi kota");
});

test("localizes mixed imported Vietnam itinerary phrasing", () => {
  assert.equal(localizePdfText("Sarapan at Hotel"), "Sarapan di hotel");
  assert.equal(
    localizePdfText("At 05:00 PM, transfer from Sapa ke Hanoi by shared limousine."),
    "Pukul 17.00, transfer dari Sapa ke Hanoi dengan shared limousine.",
  );
  assert.equal(
    localizePdfText("Begin your exploration of Hanoi dengan a relaxing one-hour cyclo ride through the charming Hanoi Old Quarter."),
    "Mulai eksplorasi Hanoi dengan cyclo ride santai selama satu jam melalui Hanoi Old Quarter.",
  );
});

test("classifies only explicit itinerary transport and keeps special transport accurate", () => {
  assert.deepEqual(
    buildItineraryDisplay({
      day: 3,
      title: "Almaty menuju Bishkek",
      description: "Menikmati kereta gantung Shymbulak lalu transfer privat menuju Bishkek.",
    }).insights,
    [{ kind: "transport", label: "Transportasi", value: "Kereta gantung" }],
  );
  assert.deepEqual(
    buildItineraryDisplay({
      day: 4,
      title: "Aktivitas musim dingin",
      description: "Pengalaman kereta anjing dan skateboard di area resort.",
    }).insights,
    [{ kind: "transport", label: "Transportasi", value: "Kereta anjing" }],
  );
  assert.deepEqual(
    buildItineraryDisplay({
      day: 5,
      title: "Aktivitas musim dingin",
      description: "Menikmati kereta rusa di area bersalju.",
    }).insights,
    [{ kind: "transport", label: "Transportasi", value: "Kereta rusa" }],
  );
  assert.equal(
    buildItineraryDisplay({
      day: 6,
      title: "Kota Rusia",
      description: "Menikmati kereta Rusia dan berjalan santai di pusat kota.",
    }).insights.some((insight) => insight.value === "Kereta api"),
    false,
  );
});

test("adds a hotel stay only for eligible middle itinerary days", () => {
  const baseDay = buildItineraryDisplay({ day: 3, title: "Eksplorasi kota", description: "Tur kota dan waktu bebas." });
  assert.equal(addInferredMiddleHotelStay(baseDay, 1, 5, "Tur kota dan waktu bebas.").insights.at(-1)?.value, "Hotel");
  assert.equal(addInferredMiddleHotelStay(baseDay, 0, 5, "Tur kota dan waktu bebas.").insights.some((item) => item.kind === "stay"), false);
  assert.equal(addInferredMiddleHotelStay(baseDay, 1, 5, "Menginap di yurt camp.").insights.some((item) => item.kind === "stay"), false);
});

test("preserves a CMS-managed itinerary highlight image for the public experience cards", () => {
  const day = buildItineraryDisplay({
    day: 2,
    title: "Tur Kota Tokyo",
    description: "Kunjungan ke Asakusa.",
    image: "https://res.cloudinary.com/example/tokyo.jpg",
  });

  assert.equal(day.image, "https://res.cloudinary.com/example/tokyo.jpg");
});
