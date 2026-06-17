import { localizePdfText } from "./itinerary-pdf-localization";

const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";
const TRANSLATE_CHUNK_LIMIT = 1400;

const EN_HINT_RE =
  /\b(today|then|after|before|upon|arrival|departure|breakfast|lunch|dinner|brunch|overnight|included|excluded|include|excludes|tour guide|local guide|driver|private transfer|pick\s*up|drop\s*off|lobby|harbor|board|boat|island|snorkeling|water park|shopping|complex|free time|leisure|passport|check[ -]?in|check[ -]?out|subject to availability|or similar|accommodation|cable car|cruise|flight|city tour|full day|half day|tour ends|services end|street\s*food|streetfood|cooking class|water puppet|spa treatment|massage|with transfer|with guide|english|tour includes|tour excluded|lunch menu|note:|clients|additional service|steamed|sauteed|fried|vegetable|omelette|fresh fruit|steam rice|upon request|please kindly|northern|southern|central|south to north|north to south|joint bus|joint cruise|come back|sightseeing|foc|we visit|you will|you can|your hotel|by your own|visit|located|regarded|history dating|explore|admire|architecture|stroll|shops|enjoy|return|on board|in the south|own arrangement|personal documents|belongings|program & activities)\b/i;

const POST_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(\d+)D(\d+)N\b/gi, "$1 Hari $2 Malam"],
  [/\bCentral Asia\b/gi, "Asia Tengah"],
  [/\bNorthern Lights Hunt\b/gi, "Perburuan cahaya utara"],
  [/\bNorthern Lights\b/gi, "Cahaya utara"],
  [/\bNorthern Vietnam\b/gi, "Vietnam Utara"],
  [/\bCentral Vietnam\b/gi, "Vietnam Tengah"],
  [/\bSouthern Vietnam\b/gi, "Vietnam Selatan"],
  [/\bSouth Vietnam\b/gi, "Vietnam Selatan"],
  [/\bNorthern dan Vietnam Selatan\b/gi, "Vietnam Utara dan Selatan"],
  [/\bNorthern dan Vietnam Tengah\b/gi, "Vietnam Utara dan Tengah"],
  [/\bNorthern\b/gi, "Vietnam Utara"],
  [/\bSouthern\b/gi, "Vietnam Selatan"],
  [/\bCentral\b/gi, "Tengah"],
  [/\bVietnam From North to South\b/gi, "Vietnam dari Utara ke Selatan"],
  [/\bVietnam South to North\b/gi, "Vietnam dari Selatan ke Utara"],
  [/\bFrom North to South\b/gi, "dari Utara ke Selatan"],
  [/\bSouth to North\b/gi, "dari Selatan ke Utara"],
  [/\bHalong Bay\b/gi, "Teluk Halong"],
  [/\bHo Chi Minh\b/gi, "Ho Chi Minh"],
  [/\bPhu Quoc Island Vietnam\b/gi, "Pulau Phu Quoc Vietnam"],
  [/\bRussia\b/gi, "Rusia"],
  [/\bMoscow\b/gi, "Moskow"],
  [/\bWhite Nights\b/gi, "Malam Putih"],
  [/\bWhite Night\b/gi, "Malam Putih"],
  [/\bWinter\b/gi, "musim dingin"],
  [/\bAutumn\b/gi, "musim gugur"],
  [/\bFalls\b/gi, "musim gugur"],
  [/\bSnowy\b/gi, "bersalju"],
  [/\bFrozen\b/gi, "beku"],
  [/\bEscape\b/gi, "liburan"],
  [/\bParadise\b/gi, "paradise"],
  [/\bMagic\b/gi, "magic"],
  [/\bBliss\b/gi, "bliss"],
  [/\bGlow\b/gi, "glow"],
  [/\bWonderland\b/gi, "wonderland"],
  [/\bCharm\b/gi, "charm"],
  [/\bColors\b/gi, "warna"],
  [/\bWonders\b/gi, "wonders"],
  [/\bAmazing\b/gi, "menakjubkan"],
  [/\bBeautiful\b/gi, "indah"],
  [/\bStunning\b/gi, "memukau"],
  [/\bSpectacle\b/gi, "spektakel"],
  [/\bExpedition\b/gi, "ekspedisi"],
  [/\bPRIVATE\b/g, "Privat"],
  [/\bAurora Hunting\b/gi, "Berburu aurora"],
  [/\bAurora Chasing\b/gi, "Berburu aurora"],
  [/\bSIC Tour\b/gi, "Tur SIC"],
  [/\bPrivate Tour\b/gi, "Tur Privat"],
  [/\bFull Day City Tour\b/gi, "Tur Kota Sehari Penuh"],
  [/\bFull Day Sightseeing Tour\b/gi, "Tur Kota Sehari Penuh"],
  [/\bSightseeing Tour\b/gi, "Tur Kota"],
  [/\bJoint Cruise Bus\b/gi, "Bus shuttle cruise"],
  [/\bJoint Bus\b/gi, "Bus shuttle"],
  [/\bCome Back\b/gi, "Kembali"],
  [/\bMorning Flight\b/gi, "Penerbangan pagi"],
  [/\bFree to Explore\b/gi, "Waktu bebas untuk eksplorasi"],
  [/\bCable Car\b/gi, "Cable car"],
  [/\b3 Islands Tour\b/gi, "Tur 3 pulau"],
  [/\bHanoi Arrival\b/gi, "Tiba di Hanoi"],
  [/\bHanoi Departure\b/gi, "Kepulangan dari Hanoi"],
  [/\bPhu Quoc Departure\b/gi, "Kepulangan dari Phu Quoc"],
  [/\bArrival\b/gi, "Kedatangan"],
  [/\bDeparture\b/gi, "Kepulangan"],
  [/\bOPTION\s*(\d+):\s*(\d+)\*\s*STANDARD\s*ACCOMMODATION\b/gi, "Opsi $1: Akomodasi standar $2*"],
  [/\bOPTION\s*(\d+):\s*(\d+)\*\s*SUPERIOR\s*ACCOMMODATION\b/gi, "Opsi $1: Akomodasi superior $2*"],
  [/\bOPTION\s*(\d+):\s*(\d+)\*\s*ACCOMMODATION\b/gi, "Opsi $1: Akomodasi $2*"],
  [/\bOPTION\s*(\d+)\b/gi, "Opsi $1"],
  [/\bACCOMMODATION\b/gi, "Akomodasi"],
  [/\batau setara\/or similar\b/gi, "atau setara"],
  [/\bor similar\b/gi, "atau setara"],
  [/\(atau setara\)/gi, "atau setara"],
  [/\bJunior Ocean Cabin\b/gi, "Kabin Junior Ocean"],
  [/\bJunior Suite\b/gi, "Suite Junior"],
  [/\bDeluxe Cabin\b/gi, "Kabin Deluxe"],
  [/\bDeluxe Ocean View Room\b/gi, "Kamar Deluxe Ocean View"],
  [/\bDeluxe Ocean View\b/gi, "Kamar Deluxe Ocean View"],
  [/\bDeluxe Balcony\b/gi, "Kamar Deluxe Balcony"],
  [/\bDeluxe Room\b/gi, "Kamar Deluxe"],
  [/\bColonial Deluxe\b/gi, "Kamar Colonial Deluxe"],
  [/\bSuperior Room\b/gi, "Kamar Superior"],
  [/\bClassic Room\b/gi, "Kamar Classic"],
  [/\bSketch Room\b/gi, "Kamar Sketch"],
  [/\bStandard Room\b/gi, "Kamar Standard"],
  [/\bPremium Room\b/gi, "Kamar Premium"],
  [/\bSol by Meliá Phu Quoc \/ Kamar Standard\b/gi, "Sol by Melia Phu Quoc / Kamar Standard"],
  [/\bSpa treatment\b/gi, "Perawatan spa"],
  [/\bMassage\b/gi, "pijat"],
  [/\bStreetfood tour\b/gi, "Tur street food"],
  [/\bStreet food tour\b/gi, "Tur street food"],
  [/\bWater puppet show\b/gi, "Pertunjukan wayang air"],
  [/\bCooking class\b/gi, "Kelas memasak"],
  [/\bJeep tour\b/gi, "Tur jeep"],
  [/\bVespa tour\b/gi, "Tur Vespa"],
  [/\bwith guide\b/gi, "dengan pemandu"],
  [/\bwith transfer\b/gi, "dengan transfer"],
  [/\bwith lunch\/dinner included\b/gi, "dengan makan siang/makan malam termasuk"],
  [/\bwith\b/gi, "dengan"],
  [/\bto\b/gi, "ke"],
  [/\bat night\b/gi, "malam hari"],
  [/\badventure\b/gi, "petualangan"],
  [/\bmins\b/gi, "menit"],
  [/\b(\d+)-hour\b/gi, "$1 jam"],
  [/\bNo meal included\b/gi, "Makan belum termasuk"],
  [/\bNo meals included\b/gi, "Makan belum termasuk"],
  [/\bBreakfast, Lunch & Dinner included\b/gi, "Termasuk sarapan, makan siang, dan makan malam"],
  [/\bBreakfast, Lunch included\b/gi, "Termasuk sarapan dan makan siang"],
  [/\bBreakfast, Brunch included\b/gi, "Termasuk sarapan dan brunch"],
  [/\bBreakfast included\b/gi, "Termasuk sarapan"],
  [/\bMeals:\s*Breakfast,\s*Lunch,\s*Dinner\b/gi, "Makan: sarapan, makan siang, makan malam"],
  [/\bMeals:\s*Breakfast,\s*Lunch\b/gi, "Makan: sarapan dan makan siang"],
  [/\bMeals:\s*Breakfast,\s*Brunch\b/gi, "Makan: sarapan dan brunch"],
  [/\bMeals:\s*Breakfast\b/gi, "Makan: sarapan"],
  [/\bMeals:\s*No meal\b/gi, "Makan: belum termasuk"],
  [/\(B,L,D\)/g, "(Sarapan, Makan siang, Makan malam)"],
  [/\(B,L\)/g, "(Sarapan, Makan siang)"],
  [/\(B,Brunch\)/gi, "(Sarapan, brunch)"],
  [/\bDomestic Flight\b/gi, "penerbangan domestik"],
  [/\bDomestic Penerbangan\b/gi, "penerbangan domestik"],
  [/\bSarapan at the hotel\b/gi, "Sarapan di hotel"],
  [/\bat the hotel\b/gi, "di hotel"],
  [/\bat hotels\b/gi, "di hotel"],
  [/\bke the airport\b/gi, "menuju bandara"],
  [/\bto the airport\b/gi, "menuju bandara"],
  [/\btake a flight\b/gi, "mengambil penerbangan"],
  [/\bKembali ke your home country\b/gi, "pulang ke negara asal"],
  [/\byour home country\b/gi, "negara asal Anda"],
  [/\byour hotel\b/gi, "hotel Anda"],
  [/\byou will be picked up by our pengemudi menuju bandara ke mengambil penerbangan ke pulang ke negara asal\b/gi, "Anda dijemput oleh pengemudi menuju bandara untuk penerbangan pulang"],
  [/\byou will be picked up by our pengemudi menuju bandara untuk mengambil penerbangan pulang ke negara asal Anda\b/gi, "Anda dijemput oleh pengemudi menuju bandara untuk penerbangan pulang"],
  [/\byou are free at your leisure until being picked up by our pengemudi menuju bandara ke mengambil penerbangan ke pulang ke negara asal\b/gi, "Waktu bebas sampai dijemput oleh pengemudi menuju bandara untuk penerbangan pulang"],
  [/\bat your leisure until being transferred by private van \(tanpa pemandu\) menuju bandara ke mengambil penerbangan ke pulang ke negara asal\b/gi, "Waktu bebas sampai transfer privat menuju bandara untuk penerbangan pulang"],
  [/\bke mengambil penerbangan ke pulang ke negara asal\b/gi, "untuk penerbangan pulang"],
  [/\bwithout a pemandu wisata\b/gi, "tanpa pemandu wisata"],
  [/\bwithout pemandu wisata\b/gi, "tanpa pemandu wisata"],
  [/\bno pemandu wisata\b/gi, "tanpa pemandu wisata"],
  [/\bno guide\b/gi, "tanpa pemandu"],
  [/\bno transfer\b/gi, "tanpa transfer"],
  [/\bby your own arrangement\b/gi, "dengan pengaturan sendiri"],
  [/\bOvernight:\s*([^\n.]+)/gi, "Bermalam: $1"],
  [/\bBermalam on Cruise\b/gi, "Bermalam di kapal pesiar"],
  [/\bBermalam in\b/gi, "Bermalam di"],
  [/\bon Cruise\b/gi, "di kapal pesiar"],
  [/\bon Teluk Halong cruise\b/gi, "di kapal pesiar Teluk Halong"],
  [/\bTeluk Halong Bermalam Cruise\b/gi, "kapal pesiar bermalam Teluk Halong"],
  [/\bTeluk Halong Kemarin Cruise\b/gi, "kapal pesiar bermalam Teluk Halong"],
  [/\bBus shuttle cruise ke Halong\b/gi, "Bus shuttle ke Teluk Halong"],
  [/\bBus shuttle cruise ke Teluk Halong\b/gi, "Bus shuttle ke Teluk Halong"],
  [/\b01 malam di Cruise di Teluk Halong\b/gi, "1 malam di kapal pesiar Teluk Halong"],
  [/\bOvernight in\b/gi, "Bermalam di"],
  [/\bOvernight on\b/gi, "Bermalam di"],
  [/\bOvernight\b/gi, "Bermalam"],
  [/\bBreakfast\b/gi, "Sarapan"],
  [/\bBreakfasts\b/gi, "Sarapan"],
  [/\bLunch\b/gi, "Makan siang"],
  [/\bLunches\b/gi, "Makan siang"],
  [/\bMakan siang in\b/gi, "Makan siang di"],
  [/\bDinner\b/gi, "Makan malam"],
  [/\bBrunch\b/gi, "Brunch"],
  [/\bdriver\b/gi, "pengemudi"],
  [/\btour guide\b/gi, "pemandu wisata"],
  [/\blocal guide\b/gi, "pemandu lokal"],
  [/\bprivate transfer\b/gi, "transfer privat"],
  [/\bsubject to availability\b/gi, "mengikuti ketersediaan"],
  [/\bquote separately\b/gi, "dihitung terpisah"],
  [/\bAll airfares excluded\b/gi, "Tiket pesawat belum termasuk"],
  [/\bDomestic flights, jika ada, dihitung terpisah\b/gi, "Penerbangan domestik, jika ada, dihitung terpisah"],
  [/\bHarga subject to availability dan kurs\b/gi, "Harga mengikuti ketersediaan dan kurs saat konfirmasi"],
  [/\bHotel dapat diganti dengan hotel setara\/or similar\b/gi, "Hotel dapat diganti dengan hotel setara"],
  [/\bLucnh\b/gi, "Makan siang"],
  [/\bTOUR INCLUDES:?/gi, "Termasuk dalam tur:"],
  [/\bTOUR EXCLUDED:?/gi, "Tidak termasuk dalam tur:"],
  [/\bLUNCH MENU:?/gi, "Menu makan siang:"],
  [/\bNote:?/gi, "Catatan:"],
  [/\bEnglish vietnamese speaking local guide\b/gi, "Pemandu lokal berbahasa Inggris/Vietnam"],
  [/\bEnglish vietnamese speaking pemandu lokal\b/gi, "Pemandu lokal berbahasa Inggris/Vietnam"],
  [/\bSharing bus pick up & drop off\b/gi, "Layanan antar-jemput bus sharing"],
  [/\bSharing big boat\b/gi, "Kapal besar sharing"],
  [/\bSharing lunch on boat\b/gi, "Makan siang sharing di kapal"],
  [/\bSharing Makan siang on boat\b/gi, "Makan siang sharing di kapal"],
  [/\b1 bottle of mineral water\/person\b/gi, "1 botol air mineral per orang"],
  [/\bVisit 3 islands in the south\b/gi, "Kunjungi 3 pulau di selatan"],
  [/\bEnjoy Makan siang on board\b/gi, "Nikmati makan siang di kapal"],
  [/\bReturn ke hotel Anda\b/gi, "Kembali ke hotel Anda"],
  [/\bExplore Grand World on your own\b/gi, "Jelajahi Grand World secara mandiri"],
  [/\bOther Personal expenses\b/gi, "Pengeluaran pribadi lainnya"],
  [/\bAny additional service at cable car & island\b/gi, "Layanan tambahan di area cable car dan pulau"],
  [/\bSteam rice\b/gi, "Nasi putih"],
  [/\bSteamed shrimp\b/gi, "Udang kukus"],
  [/\bSauteed squid sweet sour\b/gi, "Cumi tumis asam manis"],
  [/\bFried chicken with fish sauce\b/gi, "Ayam goreng saus ikan"],
  [/\bFried chicken dengan fish sauce\b/gi, "Ayam goreng saus ikan"],
  [/\bVegetable soup and minced pork\b/gi, "Sup sayur dan daging babi cincang"],
  [/\bDeep-fried tofu with tomato sauce\b/gi, "Tahu goreng saus tomat"],
  [/\bDeep-fried tofu dengan tomato sauce\b/gi, "Tahu goreng saus tomat"],
  [/\bStir[-–]fried morning glory with garlic\b/gi, "Tumis kangkung bawang putih"],
  [/\bStir[-–]fried morning glory dengan garlic\b/gi, "Tumis kangkung bawang putih"],
  [/\bOmelette\b/gi, "Telur dadar"],
  [/\bFresh fruit\b/gi, "Buah segar"],
  [/\bFOC\b/gi, "gratis"],
  [/\bfor the tour leader\b/gi, "untuk pemimpin tur"],
  [/\bTour price unchanged\b/gi, "Harga tur tidak berubah"],
  [/\bEnd of services\b/gi, "Layanan selesai"],
  [/\bSERVICES END!?/gi, "Layanan selesai."],
  [/\bOptional, tergantung ketersediaan\b/gi, "Opsional, mengikuti ketersediaan"],
  [/\bOpsional, subject to availability\b/gi, "Opsional, mengikuti ketersediaan"],
  [/\bGet dropped off at the hotel\b/gi, "Diantar kembali ke hotel"],
  [/\bGet dropped off di hotel\b/gi, "Diantar kembali ke hotel"],
  [/\bthe boat is cruising back ke the harbor\b/gi, "kapal berlayar kembali ke pelabuhan"],
  [/\bmeanwhile the boat is cruising back ke the harbor\b/gi, "sambil kapal berlayar kembali ke pelabuhan"],
  [/\bTur pribadi\b/gi, "Tur privat"],
  [/\bPribadi\b/gi, "Privat"],
  [/\bTeluk Halong Bay\b/gi, "Teluk Halong"],
  [/\bKapal\/cruise\b/gi, "Kapal/cruise"],
  [/\bMakan Siang\b/g, "Makan siang"],
  [/\bCable car\b/gi, "kereta gantung"],
  [/\bsubject ke availability\b/gi, "mengikuti ketersediaan"],
  [/\bearly check-in excluded dan mengikuti ketersediaan\b/gi, "early check-in belum termasuk dan mengikuti ketersediaan kamar"],
  [/\bearly check-in excluded dan subject ke availability\b/gi, "early check-in belum termasuk dan mengikuti ketersediaan kamar"],
  [/\bBermalam:\s*Depature\b/gi, "Akhir perjalanan: kepulangan"],
  [/\bBus shuttle cruise ke Kembali Hanoi\b/gi, "Bus shuttle kembali ke Hanoi"],
  [/\bBus Pesiar ke Kembali ke Hanoi\b/gi, "bus cruise kembali ke Hanoi"],
  [/\bMakan siang MENU:?/gi, "Menu makan siang:"],
  [/\bCruise important Catatan:\s*s:?/gi, "Catatan penting cruise:"],
  [/\bThe itinerary can be changed without prior notice\./gi, "Rencana perjalanan dapat berubah tanpa pemberitahuan sebelumnya."],
  [/\bProgram & activities:?/gi, "Program & aktivitas:"],
  [/\bPersonal documents dan belongings:?/gi, "Dokumen pribadi dan barang bawaan:"],
  [/\bMakanan & minuman di pesawat:?/gi, "Makanan & minuman di kapal:"],
  [/\bPengeluaran Privat\b/gi, "Pengeluaran pribadi"],
  [/\bkendaraan Privat\b/gi, "kendaraan privat"],
  [/\bbiaya Privat\b/gi, "biaya pribadi"],
  [/\bearly Makan siang at 09-10am\b/gi, "makan siang awal pukul 09.00-10.00"],
  [/\bMakan siang at 09-10am\b/gi, "makan siang pukul 09.00-10.00"],
  [/\bPesiar Teluk Halong\b/gi, "kapal pesiar Teluk Halong"],
  [/\bSol oleh Meliá\b/gi, "Sol by Meliá"],
  [/\bSol oleh Melia\b/gi, "Sol by Melia"],
  [/\bBermalam flight\b/gi, "penerbangan malam"],
  [/\bexplore Tokyo\b/gi, "eksplor Tokyo"],
  [/\bWelcome ke Tokyo\b/gi, "Selamat datang di Tokyo"],
  [/\bcity tour\b/gi, "tur kota"],
  [/\bFlight ke\b/gi, "Penerbangan ke"],
  [/\bSarapan di hotel then transfer menuju bandara\b/gi, "Sarapan di hotel lalu transfer menuju bandara"],
  [/\bKedatangan airport\. Pick up by pengemudi \(tanpa pemandu wisata\)\. Then, transfer ke the hotel\./gi, "Setibanya di bandara, Anda dijemput pengemudi (tanpa pemandu wisata), lalu diantar ke hotel."],
  [/\bKedatangan airport\. Pick up by pengemudi \(tanpa pemandu wisata\)\./gi, "Setibanya di bandara, Anda dijemput pengemudi (tanpa pemandu wisata)."],
  [/\bKedatangan at Danang airport\. Pick up by another pengemudi \(without guide\)\. Then, transfer ke the hotel\./gi, "Setibanya di Bandara Danang, Anda dijemput pengemudi lain (tanpa pemandu), lalu diantar ke hotel."],
  [/\bKedatangan at Danang airport\. Pick up by another pengemudi \(without guide\)\./gi, "Setibanya di Bandara Danang, Anda dijemput pengemudi lain (tanpa pemandu)."],
  [/\bToday, after having Sarapan di hotel, you will be picked up by our pengemudi \(without guide\) menuju bandara untuk penerbangan pulang\./gi, "Setelah sarapan di hotel, Anda dijemput oleh pengemudi (tanpa pemandu) menuju bandara untuk penerbangan pulang."],
  [/\bfull day explore\b/gi, "eksplor seharian"],
  [/\bexplore kota\b/gi, "menjelajahi kota"],
  [/\bDo kayaking or perahu bambu through Luon Cave ke discover the indah lagoon\./gi, "Aktivitas kayak atau naik perahu bambu melewati Gua Luon untuk melihat laguna yang indah."],
  [/\bVisit TiTop Island dengan its sandy beach\./gi, "Kunjungi Pulau TiTop dengan pantai berpasirnya."],
  [/\bBack ke the boat for the sesi menikmati matahari terbenam\b/gi, "Kembali ke kapal untuk sesi menikmati matahari terbenam"],
];

const translationCache = new Map<string, Promise<string>>();

function normalizeSpacing(value: string) {
  return value
    .replace(/[ \t]+([,.):])/g, "$1")
    .replace(/([(:])[ \t]+/g, "$1")
    .replace(/:([A-Za-zÀ-ÿ])/g, ": $1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\b(?:Kamar\s+){2,}/gi, "Kamar ")
    .replace(/\bKamar\s+Deluxe\s+Balcony\s+Room\b/gi, "Kamar Deluxe Balcony")
    .replace(/\bKamar\s+Deluxe\s+Room\b/gi, "Kamar Deluxe")
    .replace(/\bSuite\s+Junior\s+Room\b/gi, "Suite Junior")
    .replace(/\bSuite\s+Junior\s+Cabin\b/gi, "Suite Junior")
    .replace(/\bkapal(?:\s+kapal)+\s+pesiar\b/gi, "kapal pesiar")
    .replace(/\bMenu standar di dalam pesawat\b/gi, "Menu standar di kapal")
    .replace(/\bDokumen Privat\b/gi, "Dokumen pribadi")
    .replace(/\bSol oleh Meliá\b/gi, "Sol by Meliá")
    .replace(/\bSol oleh Melia\b/gi, "Sol by Melia")
    .replace(/\b(\d+)h\s+–\s+(\d+)h30[’']?\s+drive\b/gi, "$1-$2 jam 30 menit perjalanan")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeCatalogIndonesian(value?: string | null) {
  if (!value) return value ?? null;
  let out = localizePdfText(value) ?? value;
  for (const [pattern, replacement] of POST_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return normalizeSpacing(out);
}

export function hasEnglishCatalogHint(value?: string | null) {
  return !!value && EN_HINT_RE.test(value);
}

function splitLongLine(line: string) {
  if (line.length <= TRANSLATE_CHUNK_LIMIT) return [line];
  const sentences = line.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [line];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current}${sentence}`.trim();
    if (next.length > TRANSLATE_CHUNK_LIMIT && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function googleTranslateToIndonesian(text: string) {
  const url =
    `${TRANSLATE_URL}?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = (await res.json()) as unknown;
  const segments =
    Array.isArray(data) && Array.isArray((data as unknown[])[0])
      ? ((data as unknown[])[0] as unknown[])
      : [];
  return segments.map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : "")).join("");
}

async function translateChunk(text: string) {
  const normalized = normalizeCatalogIndonesian(text) ?? "";
  if (!hasEnglishCatalogHint(normalized)) return normalized;

  const key = normalized;
  if (!translationCache.has(key)) {
    translationCache.set(
      key,
      googleTranslateToIndonesian(normalized)
        .then(async (translated) => {
          const firstPass = normalizeCatalogIndonesian(translated) ?? normalized;
          if (!hasEnglishCatalogHint(firstPass) || firstPass === normalized) return firstPass;
          const secondPass = await googleTranslateToIndonesian(firstPass);
          return normalizeCatalogIndonesian(secondPass) ?? firstPass;
        })
        .catch(() => normalized)
    );
  }
  return translationCache.get(key)!;
}

export async function localizeCatalogText(value?: string | null) {
  const normalized = normalizeCatalogIndonesian(value);
  if (!normalized) return normalized;
  if (!hasEnglishCatalogHint(normalized)) return normalized;

  const lines = normalized.split("\n");
  const localizedLines: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      localizedLines.push("");
      continue;
    }
    const chunks = splitLongLine(line);
    const localized = await Promise.all(chunks.map(translateChunk));
    localizedLines.push(localized.join(" "));
  }

  return normalizeCatalogIndonesian(localizedLines.join("\n")) ?? normalized;
}

export async function localizeCatalogStringArray(values: string[]) {
  return Promise.all(values.map((value) => localizeCatalogText(value).then((text) => text ?? "")));
}

export async function localizeCatalogRecord(record: Record<string, string> | null | undefined) {
  if (!record) return record ?? null;
  const entries = await Promise.all(
    Object.entries(record).map(async ([key, value]) => [
      (await localizeCatalogText(key)) ?? key,
      (await localizeCatalogText(value)) ?? value,
    ] as const)
  );
  return Object.fromEntries(entries);
}
