// Isi tiga halaman "pasti berangkat". Mesin dan tampilan sama (src/page.html, src/page.js, src/page.css);
// bedanya hanya di sini: teks halaman dan objek P yang dibaca src/page.js.
// Ubah file ini atau isi src/, lalu jalankan: npm run build:pasti-berangkat
import { readFileSync } from "node:fs";

const ICON = JSON.parse(readFileSync(new URL("./src/icons.json", import.meta.url), "utf8"));
const MEET = "Lobi Astra Hotel, Jl. Zheltoksan 12, Almaty";

const care = (icon, html, id = "") => `      <li${id ? ` id="${id}"` : ""}>${ICON[icon]}<p>${html}</p></li>`;
const how = (items) => items.map((x) => `      <li><p>${x}</p></li>`).join("\n");
const faq = (items) => items.map(([q, a]) => `        <dt>${q}</dt>\n        <dd>${a}</dd>`).join("\n");
const foot = (links) => "<span>Lihat juga:</span> " + links.map(([href, label]) => `<a href="${href}">${label}</a>`).join(" ");

const CARE_AIRPORT = care("flag", "<b>Di Bandara Almaty,</b> pemandu menjemput kamu dengan bendera SUNDAF Trip. Centang jemput bandara saat daftar; harganya menyusul dari admin.");
const CARE_CGK = care("plane", "<b>Berangkat dari Jakarta?</b> Tim SUNDAF Trip menemui kamu di Bandara Soekarno-Hatta (CGK) sebelum terbang.");
const CARE_MEET = care("pin", `<b>Titik kumpul tiap pagi:</b> <span id="meetText">${MEET}</span>. Menginap di hotel lain? Datang ke sini pada jam kumpul yang dikirim admin sehari sebelumnya.`, "careMeet");
const CARE_NIGHT = care("moon", '<b>Tiba malam?</b> Tetap dijemput, terpisah dari rombongan. <span id="nightText">Biaya transfer malam dikonfirmasi admin.</span>');
const CARE_KG = care("hop", "<b>Lanjut ke Kirgistan?</b> WNI perlu e-visa untuk masuk lewat darat, kami bantu urus. Kamu diantar sampai perbatasan Korday, lalu tim Kirgistan menjemput di seberang.");

const LEGEND_LAND = '<span><i></i>Sudah ada yang tiba</span><span><i class="on"></i>Tiba dan pulang</span><span><i class="band"></i>Di Almaty</span>';
const BATAL_ROOM = '      <p class="plain">Kalau sebagian anggota rombonganmu batal, kenaikan biaya anggota yang tersisa (misalnya kamar jadi sendiri) dipotong dulu dari pengembalian anggota yang batal.</p>\n';
const VISA_KZ = ["Perlu visa?", "Kazakhstan bebas visa sampai 30 hari untuk WNI."];
const MENYUSUL = ["Kenapa beberapa harga tertulis menyusul?", "Harga itu belum ada di penawaran yang kami terima, misalnya transfer bandara per mobil dan tur privat harian. Admin mengirimnya bersama harga pasti, sebelum kamu membayar apa pun."];
const OWN_HOTEL = ["Aku sudah punya hotel. Masih bisa ikut tur?", 'Bisa. Pilih hotel sendiri, lalu datang ke titik kumpul pada jam yang dikirim admin sehari sebelumnya. Cuma mau tur sehari? Pakai halaman <a href="/turharian">tur harian</a>.'];
const L_PB = ["/pastiberangkat", "Trip Almaty, pasti berangkat"];
const L_2T = ["/2tans", "Kazakhstan + Kirgistan"];
const L_TH = ["/turharian", "Tur harian Almaty"];
const L_KZ = ["/kazakhstan", "Pool Kazakhstan"];
// Contoh harga di atas halaman: tanggal di batch Maret 2027, sama dengan halaman lain.
const TWO_TOURS = { "2027-03-25": "kota", "2027-03-26": "charyn" };

export const PRODUCTS = {
  pastiberangkat: {
    P: {
      key: "pastiberangkat", pools: "arrivals", edges: true, singleFirst: false,
      kg: false, crossKg: true, hotel: true, paket: true, arrival: true, tips: true,
      menu: ["kota", "charyn", "privat", "hotel", "p5", "p6"],
      samples: [
        { l: "1 orang", s: "kamar sendiri", f: { d: "2027-03-24", e: "2027-03-27", pax: 1, kamar: 1, hari: TWO_TOURS } },
        { l: "2 orang", s: "kamar berdua", f: { d: "2027-03-24", e: "2027-03-27", pax: 2, kamar: 2, hari: TWO_TOURS } },
        { l: "3 orang", s: "kamar bertiga", f: { d: "2027-03-24", e: "2027-03-27", pax: 3, kamar: 3, hari: TWO_TOURS } },
      ],
      waIntro: "Halo admin SUNDAF Trip, ini rencana trip Almaty saya (halaman pasti berangkat).",
      share: "Aku lagi susun trip Almaty bareng SUNDAF Trip, tiba {d}. Tetap jalan walau daftar sendiri, tur bisa dibeli per hari. Yuk susun juga",
    },
    TITLE: "Trip Almaty, pasti berangkat · SUNDAF Trip",
    META_DESC: "Trip Almaty yang tetap jalan walau kamu daftar sendirian. Pilih tanggal tiba dan pulang, isi tur per hari, hotel boleh tidak. Harga per orang tidak bergantung pada jumlah peserta lain.",
    OG_DESC: "Tetap jalan walau kamu sendirian. Pilih tanggal bebas, isi harimu, hotel boleh tidak.",
    H1: "Trip Almaty, pasti berangkat",
    LEDE: "Tidak perlu menunggu kuota. Hotel dihitung dari kamarmu sendiri dan tur gabungan dibayar per kursi, jadi tripmu tetap jalan walau cuma kamu yang daftar.",
    CAP: "Contoh harga per orang, 4 hari 3 malam di Astra Hotel dengan 2 tur gabungan. Belum termasuk transfer bandara dan tips wajib Rp250 rb.",
    CTA: "Susun tripku",
    POOLS_TITLE: "Tanggal yang sudah dibuka",
    POOLS_UNIT: "tanggal tiba",
    NEW_DATE_BTN: "Tanggalku belum ada di daftar",
    MENU_TITLE: "Bisa dibeli per hari",
    MENU_NOTE: "Tur berangkat dari titik kumpul yang sama. Harga per orang; total per orang dibulatkan ke atas ke Rp10.000.",
    CARE_TITLE: "Didampingi dari bandara",
    CARE_ITEMS: [CARE_AIRPORT, CARE_CGK, CARE_MEET, CARE_NIGHT].join("\n"),
    HOW_ITEMS: how([
      "<b>Susun dan daftar.</b> Pilih tanggal, isi harimu, pilih hotel atau tidak, lalu kirim. Gratis, tanpa bayar.",
      "<b>Admin kirim harga pasti.</b> Termasuk layanan yang harganya menyusul, seperti transfer bandara dan tur privat. Semuanya sebelum kamu bayar apa pun.",
      "<b>DP 30% mengunci harga maksimal.</b> Pelunasan di tanggal kunci. Tripmu tetap jalan walau tidak ada peserta lain di tanggalmu, karena harganya dihitung dari rombonganmu sendiri.",
    ]),
    INCL: "Sesuai yang kamu pilih. Tur gabungan: kendaraan, pemandu, dan tiket sesuai program operator. Astra Hotel: kamar dan sarapan. Paket privat Almaty: hotel kalau dipilih, jemput dan antar bandara, mobil dan guide khusus rombonganmu, tiket masuk.",
    EXCL: "Tiket pesawat, tips wajib Rp250.000 per orang, makan siang dan malam, aktivitas tambahan, pengeluaran pribadi. Transfer bandara dan tur privat: harganya menyusul dari admin.",
    BATAL_NOTE: BATAL_ROOM,
    FAQ: faq([
      ["Benar tetap jalan walau aku sendirian?", "Ya. Harga per orang dihitung dari rombonganmu sendiri, bukan dari jumlah pendaftar lain, jadi tripmu tidak dibatalkan karena sepi. Tur gabungan dibayar per kursi, dan admin memastikan operatornya jalan di tanggalmu. Kalau tidak jalan, admin menawarkan tanggal lain atau tur privat dengan harga untuk rombonganmu, sebelum kamu membayar apa pun."],
      ["Kenapa kamar sendiri lebih mahal?", "Satu kamar dibayar penuh oleh satu orang, jadi per orangnya lebih mahal dari kamar berdua. Itu harga kamar, bukan tarif tur solo: tur gabungan tetap dibayar per kursi."],
      OWN_HOTEL,
      MENYUSUL,
      ["Mau sekalian ke Kirgistan?", 'Susun trip dua negara di <a href="/2tans">sundaftrip.com/2tans</a>.'],
      VISA_KZ,
    ]),
    FOOT_LINKS: foot([L_2T, L_TH, L_KZ]),
    DOCK_TITLE: "Trip Almaty, pasti berangkat",
    DOCK_CTA: "Susun",
    Q0: "Kapan kamu di Almaty?",
    Q0_SUB: "Ketuk tanggal tiba, lalu tanggal pulang. Tur sehari saja? Ketuk tanggal yang sama dua kali.",
    CHIPS_LABEL: "Sudah ada yang tiba di tanggal ini",
    CAL_LEGEND: LEGEND_LAND,
    Q2: "Isi harimu di Almaty",
  },
  "2tans": {
    P: {
      key: "2tans", pools: "arrivals", edges: true, singleFirst: false,
      kg: true, crossKg: false, hotel: true, paket: true, arrival: true, tips: true,
      menu: ["kota", "charyn", "privat", "hotel", "kgg", "kgp", "p5", "p6"],
      samples: [
        { l: "Tur sehari", s: "tanpa hotel", f: { d: "2027-03-26", e: "2027-03-26", hotel: "sendiri", hari: { "2027-03-26": "charyn" } } },
        { l: "5 hari", s: "Almaty, hotel, 2 tur", f: { d: "2027-03-24", e: "2027-03-28", hari: TWO_TOURS } },
        { l: "8 hari", s: "+ Kirgistan 3 hari", f: { d: "2027-03-24", e: "2027-03-31", kg: "gabungan", kgMulai: "2027-03-28", hari: TWO_TOURS } },
      ],
      waIntro: "Halo admin SUNDAF Trip, ini rencana trip Kazakhstan + Kirgistan saya (halaman 2tans).",
      share: "Aku lagi susun trip Kazakhstan + Kirgistan bareng SUNDAF Trip, tiba di Almaty {d}. Tur bisa dibeli per hari, hotel boleh tidak. Yuk susun juga",
    },
    TITLE: "Trip Kazakhstan + Kirgistan · SUNDAF Trip",
    META_DESC: "Susun trip Kazakhstan + Kirgistan sendiri. Pilih tanggal tiba dan pulang, isi tur per hari, hotel boleh tidak, lalu lanjut ke Kirgistan. Mau tur sehari saja juga bisa.",
    OG_DESC: "Pilih tanggal bebas, isi harimu, hotel boleh tidak. Titik kumpul sudah diatur.",
    H1: "Trip Kazakhstan + Kirgistan, susun sendiri",
    LEDE: "Pilih tanggal tiba dan pulang, lalu isi harimu: tur harian, hotel kalau perlu, dan lanjut ke Kirgistan. Mau tur sehari saja juga bisa, titik kumpulnya sudah kami atur.",
    CAP: "Contoh harga per orang, kamar berdua. Belum termasuk transfer bandara, e-visa Kirgistan, dan tips wajib Rp250 rb.",
    CTA: "Susun tripku",
    POOLS_TITLE: "Tanggal yang sudah dibuka",
    POOLS_UNIT: "tanggal tiba",
    NEW_DATE_BTN: "Tanggalku belum ada di daftar",
    MENU_TITLE: "Bisa dibeli per hari",
    MENU_NOTE: "Tur berangkat dari titik kumpul yang sama. Harga per orang; total per orang dibulatkan ke atas ke Rp10.000.",
    CARE_TITLE: "Didampingi dari bandara",
    CARE_ITEMS: [CARE_AIRPORT, CARE_CGK, CARE_MEET, CARE_NIGHT, CARE_KG].join("\n"),
    HOW_ITEMS: how([
      "<b>Susun dan daftar.</b> Pilih tanggal, isi harimu, pilih hotel atau tidak, lalu kirim. Gratis, tanpa bayar.",
      "<b>Admin kirim harga pasti.</b> Termasuk layanan yang harganya menyusul, seperti transfer bandara, tur privat, dan e-visa. Semuanya sebelum kamu bayar apa pun.",
      "<b>DP 30% mengunci harga maksimal.</b> Pelunasan di tanggal kunci. Tagihan akhirmu tidak lebih tinggi dari harga saat DP, dan bisa turun kalau peserta lain yang sudah DP ikut layanan privat yang sama.",
    ]),
    INCL: "Sesuai yang kamu pilih. Tur gabungan: kendaraan, pemandu, dan tiket sesuai program operator. Astra Hotel: kamar dan sarapan. Tur gabungan Kirgistan: penginapan dan makan. Paket privat Almaty: hotel kalau dipilih, jemput dan antar bandara, mobil dan guide khusus rombonganmu, tiket masuk.",
    EXCL: "Tiket pesawat, tips wajib Rp250.000 per orang, makan siang dan malam (kecuali di tur gabungan Kirgistan), aktivitas tambahan, pengeluaran pribadi. Transfer bandara, tur privat, e-visa Kirgistan, dan transfer ke perbatasan: harganya menyusul dari admin.",
    BATAL_NOTE: BATAL_ROOM,
    FAQ: faq([
      ["Bisa ikut kalau sendirian?", "Bisa. Tur gabungan dibayar per kursi. Kami pastikan operatornya tetap jalan untuk 1 tamu; kalau tidak, admin menawarkan tanggal lain atau tur privat dengan harga untuk 1 orang. Kamar sendiri di hotel dibayar penuh, dan itu tidak sama dengan tarif tur solo."],
      OWN_HOTEL,
      ["Kenapa beberapa harga tertulis menyusul?", "Harga itu belum ada di penawaran yang kami terima, misalnya transfer bandara per mobil, tur privat harian, dan e-visa. Admin mengirimnya bersama harga pasti, sebelum kamu membayar apa pun."],
      ["Kalau peserta lain batal, hargaku naik?", "Tidak. Harga saat DP adalah harga maksimal dan dihitung dari rombonganmu sendiri. Kalau peserta dari rombongan lain yang sudah DP memakai layanan privat yang sama, tagihanmu malah bisa turun di tanggal kunci."],
      ["Perlu visa?", "Kazakhstan bebas visa sampai 30 hari untuk WNI. Kirgistan perlu visa: untuk masuk lewat darat dari Almaty, urus e-visa sebelum berangkat. Kami bantu prosesnya."],
    ]),
    FOOT_LINKS: foot([L_PB, L_TH, L_KZ]),
    DOCK_TITLE: "Trip Kazakhstan + Kirgistan",
    DOCK_CTA: "Susun",
    Q0: "Kapan kamu di Almaty?",
    Q0_SUB: "Ketuk tanggal tiba, lalu tanggal pulang. Tur sehari saja? Ketuk tanggal yang sama dua kali.",
    CHIPS_LABEL: "Sudah ada yang tiba di tanggal ini",
    CAL_LEGEND: LEGEND_LAND,
    Q2: "Isi harimu di Almaty",
  },
  turharian: {
    P: {
      key: "turharian", pools: "tours", edges: false, singleFirst: true,
      kg: false, crossKg: false, hotel: false, paket: false, arrival: false, tips: false,
      menu: ["kota", "charyn", "privat"],
      samples: [
        { l: "Charyn", s: "+ Kolsay, 1 hari", f: { d: "2027-03-26", e: "2027-03-26", pax: 1, hari: { "2027-03-26": "charyn" } } },
        { l: "Shymbulak", s: "+ kota, 1 hari", f: { d: "2027-03-25", e: "2027-03-25", pax: 1, hari: { "2027-03-25": "kota" } } },
        { l: "Dua tur", s: "dua-duanya, 2 hari", f: { d: "2027-03-25", e: "2027-03-26", pax: 1, hari: TWO_TOURS } },
      ],
      waIntro: "Halo admin SUNDAF Trip, saya mau ikut tur harian di Almaty (halaman tur harian).",
      share: "Aku ikut tur harian di Almaty bareng SUNDAF Trip, mulai {d}. Bayar per kursi, kumpul di lobi Astra Hotel. Yuk ikut",
    },
    TITLE: "Tur harian Almaty · SUNDAF Trip",
    META_DESC: "Beli tur sehari di Almaty tanpa paket: Charyn Canyon, Kolsay, Medeu, Shymbulak. Bayar per kursi, kumpul di lobi Astra Hotel. Bisa mulai 1 orang.",
    OG_DESC: "Tur sehari dari Almaty, bayar per kursi. Titik kumpul di lobi Astra Hotel.",
    H1: "Tur sehari di Almaty, tanpa paket",
    LEDE: "Sudah punya hotel dan tiket? Pilih tanggal dan turnya saja. Kumpul pagi di lobi Astra Hotel, lalu jalan bareng tamu lain.",
    CAP: "Contoh harga per orang. Belum termasuk makan dan ongkos ke titik kumpul.",
    CTA: "Pilih tanggal tur",
    POOLS_TITLE: "Tur yang sudah ada pendaftarnya",
    POOLS_UNIT: "tanggal tur",
    NEW_DATE_BTN: "Pilih tanggal lain",
    MENU_TITLE: "Pilihan tur",
    MENU_NOTE: "Semua berangkat dari lobi Astra Hotel. Harga per orang; total pesananmu dibulatkan ke atas ke Rp10.000.",
    CARE_TITLE: "Titik kumpul sudah diatur",
    CARE_ITEMS: [
      care("pin", `<b>Titik kumpul:</b> <span id="meetText">${MEET}</span>. Jam kumpul dikirim admin lewat WhatsApp sehari sebelumnya.`, "careMeet"),
      care("hop", "<b>Bareng tamu lain.</b> Tur gabungan dibayar per kursi, jadi bisa mulai 1 orang. Admin memastikan turnya jalan di tanggalmu sebelum kamu bayar."),
      care("plane", '<b>Butuh hotel dan jemput bandara juga?</b> Susun trip lengkap di <a href="/pastiberangkat">sundaftrip.com/pastiberangkat</a>.'),
    ].join("\n"),
    HOW_ITEMS: how([
      "<b>Pilih tanggal dan tur.</b> Satu hari atau beberapa hari, lalu kirim. Gratis, tanpa bayar.",
      "<b>Admin memastikan kursinya.</b> Admin mengecek jadwal operator, lalu mengirim harga pasti lewat WhatsApp. Jam kumpul dikirim sehari sebelum tur.",
      "<b>DP 30% mengunci harga maksimal.</b> Pelunasan di tanggal kunci. Daftar setelah tanggal kunci langsung lunas.",
    ]),
    INCL: "Sesuai program operator tur gabungan: kendaraan, pemandu, dan tiket masuk. Tur kota dan Shymbulak termasuk kereta gantung.",
    EXCL: "Makan, ongkos ke titik kumpul, aktivitas tambahan di Shymbulak, pengeluaran pribadi. Tur privat: harganya menyusul dari admin.",
    BATAL_NOTE: "",
    FAQ: faq([
      ["Bisa ikut sendirian?", "Bisa. Tur gabungan dibayar per kursi. Admin memastikan operatornya jalan di tanggalmu; kalau tidak jalan, admin menawarkan tanggal lain atau tur privat, sebelum kamu membayar apa pun."],
      ["Jam berapa kumpulnya?", "Tur berangkat pagi. Jam pastinya bergantung pada operator dan musim, jadi admin mengirimnya lewat WhatsApp sehari sebelumnya."],
      ["Hotelku jauh dari titik kumpul.", "Ongkos ke lobi Astra Hotel ditanggung sendiri. Mau dijemput di hotelmu? Tulis di catatan; admin mengecek apakah bisa dan berapa biayanya."],
      ["Akhir Maret ke Kolsay aman?", "Jalan ke Kolsay dan Kaindy bisa bersalju di akhir Maret. Admin memastikan jadwal Charyn & Kolsay sebelum kamu bayar."],
      VISA_KZ,
    ]),
    FOOT_LINKS: foot([L_PB, L_2T, L_KZ]),
    DOCK_TITLE: "Tur harian Almaty",
    DOCK_CTA: "Pilih",
    Q0: "Kapan mau ikut tur?",
    Q0_SUB: "Ketuk tanggal turnya. Mau beberapa hari? Ketuk juga hari terakhirnya.",
    CHIPS_LABEL: "Sudah ada yang daftar tur di tanggal ini",
    CAL_LEGEND: '<span><i></i>Sudah ada yang daftar</span><span><i class="on"></i>Hari pertama dan terakhir</span><span><i class="band"></i>Di antaranya</span>',
    Q2: "Pilih turnya",
  },
};
