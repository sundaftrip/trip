import type { InquiryStatus } from "@prisma/client";

export type AiOpsInquiry = {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  destination: string | null;
  travelDate: string | null;
  message: string | null;
  source: string | null;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AiOpsTour = {
  id: string;
  title: string;
  slug: string | null;
  country: string;
  cityHighlight: string | null;
  price: number;
  promoPrice: number | null;
  seatsLeft: number;
  tripDate: Date | null;
  duration: string | null;
};

export type AiOpsRecommendation = {
  inquiryId: string;
  customerName: string;
  status: InquiryStatus;
  ageHours: number;
  priority: "hot" | "warm" | "normal" | "stale";
  resolution: "collecting" | "ready_to_quote" | "ready_to_invoice" | "handoff_admin";
  resolutionLabel: string;
  intent: string;
  nextAction: string;
  profileLine: string;
  replyDraft: string;
  whatsappUrl: string;
  matchedTours: {
    id: string;
    title: string;
    href: string;
    tripDateLabel: string;
    priceLabel: string;
    seatsLabel: string;
  }[];
};

export type AiOpsLeadFacts = {
  intent: string;
  destination: string;
  travelDate: string;
  pax: string;
  budget: string;
  passportValidity: string;
  asks: string[];
  missingFields: string[];
  confidence: "low" | "medium" | "high";
};

const HOT_WORDS = [
  "booking",
  "book",
  "dp",
  "deposit",
  "bayar",
  "harga",
  "seat",
  "kursi",
  "invoice",
  "berangkat",
  "pax",
  "orang",
];

const VISA_WORDS = ["visa", "paspor", "dokumen", "kedutaan", "evisa", "e-visa"];
const AURORA_WORDS = ["aurora", "murmansk", "teriberka", "rusia", "russia"];
const CUSTOM_WORDS = ["custom", "private", "keluarga", "honeymoon", "kantor", "corporate"];
const PRICE_WORDS = ["harga", "biaya", "price", "rate", "budget", "range"];
const SEAT_WORDS = ["seat", "kursi", "available", "tersedia", "sisa"];
const BOOKING_WORDS = ["booking", "book", "dp", "deposit", "invoice", "bayar", "deal", "ambil"];
const PASSPORT_WORDS = ["paspor berlaku", "masa berlaku", "expired", "expiry", "kadaluarsa", "kedaluwarsa"];
const TOUR_STOP_TOKENS = new Set([
  "saya",
  "mau",
  "ingin",
  "untuk",
  "kak",
  "trip",
  "tour",
  "open",
  "paket",
  "dan",
  "yang",
  "dari",
  "dengan",
  "bulan",
  "harga",
  "budget",
]);
const MONTH_WORDS = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
  "jan",
  "feb",
  "mar",
  "apr",
  "jun",
  "jul",
  "agu",
  "sep",
  "okt",
  "nov",
  "des",
];

function clean(value?: string | null) {
  return (value ?? "").trim();
}

function lower(value?: string | null) {
  return clean(value).toLowerCase();
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeWhatsAppNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function formatDateLabel(date: Date | null) {
  if (!date) return "Tanggal fleksibel";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ageHours(createdAt: Date) {
  return Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 36e5));
}

function leadText(inquiry: AiOpsInquiry) {
  return [
    inquiry.destination,
    inquiry.travelDate,
    inquiry.message,
  ].map(lower).join(" ");
}

function extractPax(text: string) {
  const direct = text.match(/\b(\d{1,3})\s*(pax|orang|peserta|person|persons|org)\b/i);
  if (direct) return `${direct[1]} pax`;
  const standaloneNumber = text
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => /^\d{1,2}$/.test(line));
  if (standaloneNumber) return `${standaloneNumber} pax`;
  const wordMap: Array<[RegExp, string]> = [
    [/\b(satu|sendiri|solo)\b/i, "1 pax"],
    [/\b(dua|berdua|couple|pasangan)\b/i, "2 pax"],
    [/\b(tiga|bertiga)\b/i, "3 pax"],
    [/\b(empat|berempat)\b/i, "4 pax"],
    [/\b(lima|berlima)\b/i, "5 pax"],
    [/\b(keluarga)\b/i, "keluarga"],
  ];
  return wordMap.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

function extractTravelDate(text: string) {
  const monthPattern = new RegExp(`\\b(${MONTH_WORDS.join("|")})(?:\\s+\\d{4})?\\b`, "i");
  const month = text.match(monthPattern)?.[0];
  if (month) return titleCaseWords(month);
  const quarter = text.match(/\b(q[1-4]|kuartal\s+[1-4])\s*(2026|2027)?\b/i)?.[0];
  if (quarter) return titleCaseWords(quarter);
  const relative = text.match(/\b(minggu depan|bulan depan|akhir tahun|awal tahun|libur sekolah|lebaran|natal|tahun baru)\b/i)?.[0];
  return relative ? titleCaseWords(relative) : "";
}

function extractBudget(text: string) {
  const keywordBudget = text.match(/\b(?:budget|range|harga|biaya|max|maksimal|sekitar|kurang lebih|dp)\D{0,18}((?:rp\s*)?\d+(?:[.,]\d+)?\s*(?:juta|jt|ribu|rb|m)?(?:\s*(?:per|\/)\s*(?:orang|pax|person))?)/i)?.[1];
  if (keywordBudget) return keywordBudget.replace(/\s+/g, " ").trim();
  const jutaBudget = text.match(/\b(\d+(?:[.,]\d+)?\s*(?:juta|jt)\s*(?:per orang|per pax|\/pax|\/orang)?)/i)?.[1];
  return jutaBudget ? jutaBudget.replace(/\s+/g, " ").trim() : "";
}

function extractPassportValidity(text: string) {
  const validity = text.match(/\b(?:paspor.*?(?:sampai|hingga|berlaku)\s+)([a-zA-Z]+\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i)?.[1];
  if (validity) return titleCaseWords(validity);
  if (hasAny(text, PASSPORT_WORDS)) return "perlu dicek";
  return "";
}

function inferDestinationFromText(text: string) {
  if (text.includes("asia tengah") || text.includes("kazakhstan") || text.includes("uzbekistan")) return "Asia Tengah";
  if (text.includes("aurora") || text.includes("murmansk") || text.includes("teriberka")) return "Rusia Aurora";
  if (text.includes("rusia") || text.includes("russia")) return "Rusia";
  if (text.includes("vietnam") || text.includes("sapa") || text.includes("halong")) return "Vietnam";
  if (text.includes("eropa")) return "Eropa";
  if (text.includes("amerika") || text.includes("canada") || text.includes("kanada")) return "Amerika / Canada";
  return "";
}

function classifyIntentFromFacts(text: string, destination: string) {
  if (hasAny(text, VISA_WORDS) && (destination || hasAny(text, BOOKING_WORDS) || hasAny(text, PRICE_WORDS) || hasAny(text, SEAT_WORDS))) return "Trip + visa support";
  if (hasAny(text, VISA_WORDS)) return "Visa / dokumen";
  if (hasAny(text, BOOKING_WORDS)) return "Booking-ready trip";
  if (destination === "Rusia Aurora") return "Trip Rusia / aurora";
  if (hasAny(text, CUSTOM_WORDS)) return "Custom trip";
  if (destination === "Asia Tengah") return "Asia Tengah";
  if (destination) return `Trip ${destination}`;
  return "Konsultasi umum";
}

function asksFromText(text: string) {
  const asks: string[] = [];
  if (hasAny(text, PRICE_WORDS)) asks.push("harga");
  if (hasAny(text, SEAT_WORDS)) asks.push("seat");
  if (hasAny(text, BOOKING_WORDS)) asks.push("booking");
  if (hasAny(text, VISA_WORDS)) asks.push("visa");
  if (text.includes("itinerary") || text.includes("rute")) asks.push("itinerary");
  return asks;
}

function missingFieldsFor(intent: string, destination: string, pax: string, travelDate: string, budget: string, passportValidity: string) {
  if (intent === "Visa / dokumen") {
    return [
      destination ? "" : "negara tujuan",
      travelDate ? "" : "tanggal berangkat",
      pax ? "" : "jumlah pemohon",
      passportValidity ? "" : "masa berlaku paspor",
    ].filter(Boolean);
  }

  if (intent === "Trip + visa support") {
    return [
      destination ? "" : "tujuan",
      pax ? "" : "jumlah peserta",
      travelDate ? "" : "tanggal berangkat",
      budget ? "" : "range budget",
      passportValidity ? "" : "masa berlaku paspor",
    ].filter(Boolean);
  }

  if (intent === "Custom trip") {
    return [
      destination ? "" : "kota atau negara tujuan",
      pax ? "" : "jumlah peserta",
      travelDate ? "" : "tanggal berangkat",
      budget ? "" : "range budget",
    ].filter(Boolean);
  }

  return [
    destination ? "" : "tujuan",
    pax ? "" : "jumlah peserta",
    travelDate ? "" : "tanggal berangkat",
    budget ? "" : "range budget",
  ].filter(Boolean);
}

function confidenceFor(facts: Pick<AiOpsLeadFacts, "destination" | "travelDate" | "pax" | "budget" | "asks">) {
  const filled = [facts.destination, facts.travelDate, facts.pax, facts.budget].filter(Boolean).length;
  if (filled >= 3 || (filled >= 2 && facts.asks.length > 1)) return "high";
  if (filled >= 1 || facts.asks.length > 0) return "medium";
  return "low";
}

export function extractLeadFacts(text: string): AiOpsLeadFacts {
  const normalized = lower(text);
  const destination = inferDestinationFromText(normalized);
  const pax = extractPax(normalized);
  const travelDate = extractTravelDate(normalized);
  const budget = extractBudget(normalized);
  const passportValidity = extractPassportValidity(normalized);
  const intent = classifyIntentFromFacts(normalized, destination);
  const asks = asksFromText(normalized);
  const missingFields = missingFieldsFor(intent, destination, pax, travelDate, budget, passportValidity);
  const confidence = confidenceFor({ destination, travelDate, pax, budget, asks });

  return {
    intent,
    destination,
    travelDate,
    pax,
    budget,
    passportValidity,
    asks,
    missingFields,
    confidence,
  };
}

function priorityFor(inquiry: AiOpsInquiry, text: string, facts: AiOpsLeadFacts) {
  const hours = ageHours(inquiry.createdAt);
  if (inquiry.status === "NEW" && (facts.asks.includes("booking") || hasAny(text, HOT_WORDS))) return "hot";
  if (inquiry.status === "NEW" && facts.confidence === "high" && (facts.asks.includes("harga") || facts.asks.includes("seat"))) return "hot";
  if (inquiry.status === "NEW" && hours >= 24) return "stale";
  if (inquiry.status === "CONTACTED" && hours >= 72) return "stale";
  if (facts.confidence !== "low" || hasAny(text, VISA_WORDS) || hasAny(text, AURORA_WORDS)) return "warm";
  return "normal";
}

function scoreTour(text: string, tour: AiOpsTour) {
  const haystack = `${tour.title} ${tour.country} ${tour.cityHighlight ?? ""}`.toLowerCase();
  let score = 0;
  for (const token of text.split(/\s+/).filter((item) => item.length > 2 && !TOUR_STOP_TOKENS.has(item))) {
    if (haystack.includes(token)) score += 2;
  }
  if (haystack.includes("rusia") && hasAny(text, AURORA_WORDS)) score += 4;
  if (haystack.includes("aurora") && hasAny(text, AURORA_WORDS)) score += 5;
  if (haystack.includes("asia") && text.includes("asia tengah")) score += 5;
  if (score === 0) return 0;
  if (tour.tripDate && tour.tripDate.getTime() >= Date.now()) score += 1;
  if (tour.seatsLeft > 0) score += 1;
  return score;
}

function matchedToursFor(text: string, tours: AiOpsTour[]) {
  return tours
    .map((tour) => ({ tour, score: scoreTour(text, tour) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ tour }) => ({
      id: tour.id,
      title: tour.title,
      href: `/tours/${tour.slug || tour.id}`,
      tripDateLabel: formatDateLabel(tour.tripDate),
      priceLabel: formatMoney(tour.promoPrice ?? tour.price),
      seatsLabel: tour.seatsLeft > 0 ? `${tour.seatsLeft} seat tersedia` : "Tanya ketersediaan",
    }));
}

function resolveLead(facts: AiOpsLeadFacts, tours: AiOpsRecommendation["matchedTours"]) {
  if (facts.missingFields.length > 0) {
    return {
      resolution: "collecting" as const,
      label: "Butuh data lagi",
    };
  }

  if (facts.asks.includes("booking") && tours.length > 0) {
    return {
      resolution: "ready_to_invoice" as const,
      label: "Selesai: siap invoice",
    };
  }

  if (facts.intent === "Trip + visa support") {
    return {
      resolution: "handoff_admin" as const,
      label: "Selesai: admin ambil alih",
    };
  }

  if (facts.confidence === "high") {
    return {
      resolution: "ready_to_quote" as const,
      label: "Selesai: siap penawaran",
    };
  }

  return {
    resolution: "collecting" as const,
    label: "Butuh data lagi",
  };
}

function nextActionFor(
  inquiry: AiOpsInquiry,
  priority: AiOpsRecommendation["priority"],
  facts: AiOpsLeadFacts,
  resolution: AiOpsRecommendation["resolution"],
) {
  if (inquiry.status === "NEW" && facts.missingFields.length > 0) {
    return `Balas WhatsApp dan minta ${facts.missingFields.slice(0, 3).join(", ")}.`;
  }
  if (resolution === "ready_to_invoice") return "Selesaikan: kunci seat, buat invoice DP, lalu handoff ke admin.";
  if (resolution === "handoff_admin") return "Selesaikan: serahkan ke admin untuk validasi seat, visa, dan invoice.";
  if (resolution === "ready_to_quote") return "Selesaikan: kirim penawaran final dan minta konfirmasi.";
  if (inquiry.status === "NEW" && facts.asks.includes("booking")) return "Kunci seat, jelaskan DP, lalu siapkan invoice.";
  if (inquiry.status === "NEW") return "Kirim opsi paling relevan, lalu arahkan ke invoice atau konsultasi admin.";
  if (priority === "stale") return "Kirim follow-up singkat dan minta keputusan next step.";
  if (facts.intent === "Visa / dokumen") return "Kirim checklist dokumen dan tawarkan bantuan itinerary.";
  if (facts.intent === "Custom trip") return "Minta kota tujuan detail dan preferensi ritme perjalanan.";
  return "Kunci minat paket, lalu arahkan ke invoice atau konsultasi admin.";
}

function profileLineFor(facts: AiOpsLeadFacts) {
  const destination = facts.destination || "tujuan belum spesifik";
  const travelDate = facts.travelDate || "tanggal belum pasti";
  const pax = facts.pax || "pax belum jelas";
  return `${facts.intent} - ${destination} - ${travelDate} - ${pax}`;
}

function factsLine(facts: AiOpsLeadFacts) {
  return [
    facts.destination ? `tujuan ${facts.destination}` : "",
    facts.pax ? `${facts.pax}` : "",
    facts.travelDate ? `rencana ${facts.travelDate}` : "",
    facts.budget ? `budget ${facts.budget}` : "",
    facts.passportValidity ? `paspor ${facts.passportValidity}` : "",
  ].filter(Boolean).join(", ");
}

function missingQuestion(facts: AiOpsLeadFacts) {
  if (facts.missingFields.length === 0) return "";
  if (facts.missingFields.length === 1) return `Tinggal info ${facts.missingFields[0]} ya, Kak.`;
  if (facts.missingFields.length === 2) return `Tinggal info ${facts.missingFields.join(" dan ")} ya, Kak.`;
  const last = facts.missingFields[facts.missingFields.length - 1];
  const firstItems = facts.missingFields.slice(0, -1).join(", ");
  return `Tinggal info ${firstItems}, dan ${last} ya, Kak.`;
}

function terminalReply(
  firstName: string,
  facts: AiOpsLeadFacts,
  tours: AiOpsRecommendation["matchedTours"],
  resolution: AiOpsRecommendation["resolution"],
) {
  const mainTour = tours[0];
  const summary = factsLine(facts);
  const tourLine = mainTour
    ? `Paket yang saya pegang: ${mainTour.title}, ${mainTour.tripDateLabel}, ${mainTour.priceLabel}, ${mainTour.seatsLabel}.`
    : "Admin perlu cek paket final dari database Sundaf.";

  if (resolution === "ready_to_invoice") {
    return [
      `Siap Kak ${firstName}, datanya sudah cukup.`,
      summary ? `Ringkasannya: ${summary}.` : "",
      tourLine,
      "Status: selesai di prototype, siap dibuatkan invoice DP.",
      "Langkah berikutnya admin manusia mengambil alih untuk kunci seat, nominal DP, dan pengiriman invoice.",
    ].filter(Boolean).join("\n\n");
  }

  if (resolution === "handoff_admin") {
    return [
      `Siap Kak ${firstName}, datanya sudah cukup untuk diteruskan.`,
      summary ? `Ringkasannya: ${summary}.` : "",
      tourLine,
      "Status: selesai di prototype, admin mengambil alih.",
      "Admin akan validasi seat, kebutuhan visa, dan invoice dalam satu alur.",
    ].filter(Boolean).join("\n\n");
  }

  if (resolution === "ready_to_quote") {
    return [
      `Siap Kak ${firstName}, datanya sudah cukup untuk dibuatkan penawaran.`,
      summary ? `Ringkasannya: ${summary}.` : "",
      tourLine,
      "Status: selesai di prototype, siap dikirim penawaran final.",
      "Langkah berikutnya admin mengirim opsi final untuk dikonfirmasi.",
    ].filter(Boolean).join("\n\n");
  }

  return "";
}

function buildReply(
  inquiry: AiOpsInquiry,
  facts: AiOpsLeadFacts,
  tours: AiOpsRecommendation["matchedTours"],
  resolution: AiOpsRecommendation["resolution"],
) {
  const firstName = clean(inquiry.name).split(/\s+/)[0] || "Kak";
  const tourLines = tours.length
    ? tours.map((tour, index) => `${index + 1}. ${tour.title} - ${tour.tripDateLabel} - ${tour.priceLabel}`).join("\n")
    : "";
  const terminal = terminalReply(firstName, facts, tours, resolution);
  if (terminal) return terminal;

  if (facts.intent === "Visa / dokumen") {
    return [
      `Halo Kak ${firstName}, saya dari Sundaf Trip.`,
      factsLine(facts) ? `Saya tangkap kebutuhannya: ${factsLine(facts)}.` : "Saya bantu cek kebutuhan visa dan dokumen Kakak.",
      missingQuestion(facts) || "Data dasarnya sudah cukup untuk mulai cek dokumen.",
      "Untuk visa, yang paling penting dicek dulu: paspor, tanggal berangkat, negara tujuan, dan jumlah pemohon.",
      "Setelah itu saya kirim checklist yang perlu disiapkan.",
    ].join("\n\n");
  }

  if (facts.intent === "Trip + visa support") {
    return [
      `Halo Kak ${firstName}, saya dari Sundaf Trip.`,
      `Saya tangkap kebutuhannya: ${factsLine(facts)}.`,
      tours.length ? `Paket yang paling relevan saat ini:\n${tourLines}` : "Saya cekkan paket yang paling masuk akal dulu.",
      missingQuestion(facts) || "Data trip dan visa sudah cukup untuk mulai cek seat plus dokumen.",
      "Kalau paketnya cocok, admin bisa lanjutkan DP, invoice, dan checklist visa dalam satu alur.",
    ].join("\n\n");
  }

  return [
    `Halo Kak ${firstName}, saya dari Sundaf Trip.`,
    factsLine(facts) ? `Saya tangkap kebutuhannya: ${factsLine(facts)}.` : "Saya bantu petakan trip yang paling pas dulu.",
    tours.length ? `Paket yang paling relevan saat ini:\n${tourLines}` : "Saya cekkan pilihan paket atau custom trip yang paling masuk akal untuk tanggal Kakak.",
    missingQuestion(facts) || (facts.asks.includes("booking") ? "Kalau cocok, bisa mulai dari DP lalu admin buatkan invoice." : "Kalau opsi ini masuk, saya bantu arahkan ke itinerary dan invoice."),
    facts.asks.includes("seat") ? "Saya prioritaskan cek seat karena Kakak sudah tanya ketersediaan." : "Nanti saya bantu arahkan ke paket, itinerary, dan estimasi biaya yang paling pas.",
  ].join("\n\n");
}

export function buildLeadRecommendation(inquiry: AiOpsInquiry, tours: AiOpsTour[]): AiOpsRecommendation {
  const text = leadText(inquiry);
  const facts = extractLeadFacts(text);
  const priority = priorityFor(inquiry, text, facts);
  const matchedTours = matchedToursFor(text, tours);
  const { resolution, label: resolutionLabel } = resolveLead(facts, matchedTours);
  const replyDraft = buildReply(inquiry, facts, matchedTours, resolution);
  const wa = normalizeWhatsAppNumber(inquiry.whatsapp);

  return {
    inquiryId: inquiry.id,
    customerName: inquiry.name,
    status: inquiry.status,
    ageHours: ageHours(inquiry.createdAt),
    priority,
    resolution,
    resolutionLabel,
    intent: facts.intent,
    nextAction: nextActionFor(inquiry, priority, facts, resolution),
    profileLine: profileLineFor(facts),
    replyDraft,
    whatsappUrl: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(replyDraft)}` : "",
    matchedTours,
  };
}

export function buildOpsStats(recommendations: AiOpsRecommendation[]) {
  return {
    total: recommendations.length,
    newLeads: recommendations.filter((item) => item.status === "NEW").length,
    hot: recommendations.filter((item) => item.priority === "hot").length,
    stale: recommendations.filter((item) => item.priority === "stale").length,
    contacted: recommendations.filter((item) => item.status === "CONTACTED").length,
  };
}
