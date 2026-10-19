(function () {
  'use strict';

  /* Satu mesin untuk tiga halaman "pasti berangkat": /pastiberangkat (Kazakhstan), /2tans (Kazakhstan + Kirgistan),
     dan /turharian (tur harian). Bedanya diatur oleh P di bawah (diisi saat build).
     Data lewat /api/pasti-berangkat (Next.js), yang meneruskan ke Apps Script di Google Sheet "SUNDAF · Pasti Berangkat".
     Dibuka dari file lokal atau dengan ?demo=1: memakai data contoh dan tidak menyimpan apa pun. */
  var API_URL = '/api/pasti-berangkat';
  var P = /*__PRODUCT__*/{};
  var DEMO_MODE = location.protocol === 'file:' || /[?&]demo=1(&|$)/.test(location.search);
  var LIVE = !!API_URL && !DEMO_MODE;

  /* ===================== KONFIGURASI — ubah di sini ===================== */
  var CONFIG = {
    waAdmin: '6281775202759', // nomor WhatsApp admin (sama dengan Pool Kazakhstan); data dari Apps Script didahulukan
    kursUSD: 17950,           // Rp per USD (sama dengan Pool Kazakhstan)
    kursKZT: 454,             // KZT per USD
    cadanganKurs: 0.03,       // cadangan kurs 3%
    markup: 0.15,             // markup SUNDAF dari modal lengkap
    opsPerOrang: 0,           // biaya operasional SUNDAF per orang (Rp)
    pembulatan: 10000,        // total per orang dibulatkan ke atas
    tipsWajib: 250000,        // tips wajib per orang untuk land tour, ditagih terpisah (0 = tidak ditampilkan)
    biayaAdminBatal: 0,       // biaya administrasi pembatalan (Rp); 0 = nominal tidak ditampilkan
    batchMaret: { dari: '2027-03-01', sampai: '2027-03-31', tanggalKunci: '2027-02-05' },
    hariKunci: 45,            // di luar batch: tanggal kunci = 45 hari sebelum tiba
    hargaPer: '18 Oktober 2026',
    minDays: 7,               // tanggal paling cepat: hari ini + 7 (sama dengan Pool Kazakhstan)
    maxNights: 21,            // rencana paling panjang
    maxPax: 30,               // orang per pendaftaran
    milestones: [6],          // grup WA dibuka saat 6 orang tiba di tanggal yang sama
    meet: 'Lobi Astra Hotel, Jl. Zheltoksan 12, Almaty',
    meetTime: ''              // contoh '08:30'; kosong = jam kumpul dikirim admin sehari sebelumnya
  };

  /* Harga modal (sebelum markup). Status: mitra = penawaran tertulis; publik = harga publik;
     estimasi = turunan atau sudah lewat masa berlaku; tunggu = belum ada harga. */
  var HOTEL = {
    nama: 'Astra Hotel',
    kamarUSD: { 1: 59, 2: 64, 3: 70 },     // per kamar per malam, termasuk sarapan
    status: 'publik',
    sumber: 'harga publik Booking.com, dicek 18 Okt 2026 untuk 22–31 Mar 2027 (dipakai angka tertinggi)'
  };
  var TUR = {
    kota: { nama: 'Almaty kota, Medeu, Shymbulak, Kok-Tobe', pendek: 'Kota & Shymbulak', kzt: 27000, status: 'publik',
      ds: 'Tur gabungan sehari, termasuk kereta gantung.', info: 'Tur gabungan sehari, termasuk kereta gantung. Acuan harga musim dingin.' },
    charyn: { nama: 'Charyn Canyon, Danau Kolsay, Danau Kaindy', pendek: 'Charyn & Kolsay', kzt: 18000, status: 'publik',
      ds: 'Tur gabungan sehari ke ngarai dan danau pegunungan.', info: 'Tur gabungan sehari ke ngarai dan danau pegunungan. Akhir Maret jalan ke Kolsay–Kaindy bisa bersalju; admin memastikan jadwalnya.' },
    privat: { nama: 'Tur privat rombongan', pendek: 'Tur privat', kzt: 0, status: 'tunggu',
      ds: 'Mobil dan guide khusus rombonganmu, rute bisa diatur.', info: 'Mobil dan guide berbahasa Inggris khusus rombonganmu, rutenya bisa diatur.' }
  };
  var TUR_KEYS = ['kota', 'charyn', 'privat'];
  var KG = {
    gabungan: { nama: 'Tur gabungan Kirgistan 3 hari 2 malam', hari: 3, malam: 2, usd: 585, status: 'publik', jadwal: ['2027-03-28'] },
    privat: { nama: 'Tur privat Kirgistan 4 hari 3 malam', hari: 4, malam: 3, status: 'mitra', berlaku: '2026-11-15',
      tier: { 10: 432, 12: 527, 14: 482, 16: 449, 18: 422, 20: 401, 22: 384, 24: 436, 26: 427 }, singleUSD: 105 }
  };
  var PAKET = {
    p5: { nama: 'Paket privat Almaty 5 hari 4 malam', malam: 4, hariTur: 3, tier: { 2: 504, 4: 381, 6: 309, 10: 314, 14: 317, 20: 288, 30: 256 } },
    p6: { nama: 'Paket privat Almaty 6 hari 5 malam', malam: 5, hariTur: 4, tier: { 2: 685, 4: 443, 6: 368, 10: 378, 14: 380, 20: 346, 30: 308 } },
    status: 'mitra',
    potongTanpaHotelUSD: 90   // perkiraan: 3 malam x USD 30 per orang (harga publik terendah kamar berdua)
  };
  var TAMBAHAN = [   // harga jual per orang, sama dengan halaman Pool Kazakhstan
    { id: 'kuda', nama: 'Berkuda', ds: 'Mulai 15 menit, bergantung cuaca', rp: 165140, mulai: true },
    { id: 'para', nama: 'Paralayang', ds: 'Bergantung cuaca', rp: 1692685 },
    { id: 'paragg', nama: 'Kereta gantung ke puncak (untuk paralayang)', rp: 309638 },
    { id: 'parafoto', nama: 'Foto paralayang', rp: 144498 },
    { id: 'paravideo', nama: 'Video paralayang', rp: 247710 },
    { id: 'parafv', nama: 'Foto dan video paralayang', rp: 309638 },
    { id: 'atv', nama: 'Mengendarai ATV', ds: 'Mulai 20 menit', rp: 1032125, mulai: true },
    { id: 'zip', nama: 'Gorilla ZipLine', ds: 'Tutup Selasa, Rabu, dan Kamis', rp: 309638, zip: true },
    { id: 'ziph', nama: 'Gorilla ZipLine horizontal', ds: 'Tutup Selasa, Rabu, dan Kamis', rp: 619275, zip: true },
    { id: 'alpine', nama: 'Alpine park', rp: 206425 },
    { id: 'tali', nama: 'Taman tali', rp: 144498, mulai: true },
    { id: 'taligg', nama: 'Kereta gantung ke Medeo (untuk taman tali)', rp: 247710 },
    { id: 'burung', nama: 'Pertunjukan burung pemburu', rp: null }
  ];
  /* ===================================================================== */

  var STATUS = { mitra: 'penawaran mitra', publik: 'harga publik', estimasi: 'perkiraan', tunggu: 'harga menyusul' };
  var ADMIN = /[?&]admin=1(&|$)/.test(location.search);
  var TOURS = P.pools === 'tours';
  var LAST = 5, DONE = 6;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var MONL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  var DAYL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var CHECK_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_HOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="17.5" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="19" cy="6.5" r="2.3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 15.5 17 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3.2"/><circle class="hop-dot" r="1.9"/></svg>';
  var ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><g class="pin-head"><path d="M12 21s-6.2-5.5-6.2-10.4a6.2 6.2 0 0 1 12.4 0C18.2 15.5 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10.6" r="2.3" fill="var(--bar)"/></g></svg>';
  var ICON_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.6A7.6 7.6 0 1 1 9.4 4.5a6 6 0 0 0 10.1 10.1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path class="moon-star" d="M17.3 2.6l.75 1.65 1.65.75-1.65.75-.75 1.65-.75-1.65-1.65-.75 1.65-.75z"/><path class="moon-star s2" d="M21.2 8.4l.45 1 1 .45-1 .45-.45 1-.45-1-1-.45 1-.45z"/></svg>';
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tOf(k) { var p = k.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function keyOf(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function addDays(k, n) { return keyOf(tOf(k) + n * 864e5); }
  function diff(a, b) { return Math.round((tOf(a) - tOf(b)) / 864e5); }   // a - b, dalam hari
  function dow(k) { return new Date(tOf(k)).getUTCDay(); }
  function short(k) { var p = k.split('-'); return (+p[2]) + ' ' + MON[+p[1] - 1]; }
  function dayShort(k) { return DAYS[dow(k)] + ', ' + short(k); }
  function mid(k) { var p = k.split('-'); return DAYS[dow(k)] + ', ' + (+p[2]) + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function long(k) { var p = k.split('-'); return DAYL[dow(k)] + ', ' + (+p[2]) + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function jt(n) { return 'Rp' + (Math.round(n / 1e4) / 100).toFixed(2).replace('.', ',') + ' jt'; }
  function harga(n) { return n >= 1e6 ? jt(n) : 'Rp' + Math.round(n / 1000) + ' rb'; }
  function rp(n) { return 'Rp' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pct(x) { return Math.round(x * 1000) / 10 + '%'; }
  function validDate(k) { return /^\d{4}-\d{2}-\d{2}$/.test(k || ''); }
  function monthOf(k) { var p = k.split('-'); return { y: +p[0], m: +p[1] - 1 }; }
  function jakartaToday() { return keyOf(Date.now() + 7 * 36e5); }
  function li(x) { return '<li>' + esc(x) + '</li>'; }
  function setText(sel, t) { var el = $(sel); if (el) el.textContent = t; return el; }
  var MOUTH = ['M8.4 14.4q3.6 3.1 7.2 0', 'M8.2 13.7q3.8 4.6 7.6 0z', 'M9.6 14.9q2.4 1.6 4.8 0', 'M8.6 14.2q3.4 2.6 6.8 0'];
  function face(i, me) {
    var m = MOUTH[i % MOUTH.length], fill = i % MOUTH.length === 1 ? ' style="fill:var(--face)"' : '';
    return '<span class="av c' + (i % 5 + 1) + (me ? ' me' : '') + '" style="--k:' + i + '"><svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle class="bg" cx="12" cy="12" r="12"/><circle class="cheek" cx="6.6" cy="13.6" r="1.7"/><circle class="cheek" cx="17.4" cy="13.6" r="1.7"/>' +
      '<circle class="eye" cx="8.7" cy="10.2" r="1.25"/><circle class="eye" cx="15.3" cy="10.2" r="1.25"/><path class="mouth" d="' + m + '"' + fill + '/></svg></span>';
  }
  function stack(n, max, delay, more) {
    if (!n) return '';
    var k = Math.min(n, max), h = '';
    for (var i = 0; i < k; i++) h += face(i);
    if (more && n > k) h += '<span class="av-more" style="--k:' + k + '">+' + (n - k) + '</span>';
    return '<span class="stack" style="--d:' + (delay || 0) + 'ms" aria-hidden="true">' + h + '</span>';
  }
  function rangeShort(d, e) {
    var a = d.split('-'), b = e.split('-');
    if (d === e) return short(d);
    return a[1] === b[1] ? (+a[2]) + '–' + (+b[2]) + ' ' + MON[+a[1] - 1] : short(d) + '–' + short(e);
  }
  function rangeKeys(d, e) {
    var a = d.split('-'), b = e.split('-');
    if (d === e) return (+a[2]) + ' ' + MONL[+a[1] - 1] + ' ' + a[0];
    if (a[0] === b[0] && a[1] === b[1]) return (+a[2]) + '–' + (+b[2]) + ' ' + MONL[+a[1] - 1] + ' ' + a[0];
    if (a[0] === b[0]) return (+a[2]) + ' ' + MONL[+a[1] - 1] + ' – ' + (+b[2]) + ' ' + MONL[+b[1] - 1] + ' ' + a[0];
    return (+a[2]) + ' ' + MONL[+a[1] - 1] + ' ' + a[0] + ' – ' + (+b[2]) + ' ' + MONL[+b[1] - 1] + ' ' + b[0];
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '')) ? String(u) : ''; }
  function normWa(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (d.charAt(0) === '0') d = '62' + d.slice(1); else if (d.charAt(0) === '8') d = '62' + d;
    return d.length >= 10 && d.length <= 15 ? d : '';
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('sundafpb.' + P.key + '.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('sundafpb.' + P.key + '.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function saveTheme(v) { try { localStorage.setItem('sundafPool.theme', JSON.stringify(v)); } catch (e) {} }   // sama dengan Pool Kazakhstan

  /* ---------------- harga ---------------- */
  function factor() { return CONFIG.kursUSD * (1 + CONFIG.cadanganKurs) * (1 + CONFIG.markup); }
  function rpItem(usd) { return Math.ceil(usd * factor() / 1000) * 1000; }
  function rpTotal(usd) { return Math.ceil((usd * CONFIG.kursUSD * (1 + CONFIG.cadanganKurs) + CONFIG.opsPerOrang) * (1 + CONFIG.markup) / CONFIG.pembulatan) * CONFIG.pembulatan; }
  function kztUSD(kzt) { return kzt / CONFIG.kursKZT; }
  function susunKamar(n, pref) {
    var rooms = [], sisa = n;
    pref = pref === 1 || pref === 3 ? pref : 2;
    while (sisa >= pref) { rooms.push(pref); sisa -= pref; }
    if (sisa > 0) rooms.push(sisa);
    return rooms;
  }
  function teksKamar(rooms) {
    var c = { 1: 0, 2: 0, 3: 0 }, parts = [];
    rooms.forEach(function (r) { c[r]++; });
    if (c[2]) parts.push(c[2] + ' kamar berdua');
    if (c[3]) parts.push(c[3] + ' kamar bertiga');
    if (c[1]) parts.push(c[1] + ' kamar sendiri');
    return parts.join(', ');
  }
  function perMalamUSD(rooms) { return rooms.reduce(function (s, r) { return s + HOTEL.kamarUSD[r]; }, 0); }
  function isNauryz(k) { var m = k.slice(5); return (m >= '03-21' && m <= '03-23') || k === '2027-03-24'; }
  function kgOpsi(p, d, e) { var out = [], last = diff(e, d) - p.hari; for (var k = 1; k <= last; k++) out.push(addDays(d, k)); return out; }
  function endOf(f) { return validDate(f.e) && f.e >= f.d ? f.e : f.d; }
  function todayKey() { return S.data && S.data.today ? S.data.today : jakartaToday(); }
  function kgPrivStatus() { return todayKey() > KG.privat.berlaku ? 'estimasi' : KG.privat.status; }
  function tierList(t) { var k = Object.keys(t); return k.slice(0, -1).join(', ') + ', dan ' + k[k.length - 1]; }
  function minTier(t) { var m = Infinity; Object.keys(t).forEach(function (k) { m = Math.min(m, t[k]); }); return m; }

  /* Hitung rencana. Murni dari data form f dan P, tanpa DOM. */
  function hitung(f) {
    var r = { error: '', nights: 0, almaty: 0, e: '', list: [], lines: [], wait: [], extra: [], warn: [], kgWarn: [], usd: 0, pp: 0, rooms: [], kgDays: [], kgP: null };
    if (!validDate(f.d)) { r.error = 'Pilih tanggal dulu.'; return r; }
    var e = endOf(f), nights = diff(e, f.d), n = f.pax, kgWarn = [], i, k;
    var mode = P.paket ? f.mode : 'harian', hotelOn = P.hotel && f.hotel !== 'sendiri', kgKind = P.kg ? f.kg : 'tidak';
    r.e = e; r.nights = nights;

    // Kirgistan
    var kgP = null, kgDays = [];
    if (kgKind !== 'tidak' && KG[kgKind]) {
      var opsi = kgOpsi(KG[kgKind], f.d, e);
      if (!opsi.length) kgWarn.push('Rencanamu terlalu pendek untuk ' + KG[kgKind].nama.toLowerCase() + ': perlu ' + KG[kgKind].hari + ' hari penuh, ditambah sehari kembali ke Almaty sebelum pulang.');
      else if (opsi.indexOf(f.kgMulai) < 0) kgWarn.push('Pilih tanggal berangkat ke Kirgistan.');
      else { kgP = KG[kgKind]; for (i = 0; i < kgP.hari; i++) kgDays.push(addDays(f.kgMulai, i)); }
    }
    var almaty = nights - (kgP ? kgP.malam : 0);
    r.almaty = almaty;

    // daftar hari (tur harian: semua hari penuh, tanpa hari tiba dan pulang)
    for (k = 0; k <= nights; k++) {
      var d = addDays(f.d, k), kind;
      if (nights === 0) kind = 'single';
      else if (kgDays.indexOf(d) >= 0) kind = 'kg';
      else if (P.edges && k === 0) kind = 'tiba';
      else if (P.edges && k === nights) kind = 'pulang';
      else kind = 'full';
      r.list.push({ d: d, k: k, act: '', kind: kind });
    }
    var rooms = susunKamar(n, n === 1 ? 1 : f.kamar);
    r.rooms = rooms;
    var full = r.list.filter(function (h) { return h.kind === 'full'; });

    if (mode === 'paket') {
      var p = PAKET[f.paket] || PAKET.p5, tier = p.tier[n];
      full.forEach(function (h, j) { if (j < p.hariTur) h.kind = 'paket'; });
      if (full.length < p.hariTur) r.warn.push('Hari penuh di Almaty hanya ' + full.length + ', sedangkan ' + p.nama.toLowerCase() + ' berisi ' + p.hariTur + ' hari tur. Pilih paket yang lebih pendek atau tambah tanggal.');
      if (tier === undefined) r.wait.push(p.nama + ' untuk ' + n + ' orang');
      else r.lines.push({ label: p.nama + (hotelOn ? ', termasuk hotel' : ', tanpa hotel'), usd: hotelOn ? tier : tier - PAKET.potongTanpaHotelUSD,
        status: hotelOn ? PAKET.status : 'estimasi',
        x: hotelOn ? 'Hotel kamar berdua, jemput dan antar bandara, mobil, guide, tiket masuk.' : 'Perkiraan kasar: harga paket dikurangi 3 malam hotel.',
        adm: hotelOn ? 'tarif mitra USD ' + tier + '/orang untuk ' + n + ' orang' : 'USD ' + tier + ' − USD ' + PAKET.potongTanpaHotelUSD + ' (3 malam × USD 30)' });
      if (hotelOn && n > 1 && f.kamar !== 2) r.wait.push('Selisih kamar ' + (f.kamar === 1 ? 'sendiri' : 'bertiga') + ' di paket privat');
      var lebih = almaty - p.malam;
      if (lebih > 0 && hotelOn) r.lines.push({ label: 'Malam tambahan di ' + HOTEL.nama + ', ' + lebih + ' malam, ' + teksKamar(rooms), usd: perMalamUSD(rooms) * lebih / n, status: HOTEL.status,
        adm: 'USD ' + perMalamUSD(rooms) + '/malam untuk rombongan × ' + lebih + ' malam ÷ ' + n + ' orang' });
      if (lebih < 0) r.warn.push('Paket ini ' + p.malam + ' malam di Almaty, sedangkan rencanamu ' + almaty + ' malam di Almaty. Pilih paket yang lebih pendek atau tambah tanggal.');
    } else if (hotelOn && almaty > 0) {
      r.lines.push({ label: HOTEL.nama + ', ' + almaty + ' malam, ' + teksKamar(rooms), usd: perMalamUSD(rooms) * almaty / n, status: HOTEL.status,
        x: 'Termasuk sarapan.', adm: 'USD ' + perMalamUSD(rooms) + '/malam untuk rombongan × ' + almaty + ' malam ÷ ' + n + ' orang' });
    }

    // kegiatan per hari
    r.list.forEach(function (h) {
      if (h.kind === 'kg' || h.kind === 'paket') return;
      var a = f.hari[h.d];
      if (!a || !TUR[a]) return;
      h.act = a;
      var t = TUR[a];
      if (t.kzt) r.lines.push({ label: dayShort(h.d) + ': ' + t.nama, usd: kztUSD(t.kzt), status: t.status, d: h.d, adm: t.kzt + ' KZT ÷ ' + CONFIG.kursKZT });
      else r.wait.push(dayShort(h.d) + ': ' + t.nama.toLowerCase());
    });

    // Kirgistan
    if (kgP) {
      var label = rangeShort(kgDays[0], kgDays[kgDays.length - 1]) + ': ' + kgP.nama;
      if (kgKind === 'gabungan') {
        r.lines.push({ label: label, usd: kgP.usd, status: kgP.status, x: 'Termasuk penginapan dan makan.', adm: 'USD ' + kgP.usd + '/orang' });
        if (kgP.jadwal.indexOf(kgDays[0]) < 0) kgWarn.push('Jadwal tur gabungan Kirgistan yang sudah tercantum: 28–30 Maret 2027. Untuk tanggal lain, admin mengecek jadwalnya dulu.');
        if (rooms.indexOf(1) >= 0) r.wait.push('Tambahan kamar sendiri di tur gabungan Kirgistan');
      } else {
        var t2 = kgP.tier[n];
        if (t2 === undefined) r.wait.push(label + ' untuk ' + n + ' orang');
        else {
          var singles = rooms.filter(function (x) { return x === 1; }).length, st = kgPrivStatus();
          r.lines.push({ label: label, usd: t2 + kgP.singleUSD * singles / n, status: st,
            x: st === 'estimasi' ? 'Harga penawaran mitra berlaku sampai 15 Nov 2026; admin mengecek ulang.' : '',
            adm: 'USD ' + t2 + '/orang untuk ' + n + ' orang' + (singles ? ' + USD ' + kgP.singleUSD + ' × ' + singles + ' kamar sendiri ÷ ' + n : '') + '; berlaku s.d. ' + kgP.berlaku });
        }
      }
      r.wait.push('E-visa Kirgistan');
      r.wait.push('Transfer Almaty ke perbatasan Kirgistan dan kembali');
    }

    // transfer (paket privat sudah termasuk; tur harian tanpa transfer)
    if (P.arrival && mode !== 'paket' && nights > 0) {
      if (f.via !== 'lokal' && f.jemput) r.wait.push((f.via === 'darat' ? 'Jemput setibanya di Almaty' : 'Jemput di Bandara Almaty') + (f.via === 'pesawat' && isNight(f.t) ? ', tarif malam' : ''));
      if (f.antar) r.wait.push('Antar ke Bandara Almaty saat pulang');
    }

    // tambahan dan pengecekan
    TAMBAHAN.forEach(function (t) { if (f.add.indexOf(t.id) >= 0) r.extra.push({ label: t.nama + (t.mulai ? ' (mulai)' : ''), rp: t.rp }); });
    var kota = r.list.filter(function (h) { return h.act === 'kota'; });
    if (r.extra.length && mode !== 'paket' && !kota.length) r.warn.push('Kamu memilih aktivitas di Shymbulak, tetapi belum ada hari Shymbulak di rencanamu.');
    var zip = TAMBAHAN.filter(function (t) { return t.zip && f.add.indexOf(t.id) >= 0; });
    if (zip.length && mode !== 'paket' && kota.length && kota.every(function (h) { var w = dow(h.d); return w >= 2 && w <= 4; }))
      r.warn.push('Gorilla ZipLine tutup Selasa, Rabu, dan Kamis, sedangkan hari Shymbulak-mu jatuh di hari itu.');
    var first = r.list[0], last = r.list[r.list.length - 1];
    if (first && first.kind === 'tiba' && TUR[first.act] && f.via === 'pesawat' && f.t && f.t >= '07:00')
      r.warn.push('Kamu mendarat jam ' + f.t.replace(':', '.') + ', sedangkan tur di hari tiba berangkat pagi dari titik kumpul. Cek lagi rencana hari pertamamu.');
    if (last && last.kind === 'pulang' && TUR[last.act]) r.warn.push('Ada tur di hari pulang. Pastikan pesawat pulangmu malam hari.');

    r.kgWarn = kgWarn;
    r.warn = kgWarn.concat(r.warn);
    r.usd = r.lines.reduce(function (s, b) { return s + b.usd; }, 0);
    r.pp = r.usd > 0 || CONFIG.opsPerOrang ? rpTotal(r.usd) : 0;
    r.kgDays = kgDays; r.kgP = kgP;
    return r;
  }
  function tourCount(r) { return r.list.filter(function (h) { return TUR[h.act]; }).length; }
  function isEmptyPlan(r) { return !r.lines.length && !r.wait.filter(function (w) { return !/^(Jemput|Antar)/.test(w); }).length; }
  function tanggalKunci(d) {
    if (!validDate(d)) return '';
    var b = CONFIG.batchMaret;
    if (d >= b.dari && d <= b.sampai) return b.tanggalKunci;
    return addDays(d, -CONFIG.hariKunci);
  }

  /* ---------------- state ---------------- */
  var S = {
    data: null, sort: 'n', step: 0, open: false, busy: false, heroSeen: true, prevP: {}, res: null, cal: null,
    day: '', dateNote: '', stripSig: '', planText: '',
    f: { d: '', e: '', pax: 2, flex: false, mode: 'harian', paket: 'p5', hari: {}, kg: 'tidak', kgMulai: '', hotel: 'astra', kamar: 2, hn: '', add: [],
      via: 'pesawat', t: '', fl: '', jemput: true, antar: true, note: '', name: '', wa: '' },
    mine: store.get('mine', [])
  };
  (function () {
    var dr = store.get('draft', null), f = S.f;
    if (!dr || typeof dr !== 'object') return;
    ['d', 'e', 'kgMulai', 'name', 'wa', 'fl', 'hn', 'note'].forEach(function (k) { if (typeof dr[k] === 'string') f[k] = dr[k]; });
    if (!validDate(f.d)) f.d = '';
    if (!validDate(f.e) || f.e < f.d) f.e = '';
    if (!validDate(f.kgMulai)) f.kgMulai = '';
    var pax = dr.pax | 0; if (pax >= 1 && pax <= CONFIG.maxPax) f.pax = pax;
    f.flex = !!dr.flex;
    if (/^\d{2}:\d{2}$/.test(dr.t || '')) f.t = dr.t;
    if (/^(pesawat|darat|lokal)$/.test(dr.via || '')) f.via = dr.via;
    if (dr.mode === 'paket') f.mode = 'paket';
    if (dr.paket === 'p6') f.paket = 'p6';
    if (dr.hotel === 'sendiri') f.hotel = 'sendiri';
    if (dr.kamar === 1 || dr.kamar === 3) f.kamar = dr.kamar;
    if (dr.kg === 'gabungan' || dr.kg === 'privat') f.kg = dr.kg;
    if (dr.hari && typeof dr.hari === 'object') Object.keys(dr.hari).forEach(function (k) { if (validDate(k) && TUR[dr.hari[k]]) f.hari[k] = dr.hari[k]; });
    if (Array.isArray(dr.add)) f.add = dr.add.filter(function (id) { return TAMBAHAN.some(function (t) { return t.id === id; }); });
    if (dr.jemput === false) f.jemput = false;
    if (dr.antar === false) f.antar = false;
  })();
  function saveDraft() { store.set('draft', S.f); }

  /* Rapikan pilihan yang tidak cocok dengan halaman ini, atau tidak lagi cocok setelah tanggal atau jumlah orang berubah. */
  function fixKgStart() {
    var f = S.f;
    if (f.kg === 'tidak' || !validDate(f.d)) return;
    var opsi = kgOpsi(KG[f.kg], f.d, endOf(f));
    if (opsi.indexOf(f.kgMulai) < 0) f.kgMulai = defaultKgStart(f.kg, opsi);
  }
  function defaultKgStart(kind, opsi) {
    if (!opsi.length) return '';
    if (kind === 'gabungan') { var s = KG.gabungan.jadwal.filter(function (x) { return opsi.indexOf(x) >= 0; })[0]; if (s) return s; }
    return opsi[opsi.length - 1];   // paling lambat: Almaty dulu, Kirgistan, lalu pulang dari Almaty
  }
  function norm() {
    var f = S.f;
    if (!P.kg) { f.kg = 'tidak'; f.kgMulai = ''; }
    if (!P.hotel) f.hotel = 'sendiri';
    if (!P.paket) f.mode = 'harian';
    if (!P.arrival) { f.via = 'lokal'; f.jemput = false; f.antar = false; f.t = ''; f.fl = ''; }
    if (f.pax < 3 && f.kamar === 3) f.kamar = 2;
    if (!validDate(f.d)) return;
    var e = endOf(f);
    if (f.kg !== 'tidak') { if (!kgOpsi(KG[f.kg], f.d, e).length) { f.kg = 'tidak'; f.kgMulai = ''; } else fixKgStart(); }
    if (f.mode === 'paket') {
      var r = hitung(f);
      if (r.almaty < PAKET.p5.malam) f.mode = 'harian';
      else if (f.paket === 'p6' && r.almaty < PAKET.p6.malam) f.paket = 'p5';
    }
  }
  norm();

  /* ---------------- data ---------------- */
  function call(fn, arg) {
    if (!LIVE) return demo(fn, arg);
    var sameOrigin = API_URL.charAt(0) === '/';
    if (fn === 'getPools') return fetch(sameOrigin ? API_URL : API_URL + (API_URL.indexOf('?') < 0 ? '?' : '&') + 'api=pools&t=' + Date.now()).then(function (r) { return r.json(); });
    return fetch(API_URL, { method: 'POST', body: JSON.stringify(arg) }).then(function (r) { return r.json(); });
  }

  var DEMO = null;
  function demoData() {
    var today = jakartaToday(), now = Date.now(), act = {};
    function mk(o, n, dp, kg, len) { var d = addDays(today, o); return { d: d, n: n, dp: dp, kg: kg, r: Math.ceil(n / 2), e: addDays(d, len), g: n >= CONFIG.milestones[0] }; }
    function a(o, k, n) { var d = addDays(today, o); (act[d] = act[d] || {})[k] = n; }
    var pools = [mk(157, 7, 2, 4, 7), mk(155, 4, 2, 2, 8), mk(160, 3, 0, 0, 4), mk(52, 2, 0, 0, 3), mk(78, 5, 2, 2, 7)];
    a(158, 'kota', 5); a(159, 'charyn', 6); a(156, 'kota', 2); a(161, 'charyn', 3); a(53, 'kota', 2); a(80, 'charyn', 3); a(190, 'charyn', 1); a(159, 'kota', 2);
    return {
      ok: true, demo: true, version: 1, open: true, today: today, minDays: CONFIG.minDays, maxPax: CONFIG.maxPax, milestones: CONFIG.milestones.slice(),
      wa: '', share: '', meet: CONFIG.meet, meetTime: CONFIG.meetTime, night: { from: '22:00', to: '06:00', fee: 0 }, pools: pools, act: act,
      recent: [{ d: pools[0].d, n: 2, t: now - 4 * 6e4, p: '2tans' }, { d: addDays(today, 159), n: 2, t: now - 9 * 6e4, p: 'turharian' }, { d: pools[4].d, n: 1, t: now - 21 * 6e4, p: 'pastiberangkat' },
        { d: pools[1].d, n: 2, t: now - 70 * 6e4, p: '2tans' }, { d: addDays(today, 161), n: 3, t: now - 3 * 36e5, p: 'turharian' }],
      total: pools.reduce(function (s, p) { return s + p.n; }, 0), updated: now
    };
  }
  function demo(fn, arg) {
    if (!DEMO) DEMO = demoData();
    return new Promise(function (res) {
      setTimeout(function () {
        if (fn === 'getPools') return res(JSON.parse(JSON.stringify(DEMO)));
        var x = arg || {}, p = null, prev = 0, actOut = {};
        if (x.page !== 'turharian') {
          DEMO.pools.forEach(function (q) { if (q.d === x.d) p = q; });
          if (!p) { p = { d: x.d, n: 0, dp: 0, kg: 0, r: 0, e: x.e || x.d, g: false }; DEMO.pools.push(p); }
          prev = p.n;
          p.n += x.pax; p.r += 1; if (x.kg && x.kg !== 'tidak') p.kg += x.pax; if (x.e > p.e) p.e = x.e; p.g = p.n >= DEMO.milestones[0];
          DEMO.total += x.pax;
        }
        Object.keys(x.hari || {}).forEach(function (d) {
          var a = DEMO.act[d] || (DEMO.act[d] = {});
          a[x.hari[d]] = (a[x.hari[d]] || 0) + x.pax;
          actOut[d] = JSON.parse(JSON.stringify(a));
        });
        DEMO.recent.unshift({ d: x.d, n: x.pax, t: Date.now(), p: x.page });
        res({ ok: true, demo: true, kode: 'PB-DEMO', updated: false, prev: prev, act: actOut,
          pool: p ? { d: p.d, n: p.n, dp: p.dp, kg: p.kg, r: p.r, e: p.e } : null, group: '', wa: '', share: '' });
      }, fn === 'getPools' ? 200 : 900);
    });
  }
  function provisional() {
    return { ok: true, prov: true, version: 1, open: true, today: jakartaToday(), minDays: CONFIG.minDays, maxPax: CONFIG.maxPax, milestones: CONFIG.milestones.slice(),
      wa: '', share: '', meet: CONFIG.meet, meetTime: CONFIG.meetTime, night: { from: '22:00', to: '06:00', fee: 0 }, pools: [], act: {}, recent: [], total: 0 };
  }

  function ms() { var m = S.data && S.data.milestones; return m && m.length ? m : CONFIG.milestones; }
  function cap() { var m = ms(); return m[m.length - 1]; }
  function minKey() { var md = S.data && S.data.minDays !== undefined ? S.data.minDays : CONFIG.minDays; return addDays(todayKey(), md); }
  function maxKey() { return addDays(todayKey(), 450); }
  function maxPax() { return (S.data && S.data.maxPax) || CONFIG.maxPax; }
  function pools() { return (S.data && S.data.pools) || []; }
  function poolOf(d) { var f = null; pools().forEach(function (p) { if (p.d === d) f = p; }); return f; }
  function actCount(d, k) { var a = S.data && S.data.act && S.data.act[d]; return (a && a[k]) || 0; }
  function actTotal(d) { var n = 0; TUR_KEYS.forEach(function (k) { n += actCount(d, k); }); return n; }
  function dayCount(d) { if (TOURS) return actTotal(d); var p = poolOf(d); return p ? p.n : 0; }
  /* Tur harian: tanggal tur yang sudah ada pesertanya, dari hitungan per hari. */
  function tourPools() {
    var act = (S.data && S.data.act) || {}, today = todayKey(), out = [];
    Object.keys(act).forEach(function (d) {
      if (!validDate(d) || d < today) return;
      var tours = TUR_KEYS.filter(function (k) { return act[d][k] > 0; }).map(function (k) { return { k: k, n: act[d][k] }; });
      if (tours.length) out.push({ d: d, n: tours.reduce(function (s, t) { return s + t.n; }, 0), tours: tours });
    });
    return out;
  }
  function waAdmin() { return normWa((S.data && S.data.wa) || CONFIG.waAdmin); }
  function meetText() {
    var m = S.data && S.data.meet !== undefined ? S.data.meet : CONFIG.meet, t = S.data && S.data.meetTime !== undefined ? S.data.meetTime : CONFIG.meetTime;
    return m ? m + (t ? ', jam ' + t.replace(':', '.') : '') : '';
  }
  function nightCfg() { return S.data && S.data.night !== undefined ? S.data.night : { from: '22:00', to: '06:00', fee: 0 }; }
  function isNight(t) { var n = nightCfg(); if (!t || !n) return false; return n.from > n.to ? (t >= n.from || t < n.to) : (t >= n.from && t < n.to); }
  function nightFee() { var n = nightCfg(); return n && n.fee ? 'biaya transfer malam ' + rp(n.fee) + ' per penjemputan' : 'biaya transfer malam dikonfirmasi admin'; }
  function status(n, g) {
    var m0 = ms()[0];
    if (n < m0) return { tone: '', text: (m0 - n) + ' orang lagi, grup WA dibuka' };
    return { tone: 'done', text: g ? 'Grup WA aktif' : 'Grup WA dibuka' };
  }

  /* ---------------- halaman ---------------- */
  function barHTML(n, p0, labels) {
    var m = ms(), c = cap(), p = Math.min(n / c, 1);
    var marks = m.slice(0, -1).map(function (x) { return '<i class="mark"' + (n >= x ? ' data-on="1"' : '') + ' style="--x:' + (x / c).toFixed(4) + '"></i>'; }).join('');
    var lab = labels ? '<div class="bar-l" aria-hidden="true">' + m.map(function (x) { return '<span style="--x:' + (x / c).toFixed(4) + '">' + x + '</span>'; }).join('') + '</div>' : '';
    return '<div class="bar' + (n >= c ? ' full' : '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="' + c + '" aria-valuenow="' + Math.min(n, c) + '" aria-label="' + n + ' orang, grup WA dibuka di ' + c + ' orang">' +
      '<span class="fill" style="--p:' + (p0 === undefined ? p : p0).toFixed(4) + '" data-p="' + p.toFixed(4) + '"></span>' + marks + '</div>' + lab;
  }
  function animateBars(root, delay) {
    var go = function () {
      $$('.fill', root).forEach(function (f) { f.style.setProperty('--p', f.getAttribute('data-p')); });
      $$('.mark[data-on]', root).forEach(function (t) { t.classList.add('on'); });
    };
    requestAnimationFrame(function () { requestAnimationFrame(function () { delay ? setTimeout(go, delay) : go(); }); });
  }
  function countUp(el, from, to, dur) {
    if (reduce || from === to) { el.textContent = to; return; }
    var t0 = performance.now(); dur = dur || 900;
    (function step(t) {
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  function blankF(o) {
    var f = { d: '', e: '', pax: 2, flex: false, mode: 'harian', paket: 'p5', hari: {}, kg: 'tidak', kgMulai: '', hotel: 'astra', kamar: 2, hn: '', add: [], via: 'lokal', t: '', fl: '', jemput: false, antar: false };
    for (var k in o) if (o.hasOwnProperty(k)) f[k] = o[k];
    return f;
  }
  function renderHeader() {
    $('#tiers').innerHTML = (P.samples || []).map(function (s) {
      return '<li><span>' + esc(s.l) + '</span><b>' + harga(hitung(blankF(s.f)).pp) + '</b><small>' + esc(s.s) + '</small></li>';
    }).join('');
    var mt = meetText(), cm = $('#careMeet');
    if (cm) cm.hidden = !mt;
    setText('#meetText', mt);
    var nf = nightFee();
    setText('#nightText', nf.charAt(0).toUpperCase() + nf.slice(1) + '.');
    $('#modePill').classList.toggle('demo', !LIVE);
    $('#modeText').textContent = LIVE ? 'Live' : 'Contoh';
    $('#demoNote').hidden = LIVE;
  }
  function srcTag(st) { return '<small class="src src-' + st + '">' + STATUS[st] + '</small>'; }
  function renderMenu() {
    var kg = KG.privat.tier, p5 = PAKET.p5.tier, p6 = PAKET.p6.tier;
    var rows = {
      kota: [TUR.kota.nama, TUR.kota.info, rp(rpItem(kztUSD(TUR.kota.kzt))), TUR.kota.status],
      charyn: [TUR.charyn.nama, TUR.charyn.info, rp(rpItem(kztUSD(TUR.charyn.kzt))), TUR.charyn.status],
      privat: [TUR.privat.nama, TUR.privat.info, 'menyusul', 'tunggu'],
      hotel: ['Astra Hotel bintang 3, dengan sarapan', 'Per orang per malam, kamar berdua. Bertiga ' + rp(rpItem(HOTEL.kamarUSD[3] / 3)) + ', sendiri ' + rp(rpItem(HOTEL.kamarUSD[1])) + '. Lobinya titik kumpul tur.', rp(rpItem(HOTEL.kamarUSD[2] / 2)), HOTEL.status],
      kgg: ['Kirgistan, tur gabungan 3 hari 2 malam', 'Termasuk penginapan dan makan. Jadwal tercantum 28–30 Maret 2027.', rp(rpItem(KG.gabungan.usd)), KG.gabungan.status],
      kgp: ['Kirgistan, tur privat 4 hari 3 malam', 'Untuk rombongan 10–26 orang. ' + rp(rpItem(kg[10])) + ' per orang untuk 10 orang.', 'mulai ' + rp(rpItem(minTier(kg))), kgPrivStatus()],
      p5: [PAKET.p5.nama, 'Hotel, jemput dan antar bandara, mobil, guide, tiket. ' + rp(rpItem(p5[2])) + ' per orang untuk 2 orang.', 'mulai ' + rp(rpItem(minTier(p5))), PAKET.status],
      p6: [PAKET.p6.nama, 'Isi sama dengan paket 5 hari, plus 1 hari tur. ' + rp(rpItem(p6[2])) + ' per orang untuk 2 orang.', 'mulai ' + rp(rpItem(minTier(p6))), PAKET.status]
    };
    $('#menu').innerHTML = (P.menu || []).map(function (k) { var r = rows[k]; return r ? '<li><span>' + esc(r[0]) + '<small>' + esc(r[1]) + '</small></span><b>' + esc(r[2]) + srcTag(r[3]) + '</b></li>' : ''; }).join('');
  }
  function renderRules() {
    var b = CONFIG.batchMaret, src = ['Tur harian: harga publik operator tur gabungan di Almaty, dalam tenge (KZT), dihitung dengan ' + CONFIG.kursKZT + ' KZT per USD.'];
    if (P.hotel) src.push('Astra Hotel: ' + HOTEL.sumber + '.');
    if (P.kg) src.push('Kirgistan tur gabungan: harga publik operator, USD ' + KG.gabungan.usd + ' per orang.');
    if (P.paket) src.push(P.kg ? 'Kirgistan tur privat dan paket privat Almaty: penawaran tertulis mitra kami. Penawaran Kirgistan berlaku sampai ' + long(KG.privat.berlaku) + '.' : 'Paket privat Almaty: penawaran tertulis mitra kami.');
    src.push('Harga dihitung dari USD (kurs ' + rp(CONFIG.kursUSD) + ') dan bisa berubah mengikuti kurs. Total per orang dibulatkan ke atas ke Rp10.000.');
    src.push('Harga per ' + CONFIG.hargaPer + '. Admin mengirim harga pasti sebelum DP.');
    $('#srcList').innerHTML = src.map(li).join('');
    var rules = [
      'DP 30% dalam 3×24 jam setelah admin mengirim harga pasti. Harga saat DP adalah harga maksimal: tagihanmu tidak naik, kecuali kamu mengubah layanan, tanggal' + (P.hotel ? ', atau kamar' : '') + ', atau jumlah orang di rombonganmu berkurang.',
      'Pelunasan di tanggal kunci. Untuk ' + (TOURS ? 'tur' : 'kedatangan') + ' ' + MONL[+b.dari.slice(5, 7) - 1] + ' ' + b.dari.slice(0, 4) + ': ' + long(b.tanggalKunci) + '. Tanggal lain: ' + CONFIG.hariKunci + ' hari sebelumnya. Daftar setelah tanggal kunci langsung lunas.',
      'Di tanggal kunci tagihan akhir dihitung ulang, dan bisa turun kalau peserta lain yang sudah DP memakai layanan privat yang sama. Yang dihitung hanya peserta yang sudah DP atau lunas, bukan semua pendaftar.'
    ];
    if (P.hotel) rules.push('Kamar hanya dibagi di dalam rombonganmu sendiri. Kamar sendiri dibayar penuh, dan itu tidak sama dengan tarif tur solo.');
    $('#ruleList').innerHTML = rules.map(li).join('');
    $('#batal1').textContent = (CONFIG.biayaAdminBatal ? 'Biaya administrasi ' + rp(CONFIG.biayaAdminBatal) : 'Biaya administrasi') + ' + biaya mitra yang tidak bisa dikembalikan';
    $('#hargaPer').textContent = 'Harga perkiraan per ' + CONFIG.hargaPer + ', dari penawaran mitra dan harga publik.';
  }

  function renderStats(first) {
    var total = 0, dates = 0;
    if (TOURS) tourPools().forEach(function (p) { total += p.n; dates++; });
    else pools().forEach(function (p) { if (p.d >= todayKey()) { total += p.n; if (p.n > 0) dates++; } });
    if (first || !$('#liveStack').firstChild) $('#liveStack').innerHTML = stack(total, 5, 150);
    if (first) { countUp($('#statTotal'), 0, total, 1000); countUp($('#statDates'), 0, dates, 800); }
    else { $('#statTotal').textContent = total; $('#statDates').textContent = dates; }
  }
  var tickTimer = null, tickIdx = 0;
  function ago(t) {
    var s = (Date.now() - t) / 1000;
    if (s < 60) return 'baru saja'; if (s < 3600) return Math.floor(s / 60) + ' mnt lalu';
    if (s < 86400) return Math.floor(s / 3600) + ' jam lalu'; return Math.floor(s / 86400) + ' hari lalu';
  }
  function renderTicker() {
    var el = $('#ticker'), items = ((S.data && S.data.recent) || []).filter(function (r) { return r && r.d && r.n && (TOURS ? r.p === 'turharian' : r.p !== 'turharian'); });
    clearInterval(tickTimer);
    if (!items.length) { el.hidden = true; return; }
    el.hidden = false; tickIdx = 0;
    var text = function () { var r = items[tickIdx++ % items.length]; return 'Terakhir: +' + r.n + ' orang ' + (TOURS ? 'daftar tur ' : 'tiba ') + short(r.d) + ', ' + ago(r.t); };
    el.textContent = text();
    if (items.length > 1 && !reduce) tickTimer = setInterval(function () {
      el.classList.add('fading');
      setTimeout(function () { el.textContent = text(); el.classList.remove('fading'); }, 400);
    }, 4200);
  }
  function renderPools(first) {
    var list = $('#poolList'), today = todayKey();
    var items = TOURS ? tourPools() : pools().filter(function (p) { return p.n > 0 && p.d >= today; });
    if (!items.length) {
      list.innerHTML = '<li class="empty"><b>' + (TOURS ? 'Belum ada tur yang terisi.' : 'Belum ada tanggal yang dibuka.') + '</b><span>Jadi yang pertama. ' + (TOURS ? 'Tanggal turmu' : 'Tanggal tibamu') + ' langsung muncul di sini begitu kamu daftar.</span>' +
        '<button type="button" class="btn btn-primary btn-sm" data-new="1">' + (TOURS ? 'Pilih tanggal tur' : 'Susun trip pertama') + '</button></li>';
      return;
    }
    items.sort(S.sort === 'n'
      ? function (a, b) { return b.n - a.n || (a.d < b.d ? -1 : 1); }
      : function (a, b) { return a.d < b.d ? -1 : 1; });
    if (TOURS) {
      list.innerHTML = items.map(function (p, i) {
        var days = diff(p.d, today), mine = S.mine.some(function (x) { return x.d === p.d; });
        return '<li class="pool tour-pool' + (first ? '' : ' still') + '" style="--i:' + i + '" data-d="' + p.d + '">' +
          '<div class="pool-top"><div class="pool-when"><b>' + mid(p.d) + '</b><span>' + (days > 0 ? days + ' hari lagi' : 'hari ini') + (mine ? ' <span class="mine">· kamu ikut</span>' : '') + '</span></div></div>' +
          '<ul class="tp">' + p.tours.map(function (t) {
            return '<li><span class="tp-n">' + (first ? stack(t.n, 3, 250 + i * 60) : stack(t.n, 3).replace('class="stack"', 'class="stack still"')) + '<span><b>' + esc(TUR[t.k].pendek) + '</b><small>' + t.n + ' orang daftar</small></span></span>' +
              '<button type="button" class="btn btn-line btn-sm" data-ikut="' + p.d + '|' + t.k + '" aria-label="Ikut ' + esc(TUR[t.k].nama) + ', ' + esc(long(p.d)) + '">Ikut</button></li>';
          }).join('') + '</ul></li>';
      }).join('');
      return;
    }
    list.innerHTML = items.map(function (p, i) {
      var st = status(p.n, p.g), mine = S.mine.some(function (x) { return x.d === p.d; });
      var prev = first ? 0 : (S.prevP[p.d] !== undefined ? S.prevP[p.d] : 0), days = diff(p.d, today), meta = [days > 0 ? days + ' hari lagi' : 'hari ini'];
      if (p.dp) meta.push(p.dp + ' sudah DP');
      if (p.kg && P.kg) meta.push(p.kg + ' lanjut Kirgistan');
      return '<li class="pool' + (first ? '' : ' still') + '" style="--i:' + i + '" data-d="' + p.d + '">' +
        '<div class="pool-top"><div class="pool-when"><b>' + mid(p.d) + '</b><span>' + esc(meta.join(' · ')) + (mine ? ' <span class="mine">· kamu ikut</span>' : '') + '</span></div>' +
        '<button type="button" class="btn btn-line btn-sm" data-join="' + p.d + '" aria-label="Tiba ' + esc(long(p.d)) + ', susun tripmu">Gabung</button></div>' +
        barHTML(p.n, prev, false) +
        '<p class="pool-meta"><span>' + (first ? stack(p.n, 3, 250 + i * 60) : stack(p.n, 3).replace('class="stack"', 'class="stack still"')) + '<b class="num" data-to="' + p.n + '">' + (first ? 0 : p.n) + '</b>&nbsp;orang tiba</span><span class="st ' + st.tone + '">' + esc(st.text) + '</span></p>' +
        '</li>';
    }).join('');
    items.forEach(function (p) { S.prevP[p.d] = Math.min(p.n / cap(), 1); });
    animateBars(list, first ? 250 : 0);
    if (first) $$('.num[data-to]', list).forEach(function (el, i) { setTimeout(function () { countUp(el, 0, +el.getAttribute('data-to'), 900); }, 250 + i * 60); });
  }
  function resort() {
    var list = $('#poolList'), before = {};
    $$('.pool', list).forEach(function (el) { before[el.getAttribute('data-d')] = el.getBoundingClientRect().top; });
    renderPools(false);
    if (reduce || !Element.prototype.animate) return;
    $$('.pool', list).forEach(function (el) {
      var b = before[el.getAttribute('data-d')]; if (b === undefined) return;
      var dy = b - el.getBoundingClientRect().top;
      if (dy) el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,.8,.26,1)' });
    });
  }
  function renderAll(first) { renderHeader(); renderStats(first); renderTicker(); renderPools(first); renderMenu(); }

  /* ---------------- sheet ---------------- */
  function err(step, msg, field) {
    var el = $('#err' + step); if (!el) return;
    $$('[aria-invalid]', $('.step[data-step="' + step + '"]')).forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!msg) { el.hidden = true; return; }
    el.textContent = msg; el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    if (field) { var f = $(field); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } }
    else el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }
  /* Tombol daftar tidak boleh diam saat data belum masuk (Apps Script bisa 2-5 detik). */
  function openFrom(btn, d, act) {
    if (S.data) return openSheet(d, act);
    if (S.loadFailed) { S.data = provisional(); return openSheet(d, act); }
    if (S.pending) return;
    S.pending = { d: d || '', act: act || '', btn: btn || null };
    if (btn) { btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); }
    S.pendingT = setTimeout(function () { flushPending(true); }, 2500);
  }
  function flushPending(fallback) {
    var p = S.pending;
    if (!p) return;
    if (!S.data) { if (!fallback) return; S.data = provisional(); }
    clearTimeout(S.pendingT); S.pending = null;
    if (p.btn) { p.btn.classList.remove('busy'); p.btn.removeAttribute('aria-busy'); }
    openSheet(p.d, p.act);
  }
  function openSheet(d, act) {
    if (!S.data) return;
    if (S.data.open === false) { closedNote(); return; }
    S.open = true;
    var f = S.f;
    if (d) {
      if (P.singleFirst) { f.d = d; f.e = d; S.dateNote = ''; }
      else applyStart(d, true);
      if (act && TUR[act]) f.hari[d] = act;
    }
    if (f.d && (f.d < minKey() || f.d > maxKey())) { f.d = ''; f.e = ''; }
    if (f.e && (!f.d || f.e < f.d || f.e > maxKey() || diff(f.e, f.d) > CONFIG.maxNights)) f.e = '';
    norm(); saveDraft(); S.dateNote = ''; S.day = ''; S.stripSig = '';
    var shEl = $('#sheet'); shEl.classList.remove('settled', 'closing'); shEl.style.transform = '';
    $('#backdrop').hidden = false; $('#backdrop').style.opacity = ''; shEl.hidden = false;
    document.documentElement.classList.add('locked');
    updateDock();
    $('#fName').value = f.name; $('#fWa').value = f.wa; $('#fNote').value = f.note; $('#fFlex').checked = f.flex; $('#fHn').value = f.hn;
    [0, 1, 2, 3, 4, 5].forEach(function (i) { err(i, ''); });
    $('#waFallback').hidden = true;
    S.cal = monthOf(f.d || minKey());
    renderChips(); renderCal(0); updateDate();
    $('.success').classList.remove('drawn');
    $$('.step').forEach(function (s) { s.hidden = true; });
    S.step = -1;
    go(0, true);
  }
  function closedNote() {
    var list = $('#poolList'), note = document.createElement('li');
    note.className = 'load-err';
    note.textContent = 'Pendaftaran lagi ditutup sementara. Coba lagi nanti, ya.';
    list.insertBefore(note, list.firstChild);
    setTimeout(function () { if (note.parentNode) note.parentNode.removeChild(note); }, 4000);
  }
  function closeSheet() {
    if (!S.open) return;
    S.open = false;
    var sh = $('#sheet'), bd = $('#backdrop'), wasDone = S.step === DONE, d = S.res && S.res.d;
    sh.classList.remove('settled', 'dragging'); sh.classList.add('closing'); bd.classList.add('closing');
    setTimeout(function () {
      sh.hidden = true; bd.hidden = true; sh.classList.remove('closing'); bd.classList.remove('closing');
      sh.style.transform = ''; bd.style.opacity = '';
      document.documentElement.classList.remove('locked');
      updateDock();
      if (wasDone) {
        var f = S.f;
        f.d = ''; f.e = ''; f.hari = {}; f.kg = 'tidak'; f.kgMulai = ''; f.add = []; f.mode = 'harian'; f.pax = 2; f.flex = false; f.t = ''; f.fl = ''; f.note = '';
        saveDraft();
        var row = d && $('.pool[data-d="' + d + '"]');
        if (row) { row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); }
      }
    }, reduce ? 0 : 300);
  }
  function stepSkipped(n) {
    if ((n === 1 && !P.kg) || (n === 3 && !P.hotel) || (n === 4 && !P.arrival)) return true;   // tidak ada di halaman ini
    if (!validDate(S.f.d)) return false;
    var r = hitung(S.f);
    if (n === 1) return !kgOpsi(KG.gabungan, S.f.d, r.e).length;   // terlalu pendek untuk Kirgistan
    if (n === 3) return r.almaty <= 0;                             // tidak ada malam di Almaty
    if (n === 4) return r.nights === 0;                            // sehari saja
    return false;
  }
  /* Posisi di bilah progres, hanya menghitung langkah yang dipakai. */
  function progOf(n) {
    var vis = [];
    for (var i = 0; i <= LAST; i++) if (i === n || !stepSkipped(i)) vis.push(i);
    return { s: n === DONE ? vis.length : vis.indexOf(n) + 1, t: vis.length };
  }
  function nextIdx(n) { var i = n + 1; while (i < LAST && stepSkipped(i)) i++; return i; }
  function prevIdx(n) { var i = n - 1; while (i > 0 && stepSkipped(i)) i--; return Math.max(0, i); }
  function go(n, instant) {
    var cur = $('.step[data-step="' + S.step + '"]'), nx = $('.step[data-step="' + n + '"]');
    var dir = n >= S.step ? 'fwd' : 'back';
    if (cur && cur !== nx) cur.hidden = true;
    nx.hidden = false; nx.classList.remove('fwd', 'back'); void nx.offsetWidth;
    if (!instant && !reduce) nx.classList.add(dir);
    S.step = n;
    var pg = progOf(n);
    $('#prog').style.setProperty('--s', pg.s); $('#prog').style.setProperty('--steps', pg.t);
    $('#backBtn').style.visibility = n === 0 || n === DONE ? 'hidden' : 'visible';
    $('#prog').style.visibility = n === DONE ? 'hidden' : 'visible';
    $('#sheet').setAttribute('aria-labelledby', n === DONE ? 'sTitle' : 'q' + n);
    $('#sheet').scrollTop = 0;
    if (n === 0 && !instant) { renderChips(); renderCal(0); updateDate(); }
    if (n === 1) renderKgStep();
    if (n === 2) renderPlan();
    if (n === 3) renderHotel();
    if (n === 4) renderArrival();
    if (n === 5) renderReview();
    if (n > 0 && n < DONE) renderCta();
    var q = $('.q', nx);
    if (q) q.focus({ preventScroll: true });
  }
  function next(n) {
    var f = S.f, r;
    if (n === 0) {
      if (!f.d) return err(0, P.singleFirst ? 'Ketuk dulu tanggal turnya.' : 'Ketuk dulu tanggal kamu tiba di Almaty.');
      if (f.d < minKey()) return err(0, 'Tanggal paling cepat ' + long(minKey()) + '. Untuk tanggal yang lebih dekat, chat admin langsung, ya.');
      if (!f.e) return err(0, 'Ketuk tanggal pulang dulu. Tur sehari saja? Ketuk tanggal tibamu sekali lagi.');
      if (f.e > maxKey()) return err(0, 'Tanggalnya kejauhan. Pilih tanggal dalam 15 bulan ke depan.');
      if (diff(f.e, f.d) > CONFIG.maxNights) return err(0, 'Paling lama ' + CONFIG.maxNights + ' malam. Untuk trip yang lebih panjang, chat admin, ya.');
      norm(); saveDraft();
      err(0, ''); return go(nextIdx(0));
    }
    if (n === 1) {
      r = hitung(f);
      if (f.kg !== 'tidak' && !r.kgP) return err(1, r.kgWarn[0] || 'Pilih tanggal berangkat ke Kirgistan.');
      err(1, ''); return go(nextIdx(1));
    }
    if (n === 2) {
      r = hitung(f);
      if ((r.nights === 0 || !P.edges) && !tourCount(r)) return err(2, r.nights === 0 ? 'Pilih tur untuk harimu dulu.' : 'Pilih minimal satu tur dulu.');
      err(2, ''); return go(nextIdx(2));
    }
    if (n === 3) { err(3, ''); return go(nextIdx(3)); }
    if (n === 4) { err(4, ''); return go(LAST); }
  }
  function restart(el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }

  /* ---------------- 0: tanggal, kalender ala GetYourGuide dengan rentang ---------------- */
  function renderChips() {
    var lo = minKey(), hi = maxKey(), list = (TOURS ? tourPools() : pools().filter(function (p) { return p.n > 0; }))
      .filter(function (p) { return p.d >= lo && p.d <= hi; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }).slice(0, 8);
    $('#chips').innerHTML = list.map(function (p, i) {
      return '<button type="button" class="chip" data-pick="' + p.d + '" aria-pressed="' + (p.d === S.f.d) + '" style="--k:' + i + '" aria-label="' + esc(long(p.d)) + ', ' + p.n + ' orang">' +
        '<b>' + dayShort(p.d) + '</b><span>' + p.n + ' orang</span></button>';
    }).join('');
    $('#chips').hidden = $('#chipsL').hidden = !list.length;
  }
  function dayCls(k) {
    var d = S.f.d, e = S.f.e, c = '';
    if (!d) return c;
    if (k === d) c += ' start' + (e && e > d ? ' ranged' : '');
    if (e && e > d && k === e) c += ' end';
    if (e && k > d && k < e) c += ' in';
    return c;
  }
  function isEdge(k) { return k === S.f.d || (!!S.f.e && k === S.f.e); }
  function dayLabel(k, n, lo) {
    var first = P.edges ? ', tanggal tiba' : ', hari tur pertama', lastL = P.edges ? ', tanggal pulang' : ', hari tur terakhir';
    return long(k) + (k === S.f.d ? first : '') + (S.f.e && k === S.f.e && S.f.e !== S.f.d ? lastL : '') +
      (n ? ', ' + n + (TOURS ? ' orang daftar tur di tanggal ini' : ' orang tiba di tanggal ini') : '') + (k < lo ? ', belum bisa dipilih' : '');
  }
  function renderCal(dir) {
    var y = S.cal.y, m = S.cal.m, lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
    var count = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), lo = minKey(), hi = maxKey(), h = '';
    for (var i = 0; i < lead; i++) h += '<span aria-hidden="true"></span>';
    for (var dd = 1; dd <= count; dd++) {
      var k = y + '-' + pad(m + 1) + '-' + pad(dd), n = dayCount(k), off = k < lo || k > hi;
      h += '<button type="button" class="day' + dayCls(k) + (n ? ' has' : '') + '" data-cal="' + k + '" aria-pressed="' + isEdge(k) + '"' +
        (off ? ' disabled' : '') + ' aria-label="' + esc(dayLabel(k, n, lo)) + '"><b>' + dd + '</b>' + (n ? '<small>' + n + ' org</small>' : '') + '</button>';
    }
    var grid = $('#calGrid');
    grid.innerHTML = h;
    grid.setAttribute('aria-label', MONL[m] + ' ' + y);
    grid.classList.remove('fwd', 'back');
    if (dir && !reduce) { void grid.offsetWidth; grid.classList.add(dir > 0 ? 'fwd' : 'back'); }
    $('#calTitle').textContent = MONL[m] + ' ' + y;
    var a = monthOf(lo), b = monthOf(hi), at = y * 12 + m;
    $('#calPrev').disabled = at <= a.y * 12 + a.m;
    $('#calNext').disabled = at >= b.y * 12 + b.m;
  }
  function paintCal() {
    var lo = minKey();
    $$('#calGrid .day').forEach(function (b) {
      var k = b.getAttribute('data-cal'), n = dayCount(k);
      b.className = 'day' + dayCls(k) + (n ? ' has' : '');
      b.setAttribute('aria-pressed', String(isEdge(k)));
      b.setAttribute('aria-label', dayLabel(k, n, lo));
    });
  }
  function shiftMonth(n) {
    var a = monthOf(minKey()), b = monthOf(maxKey());
    var t = Math.max(a.y * 12 + a.m, Math.min(b.y * 12 + b.m, S.cal.y * 12 + S.cal.m + n));
    if (t === S.cal.y * 12 + S.cal.m) return;
    S.cal = { y: Math.floor(t / 12), m: t % 12 };
    renderCal(n);
  }
  /* Ketukan di kalender. Land tour: pertama = tiba, kedua = pulang (tanggal yang sama dua kali = sehari).
     Tur harian: ketukan langsung memilih satu hari; ketuk hari sesudahnya untuk beberapa hari. */
  function pickDay(k) {
    if (!validDate(k)) return;
    var d = S.f.d, e = S.f.e;
    S.dateNote = '';
    if (P.singleFirst) {
      if (d && e === d && k > d && diff(k, d) <= CONFIG.maxNights) { S.f.e = k; pruneHari(); }
      else { S.f.d = k; S.f.e = k; pruneHari(); }
    } else if (!d || e || k < d) { S.f.d = k; S.f.e = ''; }
    else if (diff(k, d) > CONFIG.maxNights) { S.f.d = k; S.f.e = ''; S.dateNote = 'Paling lama ' + CONFIG.maxNights + ' malam, jadi tanggal itu jadi tanggal tiba baru.'; }
    else { S.f.e = k; pruneHari(); }
    afterDateChange(k);
  }
  /* Rentang baru dari kalender: buang tur di luar rentang dan di hari tiba/pulang yang baru. */
  function pruneHari() {
    var d = S.f.d, e = S.f.e, h = {};
    Object.keys(S.f.hari).forEach(function (k) { if (k >= d && k <= e && (!P.edges || d === e || (k !== d && k !== e))) h[k] = S.f.hari[k]; });
    S.f.hari = h;
  }
  /* Dari chip atau saran: geser tanggal tiba, lama trip dan isi hari ikut bergeser. */
  function applyStart(d, keep) {
    if (!validDate(d)) return;
    var od = S.f.d, len = od && S.f.e && S.f.e >= od ? diff(S.f.e, od) : -1;
    if (keep && len >= 0 && od !== d) shiftPlan(diff(d, od));
    S.f.d = d;
    S.f.e = keep && len >= 0 ? addDays(d, len) : (P.singleFirst ? d : '');
    if (S.f.e && S.f.e > maxKey()) S.f.e = P.singleFirst ? d : '';
    S.dateNote = '';
  }
  function setStart(d, keep) { applyStart(d, keep); afterDateChange(d); }
  function shiftPlan(n) {
    var h = {};
    Object.keys(S.f.hari).forEach(function (k) { h[addDays(k, n)] = S.f.hari[k]; });
    S.f.hari = h;
    if (validDate(S.f.kgMulai)) S.f.kgMulai = addDays(S.f.kgMulai, n);
  }
  function afterDateChange(k) {
    err(0, ''); norm(); saveDraft();
    var mo = monthOf(k), cur = S.cal.y * 12 + S.cal.m, nx = mo.y * 12 + mo.m;
    if (nx !== cur) { S.cal = mo; renderCal(nx > cur ? 1 : -1); } else paintCal();
    updateDate();
  }
  function updateDate() {
    var d = S.f.d, e = S.f.e, info = $('#dateInfo');
    $$('#chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-pick') === d)); });
    if (!validDate(d)) { info.hidden = true; $('#suggest').hidden = true; renderPax(); return; }
    var n = dayCount(d), days = diff(d, todayKey()), txt = S.dateNote ? esc(S.dateNote) + ' ' : '';
    if (P.singleFirst) {
      if (!e || e === d) txt += '<b>' + esc(long(d)) + '</b>, ' + days + ' hari lagi. Mau beberapa hari? Ketuk juga hari terakhirnya.';
      else txt += '<b>' + esc(rangeKeys(d, e)) + '</b>, ' + (diff(e, d) + 1) + ' hari. Hari tanpa tur boleh dibiarkan bebas.';
      if (n) txt += ' ' + n + ' orang sudah ikut tur di tanggal ' + short(d) + '.';
    } else {
      if (!e) txt += '<b>Tiba ' + esc(long(d)) + '</b>, ' + days + ' hari lagi. Sekarang ketuk tanggal pulang. Tur sehari saja? Ketuk tanggal ini sekali lagi.';
      else if (e === d) txt += '<b>' + esc(long(d)) + '</b>, sehari saja. Pas untuk beli tur harian.';
      else txt += '<b>' + esc(rangeKeys(d, e)) + '</b>, ' + diff(e, d) + ' malam.';
      if (n) txt += ' ' + n + ' orang tiba di tanggal ini.';
    }
    if (info.hidden || info.innerHTML !== txt) { info.innerHTML = txt; info.hidden = false; restart(info); }
    renderSuggest();
    renderPax();
  }
  function renderSuggest() {
    var box = $('#suggest'), d = S.f.d, h = '';
    if (!TOURS) {
      var own = poolOf(d), base = own ? own.n : 0;
      var c = pools().filter(function (p) { return p.d !== d && p.n > base && Math.abs(diff(p.d, d)) <= 3 && p.d >= minKey() && p.d <= maxKey(); })
        .sort(function (a, b) { return b.n - a.n || Math.abs(diff(a.d, d)) - Math.abs(diff(b.d, d)); })[0];
      if (c) {
        var dd = diff(c.d, d);
        h = '<p><b>' + short(c.d) + '</b> sudah ' + c.n + ' orang, ' + Math.abs(dd) + ' hari ' + (dd > 0 ? 'setelah' : 'sebelum') + ' tanggal tibamu. Kalau tiketmu masih bisa geser, tiba bareng mereka biar cepat ramai.</p>' +
          '<button type="button" class="btn btn-line btn-sm" data-pick="' + c.d + '">Tiba ' + short(c.d) + (S.f.e && S.f.e !== d ? ', lama trip tetap' : '') + '</button>';
      }
    }
    if (!h) { box.hidden = true; box.innerHTML = ''; return; }
    if (box.hidden || box.innerHTML !== h) { box.innerHTML = h; box.hidden = false; restart(box); }
  }
  function renderPax() {
    var n = S.f.pax, max = maxPax();
    if (n > max) n = S.f.pax = max;
    $('#paxOut').textContent = n;
    $('#paxMinus').disabled = n <= 1; $('#paxPlus').disabled = n >= max;
    $('#paxHint').textContent = n === 1 ? (TOURS ? 'Ikut sendiri juga bisa' : 'Berangkat sendiri juga bisa') : n === 2 ? 'Kamu dan 1 teman' : 'Kamu dan ' + (n - 1) + ' teman';
  }
  function setPax(delta) {
    var n = Math.max(1, Math.min(maxPax(), S.f.pax + delta));
    if (n === S.f.pax) return;
    S.f.pax = n; norm(); saveDraft();
    var out = $('#paxOut'); out.classList.remove('up', 'down'); void out.offsetWidth; if (!reduce) out.classList.add(delta > 0 ? 'up' : 'down');
    renderPax();
  }

  /* ---------------- 1: Kirgistan ---------------- */
  function renderKgStep() {
    var f = S.f, n = f.pax, e = endOf(f), on = f.kg !== 'tidak';
    fixKgStart();
    $$('[data-kg]').forEach(function (b) {
      var k = b.getAttribute('data-kg');
      b.setAttribute('aria-pressed', String(k === f.kg));
      b.disabled = k !== 'tidak' && !kgOpsi(KG[k], f.d, e).length;
    });
    $('#kgGabPrice').innerHTML = rp(rpItem(KG.gabungan.usd)) + '<small>per orang</small>';
    var t = KG.privat.tier[n];
    $('#kgPrivPrice').innerHTML = t !== undefined ? rp(rpItem(t)) + '<small>per orang</small>' : 'menyusul<small>untuk ' + n + ' orang</small>';
    $('#kgStartBox').hidden = !on; $('#visaNote').hidden = !on; $('#kgAsumsi').hidden = !on;
    if (on) {
      var p = KG[f.kg], opsi = kgOpsi(p, f.d, e);
      $('#kgChips').innerHTML = opsi.map(function (s, i) {
        var end = addDays(s, p.hari - 1), sched = f.kg === 'gabungan' && p.jadwal.indexOf(s) >= 0;
        return '<button type="button" class="chip kg-chip" data-kgstart="' + s + '" aria-pressed="' + (s === f.kgMulai) + '" style="--k:' + i + '" aria-label="Berangkat ' + esc(long(s)) + ', sampai ' + esc(long(end)) + (sched ? ', jadwal tercantum' : '') + '">' +
          '<b>' + dayShort(s) + '</b><span>s.d. ' + short(end) + (sched ? ' · tercantum' : '') + '</span></button>';
      }).join('');
      var sel = $('#kgChips [aria-pressed="true"]');
      if (sel) { var box = $('#kgChips'); box.scrollLeft = Math.max(0, sel.offsetLeft - box.offsetLeft - 20); }
    }
    renderKgPlan();
    var r = hitung(f), w = r.kgWarn.slice();
    if (f.kg === 'privat' && t === undefined) w.push('Penawaran tur privat Kirgistan untuk rombongan 10–26 orang. Untuk ' + n + ' orang, harganya menyusul dari admin.');
    $('#kgWarn').hidden = !w.length; $('#kgWarn').textContent = w.join(' ');
  }
  function renderKgPlan() {
    var f = S.f, el = $('#kgPlan'), r = hitung(f);
    if (!r.kgP) { el.hidden = true; el.innerHTML = ''; return; }
    var ks = r.kgDays[0], ke = r.kgDays[r.kgDays.length - 1], before = diff(ks, f.d) - 1, after = diff(r.e, ke) - 1, rows = [];
    rows.push([rangeShort(f.d, addDays(ks, -1)), 'Almaty dan sekitarnya', before > 0 ? 'Tiba ' + dayShort(f.d) + ', lalu ' + before + ' hari untuk tur.' : 'Tiba ' + dayShort(f.d) + ', besoknya langsung ke Kirgistan.']);
    rows.push([rangeShort(ks, ke), r.kgP.nama, 'Lewat darat, masuk di pos Korday/Ak-Zhol. Kembali ke Almaty ' + dayShort(ke) + '.', 1]);
    rows.push([after > 0 ? rangeShort(addDays(ke, 1), r.e) : short(r.e), after > 0 ? 'Almaty, lalu pulang' : 'Pulang', after > 0 ? after + ' hari di Almaty, pulang ' + dayShort(r.e) + '.' : 'Pulang dari Almaty ' + dayShort(r.e) + '.']);
    el.innerHTML = rows.map(function (x, i) { return '<li style="--i:' + i + '"><span class="d' + (x[3] ? ' kgd' : '') + '">' + esc(x[0]) + '</span><div><b>' + esc(x[1]) + '</b><p>' + esc(x[2]) + '</p></div></li>'; }).join('');
    el.hidden = false;
  }
  function setKg(k) {
    if (!KG[k] && k !== 'tidak') return;
    S.f.kg = k;
    if (k !== 'tidak') { S.f.kgMulai = ''; fixKgStart(); }
    err(1, ''); saveDraft(); renderKgStep(); renderCta();
  }
  function setKgStart(s) { S.f.kgMulai = s; err(1, ''); saveDraft(); renderKgStep(); renderCta(); }

  /* ---------------- 2: isi hari ---------------- */
  function ensureDay(r) {
    if (r.list.some(function (h) { return h.d === S.day; })) return;
    var pick = r.list.filter(function (h) { return h.kind === 'full' || h.kind === 'single'; })[0] || r.list[0];
    S.day = pick ? pick.d : '';
  }
  function renderPlan() {
    norm();
    var f = S.f, r = hitung(f), canPk = P.paket && r.almaty >= PAKET.p5.malam;
    ensureDay(r);
    $('#planTabs').hidden = !canPk;
    $$('#planTabs [data-mode]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mode') === f.mode)); });
    $('#planTabs .ink').style.setProperty('--t', f.mode === 'paket' ? 1 : 0);
    $('#pkgBox').hidden = f.mode !== 'paket';
    if (f.mode === 'paket') {
      ['p5', 'p6'].forEach(function (k) {
        var t = PAKET[k].tier[f.pax], btn = $('[data-paket="' + k + '"]');
        btn.setAttribute('aria-pressed', String(f.paket === k));
        btn.disabled = r.almaty < PAKET[k].malam;
        $('#' + k + 'Price').innerHTML = t !== undefined ? rp(rpItem(f.hotel !== 'sendiri' ? t : t - PAKET.potongTanpaHotelUSD)) + '<small>per orang</small>' : 'menyusul<small>untuk ' + f.pax + ' orang</small>';
      });
      $('#pkgHint').textContent = (PAKET.p5.tier[f.pax] === undefined ? 'Untuk ' + f.pax + ' orang, harganya menyusul dari admin. ' : 'Harga di atas untuk rombongan ' + f.pax + ' orang' + (f.hotel === 'sendiri' ? ', tanpa hotel (perkiraan). ' : '. ')) +
        'Penawaran tersedia untuk rombongan ' + tierList(PAKET.p5.tier) + ' orang.';
    }
    var how = P.edges ? 'Ketuk hari, lalu pilih kegiatannya.' : 'Ketuk hari, lalu pilih turnya. Hari tanpa tur boleh dibiarkan bebas.';
    $('#planSub').textContent = rangeKeys(f.d, r.e) + ', ' + f.pax + ' orang. ' + (r.nights === 0 ? 'Pilih tur untuk harimu. Tur gabungan dibayar per kursi, jadi bisa mulai 1 orang.'
      : f.mode === 'paket' ? 'Hari paket diisi program bersama guide. Hari lainnya bebas kamu isi.'
      : how + ' Tur gabungan dibayar per kursi, jadi bisa mulai 1 orang.');
    $('#kgLink').hidden = !(P.crossKg && r.nights >= 4);
    renderStrip(r); renderDayPanel(r, false); renderAddons(r); renderPlanWarn(r);
  }
  function chipInfo(h) {
    if (h.kind === 'kg') return { c: 't-kg', l: 'Kirgistan' };
    if (h.kind === 'paket') return { c: 't-pk', l: 'Paket privat' };
    if (TUR[h.act]) return { c: 't-tour', l: TUR[h.act].pendek };
    if (h.kind === 'tiba') return { c: 't-edge', l: 'Tiba' };
    if (h.kind === 'pulang') return { c: 't-edge', l: 'Pulang' };
    return { c: 't-free', l: h.kind === 'single' ? 'Pilih tur' : 'Bebas' };
  }
  function renderStrip(r) {
    var el = $('#dayStrip'), sig = r.list.map(function (h) { return h.d + h.kind; }).join('|');
    el.hidden = r.list.length < 2;
    if (sig !== S.stripSig) {
      S.stripSig = sig;
      el.classList.remove('still');
      el.innerHTML = r.list.map(function (h, i) {
        var c = chipInfo(h);
        return '<button type="button" class="chip dchip ' + c.c + '" data-day="' + h.d + '" aria-pressed="' + (h.d === S.day) + '" style="--k:' + i + '" aria-label="' + esc(long(h.d) + ', ' + c.l) + '"><b>' + DAYS[dow(h.d)] + ' ' + (+h.d.slice(8)) + '</b><span>' + esc(c.l) + '</span></button>';
      }).join('');
      clearTimeout(S.stillT);
      S.stillT = setTimeout(function () { el.classList.add('still'); }, 1600);
      requestAnimationFrame(scrollStrip);
    } else {
      r.list.forEach(function (h) {
        var b = $('[data-day="' + h.d + '"]', el); if (!b) return;
        var c = chipInfo(h);
        b.className = 'chip dchip ' + c.c;
        b.setAttribute('aria-pressed', String(h.d === S.day));
        b.setAttribute('aria-label', long(h.d) + ', ' + c.l);
        $('span', b).textContent = c.l;
      });
    }
  }
  function scrollStrip() {
    var el = $('#dayStrip'), b = $('[data-day="' + S.day + '"]', el);
    if (!b || el.hidden) return;
    var x = el.scrollLeft + b.getBoundingClientRect().left - el.getBoundingClientRect().left - (el.clientWidth - b.offsetWidth) / 2;
    try { el.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { el.scrollLeft = Math.max(0, x); }
  }
  function optBtn(k, b, s, side, on, ppl) {
    return '<button type="button" class="opt" data-act="' + k + '" aria-pressed="' + on + '"><span class="radio" aria-hidden="true"></span><span class="opt-main"><b>' + esc(b) + '</b><span>' + esc(s) + '</span>' +
      (ppl ? '<span class="ppl">' + esc(ppl) + '</span>' : '') + '</span><span class="opt-side">' + side + '</span></button>';
  }
  function noteCard(icon, html) { return '<div class="note-card">' + icon + '<p>' + html + '</p></div>'; }
  function renderDayPanel(r, anim) {
    var box = $('#dayPanel'), h = null;
    r.list.forEach(function (x) { if (x.d === S.day) h = x; });
    if (!h) { box.innerHTML = ''; return; }
    var head = '<p class="day-head"><b>' + esc(long(h.d)) + '</b>' + (r.list.length > 1 ? '<span>Hari ke-' + (h.k + 1) + ' dari ' + r.list.length + '</span>' : '') + '</p>', body;
    if (h.kind === 'kg') {
      body = noteCard(ICON_HOP, '<b>Hari di Kirgistan.</b> Bagian dari ' + esc(r.kgP.nama.toLowerCase()) + '. <button type="button" class="link-btn" data-goto="1">Ubah</button>');
    } else if (h.kind === 'paket') {
      var idx = r.list.filter(function (x) { return x.kind === 'paket'; }).map(function (x) { return x.d; }).indexOf(h.d) + 1;
      body = noteCard(ICON_PIN, '<b>Program paket privat, hari tur ke-' + idx + '.</b> Mobil dan guide khusus rombonganmu, rutenya diatur bareng guide.');
    } else {
      var none = h.kind === 'tiba' ? ['Tiba, tanpa tur', 'Dijemput, check-in, istirahat.'] : h.kind === 'pulang' ? ['Pulang, tanpa tur', 'Check-out dan ke bandara.']
        : h.kind === 'single' ? ['Belum pilih tur', 'Pilih salah satu tur di bawah.'] : ['Hari bebas', P.edges ? 'Jalan sendiri atau istirahat.' : 'Tidak ikut tur di hari ini.'];
      body = '<div class="opts" role="group" aria-label="Kegiatan ' + esc(long(h.d)) + '">' + optBtn('', none[0], none[1], '–', !h.act) + TUR_KEYS.map(function (k) {
        var t = TUR[k], c = actCount(h.d, k);
        return optBtn(k, t.nama, t.ds, t.kzt ? rp(rpItem(kztUSD(t.kzt))) + '<small>per orang</small>' : 'menyusul<small>harga dari admin</small>', h.act === k, c ? c + ' orang sudah pilih hari ini' : '');
      }).join('') + '</div>';
      var hint = [];
      if (h.kind === 'tiba') hint.push('Tur berangkat pagi dari titik kumpul. Pilih tur di hari tiba hanya kalau kamu sudah di Almaty sejak pagi.');
      if (h.kind === 'pulang') hint.push('Pilih tur di hari pulang hanya kalau pesawatmu malam.');
      if (isNauryz(h.d)) hint.push('Libur Nauryz: tempat wisata ramai.');
      if (h.d.slice(5, 7) === '03') hint.push('Maret: jalan ke Kolsay–Kaindy bisa bersalju; admin memastikan jadwal Charyn & Kolsay.');
      if (!P.edges) hint.push('Titik kumpul: ' + meetText() + '. Jam kumpul dikirim admin sehari sebelumnya.');
      if (hint.length) body += '<p class="hint">' + esc(hint.join(' ')) + '</p>';
    }
    box.innerHTML = head + body;
    if (anim && !reduce) { box.classList.remove('fwd'); void box.offsetWidth; box.classList.add('fwd'); }
  }
  function selectDay(d) {
    clearTimeout(S.advT);
    S.day = d;
    var r = hitung(S.f);
    renderStrip(r); renderDayPanel(r, true); scrollStrip();
  }
  function setAct(k) {
    var d = S.day; if (!d) return;
    if (k && TUR[k]) S.f.hari[d] = k; else delete S.f.hari[d];
    saveDraft(); err(2, '');
    var r = hitung(S.f);
    renderStrip(r); renderDayPanel(r, false); renderAddons(r); renderPlanWarn(r); renderCta();
    if (!k) return;
    var nx = null, seen = false;   // isi berurutan: lompat ke hari penuh berikutnya yang masih kosong
    r.list.forEach(function (h) { if (h.d === d) seen = true; else if (seen && !nx && h.kind === 'full' && !h.act) nx = h; });
    if (nx) {
      clearTimeout(S.advT);
      S.advT = setTimeout(function () { if (S.step === 2 && S.day === d) selectDay(nx.d); }, reduce ? 0 : 420);
    }
  }
  function renderAddons(r) {
    var f = S.f, kota = f.mode === 'paket' || r.list.some(function (h) { return h.act === 'kota'; }), box = $('#addonBox'), list = $('#addonList');
    box.hidden = !kota && !f.add.length;
    if (box.hidden) return;
    if (!list.firstChild) list.innerHTML = TAMBAHAN.map(function (t) {
      return '<label class="check addon"><input type="checkbox" data-add="' + t.id + '"><span class="box" aria-hidden="true">' + CHECK_BOX + '</span><span class="ck-t">' + esc(t.nama) +
        (t.ds ? '<small>' + esc(t.ds) + '</small>' : '') + '</span><span class="ck-side' + (t.rp ? '' : ' muted') + '">' + (t.rp ? (t.mulai ? 'mulai ' : '') + rp(t.rp) : 'tanya admin') + '</span></label>';
    }).join('');
    $$('[data-add]', list).forEach(function (c) { c.checked = f.add.indexOf(c.getAttribute('data-add')) >= 0; });
    $('#addonBtn small').textContent = f.add.length ? f.add.length + ' dipilih, bayar terpisah' : 'bayar terpisah';
  }
  function renderPlanWarn(r) {
    var w = r.warn.filter(function (x) { return r.kgWarn.indexOf(x) < 0; }), el = $('#planWarn');
    el.innerHTML = w.map(li).join(''); el.hidden = !w.length;
  }
  function setMode(m) { S.f.mode = m === 'paket' ? 'paket' : 'harian'; norm(); saveDraft(); renderPlan(); renderCta(); }
  function setPaket(k) { S.f.paket = k === 'p6' ? 'p6' : 'p5'; norm(); saveDraft(); renderPlan(); renderCta(); }

  /* ---------------- 3: menginap ---------------- */
  function renderHotel() {
    var f = S.f, r = hitung(f), n = f.pax, pk = f.mode === 'paket', on = f.hotel !== 'sendiri', rooms = r.rooms;
    $$('[data-hotel]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-hotel') === f.hotel)); });
    if (pk) {
      var p = PAKET[f.paket], t = p.tier[n], lebih = r.almaty - p.malam;
      $('#hotelAName').textContent = 'Termasuk di paket privat';
      $('#hotelADesc').textContent = 'Hotel bintang 3 dengan sarapan, kamar berdua.' + (lebih > 0 ? ' Ditambah ' + lebih + ' malam di Astra Hotel.' : '');
      $('#hotelAPrice').innerHTML = 'termasuk';
      $('#hotelSName').textContent = 'Tanpa hotel';
      $('#hotelSDesc').textContent = 'Harga paket dikurangi perkiraan 3 malam hotel. Tiap pagi kamu ke titik kumpul.';
      $('#hotelSPrice').innerHTML = t !== undefined ? '−' + rp(rpItem(PAKET.potongTanpaHotelUSD)) + '<small>perkiraan</small>' : '–';
    } else {
      $('#hotelAName').textContent = 'Astra Hotel bintang 3, dengan sarapan';
      $('#hotelADesc').textContent = 'Jl. Zheltoksan 12. Lobinya sekaligus titik kumpul tur. ' + r.almaty + ' malam.';
      $('#hotelAPrice').innerHTML = rp(rpItem(perMalamUSD(rooms) / n)) + '<small>per orang per malam</small>';
      $('#hotelSName').textContent = 'Hotel sendiri';
      $('#hotelSDesc').textContent = 'Tiap pagi kamu datang ke titik kumpul. Ongkos ke sana ditanggung sendiri.';
      $('#hotelSPrice').innerHTML = 'Rp0';
    }
    $('#hotelSub').textContent = r.almaty + ' malam di Almaty' + (r.kgP ? ', di luar ' + r.kgP.malam + ' malam di Kirgistan' : '') + '. Hotel boleh tidak ikut dipesan.';
    $('#kamarRow').hidden = !on;
    $$('[data-kamar]').forEach(function (b) {
      var k = +b.getAttribute('data-kamar');
      b.setAttribute('aria-pressed', String(n === 1 ? k === 1 : k === f.kamar));
      b.disabled = n === 1 ? k !== 1 : k === 3 && n < 3;
    });
    var hint = n === 1 ? 'Kamu sendiri, jadi kamar sendiri.' : 'Kamar hanya dibagi di dalam rombonganmu: ' + teksKamar(rooms) + '.';
    if (n > 1 && rooms.indexOf(1) >= 0) hint += ' Kamar sendiri dibayar penuh, dan itu bukan tarif tur solo.';
    if (pk && on && n > 1 && f.kamar !== 2) hint += ' Paket privat dihitung kamar berdua; selisihnya menyusul dari admin.';
    $('#kamarHint').textContent = hint;
    $('#hnField').hidden = on;
    var mt = meetText();
    $('#meetHint').hidden = !mt;
    $('#meetHintText').innerHTML = (on ? 'Titik kumpul tiap pagi: ' : 'Tiap pagi kamu ke titik kumpul: ') + '<b>' + esc(mt) + '</b>';
  }
  function setHotel(h) { S.f.hotel = h === 'sendiri' ? 'sendiri' : 'astra'; saveDraft(); renderHotel(); renderCta(); }
  function setKamar(k) { if (S.f.pax === 1) return; S.f.kamar = k; norm(); saveDraft(); renderHotel(); renderCta(); }

  /* ---------------- 4: kedatangan ---------------- */
  function renderArrival() {
    var f = S.f, air = f.via === 'pesawat', land = f.via === 'darat', here = f.via === 'lokal', r = hitung(f), pk = f.mode === 'paket';
    $$('[data-via]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-via') === f.via)); });
    $('#timeField').hidden = here;
    $('#timeLabel').textContent = land ? 'Perkiraan jam tiba di Almaty' : 'Jam mendarat (waktu Almaty)';
    $('#flField').hidden = !air;
    var hm = f.t ? f.t.split(':') : null;
    $('#fHour').value = hm ? hm[0] : '';
    $('#fMin').value = hm ? hm[1] : '00';
    $('#fMin').disabled = !hm;
    $('#fFl').value = f.fl;
    var vn = $('#viaNote'), h = '';
    if (air && isNight(f.t)) {
      var n = nightCfg(), early = n.from > n.to && f.t < n.to;
      h = ICON_MOON + '<p><b>Tiba malam, tetap dijemput.</b> Kamu dijemput terpisah dari rombongan, ' + nightFee() + '.' +
        (early ? ' Mendarat dini hari? Kamar hotel biasanya baru siap siang. Mau langsung istirahat, bisa tambah 1 malam (dikonfirmasi admin).' : '') + '</p>';
    } else if (land) {
      h = ICON_HOP + '<p><b>Dari Bishkek lewat darat.</b> Lewat perbatasan Korday, sekitar 4 sampai 5 jam. Kabari admin begitu lewat perbatasan, nanti diarahkan ke titik jemput.</p>';
    }
    if (vn.innerHTML !== h) { vn.innerHTML = h; vn.hidden = !h; if (h) restart(vn); }
    $('#trfBox').hidden = pk; $('#trfPaket').hidden = !pk;
    $('#jemputRow').hidden = here;
    $('#jemputT').textContent = land ? 'Jemput setibanya di Almaty' : 'Jemput di Bandara Almaty';
    $('#fJemput').checked = f.jemput; $('#fAntar').checked = f.antar;
    var w = r.warn.filter(function (x) { return /mendarat jam|hari pulang/.test(x); });
    $('#arrWarn').innerHTML = w.map(li).join(''); $('#arrWarn').hidden = !w.length;
  }
  function setTime() {
    var h = $('#fHour').value, m = $('#fMin').value || '00';
    S.f.t = h ? h + ':' + m : '';
    $('#fMin').disabled = !h;
    saveDraft(); renderArrival(); renderCta();
  }

  /* ---------------- 5: rincian ---------------- */
  function renderReview() {
    var f = S.f, r = hitung(f), h = '', tours = tourCount(r);
    h += '<button type="button" data-goto="0"><span>Tanggal</span>' + esc(r.nights ? rangeShort(f.d, r.e) : short(f.d)) + '</button>';
    h += '<button type="button" data-goto="0"><span>Orang</span>' + f.pax + '</button>';
    if (r.kgP) h += '<button type="button" data-goto="1"><span>Kirgistan</span>' + (f.kg === 'gabungan' ? 'gabungan' : 'privat') + '</button>';
    h += '<button type="button" data-goto="2"><span>' + (P.edges ? 'Hari' : 'Tur') + '</span>' + esc(f.mode === 'paket' ? 'paket privat' + (tours ? ' + ' + tours + ' tur' : '') : tours ? tours + ' tur' : 'bebas') + '</button>';
    if (P.hotel && r.almaty > 0) h += '<button type="button" data-goto="3"><span>Hotel</span>' + (f.hotel === 'sendiri' ? 'sendiri' : f.mode === 'paket' ? 'paket' : 'Astra') + '</button>';
    if (P.arrival && r.nights > 0) h += '<button type="button" data-goto="4"><span>Tiba</span>' + esc(f.via === 'lokal' ? 'sudah di Almaty' : (f.via === 'darat' ? 'darat' : 'pesawat') + (f.t ? ' ' + f.t.replace(':', '.') : '')) + '</button>';
    $('#recap').innerHTML = h;
    $('#bill').innerHTML = billHTML(r);
  }
  function sec(title, items, warn) { return '<div class="bill-sec"><p class="subh">' + esc(title) + '</p><ul class="fine-list' + (warn ? ' warn-list' : '') + '">' + items.map(li).join('') + '</ul></div>'; }
  function billHTML(r) {
    var f = S.f, h = '';
    if (r.lines.length) {
      h += '<ul class="lines">' + r.lines.map(function (b) {
        return '<li><span>' + esc(b.label) + '</span><b>' + rp(rpItem(b.usd)) + '</b><small>' + (b.x ? esc(b.x) + ' ' : '') + '<em class="src src-' + b.status + '">' + STATUS[b.status] + '</em></small>' +
          (ADMIN ? '<small class="adm">Modal USD ' + b.usd.toFixed(2) + '/orang. ' + esc(b.adm || '') + '</small>' : '') + '</li>';
      }).join('') + (CONFIG.opsPerOrang ? '<li><span>Layanan SUNDAF Trip (admin, pendampingan)</span><b>' + rp(Math.ceil(CONFIG.opsPerOrang * (1 + CONFIG.markup) / 1000) * 1000) + '</b></li>' : '') + '</ul>';
      h += '<div class="bill-total"><span>Perkiraan per orang</span><b>' + (r.pp ? rp(r.pp) : '—') + '</b></div>';
      if (r.pp && f.pax > 1) h += '<p class="bill-g">' + rp(r.pp * f.pax) + ' untuk ' + f.pax + ' orang</p>';
      h += '<p class="hint">Total per orang dibulatkan ke atas ke Rp10.000, jadi bisa sedikit beda dari jumlah per baris.</p>';
    } else {
      h += '<p class="hint">Belum ada layanan yang harganya sudah ada di halaman ini.' + (r.wait.length ? ' Semua harganya menyusul dari admin.' : '') + '</p>';
    }
    if (r.wait.length) h += sec('Harganya menyusul dari admin', r.wait);
    if (r.extra.length) h += sec('Tambahan, bayar terpisah', r.extra.map(function (x) { return x.label + ': ' + (x.rp ? rp(x.rp) + ' per orang' : 'tanya admin'); }));
    if (r.warn.length) h += sec('Perlu dicek', r.warn, true);
    var excl = P.arrival ? ['tiket pesawat', r.kgP && f.kg === 'gabungan' ? 'makan siang dan malam, kecuali selama tur gabungan Kirgistan' : 'makan siang dan malam'] : ['makan', 'ongkos ke titik kumpul'];
    if (P.tips && CONFIG.tipsWajib) excl.push('tips wajib ' + rp(CONFIG.tipsWajib) + ' per orang, ditagih terpisah');
    excl.push('pengeluaran pribadi');
    h += '<p class="hint">Belum termasuk: ' + esc(excl.join(', ')) + '.</p>';
    var kunci = tanggalKunci(f.d);
    if (kunci) h += '<p class="hint">DP 30% setelah admin mengirim harga pasti. Harga saat DP adalah harga maksimal. Pelunasan di tanggal kunci: <b>' + esc(long(kunci)) + '</b>.' +
      (todayKey() > kunci ? ' Tanggal kunci sudah lewat, jadi pembayaran langsung lunas.' : '') + '</p>';
    if (ADMIN) {
      var modal = r.usd * CONFIG.kursUSD * (1 + CONFIG.cadanganKurs) + CONFIG.opsPerOrang;
      h += '<div class="admin-box"><b>Tampilan admin</b><dl>' +
        '<dt>Modal per orang</dt><dd>' + rp(modal) + '</dd><dt>Harga per orang</dt><dd>' + rp(r.pp) + '</dd><dt>Margin per orang</dt><dd>' + rp(r.pp - modal) + '</dd>' +
        '<dt>Kurs, cadangan</dt><dd>' + rp(CONFIG.kursUSD) + ', ' + pct(CONFIG.cadanganKurs) + '</dd><dt>KZT per USD</dt><dd>' + CONFIG.kursKZT + '</dd>' +
        '<dt>Markup</dt><dd>' + pct(CONFIG.markup) + '</dd><dt>Operasional/orang</dt><dd>' + rp(CONFIG.opsPerOrang) + '</dd><dt>Hotel</dt><dd>' + esc(HOTEL.sumber) + '</dd></dl></div>';
    }
    return h;
  }

  /* Harga di tombol langkah: ikut berubah setiap kali pilihan berubah. */
  function renderCta() {
    if (!validDate(S.f.d)) return;
    var r = hitung(S.f), txt = r.pp ? rp(r.pp) : '—';
    var sub = r.pp ? 'per orang' + (r.wait.length ? ' · ' + r.wait.length + ' harga menyusul' : '') : r.wait.length ? r.wait.length + ' harga menyusul dari admin' : 'pilih layananmu';
    $$('[data-sum]').forEach(function (el) {
      if (el.textContent === txt) return;
      el.textContent = txt;
      if (S.open && !reduce) { el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); }
    });
    $$('[data-sub]').forEach(function (el) { el.textContent = sub; });
  }

  /* ---------------- kirim ---------------- */
  function setBusy(on) {
    var b = $('#submitBtn');
    b.classList.toggle('busy', on); b.disabled = on;
    $('.lbl', b).textContent = on ? 'Mengirim…' : 'Kirim rencana';
  }
  function planDays(r) { var o = {}; r.list.forEach(function (h) { if (TUR[h.act]) o[h.d] = h.act; }); return o; }
  function pesanWA(p, r, kode) {
    var L = [];
    L.push(P.waIntro);
    if (kode) L.push('Kode: ' + kode);
    L.push('');
    L.push('Nama: ' + p.name);
    L.push((P.edges ? 'Rombongan: ' : 'Peserta: ') + p.pax + ' orang' + (P.hotel && r.almaty > 0 && p.hotel !== 'sendiri' ? ', ' + teksKamar(r.rooms) : ''));
    L.push('Tanggal: ' + (r.nights ? long(p.d) + ' s.d. ' + long(p.e) + (P.edges ? ' (' + r.nights + ' malam)' : '') : long(p.d) + ' (sehari)') + (p.flex ? ', masih bisa geser ±2 hari' : ''));
    if (P.arrival && r.nights) L.push('Tiba: ' + (p.via === 'lokal' ? 'sudah di Almaty' : (p.via === 'darat' ? 'darat dari Bishkek' : 'pesawat') + (p.t ? ', jam ' + p.t.replace(':', '.') : '') + (p.fl ? ', ' + p.fl : '')));
    if (p.mode === 'paket') L.push('Cara pesan: ' + PAKET[p.paket].nama + (p.hotel === 'sendiri' ? ', tanpa hotel' : ', termasuk hotel'));
    else if (P.hotel && r.almaty > 0) L.push('Menginap: ' + (p.hotel === 'sendiri' ? 'hotel sendiri' + (p.hn ? ' (' + p.hn + ')' : '') : HOTEL.nama + ', ' + r.almaty + ' malam'));
    L.push('', P.edges ? 'Rencana per hari:' : 'Tur:');
    var kgDone = false;
    r.list.forEach(function (h) {
      if (h.kind === 'kg') { if (!kgDone) { kgDone = true; L.push('- ' + dayShort(r.kgDays[0]) + ' s.d. ' + dayShort(r.kgDays[r.kgDays.length - 1]) + ': ' + r.kgP.nama); } return; }
      var s;
      if (h.kind === 'paket') s = 'program paket privat';
      else if (TUR[h.act]) s = TUR[h.act].nama + (h.kind === 'tiba' ? ' (hari tiba)' : h.kind === 'pulang' ? ' (hari pulang)' : '');
      else if (!P.edges) return;
      else if (h.kind === 'tiba') s = 'tiba' + (p.jemput ? ', jemput' : '');
      else if (h.kind === 'pulang') s = 'pulang' + (p.antar ? ', antar ke bandara' : '');
      else s = 'bebas';
      L.push('- ' + dayShort(h.d) + ': ' + s);
    });
    if (!P.edges) L.push('Titik kumpul: ' + meetText());
    if (r.extra.length) { L.push('', 'Tambahan di Shymbulak (bayar terpisah):'); r.extra.forEach(function (x) { L.push('- ' + x.label); }); }
    L.push('');
    if (r.pp) L.push('Perkiraan di halaman: ' + rp(r.pp) + ' per orang' + (p.pax > 1 ? ' (' + rp(r.pp * p.pax) + ' untuk ' + p.pax + ' orang)' : '') + ', harga per ' + CONFIG.hargaPer + '.');
    if (r.wait.length) L.push('Mohon harga untuk: ' + r.wait.join('; ') + '.');
    if (p.note) L.push('Catatan: ' + p.note);
    return L.join('\n');
  }
  function submit() {
    if (S.busy) return;
    var name = $('#fName').value.replace(/\s+/g, ' ').trim(), waRaw = $('#fWa').value.trim(), wa = normWa(waRaw);
    S.f.name = name; S.f.wa = waRaw; S.f.note = $('#fNote').value; saveDraft();
    if (name.length < 2) return err(5, 'Isi nama dulu, minimal 2 huruf.', '#fName');
    if (!wa) return err(5, 'Nomor WhatsApp-nya belum pas. Contoh: 0812 3456 7890.', '#fWa');
    norm();
    var f = S.f, r = hitung(f);
    if (isEmptyPlan(r)) return err(5, 'Rencanamu belum berisi layanan. Pilih tur' + (P.hotel ? ', hotel' : '') + (P.kg ? ', atau Kirgistan' : '') + ' dulu.');
    err(5, '');
    var land = P.arrival && r.nights > 0, trf = f.mode !== 'paket' && land;
    var payload = {
      v: 1, page: P.key, d: f.d, e: r.e, pax: f.pax, flex: f.flex, mode: f.mode, paket: f.mode === 'paket' ? f.paket : '',
      hotel: P.hotel && r.almaty > 0 ? f.hotel : 'sendiri', kamar: f.pax === 1 ? 1 : f.kamar, hn: f.hotel === 'sendiri' ? f.hn.trim() : '',
      kg: r.kgP ? f.kg : 'tidak', kgMulai: r.kgP ? f.kgMulai : '', hari: planDays(r), add: f.add.slice(),
      via: land ? f.via : 'lokal', t: land && f.via !== 'lokal' ? f.t : '', fl: land && f.via === 'pesawat' ? f.fl.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim() : '',
      jemput: trf && f.via !== 'lokal' && f.jemput, antar: trf && f.antar,
      note: f.note.trim(), name: name, wa: wa, hp: $('#fHp').value,
      est: { pp: r.pp, total: r.pp * f.pax, wait: r.wait.slice(), per: CONFIG.hargaPer }
    };
    payload.plan = pesanWA(payload, r, '');
    S.busy = true; setBusy(true);
    call('submit', payload).then(function (res) { return res; }, function () { return { ok: false, net: true, error: 'Koneksi lagi bermasalah. Coba tekan kirim sekali lagi, atau kirim rencanamu lewat WhatsApp.' }; })
      .then(function (res) {
        S.busy = false; setBusy(false);
        var fb = $('#waFallback'), server = !res || res.net || !res.field;
        fb.hidden = !(res && !res.ok && server);
        if (!fb.hidden) fb.href = 'https://wa.me/' + waAdmin() + '?text=' + encodeURIComponent(payload.plan);
        if (!res || !res.ok) {
          var map = { d: 0, e: 0, pax: 0, kg: 1, hari: 2, hotel: 3, t: 4, fl: 4 }, st = res && map.hasOwnProperty(res.field) ? map[res.field] : 5;
          var focus = { name: '#fName', wa: '#fWa', note: '#fNote', t: '#fHour', fl: '#fFl' };
          if (st !== 5) go(st);
          return err(st, (res && res.error) || 'Ada yang belum beres. Coba lagi, ya, atau kirim rencanamu lewat WhatsApp.', (res && focus[res.field]) || null);
        }
        success(res, payload, r);
      });
  }
  function shareLink() {
    var own = safeUrl(S.data && S.data.share);
    return own || 'https://sundaftrip.com/' + P.key;
  }
  function success(res, payload, r) {
    S.res = { d: payload.d, kode: res.kode };
    var act = S.data.act || (S.data.act = {});
    if (res.act && typeof res.act === 'object') Object.keys(res.act).forEach(function (d) { act[d] = res.act[d]; });
    else Object.keys(payload.hari).forEach(function (d) { var a = act[d] || (act[d] = {}); a[payload.hari[d]] = (a[payload.hari[d]] || 0) + payload.pax; });
    (S.data.recent = S.data.recent || []).unshift({ d: payload.d, n: payload.pax, t: Date.now(), p: P.key });
    S.mine = S.mine.filter(function (x) { return x.d !== payload.d; }).concat([{ d: payload.d, kode: res.kode, t: Date.now() }]);
    store.set('mine', S.mine);

    var n, prev, m0 = ms()[0];
    if (TOURS) {
      var days = Object.keys(payload.hari).sort(), d0 = days[0], k0 = payload.hari[d0];
      n = Math.max(actCount(d0, k0), payload.pax); prev = Math.max(0, n - payload.pax);
      $('#sNumL').textContent = 'orang daftar ' + TUR[k0].pendek + ' ' + short(d0);
      $('#sBar').hidden = true; $('#sBar').innerHTML = '';
      $('#sNext').textContent = 'Admin mengirim jam kumpul dan harga pasti lewat WhatsApp. Titik kumpul: ' + meetText() + '.';
    } else {
      var list = S.data.pools || (S.data.pools = []), p = poolOf(payload.d);
      if (!p) { p = { d: payload.d, n: 0, dp: 0, kg: 0, r: 0, g: false }; list.push(p); }
      if (res.pool) ['n', 'dp', 'kg', 'r', 'e'].forEach(function (k) { if (res.pool[k] !== undefined) p[k] = res.pool[k]; });
      if (res.group) p.g = true;
      n = p.n; prev = Math.max(0, Math.min(+res.prev || 0, n));
      $('#sNumL').textContent = 'orang tiba di tanggal ini';
      $('#sBar').hidden = false;
      $('#sBar').innerHTML = barHTML(n, Math.min(prev / cap(), 1), true);
      $('#sNext').textContent = safeUrl(res.group) ? 'Grup WA untuk yang tiba ' + short(p.d) + ' sudah ada. Gabung lewat tombolnya di bawah.'
        : n < m0 ? 'Tanggal tiba ' + short(p.d) + ' butuh ' + (m0 - n) + ' orang lagi untuk buka grup WA. Tripmu tetap jalan walau grupnya belum dibuka.'
        : 'Grup WA untuk yang tiba ' + short(p.d) + ' sudah dibuka. Admin mengirim link-nya ke nomormu.';
    }
    $('#sCode').textContent = res.kode || '';
    $('#sTitle').textContent = res.updated ? 'Rencanamu sudah diperbarui' : 'Rencanamu masuk';
    $('#sNum').textContent = prev;
    var others = Math.max(0, Math.min(prev, 7)), crowd = '';
    for (var j = 0; j < others; j++) crowd += face(j);
    var meAt = others * 70 + 450;
    crowd += face(others, true).replace('style="--k:' + others + '"', 'style="--k:' + others + ';--d:' + meAt + 'ms"');
    if (prev > others) crowd = crowd.replace('<span class="av c1"', '<span class="av-more" style="--k:0">+' + (prev - others) + '</span><span class="av c1"');
    $('#sCrowd').innerHTML = crowd;

    S.planText = pesanWA(payload, r, res.kode);
    $('#sAdmin').href = 'https://wa.me/' + waAdmin() + '?text=' + encodeURIComponent(S.planText);
    var link = shareLink();
    $('#sShare').href = 'https://wa.me/?text=' + encodeURIComponent(P.share.replace('{d}', long(payload.d)) + (link ? ': ' + link : '!'));
    var g = safeUrl(res.group);
    $('#sGroup').hidden = !g; if (g) $('#sGroup').href = g;
    $('#sPlan').hidden = true;
    $('#sCopy').textContent = 'Salin rencana';
    $('#sInfo').textContent = res.demo ? 'Mode contoh: pendaftaran ini tidak disimpan. Tekan Kirim rencana ke admin supaya rencanamu sampai ke admin.'
      : 'Rencanamu sudah tersimpan. Admin mengirim harga pasti lewat WhatsApp. Biar lebih cepat, kirim juga rencananya lewat tombol di atas.';

    go(DONE);
    var sc = $('.success'); sc.classList.remove('drawn'); void sc.offsetWidth; sc.classList.add('drawn');
    try { if (navigator.vibrate && !reduce) navigator.vibrate(10); } catch (e) {}
    setTimeout(function () { countUp($('#sNum'), prev, n, 900); }, reduce ? 0 : meAt + 500);
    if (!TOURS) animateBars($('#sBar'), 450);
    renderStats(false); renderTicker(); renderPools(false);
  }
  function copyPlan() {
    var txt = S.planText || '', btn = $('#sCopy');
    var done = function (label) { btn.innerHTML = CHECK + label; setTimeout(function () { btn.textContent = 'Salin rencana'; }, 2200); };
    var fallback = function () { var i = $('#sPlan'); i.hidden = false; i.value = txt; i.focus(); i.select(); done('Tekan lama untuk salin'); };
    try { navigator.clipboard.writeText(txt).then(function () { done('Rencana tersalin'); }, fallback); } catch (e) { fallback(); }
  }

  /* ---------------- dock, akordeon ---------------- */
  function updateDock() { $('#dock').classList.toggle('show', !S.open && !S.heroSeen && !!S.data); }
  function toggleAcc(btn, body) {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    body.classList.toggle('open', open);
  }
  $('#accBtn').addEventListener('click', function () { toggleAcc(this, $('#accBody')); });
  $('#addonBtn').addEventListener('click', function () { toggleAcc(this, $('#addonBody')); });

  /* ---------------- lampu: mode terang / gelap (sama dengan Pool Kazakhstan) ---------------- */
  var darkMq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function themeNow() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || t === 'light' ? t : (darkMq && darkMq.matches ? 'dark' : 'light');
  }
  function syncLamp() {
    var on = themeNow() === 'light', b = $('#lampBtn');
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Lampu nyala (mode terang)' : 'Lampu mati (mode gelap)');
    b.title = on ? 'Matikan lampu' : 'Nyalakan lampu';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', on ? '#FFFFFF' : '#0E1212');
  }
  $('#lampBtn').addEventListener('click', function () {
    var root = document.documentElement, b = this, nextT = themeNow() === 'dark' ? 'light' : 'dark';
    if (!reduce) {
      root.classList.add('theme-anim');
      clearTimeout(S.themeT); S.themeT = setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
      b.classList.remove('swing'); void b.offsetWidth; b.classList.add('swing');
    }
    root.setAttribute('data-theme', nextT);
    saveTheme(nextT);
    syncLamp();
    try { if (navigator.vibrate && !reduce) navigator.vibrate(8); } catch (e) {}
  });
  $('#lampBtn').addEventListener('animationend', function () { this.classList.remove('swing'); });
  if (darkMq && darkMq.addEventListener) darkMq.addEventListener('change', syncLamp);
  syncLamp();

  /* ---------------- salin nomor rekening ---------------- */
  $('#payCopy').addEventListener('click', function () {
    var b = this, num = $('#payNum').textContent.replace(/\D/g, '');
    var done = function (ok) {
      var who = $('#payWho');
      clearTimeout(b._t);
      if (ok) { b.classList.add('ok'); b.innerHTML = CHECK; b.setAttribute('aria-label', 'Nomor rekening tersalin'); }
      else {
        try { getSelection().selectAllChildren($('#payNum')); } catch (e) {}
        who.textContent = 'Tekan lama nomor di atas untuk menyalin';
      }
      b._t = setTimeout(function () {
        b.classList.remove('ok'); b.textContent = 'Salin'; b.setAttribute('aria-label', 'Salin nomor rekening');
        who.textContent = 'a.n. CV SUNDAF HOLIDAY GROUP';
      }, 2400);
    };
    try { navigator.clipboard.writeText(num).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  });

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-join],[data-ikut],[data-new],[data-cal],[data-pick],[data-sort],[data-next],[data-goto],[data-kgstart],[data-kg],[data-mode],[data-paket],[data-day],[data-act],[data-hotel],[data-kamar],[data-via]');
    if (!t || t.disabled) return;
    if (t.hasAttribute('data-join')) openFrom(t, t.getAttribute('data-join'));
    else if (t.hasAttribute('data-ikut')) { var x = t.getAttribute('data-ikut').split('|'); openFrom(t, x[0], x[1]); }
    else if (t.hasAttribute('data-new')) openFrom(t, '');
    else if (t.hasAttribute('data-cal')) pickDay(t.getAttribute('data-cal'));
    else if (t.hasAttribute('data-pick')) setStart(t.getAttribute('data-pick'), true);
    else if (t.hasAttribute('data-sort')) {
      S.sort = t.getAttribute('data-sort');
      $$('[data-sort]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
      if (S.data) resort();
    }
    else if (t.hasAttribute('data-next')) next(+t.getAttribute('data-next'));
    else if (t.hasAttribute('data-goto')) go(+t.getAttribute('data-goto'));
    else if (t.hasAttribute('data-kgstart')) setKgStart(t.getAttribute('data-kgstart'));
    else if (t.hasAttribute('data-kg')) setKg(t.getAttribute('data-kg'));
    else if (t.hasAttribute('data-mode')) setMode(t.getAttribute('data-mode'));
    else if (t.hasAttribute('data-paket')) setPaket(t.getAttribute('data-paket'));
    else if (t.hasAttribute('data-day')) selectDay(t.getAttribute('data-day'));
    else if (t.hasAttribute('data-act')) setAct(t.getAttribute('data-act'));
    else if (t.hasAttribute('data-hotel')) setHotel(t.getAttribute('data-hotel'));
    else if (t.hasAttribute('data-kamar')) setKamar(+t.getAttribute('data-kamar'));
    else if (t.hasAttribute('data-via')) { S.f.via = t.getAttribute('data-via'); saveDraft(); renderArrival(); renderCta(); }
  });
  $('#heroCta').addEventListener('click', function () { openFrom(this, ''); });
  $('#dockCta').addEventListener('click', function () { openFrom(this, ''); });
  $('#newDateBtn').addEventListener('click', function () { openFrom(this, ''); });
  $('#closeBtn').addEventListener('click', closeSheet);
  $('#backdrop').addEventListener('click', closeSheet);
  $('#sDone').addEventListener('click', closeSheet);
  $('#backBtn').addEventListener('click', function () { if (S.step > 0 && S.step < DONE) go(prevIdx(S.step)); });
  $('#paxMinus').addEventListener('click', function () { setPax(-1); });
  $('#paxPlus').addEventListener('click', function () { setPax(1); });
  $('#sCopy').addEventListener('click', copyPlan);
  $('#fFlex').addEventListener('change', function (e) { S.f.flex = e.target.checked; saveDraft(); });
  $('#fJemput').addEventListener('change', function (e) { S.f.jemput = e.target.checked; saveDraft(); renderCta(); });
  $('#fAntar').addEventListener('change', function (e) { S.f.antar = e.target.checked; saveDraft(); renderCta(); });
  $('#addonList').addEventListener('change', function (e) {
    var id = e.target.getAttribute('data-add'); if (!id) return;
    var a = S.f.add.filter(function (x) { return x !== id; });
    if (e.target.checked) a.push(id);
    S.f.add = a; saveDraft();
    var r = hitung(S.f); renderAddons(r); renderPlanWarn(r);
  });
  (function () {
    var h = '<option value="">Belum tahu</option>', m = '';
    for (var i = 0; i < 24; i++) h += '<option value="' + pad(i) + '">' + pad(i) + '</option>';
    for (var j = 0; j < 60; j += 5) m += '<option value="' + pad(j) + '">' + pad(j) + '</option>';
    $('#fHour').innerHTML = h; $('#fMin').innerHTML = m;
  })();
  $('#fHour').addEventListener('change', setTime);
  $('#fMin').addEventListener('change', setTime);
  $('#fFl').addEventListener('input', function (e) { S.f.fl = e.target.value; saveDraft(); });
  $('#fHn').addEventListener('input', function (e) { S.f.hn = e.target.value; saveDraft(); });
  $('#fNote').addEventListener('input', function (e) { S.f.note = e.target.value; saveDraft(); });
  $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
  $('#calNext').addEventListener('click', function () { shiftMonth(1); });
  (function () {
    var el = $('#cal'), x0 = null, y0 = 0;
    el.addEventListener('touchstart', function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) shiftMonth(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();
  ['#fName', '#fWa', '#fNote'].forEach(function (id) { $(id).addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); }); });
  $('#fName').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#fWa').focus(); } });
  $('#fWa').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#fNote').focus(); } });
  $('#form').addEventListener('submit', function (e) { e.preventDefault(); if (S.step < LAST) next(S.step); else if (S.step === LAST) submit(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) closeSheet(); });
  $('#sheet').addEventListener('animationend', function (e) { if (e.target === this && e.animationName === 'sheetUp') this.classList.add('settled'); });

  /* geser ke bawah di pegangan/kepala sheet untuk menutup (mengikuti jari) */
  (function () {
    var sh = $('#sheet'), bd = $('#backdrop'), y0 = 0, dy = 0, on = false;
    function start(e) { if (!S.open || !e.touches) return; on = true; dy = 0; y0 = e.touches[0].clientY; sh.classList.add('settled', 'dragging'); }
    function move(e) { if (!on) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; bd.style.opacity = String(Math.max(.2, 1 - dy / 420)); }
    function end() {
      if (!on) return; on = false; sh.classList.remove('dragging');
      if (dy > 90) { closeSheet(); return; }
      sh.style.transition = 'transform .35s cubic-bezier(.22,.8,.26,1)'; sh.style.transform = ''; bd.style.opacity = '';
      setTimeout(function () { sh.style.transition = ''; }, 360);
    }
    ['.grab', '.sheet-head'].forEach(function (q) { $(q).addEventListener('touchstart', start, { passive: true }); });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end); window.addEventListener('touchcancel', end);
  })();

  /* sheet tetap di atas keyboard layar */
  if (window.visualViewport) {
    var vv = window.visualViewport;
    var fit = function () {
      var sh = $('#sheet'), kb = window.innerHeight - vv.height - vv.offsetTop;
      if (kb > 120) { sh.style.bottom = kb + 'px'; sh.style.maxHeight = Math.round(vv.height * .96) + 'px'; }
      else { sh.style.bottom = ''; sh.style.maxHeight = ''; }
    };
    vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { S.heroSeen = es[0].isIntersecting; updateDock(); }).observe($('#heroCta'));
  } else { S.heroSeen = false; }

  /* ---------------- boot ---------------- */
  function saveCache(d) { if (LIVE) store.set('pools', { t: Date.now(), d: d }); }
  function fail() {
    S.loadFailed = true;
    if (!(S.data && !S.data.prov)) {
      $('#poolList').innerHTML = '<li class="load-err">Daftar tanggal belum bisa dimuat. <button type="button" class="btn btn-line btn-sm" id="retry">Coba lagi</button></li>';
      $('#retry').addEventListener('click', load);
    }
    flushPending(true);
  }
  function load() {
    call('getPools').then(function (d) {
      if (!d || !d.ok) return fail();
      var first = !S.data || !!S.data.prov;
      S.loadFailed = false; S.data = d; saveCache(d);
      renderAll(first); updateDock();
      if (S.open && S.step === 0) { renderChips(); renderCal(0); updateDate(); }
      flushPending(false);
    }, fail);
  }
  function refresh() {
    if (!LIVE || document.hidden || S.open || S.busy || !S.data) return;
    if (S.data.prov) return load();
    call('getPools').then(function (d) { if (d && d.ok && !S.open) { S.data = d; saveCache(d); renderHeader(); renderStats(false); renderTicker(); renderPools(false); } }, function () {});
  }
  renderHeader(); renderMenu(); renderRules();
  // Kunjungan ulang: tampilkan data terakhir langsung, lalu perbarui dari API di belakang.
  var cached = LIVE ? store.get('pools', null) : null;
  if (cached && cached.d && cached.d.ok && Date.now() - cached.t < 12 * 36e5) {
    if (!(cached.d.today >= jakartaToday())) cached.d.today = jakartaToday();
    S.data = cached.d; renderAll(true); updateDock();
  }
  load();
  setInterval(refresh, 120000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });

  window.__pb = { S: S, P: P, hitung: hitung, rpTotal: rpTotal, rpItem: rpItem, CONFIG: CONFIG, norm: norm, pesanWA: pesanWA, blankF: blankF };   // untuk pengujian
})();
