/**
 * SUNDAF Trip · API pendaftaran tiga halaman "pasti berangkat"
 *   sundaftrip.com/pastiberangkat  trip Almaty, tetap jalan walau 1 orang
 *   sundaftrip.com/2tans           trip Kazakhstan + Kirgistan
 *   sundaftrip.com/turharian       tur harian Almaty, tanpa hotel
 * Satu Google Sheet ("SUNDAF · Pasti Berangkat") untuk ketiganya. Terpisah dari Pool Kazakhstan dan Pool Trip.
 * Halaman memanggil /api/pasti-berangkat di sundaftrip.com; route itu meneruskan ke web app ini.
 *
 * Cara pasang (sekali saja):
 * 1. Di Google Sheet ini: Extensions → Apps Script. Hapus isi Code.gs, tempel seluruh file ini, simpan.
 * 2. Pilih fungsi "setup" di toolbar, tekan Run, lalu beri izin. Sheet Pendaftar, Grup WA, dan Rekap tur dibuat otomatis.
 * 3. Deploy → New deployment → Select type: Web app. Execute as: Me. Who has access: Anyone. Deploy.
 * 4. Salin URL yang berakhiran /exec ke PB_SCRIPT_URL di lib/pasti-berangkat.ts (repo situs),
 *    atau ke env PB_SCRIPT_URL di Vercel.
 *    Kalau kode ini diubah: Deploy → Manage deployments → Edit → Version: New version (URL tetap sama).
 *
 * Kerja harian admin:
 * - Kolom Status: MINAT terisi otomatis. Ubah ke DP, LUNAS, atau BATAL.
 *   Hanya DP dan LUNAS yang dihitung sebagai peserta pasti; BATAL tidak dihitung di mana pun.
 * - Kolom Halaman: dari halaman mana pendaftar datang (pastiberangkat, 2tans, turharian).
 * - Sheet "Rekap tur": jumlah orang per tanggal per tur, dari semua halaman. Dipakai untuk memesan kursi
 *   tur gabungan. Diperbarui setiap ada pendaftaran, atau lewat menu SUNDAF → Perbarui rekap tur.
 * - Sheet "Grup WA": isi tanggal tiba (yyyy-mm-dd) dan link grup WhatsApp.
 *   Pendaftar halaman pastiberangkat dan 2tans di tanggal itu langsung melihat tombol "Gabung grup WA".
 * - Kolom Rencana berisi teks lengkap yang juga bisa disalin ke WhatsApp.
 *
 * Data yang keluar ke publik (GET ?api=pools) hanya angka per tanggal, tanpa nama atau nomor WA.
 */

var CFG = {
  OPEN: true,                 // false = pendaftaran ditutup sementara
  MIN_DAYS: 7,                // tanggal paling cepat: hari ini + 7
  MAX_DAYS: 450,              // tanggal paling jauh: hari ini + 450
  MAX_NIGHTS: 21,             // rencana paling panjang
  MAX_PAX: 30,                // orang per pendaftaran
  MILESTONES: [6],            // grup WA dibuka saat 6 orang tiba di tanggal yang sama
  WA_ADMIN: '6281775202759',  // nomor WhatsApp admin, format 628xxxxxxxxxx (sama dengan Pool Kazakhstan)
  MEET: 'Lobi Astra Hotel, Jl. Zheltoksan 12, Almaty',
  MEET_TIME: '',              // contoh '08:30'; kosong = jam kumpul dikirim admin sehari sebelumnya
  NIGHT: { from: '22:00', to: '06:00', fee: 0 },
  TZ: 'Asia/Jakarta',
  SHEET: 'Pendaftar',
  GROUPS: 'Grup WA',
  REKAP: 'Rekap tur'
};

var PAGES = {
  pastiberangkat: { kode: 'PB', kg: false, hotel: true, paket: true, arrival: true },
  '2tans': { kode: '2T', kg: true, hotel: true, paket: true, arrival: true },
  turharian: { kode: 'TH', kg: false, hotel: false, paket: false, arrival: false }
};
var COLS = ['Waktu', 'Kode', 'Status', 'Halaman', 'Nama', 'WhatsApp', 'Tiba / mulai', 'Pulang / selesai', 'Malam', 'Orang',
  'Bisa geser ±2 hari', 'Cara pesan', 'Hotel', 'Kamar', 'Nama hotel', 'Kirgistan', 'Mulai Kirgistan', 'Tur per hari', 'Tambahan',
  'Tiba lewat', 'Jam tiba', 'Penerbangan', 'Jemput', 'Antar', 'Perkiraan per orang', 'Perkiraan total',
  'Harga menyusul', 'Catatan', 'Rencana', 'Data'];
var C = {};
COLS.forEach(function (n, i) { C[n] = i; });
var TEXT_COLS = ['Kode', 'Halaman', 'WhatsApp', 'Tiba / mulai', 'Pulang / selesai', 'Mulai Kirgistan', 'Jam tiba'];
var FORMATS = COLS.map(function (n) {   // teks tetap teks: tanggal dan nomor WA tidak diubah Sheets jadi angka
  return TEXT_COLS.indexOf(n) >= 0 ? '@' : n === 'Waktu' ? 'yyyy-mm-dd hh:mm' : n === 'Perkiraan per orang' || n === 'Perkiraan total' ? '#,##0' : 'General';
});
var STATUS = ['MINAT', 'DP', 'LUNAS', 'BATAL'];
var TUR = { kota: 'Kota & Shymbulak', charyn: 'Charyn & Kolsay', privat: 'Tur privat' };
var ADDONS = ['kuda', 'para', 'paragg', 'parafoto', 'paravideo', 'parafv', 'atv', 'zip', 'ziph', 'alpine', 'tali', 'taligg', 'burung'];
var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/* ---------------- pasang ---------------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CFG.SHEET) || ss.insertSheet(CFG.SHEET, 0);
  sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  TEXT_COLS.forEach(function (n) {
    sh.getRange(2, C[n] + 1, sh.getMaxRows() - 1, 1).setNumberFormat('@');
  });
  sh.getRange(2, C['Waktu'] + 1, sh.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange(2, C['Perkiraan per orang'] + 1, sh.getMaxRows() - 1, 2).setNumberFormat('#,##0');
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(false).build();
  sh.getRange(2, C['Status'] + 1, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  var g = ss.getSheetByName(CFG.GROUPS) || ss.insertSheet(CFG.GROUPS);
  g.getRange(1, 1, 1, 3).setValues([['Tanggal tiba', 'Link grup WA', 'Catatan']]).setFontWeight('bold');
  g.setFrozenRows(1);
  g.getRange(2, 1, g.getMaxRows() - 1, 1).setNumberFormat('@');
  var first = ss.getSheetByName('Sheet1');   // sheet kosong bawaan
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  rekap();
}
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SUNDAF').addItem('Perbarui rekap tur', 'rekap').addToUi();
}

/* ---------------- web ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.api === 'pools') return out(getPools());
  return out({ ok: true, info: 'API pendaftaran SUNDAF Trip: pastiberangkat, 2tans, turharian. Pakai ?api=pools.' });
}
function doPost(e) {
  var x;
  try { x = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return out({ ok: false, error: 'Data tidak terbaca. Coba kirim sekali lagi.' }); }
  try { return out(submit(x)); }
  catch (err) { console.error(err); return out({ ok: false, error: 'Server lagi sibuk. Coba kirim sekali lagi sebentar lagi.' }); }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- baca ---------------- */
function getPools() {
  var today = todayKey(), rows = readRows(), groups = readGroups(), by = {}, act = {}, recent = [], total = 0;
  rows.forEach(function (r) {
    if (r.status === 'BATAL' || !r.tiba || r.pulang < today) return;
    Object.keys(r.hari).forEach(function (d) {
      if (d < today) return;
      var a = act[d] || (act[d] = {});
      a[r.hari[d]] = (a[r.hari[d]] || 0) + r.pax;
    });
    if (r.t) recent.push({ d: r.page === 'turharian' ? firstTour(r) : r.tiba, n: r.pax, t: r.t, p: r.page });
    if (r.page === 'turharian' || r.tiba < today) return;   // tur harian tidak masuk daftar tanggal tiba
    var p = by[r.tiba] || (by[r.tiba] = { d: r.tiba, n: 0, dp: 0, kg: 0, r: 0, e: r.tiba, g: !!groups[r.tiba] });
    p.n += r.pax; p.r += 1;
    if (r.status === 'DP' || r.status === 'LUNAS') p.dp += r.pax;
    if (r.kg) p.kg += r.pax;
    if (r.pulang > p.e) p.e = r.pulang;
    total += r.pax;
  });
  recent.sort(function (a, b) { return b.t - a.t; });
  return {
    ok: true, version: 1, open: CFG.OPEN, today: today, minDays: CFG.MIN_DAYS, maxPax: CFG.MAX_PAX, milestones: CFG.MILESTONES,
    wa: CFG.WA_ADMIN, share: '', meet: CFG.MEET, meetTime: CFG.MEET_TIME, night: CFG.NIGHT,
    pools: Object.keys(by).sort().map(function (k) { return by[k]; }), act: act, recent: recent.slice(0, 12), total: total, updated: Date.now()
  };
}
function firstTour(r) { var k = Object.keys(r.hari).sort(); return k.length ? k[0] : r.tiba; }
function sheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function readRows() {
  var sh = sheet(CFG.SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, COLS.length).getValues();
  return vals.map(function (v, i) {
    var data = {};
    try { data = JSON.parse(v[C['Data']] || '{}') || {}; } catch (e) { data = {}; }
    var hari = {};
    if (data.hari && typeof data.hari === 'object') Object.keys(data.hari).forEach(function (d) { if (isDate(d) && TUR[data.hari[d]]) hari[d] = data.hari[d]; });
    var t = v[C['Waktu']], page = String(v[C['Halaman']] || '').trim();
    return {
      row: i + 2, t: t instanceof Date ? t.getTime() : (+t || 0), kode: String(v[C['Kode']] || ''), status: String(v[C['Status']] || 'MINAT').trim().toUpperCase(),
      page: PAGES.hasOwnProperty(page) ? page : '2tans', wa: String(v[C['WhatsApp']] || '').replace(/\D/g, ''),
      tiba: dateCell(v[C['Tiba / mulai']]), pulang: dateCell(v[C['Pulang / selesai']]) || dateCell(v[C['Tiba / mulai']]),
      pax: Math.max(0, Math.floor(+v[C['Orang']] || 0)), kg: !!String(v[C['Kirgistan']] || '').trim() && String(v[C['Kirgistan']]).trim() !== 'tidak', hari: hari
    };
  });
}
function readGroups() {
  var sh = sheet(CFG.GROUPS), o = {};
  if (!sh || sh.getLastRow() < 2) return o;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (v) {
    var d = dateCell(v[0]), link = String(v[1] || '').trim();
    if (d && /^https:\/\/chat\.whatsapp\.com\//i.test(link)) o[d] = link;
  });
  return o;
}

/* ---------------- rekap tur per hari (untuk memesan kursi tur gabungan) ---------------- */
function rekap(rows) {
  rows = Array.isArray(rows) ? rows : readRows();   // dari menu: tanpa argumen
  var sh = sheet(CFG.REKAP) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(CFG.REKAP), by = {}, today = todayKey();
  rows.forEach(function (r) {
    if (r.status === 'BATAL') return;
    Object.keys(r.hari).forEach(function (d) {
      if (d < today) return;
      var k = d + '|' + r.hari[d], x = by[k] || (by[k] = { d: d, tur: r.hari[d], n: 0, pasti: 0, kode: [] });
      x.n += r.pax;
      if (r.status === 'DP' || r.status === 'LUNAS') x.pasti += r.pax;
      x.kode.push(r.kode + ' (' + r.pax + ')');
    });
  });
  var vals = Object.keys(by).sort().map(function (k) {
    var x = by[k];
    return [x.d, HARI[new Date(tOf(x.d)).getUTCDay()], TUR[x.tur], x.n, x.pasti, x.kode.join(', ')];
  });
  sh.clearContents();
  if (vals.length + 1 > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), vals.length + 1 - sh.getMaxRows());
  sh.getRange(1, 1, 1, 6).setValues([['Tanggal', 'Hari', 'Tur', 'Orang (semua kecuali BATAL)', 'Orang DP/LUNAS', 'Kode pendaftar (orang)']]).setFontWeight('bold');
  sh.setFrozenRows(1);
  if (vals.length) {
    sh.getRange(2, 1, vals.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, vals.length, 6).setValues(vals);
  }
}

/* ---------------- tulis ---------------- */
function submit(x) {
  x = x || {};
  if (!CFG.OPEN) return { ok: false, error: 'Pendaftaran lagi ditutup sementara. Coba lagi nanti, ya.' };
  var page = typeof x.page === 'string' && PAGES.hasOwnProperty(x.page) ? x.page : '', pg = PAGES[page];
  if (!pg) return { ok: false, error: 'Halaman tidak dikenali. Muat ulang halamannya, lalu kirim lagi.' };
  var today = todayKey(), d = str(x.d), e = str(x.e) || d;
  if (x.hp) return { ok: true, kode: pg.kode + '-0000', updated: false, prev: 0, act: {}, pool: page === 'turharian' ? null : { d: d, n: 0, dp: 0, kg: 0, r: 0, e: e }, group: '', wa: CFG.WA_ADMIN, share: '' };   // jebakan bot
  if (!isDate(d) || !isDate(e) || e < d) return { ok: false, field: 'd', error: 'Tanggalnya belum pas. Pilih lagi tanggalnya.' };
  if (d < addDays(today, CFG.MIN_DAYS)) return { ok: false, field: 'd', error: 'Tanggal paling cepat ' + tglID(addDays(today, CFG.MIN_DAYS)) + '. Untuk tanggal yang lebih dekat, chat admin langsung, ya.' };
  if (e > addDays(today, CFG.MAX_DAYS)) return { ok: false, field: 'd', error: 'Tanggalnya kejauhan. Pilih tanggal dalam 15 bulan ke depan.' };
  var nights = diffDays(e, d);
  if (nights > CFG.MAX_NIGHTS) return { ok: false, field: 'd', error: 'Paling lama ' + CFG.MAX_NIGHTS + ' malam. Untuk trip yang lebih panjang, chat admin, ya.' };
  var pax = Math.floor(+x.pax);
  if (!(pax >= 1 && pax <= CFG.MAX_PAX)) return { ok: false, field: 'pax', error: 'Jumlah orang 1 sampai ' + CFG.MAX_PAX + '. Rombongan lebih besar, chat admin, ya.' };
  var name = text(x.name, 60);
  if (name.length < 2) return { ok: false, field: 'name', error: 'Isi nama dulu, minimal 2 huruf.' };
  var wa = normWa(x.wa);
  if (!wa) return { ok: false, field: 'wa', error: 'Nomor WhatsApp-nya belum pas. Contoh: 0812 3456 7890.' };

  var hari = {};
  if (x.hari && typeof x.hari === 'object') Object.keys(x.hari).forEach(function (k) { if (isDate(k) && k >= d && k <= e && TUR[x.hari[k]]) hari[k] = x.hari[k]; });
  if (page === 'turharian' && !Object.keys(hari).length) return { ok: false, field: 'hari', error: 'Pilih minimal satu tur dulu.' };
  var kg = pg.kg && (x.kg === 'gabungan' || x.kg === 'privat') ? x.kg : 'tidak';
  var kgHari = kg === 'privat' ? 4 : 3;   // gabungan 3 hari, privat 4 hari; harus selesai sebelum hari pulang
  var kgMulai = kg !== 'tidak' && isDate(str(x.kgMulai)) && x.kgMulai > d && addDays(x.kgMulai, kgHari - 1) < e ? x.kgMulai : '';
  if (kg !== 'tidak' && !kgMulai) kg = 'tidak';
  var mode = pg.paket && x.mode === 'paket' ? 'paket' : 'harian', paket = mode === 'paket' ? (x.paket === 'p6' ? 'p6' : 'p5') : '';
  var hotel = pg.hotel && x.hotel !== 'sendiri' ? 'astra' : 'sendiri', kamar = [1, 2, 3].indexOf(+x.kamar) >= 0 ? +x.kamar : 2;
  var via = pg.arrival && /^(pesawat|darat|lokal)$/.test(x.via) ? x.via : (pg.arrival ? 'pesawat' : 'lokal');
  var t = pg.arrival && via !== 'lokal' && /^\d{2}:\d{2}$/.test(str(x.t)) ? x.t : '';
  var fl = pg.arrival && via === 'pesawat' ? text(x.fl, 10).toUpperCase().replace(/[^A-Z0-9 ]/g, '') : '';
  var jemput = pg.arrival && mode !== 'paket' && via !== 'lokal' && nights > 0 && !!x.jemput, antar = pg.arrival && mode !== 'paket' && nights > 0 && !!x.antar;
  var add = (Array.isArray(x.add) ? x.add : []).filter(function (a) { return ADDONS.indexOf(a) >= 0; });
  var est = x.est && typeof x.est === 'object' ? x.est : {}, pp = Math.max(0, Math.round(+est.pp || 0));
  var wait = (Array.isArray(est.wait) ? est.wait : []).map(function (w) { return text(w, 120); }).filter(String).slice(0, 20);
  var clean = { v: 1, page: page, d: d, e: e, pax: pax, mode: mode, paket: paket, hotel: hotel, kamar: kamar, kg: kg, kgMulai: kgMulai, hari: hari, add: add, via: via, t: t };
  var hariTxt = Object.keys(hari).sort().map(function (k) { return k.slice(8) + '/' + k.slice(5, 7) + ' ' + TUR[hari[k]]; }).join('; ');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet(CFG.SHEET);
    if (!sh) { setup(); sh = sheet(CFG.SHEET); }
    var rows = readRows(), ex = null, prev = 0, dp = 0, kgN = 0, count = 0, end = e;
    rows.forEach(function (r) { if (r.wa === wa && r.tiba === d && r.page === page && r.status !== 'BATAL') ex = r; });
    if (page !== 'turharian') rows.forEach(function (r) {
      if (r.tiba !== d || r.page === 'turharian' || r.status === 'BATAL' || r === ex) return;
      prev += r.pax; count += 1;
      if (r.status === 'DP' || r.status === 'LUNAS') dp += r.pax;
      if (r.kg) kgN += r.pax;
      if (r.pulang > end) end = r.pulang;
    });
    var kode = ex ? ex.kode : nextKode(rows, pg.kode), status = ex ? ex.status : 'MINAT';
    if (ex && (status === 'DP' || status === 'LUNAS')) dp += pax;
    var vals = [];
    vals[C['Waktu']] = ex ? new Date(ex.t || Date.now()) : new Date();
    vals[C['Kode']] = kode;
    vals[C['Status']] = status;
    vals[C['Halaman']] = page;
    vals[C['Nama']] = safe(name);
    vals[C['WhatsApp']] = wa;
    vals[C['Tiba / mulai']] = d;
    vals[C['Pulang / selesai']] = e;
    vals[C['Malam']] = nights;
    vals[C['Orang']] = pax;
    vals[C['Bisa geser ±2 hari']] = x.flex ? 'ya' : '';
    vals[C['Cara pesan']] = page === 'turharian' ? 'Tur harian' : mode === 'paket' ? 'Paket privat ' + (paket === 'p6' ? '6H5M' : '5H4M') : 'Per hari';
    vals[C['Hotel']] = hotel === 'sendiri' ? (page === 'turharian' ? '' : 'Hotel sendiri') : mode === 'paket' ? 'Termasuk paket' : 'Astra Hotel';
    vals[C['Kamar']] = hotel === 'sendiri' ? '' : pax === 1 ? 'sendiri' : { 1: 'sendiri', 2: 'berdua', 3: 'bertiga' }[kamar];
    vals[C['Nama hotel']] = safe(text(x.hn, 60));
    vals[C['Kirgistan']] = pg.kg ? kg : '';
    vals[C['Mulai Kirgistan']] = kgMulai;
    vals[C['Tur per hari']] = hariTxt;
    vals[C['Tambahan']] = add.join(', ');
    vals[C['Tiba lewat']] = pg.arrival ? via : '';
    vals[C['Jam tiba']] = t;
    vals[C['Penerbangan']] = safe(fl);
    vals[C['Jemput']] = jemput ? 'ya' : '';
    vals[C['Antar']] = antar ? 'ya' : '';
    vals[C['Perkiraan per orang']] = pp || '';
    vals[C['Perkiraan total']] = pp ? pp * pax : '';
    vals[C['Harga menyusul']] = safe(wait.join('; '));
    vals[C['Catatan']] = safe(text(x.note, 300));
    vals[C['Rencana']] = safe(String(x.plan || '').slice(0, 4000));
    vals[C['Data']] = JSON.stringify(clean);
    var at = ex ? ex.row : sh.getLastRow() + 1;
    if (at > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 200);
    sh.getRange(at, 1, 1, COLS.length).setNumberFormats([FORMATS]).setValues([vals]);

    // jumlah orang per tur di hari-hari yang dipilih, dari semua halaman (tanpa BATAL)
    var act = {};
    Object.keys(hari).forEach(function (k) { act[k] = {}; });
    rows.forEach(function (r) {
      if (r === ex || r.status === 'BATAL') return;
      Object.keys(r.hari).forEach(function (k) { if (act[k]) act[k][r.hari[k]] = (act[k][r.hari[k]] || 0) + r.pax; });
    });
    Object.keys(hari).forEach(function (k) { act[k][hari[k]] = (act[k][hari[k]] || 0) + pax; });
    try {
      var mine = { kode: kode, status: status, page: page, pax: pax, hari: hari, tiba: d, pulang: e, wa: wa, kg: kg !== 'tidak', t: Date.now() };
      rekap(rows.filter(function (r) { return r !== ex; }).concat([mine]));
    } catch (err) { console.error(err); }   // rekap gagal tidak boleh menggagalkan pendaftaran

    var groups = page === 'turharian' ? {} : readGroups();
    return {
      ok: true, kode: kode, updated: !!ex, prev: prev, act: act,
      pool: page === 'turharian' ? null : { d: d, n: prev + pax, dp: dp, kg: kgN + (kg !== 'tidak' ? pax : 0), r: count + 1, e: end },
      group: groups[d] || '', wa: CFG.WA_ADMIN, share: ''
    };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- bantu ---------------- */
function str(v) { return v === undefined || v === null ? '' : String(v); }
function text(v, max) { return str(v).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function safe(s) { s = str(s); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }   // cegah rumus disisipkan ke sheet
function isDate(k) { return /^\d{4}-\d{2}-\d{2}$/.test(str(k)) && !isNaN(Date.parse(k + 'T00:00:00Z')); }
function dateCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CFG.TZ, 'yyyy-MM-dd');
  var s = str(v).trim();
  return isDate(s) ? s : '';
}
function todayKey() { return Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd'); }
function tOf(k) { var p = k.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
function addDays(k, n) { var d = new Date(tOf(k) + n * 864e5); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
function diffDays(a, b) { return Math.round((tOf(a) - tOf(b)) / 864e5); }
function tglID(k) { var p = k.split('-'), b = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']; return (+p[2]) + ' ' + b[+p[1] - 1] + ' ' + p[0]; }
function normWa(raw) {
  var d = str(raw).replace(/\D/g, '');
  if (d.indexOf('00') === 0) d = d.slice(2);
  if (d.charAt(0) === '0') d = '62' + d.slice(1); else if (d.charAt(0) === '8') d = '62' + d;
  return d.length >= 10 && d.length <= 15 ? d : '';
}
function nextKode(rows, pre) {
  var max = 0, re = new RegExp('^' + pre + '-(\\d+)$');
  rows.forEach(function (r) { var m = re.exec(r.kode); if (m) max = Math.max(max, +m[1]); });
  return pre + '-' + ('000' + (max + 1)).slice(-4);
}
