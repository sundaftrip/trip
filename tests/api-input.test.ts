import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeTourHotelInput,
  normalizeTourItineraryInput,
  normalizeTourSlugInput,
} from "../lib/api-input";

test("normalizeTourSlugInput accepts canonical public slugs", () => {
  assert.deepEqual(
    normalizeTourSlugInput(" central-asia-4-tan "),
    { ok: true, value: "central-asia-4-tan" },
  );
});

test("normalizeTourSlugInput rejects unsafe or empty route values", () => {
  assert.equal(normalizeTourSlugInput("").ok, false);
  assert.equal(normalizeTourSlugInput("Asia Tengah").ok, false);
  assert.equal(normalizeTourSlugInput("../admin").ok, false);
});

test("normalizeTourHotelInput trims editor rows and preserves public labels", () => {
  assert.deepEqual(
    normalizeTourHotelInput({
      " Nama hotel ": " Hotel Uzbekistan ",
      Kategori: 4,
    }),
    {
      ok: true,
      value: {
        "Nama hotel": "Hotel Uzbekistan",
        Kategori: "4",
      },
    },
  );
});

test("normalizeTourHotelInput rejects incomplete and duplicated normalized rows", () => {
  assert.equal(normalizeTourHotelInput({ Kota: "" }).ok, false);
  assert.equal(normalizeTourHotelInput({ Kota: "Almaty", " Kota ": "Bishkek" }).ok, false);
});

test("normalizeTourItineraryInput preserves an optional CMS highlight image", () => {
  assert.deepEqual(
    normalizeTourItineraryInput([
      {
        day: 2,
        title: "Tur Kota Tokyo",
        description: "Kunjungan ke Asakusa.",
        image: " https://res.cloudinary.com/example/tokyo.jpg ",
      },
      {
        day: 1,
        title: "Jakarta ke Tokyo",
        description: "Penerbangan menuju Jepang.",
      },
    ]),
    {
      ok: true,
      value: [
        {
          day: 1,
          title: "Jakarta ke Tokyo",
          description: "Penerbangan menuju Jepang.",
        },
        {
          day: 2,
          title: "Tur Kota Tokyo",
          description: "Kunjungan ke Asakusa.",
          image: "https://res.cloudinary.com/example/tokyo.jpg",
        },
      ],
    },
  );
});

test("normalizeTourItineraryInput rejects duplicate days and unsafe image values", () => {
  assert.equal(
    normalizeTourItineraryInput([
      { day: 1, title: "Satu", description: "" },
      { day: 1, title: "Duplikat", description: "" },
    ]).ok,
    false,
  );
  assert.equal(
    normalizeTourItineraryInput([
      { day: 1, title: "Satu", description: "", image: "javascript:alert(1)" },
    ]).ok,
    false,
  );
});
