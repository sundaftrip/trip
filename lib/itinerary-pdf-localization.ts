export interface LocalizableItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface LocalizablePdfTour {
  title: string;
  country: string;
  cityHighlight?: string | null;
  duration?: string | null;
  itinerary: LocalizableItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  visaInfo?: string | null;
  notes?: string | null;
}

const EXACT_LINES = new Map<string, string>([
  ["Meals: No meal", "Makan: belum termasuk"],
  ["Meals: Breakfast, Lunch", "Makan: sarapan dan makan siang"],
  ["Meals: Breakfast", "Makan: sarapan"],
  ["No meal included", "Makan belum termasuk"],
  ["No meals included", "Makan belum termasuk"],
  ["Breakfast, Lunch included", "Termasuk sarapan dan makan siang"],
  ["Breakfast included", "Termasuk sarapan"],
  ["Breakfast at hotel", "Sarapan di hotel"],
  ["Breakfast at the hotel.", "Sarapan di hotel."],
  ["Dinner by your own arrangement (no transfer, no tour guide)", "Makan malam dengan pengaturan sendiri (tanpa transfer dan tanpa pemandu)."],
  ["Meals by your own arrangement (no transfer, no guide)", "Makan dengan pengaturan sendiri (tanpa transfer dan tanpa pemandu)."],
  ["Lunch and Dinner by your own arrangement (no transfer, no guide)", "Makan siang dan makan malam dengan pengaturan sendiri (tanpa transfer dan tanpa pemandu)."],
  ["Overnight in Hanoi", "Bermalam di Hanoi."],
  ["Overnight in Hanoi.", "Bermalam di Hanoi."],
  ["Overnight: Departure", "Akhir perjalanan: kepulangan"],
  ["Check-out time is 12:00", "Waktu check-out pukul 12.00."],
  ["SERVICES END!", "Layanan selesai."],
  ["Lunch at a Local/ Indian restaurant.", "Makan siang di restoran lokal/India."],
  ["After the boat ride, you will transfer back to Hanoi.", "Setelah perjalanan perahu, Anda kembali menuju Hanoi."],
  ["Private Land Tour Only.", "Paket land tour privat saja."],
  ["Land tour only.", "Hanya land tour."],
  ["All airfares excluded.", "Tiket pesawat belum termasuk."],
  ["Domestic flights, jika ada, quote separately.", "Penerbangan domestik, jika ada, dihitung terpisah."],
  ["Harga subject to availability dan kurs.", "Harga mengikuti ketersediaan dan kurs saat konfirmasi."],
  ["Hotel atau setara/or similar.", "Hotel dapat diganti dengan hotel setara."],
  ["Private door-to-door pick-up & drop-off services", "Layanan jemput dan antar privat dari pintu ke pintu"],
  ["Private door-to-door pick- up and drop- off services", "Layanan jemput dan antar privat dari pintu ke pintu"],
  ["Professional and experienced English-speaking guide at each destination", "Pemandu wisata profesional berbahasa Inggris di setiap destinasi"],
  ["All entrance fees as mentioned in the itinerary", "Tiket masuk sesuai program perjalanan"],
  ["Meals as clearly mentioned in the itinerary", "Makan sesuai yang tercantum dalam program perjalanan"],
  ["03 Breakfasts at hotels", "3 kali sarapan di hotel"],
  ["02 Lunches (01 Lunch in Ninh Binh and 01 Lunch on Halong Bay Daycruise)", "2 kali makan siang (1 kali di Ninh Binh dan 1 kali di pelayaran harian Teluk Halong)"],
  ["Services charges and government tax", "Biaya layanan dan pajak pemerintah"],
  ["24/7 hotline customer services during the trip", "Hotline layanan pelanggan 24/7 selama perjalanan"],
  ["No extra charge after confirmation", "Tidak ada biaya tambahan setelah konfirmasi"],
  ["All airfares", "Semua tiket pesawat"],
  ["Travel insurance", "Asuransi perjalanan"],
  ["Other meals not clearly described in the program", "Makan lain yang tidak tercantum jelas dalam program"],
  ["Peak season or Public holidays surcharge if any", "Biaya tambahan musim ramai atau hari libur nasional jika ada"],
  ["Personal expenses such as drinks, telephone, laundry", "Pengeluaran pribadi seperti minuman, telepon, dan laundry"],
  ["Tips to the tour guide and driver for the day tours", "Tip untuk pemandu wisata dan pengemudi selama tur harian"],
  ["Vietnam visa fees", "Biaya visa Vietnam"],
]);

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(\d+)D(\d+)N\b/g, "$1 Hari $2 Malam"],
  [/\(B,L\)/g, "(Sarapan, Makan Siang)"],
  [/\(B\)/g, "(Sarapan)"],
  [/Northern Vietnam/gi, "Vietnam Utara"],
  [/South to North/gi, "Selatan ke Utara"],
  [/From North to South/gi, "dari Utara ke Selatan"],
  [/Halong Bay Day Cruise/gi, "Pelayaran Harian Teluk Halong"],
  [/Halong Bay/gi, "Teluk Halong"],
  [/Teluk Halong on land/gi, "Teluk Halong versi daratan"],
  [/Hanoi Arrival/gi, "Tiba di Hanoi"],
  [/Hanoi Departure/gi, "Kepulangan dari Hanoi"],
  [/Afternoon City Sightseeing Tour/gi, "Tur Kota Sore"],
  [/Afternoon City Tour/gi, "Tur Kota Sore"],
  [/Private Tour/gi, "Tur Privat"],
  [/SIC Tour/gi, "Tur SIC"],
  [/With Sapa/gi, "dengan Sapa"],
  [/With /g, "dengan "],
  [/Meals: Breakfast, Lunch/gi, "Makan: sarapan dan makan siang"],
  [/Meals: Breakfast/gi, "Makan: sarapan"],
  [/Meals: No meal/gi, "Makan: belum termasuk"],
  [/Overnight: ([^\n.]+)/gi, "Bermalam: $1"],
  [/No meal included/gi, "Makan belum termasuk"],
  [/No meals included/gi, "Makan belum termasuk"],
  [/Breakfast, Lunch included/gi, "Termasuk sarapan dan makan siang"],
  [/Breakfast included/gi, "Termasuk sarapan"],
  [/early check-in is excluded and subject to availability/gi, "early check-in belum termasuk dan mengikuti ketersediaan kamar"],
  [/early check-in excluded and subject to availability/gi, "early check-in belum termasuk dan mengikuti ketersediaan kamar"],
  [/Check in time is 14:00/gi, "Waktu check-in pukul 14.00"],
  [/Domestic flights quote separately: ([^.]+)\./gi, "Penerbangan domestik dihitung terpisah: $1."],
  [/private transfer/gi, "transfer privat"],
  [/\bdriver\b/gi, "pengemudi"],
  [/bamboo boat/gi, "perahu bambu"],
  [/sunset party/gi, "sesi menikmati matahari terbenam"],
];

const SENTENCE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/On arrival at Hanoi Airport, you are greeted by our driver \(no tour guide\) and taken to your hotel by private transfer\./gi, "Setibanya di Bandara Hanoi, Anda dijemput oleh driver kami (tanpa pemandu wisata) dan diantar ke hotel dengan private transfer."],
  [/Taking your leisure\./gi, "Waktu bebas untuk beristirahat."],
  [/14:30 Our tour guide and driver will escort you to the train street\./gi, "14.30 Pemandu wisata dan driver akan mengantar Anda ke Train Street."],
  [/After that, you continue to immerse yourself in the fresh atmosphere of Hoan Kiem Lake as well as taking photos with Ngoc Son temple and Red Bridge from outside\./gi, "Setelah itu, Anda menikmati suasana Danau Hoan Kiem serta berfoto di area luar Ngoc Son Temple dan Red Bridge."],
  [/End of the day by exploring Hanoi’s Old Quarter also known as the ‘36 streets’Hanoi\./gi, "Hari ditutup dengan menjelajahi Old Quarter Hanoi, kawasan yang dikenal sebagai 36 streets Hanoi."],
  [/This bustling area of narrow streets and alleys is home to literally thousands of small businesses and shopkeepers\. It's a great place to explore with plenty of photo opportunities\./gi, "Kawasan ini dipenuhi gang sempit, toko kecil, dan aktivitas lokal yang menarik untuk dijelajahi serta difoto."],
  [/Leaving Hanoi behind, we head out for a 2\.5- hour drive through rural northern Vietnam to Ninh Binh Province, famous for amazing karst mountains, misty caves and historical relics\./gi, "Setelah meninggalkan Hanoi, perjalanan dilanjutkan sekitar 2,5 jam menuju Provinsi Ninh Binh yang terkenal dengan pegunungan karst, gua berkabut, dan peninggalan sejarah."],
  [/The rice fields here are beautiful and the area has earned the nickname of ‘Halong Bay on land’\./gi, "Hamparan sawahnya indah, sehingga kawasan ini sering dijuluki Halong Bay on land."],
  [/Upon arrival, visit Hoa Lu ancient capital, the heart of the first three centralized feudal states of Vietnam: the Dinh, Le, and Ly dynasties\./gi, "Setibanya di sana, kunjungi Hoa Lu, ibu kota kuno yang menjadi pusat tiga dinasti awal Vietnam: Dinh, Le, dan Ly."],
  [/Then boarding the sampan for a 1\.5-hour boat trip cruising over a small canal among the paddy fields for 1km, visiting Tam Coc- meaning three caves, was created by the river of Ngo Dong flowing through a mountain\./gi, "Kemudian naik sampan selama sekitar 1,5 jam melewati kanal kecil di antara persawahan menuju Tam Coc, area tiga gua yang terbentuk dari aliran Sungai Ngo Dong."],
  [/A boat will take through these caves amid towering mountain views, via beautiful waterways lined with rice paddies\./gi, "Perahu akan membawa Anda melewati gua-gua tersebut di antara pemandangan tebing tinggi dan jalur air yang diapit sawah."],
  [/Breakfast at the hotel\./gi, "Sarapan di hotel."],
  [/8:15-8:50 Get picked up at the hotel in Hanoi Old Quarter\/ Opera House to depart Halong Bay/gi, "08.15-08.50 Dijemput di hotel area Hanoi Old Quarter/Opera House untuk berangkat menuju Teluk Halong"],
  [/Our journey follows Hanoi – Haiphong- Tuan Chau Highway \(about 2\.5-hour drive\)/gi, "Perjalanan mengikuti rute Hanoi - Haiphong - Tuan Chau Highway dengan durasi sekitar 2,5 jam"],
  [/12:00 Arrive at Tuan Chau Harbor, get on the boat to start the excursion discovering the beauty of the world heritage site/gi, "12.00 Tiba di Pelabuhan Tuan Chau, naik kapal, lalu mulai menjelajahi keindahan situs warisan dunia"],
  [/12:30 Enjoy a set menu lunch on the boat with many special dishes of Halong\./gi, "12.30 Menikmati set menu makan siang di kapal dengan hidangan khas Halong."],
  [/While having lunch, you all can see the beautiful scenery on both sides with thousands of limestone such as Fighting Chicken and Incense Bunner Islets – 2 symbols of Halong Bay/gi, "Sambil makan siang, Anda dapat melihat ribuan formasi batu kapur, termasuk Fighting Chicken dan Incense Burner Islets yang menjadi simbol Teluk Halong"],
  [/14:00 Arrive at Bo Hon Island, and you will visit Sung Sot Cave – the most beautiful cave with a lot of stalagmites and stalactites/gi, "14.00 Tiba di Pulau Bo Hon dan mengunjungi Gua Sung Sot, salah satu gua paling indah dengan banyak stalagmit dan stalaktit"],
  [/14:45 Do kayaking or bamboo boat through Luon Cave to discover the beautiful lagoon\./gi, "14.45 Aktivitas kayak atau naik perahu bambu melewati Gua Luon untuk melihat lagoon yang indah."],
  [/15:15 Visit TiTop Island with its sandy beach\./gi, "15.15 Mengunjungi Pulau TiTop dengan pantai berpasirnya."],
  [/You can go swimming here or trek up to the top of the island for sightseeing all of Halong bay/gi, "Anda dapat berenang atau trekking ke puncak pulau untuk menikmati panorama Teluk Halong"],
  [/16:00 Back to the boat for the sunset party \(some wine, fruits, and biscuits\) meanwhile the boat is cruising back to the harbor/gi, "16.00 Kembali ke kapal untuk sesi menikmati matahari terbenam sambil kapal berlayar kembali ke pelabuhan"],
  [/17:45 Arrive back at the harbor\. Get on the bus and return to Hanoi/gi, "17.45 Tiba kembali di pelabuhan, naik bus, lalu kembali menuju Hanoi"],
  [/20:30 Get dropped off at the hotel\. Tour ends\./gi, "20.30 Diantar kembali ke hotel. Tur selesai."],
  [/Today, after having breakfast at the hotel, you will be picked up by our driver to the airport to take a flight to come back to your home country \(without tour guide\)\./gi, "Setelah sarapan di hotel, Anda dijemput oleh driver menuju bandara untuk penerbangan kembali ke negara asal (tanpa pemandu wisata)."],
  [/It is time to say goodbye, we thank you so much for traveling with us and wish to welcome you back in the near future\./gi, "Terima kasih telah melakukan perjalanan bersama kami. Sampai jumpa pada perjalanan berikutnya."],
  [/03 nights in all 3\* or 4\* or 5\* hotels with central location, nice breakfast and comfortable rooms/gi, "3 malam di hotel bintang 3/4/5 berlokasi sentral, dengan sarapan baik dan kamar nyaman"],
  [/Bottled water is available on car \(02 bottled water per person per day\)/gi, "Air mineral tersedia di kendaraan (2 botol per orang per hari)"],
  [/01 FOC for the tour leader in double\/ twin sharing room applied for a group from 16 pax/gi, "Gratis 1 orang untuk tour leader di kamar double/twin sharing, berlaku untuk grup mulai 16 peserta"],
];

function applyTranslations(value: string) {
  let out = value.trim();

  for (const [pattern, replacement] of SENTENCE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  return out
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/ \)/g, ")")
    .trim();
}

export function localizePdfText(value?: string | null) {
  if (!value) return value ?? null;
  return value
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return EXACT_LINES.get(trimmed) ?? applyTranslations(trimmed);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function localizePdfTour<T extends LocalizablePdfTour>(tour: T): T {
  return {
    ...tour,
    title: localizePdfText(tour.title) ?? tour.title,
    cityHighlight: localizePdfText(tour.cityHighlight),
    duration: localizePdfText(tour.duration),
    itinerary: tour.itinerary.map((day) => ({
      ...day,
      title: localizePdfText(day.title) ?? day.title,
      description: localizePdfText(day.description) ?? day.description,
    })),
    inclusions: tour.inclusions.map((item) => localizePdfText(item) ?? item),
    exclusions: tour.exclusions.map((item) => localizePdfText(item) ?? item),
    visaInfo: localizePdfText(tour.visaInfo),
    notes: localizePdfText(tour.notes),
  };
}
