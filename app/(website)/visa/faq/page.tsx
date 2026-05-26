import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronLeft, MessageCircle } from "lucide-react";
import { FaqList, PENGURUSAN_VISA_DETAIL, type FaqItem } from "./FaqList";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "FAQ Teknis Visa Schengen untuk Paspor Indonesia",
  description:
    "Kasus teknis Schengen yang sering bikin reject: cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil, apply dari negara lain.",
  alternates: { canonical: "https://sundaftrip.com/visa/faq" },
};

const SCHENGEN_TEKNIS: FaqItem[] = [
  {
    q: "Status cerai, apa yang harus dilampirkan?",
    layanan: "Terjemahan akta cerai dan notaris consent kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <>
        <p>
          Wajib lampirkan <b>akta cerai</b> (asli + fotokopi) sebagai bukti civil status,
          diterjemahkan tersumpah ke Inggris atau bahasa negara tujuan. Akta cerai
          bukan dokumen negatif, justru menjelaskan kenapa apply sendiri tanpa
          pasangan, jangan disembunyikan.
        </p>
        <p>
          Kalau bawa anak: tambahkan <b>penetapan hak asuh</b> dari pengadilan.
          Kalau hak asuh bersama, butuh <b>surat consent dari mantan pasangan</b>
          (notaris) yang mengizinkan anak ikut bepergian.
        </p>
      </>
    ),
  },
  {
    q: "Anak di bawah 18 tahun, dokumen tambahan?",
    layanan: "Notaris consent dan terjemahan akta kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Akta lahir anak (asli + fotokopi) + Kartu Keluarga</li>
          <li>Paspor anak + paspor & KTP kedua orang tua</li>
          <li>Form aplikasi ditandatangani kedua orang tua / wali sah</li>
          <li>
            Kalau anak pergi sendiri atau hanya dengan satu orang tua:{" "}
            <b>surat consent</b> dari orang tua yang tidak ikut, ditandatangani
            di depan <b>notaris</b>
          </li>
          <li>Scan paspor orang tua yang tidak ikut (halaman data)</li>
        </ul>
      </>
    ),
  },
  {
    q: "Anak di bawah 18 ke Spanyol, apostille?",
    layanan: "Apostille, notaris, dan terjemahan Spanyol kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <>
        <p>
          Ya. Spanyol paling strict di Schengen untuk minor.{" "}
          <b>Akta lahir wajib di-apostille</b> di Kemenkumham (Indonesia sudah
          anggota Konvensi Apostille sejak 2022, tidak perlu legalisir kedutaan
          lagi).
        </p>
        <p>
          <b>Surat consent orang tua</b> juga wajib notaris + apostille, lalu
          diterjemahkan tersumpah ke Spanyol. Kalau anak pergi sendiri → consent
          dari kedua orang tua, masing-masing diproses.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Urutan praktis: notaris → Kemenkumham (apostille) → translator
          tersumpah Spanyol. Sediakan <b>3 hingga 4 minggu</b> sebelum tanggal submit.
        </p>
      </>
    ),
  },
  {
    q: "Pergi sama suami, tapi suami tidak kerja",
    layanan: "Kasus sponsor pasangan lebih aman ditangani via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Schengen tidak melarang. Yang penting jelas <b>siapa sponsornya</b>.
          Tiga opsi yang sering dipakai:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Istri sebagai sponsor</b>, istri lampirkan surat kerja, slip
            gaji, mutasi rekening, dan <b>surat sponsor</b> untuk suami. Suami
            statusnya "dependent".
          </li>
          <li>
            <b>Sponsor pihak ketiga</b> (orang tua/saudara), surat sponsor +
            bukti finansial sponsor + bukti relasi (KK/akta).
          </li>
          <li>
            <b>Aset pasangan</b>, kalau suami pengusaha, lampirkan NIB / SIUP /
            akta usaha. "Tidak kerja kantoran" beda dengan "tidak punya income".
          </li>
        </ul>
        <p>
          Suami tetap submit dokumen sendiri: paspor, form, asuransi, itinerary,
          surat keterangan tidak bekerja / surat usaha, dan <b>akta nikah</b>{" "}
          sebagai bukti relasi ke istri sponsor.
        </p>
      </>
    ),
  },
  {
    q: "Rekening tipis atau mutasi berantakan",
    layanan: "Profil finansial borderline sebaiknya lewat pengurusan visa lengkap",
    a: (
      <>
        <p>
          Acuan tidak resmi yang sering dipakai untuk paspor Indonesia:{" "}
          <b>±Rp 100 juta</b> di rekening, atau setara <b>€50 hingga €100 per hari</b>{" "}
          rencana perjalanan.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Jangan setor lump-sum mendadak</b> sebulan sebelum apply.
            Petugas visa langsung baca itu sebagai "parking money", high risk
            reject.
          </li>
          <li>
            <b>Pakai sponsor</b> (orang tua, pasangan, saudara), tunjukkan
            rekening sponsor + surat sponsor + bukti relasi.
          </li>
          <li>
            <b>Gabungkan bukti finansial lain</b>: deposito, reksadana, SPT
            tahunan, sertifikat tanah, BPKB, surat keterangan usaha. Mutasi
            rekening bukan satu-satunya bukti.
          </li>
          <li>
            <b>Bank reference letter</b> ("rekening aktif sejak…, saldo
            rata-rata…"), minta 2 hari sebelum biometric.
          </li>
          <li>Mutasi 3 bulan asli cap bank, bukan e-statement biasa.</li>
        </ul>
      </>
    ),
  },
  {
    q: "Apply Schengen dari negara lain (WNI tinggal di luar)",
    layanan: "Apply dari negara lain butuh koordinasi khusus, lebih aman via pengurusan lengkap",
    a: (
      <>
        <p>
          Aturan Schengen: apply di <b>negara tujuan utama</b>, di VAC/kedutaan
          negara <b>tempat tinggal sah</b> kamu, bukan terbang dulu ke Jakarta.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Wajib punya <b>residence permit / long-stay visa</b> yang masih
            valid <b>minimal 3 bulan</b> setelah rencana balik dari Schengen.
          </li>
          <li>
            VAC di Indonesia hanya terima pemohon yang legal resident di
            Indonesia, WNI di Dubai/Singapura/KL apply di sana.
          </li>
          <li>
            Lampiran tambahan: residence permit/visa kerja/pelajar + bukti
            tinggal (kontrak sewa, payroll, surat sekolah).
          </li>
          <li>
            Kalau residence permit tinggal sebentar (&lt; 6 bulan), kedutaan
            sering kasih validitas Schengen lebih pendek atau reject. Apply pas
            permit masih tebal.
          </li>
        </ul>
      </>
    ),
  },
];

const UMUM: FaqItem[] = [
  {
    q: "Dokumen bahasa Indonesia perlu diterjemahkan?",
    layanan: "Terjemahan tersumpah 8 bahasa kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <p>
        Ya. Akta lahir, akta nikah, akta cerai, surat kerja, slip gaji, bank
        reference, semua dokumen pendukung wajib diterjemahkan oleh{" "}
        <b>penerjemah tersumpah</b> ke Inggris atau bahasa negara tujuan.
        Mutasi rekening biasanya sudah dwi-bahasa dari bank, tapi konfirmasi
        dulu sebelum apply.
      </p>
    ),
  },
  {
    q: "Asuransi perjalanan, minimum berapa?",
    layanan: "Asuransi Schengen €30.000 dan polis negara lain kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <p>
        Schengen: <b>coverage minimum €30.000</b> untuk medical + repatriation,
        valid di seluruh wilayah Schengen, mencakup seluruh periode perjalanan
        + buffer. UK / Australia / NZ tidak mensyaratkan asuransi untuk visa,
        tapi sangat dianjurkan.
      </p>
    ),
  },
  {
    q: "Tiket pesawat & hotel, booking beneran atau dummy?",
    layanan: null,
    a: (
      <p>
        <b>Jangan booking lunas</b> sebelum visa approve.
        Pakai <b>reservation</b> tiket (hold 24 hingga 72 jam) dan booking hotel yang
        bisa <b>free cancel</b> (Booking.com / Agoda). Cetak konfirmasi-nya
        untuk lampiran. Setelah visa terbit, baru issued tiket beneran.
      </p>
    ),
  },
  {
    q: "Cover letter, perlu atau tidak?",
    layanan: "Draft cover letter sesuai profil dan negara tujuan sudah include dalam pengurusan visa kami",
    a: (
      <p>
        Sangat dianjurkan, terutama untuk profil borderline. Isinya: tujuan
        perjalanan, rencana harian singkat, siapa yang membiayai, dan{" "}
        <b>ikatan ke Indonesia</b> (pekerjaan, properti, keluarga inti, usaha).
        Cover letter yang baik sering mengubah reject jadi approve.
      </p>
    ),
  },
];

const PROFIL_NONSTANDAR: FaqItem[] = [
  {
    q: "Freelance / pekerja kreatif / digital nomad, bukti income?",
    layanan: "Profil freelance kompleks, sebaiknya didampingi via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Tidak punya surat kerja kantoran bukan disqualifier. Yang officer
          cari adalah <b>pola income yang konsisten</b> dan bukti bahwa kerja
          kamu nyata.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Mutasi rekening 6 bulan</b> yang menunjukkan transfer masuk
            rutin dari klien / platform (Fiverr, Upwork, brand, marketplace).
          </li>
          <li>
            <b>NPWP + SPT tahunan</b>, bukti paling kuat bahwa kamu pajak
            aktif sebagai freelancer / wirausaha perorangan.
          </li>
          <li>
            <b>Sample kontrak / invoice</b> 2 hingga 3 buah dari klien berbeda,
            dengan tanggal & nominal.
          </li>
          <li>
            <b>Portfolio / profile platform</b> (LinkedIn, Behance, channel
            YouTube, akun marketplace) sebagai konteks profesional.
          </li>
          <li>
            <b>Cover letter</b> yang jelaskan model kerja kamu ,
            "remote/independent, income datang dari X klien di Y negara,
            tools kerja saya internet jadi bisa pulang kapan saja".
          </li>
        </ul>
        <p>
          Untuk <b>digital nomad</b> dengan stay panjang (&gt;30 hari),
          beberapa konsulat (terutama UK, AU) curiga "kerja ilegal". Pastikan
          itinerary jelas turis, dan cover letter menegaskan kamu tetap
          bekerja remote untuk klien luar negeri kamu, bukan mencari kerja
          lokal.
        </p>
      </>
    ),
  },
  {
    q: "Baru pindah kerja / masa kerja kurang 6 bulan",
    layanan: "Profil masa kerja pendek sebaiknya didampingi via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Tidak otomatis menggagalkan, tapi memang masuk profil "ties belum
          stabil" di mata officer. Cara menanganinya:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat kerja baru</b> mencantumkan: posisi, gaji, tanggal mulai,
            durasi kontrak, status (probation/permanen).
          </li>
          <li>
            <b>Surat approval cuti</b> tertulis dari atasan langsung ,
            spesifik tanggal & lama cuti, bukan template.
          </li>
          <li>
            <b>Surat kerja dari perusahaan lama</b> (pengalaman kerja
            sebelumnya), menunjukkan kamu punya track record karir, bukan
            baru pertama kerja.
          </li>
          <li>
            Cover letter jelaskan posisi baru kamu strategis / butuh
            kontinuitas, return motivation jadi natural.
          </li>
          <li>
            <b>Mutasi rekening</b> dari pekerjaan lama + baru, bukti income
            tetap masuk walau pindah kerja.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Baru resign / sedang career break",
    layanan: "Career break butuh restrukturisasi narrative, sebaiknya via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Ini profil paling rentan untuk visa turis karena 2 sinyal langsung
          terlihat: <b>tidak ada income mengalir</b> + <b>tidak ada ties
          pekerjaan</b>. Tidak otomatis ditolak, tapi butuh kompensasi kuat.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat keterangan resign + paklaring</b> dari perusahaan lama,
            jelaskan resign baik-baik & ada rencana lanjut.
          </li>
          <li>
            <b>Bukti dana yang besar</b> (jauh di atas standar Rp 100 juta) ,
            tabungan, deposito, reksadana, BPKB, sertifikat tanah.
          </li>
          <li>
            <b>Rencana setelah balik dari trip</b> yang konkret: surat
            penerimaan kerja baru, surat penerimaan sekolah lanjut, atau bukti
            usaha yang sudah didaftarkan (NIB / SIUP).
          </li>
          <li>
            <b>Sponsor</b> dari pasangan atau orang tua sangat membantu ,
            menggeser "siapa membiayai" dari kamu ke pihak lain yang
            tertambat di Indonesia.
          </li>
          <li>
            Trip pendek (7 hingga 10 hari) lebih mudah lolos daripada 1 bulan.
            Rencana lama bikin officer curiga niat kembali.
          </li>
        </ul>
        <p>
          Profil career break umumnya butuh narrative restructuring yang
          hati-hati. Kasus seperti ini kami sarankan konsultasi via WhatsApp
          dulu sebelum submit.
        </p>
      </>
    ),
  },
  {
    q: "ASN / PNS, perlu izin atasan?",
    layanan: "Terjemahan SK ASN kami koordinasikan, format surat izin kami draftkan untuk klien pengurusan visa kami",
    a: (
      <>
        <p>
          Untuk <b>perjalanan pribadi / turis</b> (bukan dinas), umumnya
          cukup <b>surat izin tertulis dari atasan langsung / pejabat
          kepegawaian (PPK)</b> di instansi kamu. Tidak perlu izin Sekretariat
          Negara / Biro KTLN, itu untuk perjalanan dinas resmi.
        </p>
        <p>
          Yang dilampirkan saat apply visa:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat tugas / SK ASN</b> sebagai bukti pekerjaan tetap.
          </li>
          <li>
            <b>Surat izin cuti</b> ditandatangani atasan, lengkap tanggal &
            lama cuti.
          </li>
          <li>
            <b>Surat keterangan dari instansi</b> menyebut status, golongan,
            masa kerja, gaji pokok + tunjangan.
          </li>
          <li>
            <b>Slip gaji</b> 3 bulan + mutasi rekening payroll.
          </li>
        </ul>
        <p>
          ASN biasanya profil kuat untuk visa turis, gaji tetap, ties ke
          negara jelas, pensiun ke depan. Tapi <b>aturan internal tiap
          instansi berbeda</b> (Kemenkumham, Kemlu, TNI/Polri ada protokol
          khusus). Cek SOP instansi kamu sebelum proses.
        </p>
      </>
    ),
  },
  {
    q: "Pensiunan / lansia traveling, bukti finansial?",
    layanan: "Asuransi medical lansia kami koordinasikan, dokumen sponsor anak kami draftkan untuk klien pengurusan visa kami",
    a: (
      <>
        <p>
          Pensiunan justru sering jadi profil <b>kuat</b> untuk visa turis:
          income tetap dari pensiun, anak sudah mandiri, ties ke Indonesia
          jelas (rumah, keluarga, makam keluarga, layanan kesehatan).
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>SK pensiun + Kartu Identitas Pensiun (Karip / Taspen)</b>.
          </li>
          <li>
            <b>Mutasi rekening pensiun</b> 3 hingga 6 bulan menunjukkan pembayaran
            rutin masuk.
          </li>
          <li>
            <b>Bukti kepemilikan rumah / aset</b> (sertifikat, PBB).
          </li>
          <li>
            Kalau dana pensiun kurang besar, <b>sponsor dari anak</b> yang
            sudah bekerja, surat sponsor + bukti relasi (KK) + rekening
            sponsor.
          </li>
          <li>
            <b>Riwayat medical</b> tidak perlu disampaikan kecuali diminta,
            tapi <b>asuransi perjalanan</b> dengan coverage medical wajib
            ada (terutama Schengen).
          </li>
        </ul>
        <p>
          Untuk lansia &gt;75 tahun yang traveling sendiri tanpa pendamping,
          beberapa konsulat tanya rencana kontak darurat / pendamping di
          negara tujuan, siapkan kontak host atau hotel pickup service.
        </p>
      </>
    ),
  },
];

const PASPOR_RIWAYAT: FaqItem[] = [
  {
    q: "Paspor masa berlaku tinggal <6 bulan, masih bisa apply?",
    layanan: "Koordinasi perpanjangan paspor dan timing apply sudah include dalam pengurusan visa kami",
    a: (
      <>
        <p>
          Aturan resmi Schengen: paspor harus valid <b>minimal 3 bulan</b>{" "}
          setelah tanggal rencana keluar dari Schengen, dan harus{" "}
          <b>diterbitkan dalam 10 tahun terakhir</b>. Tapi <b>UK, Australia,
          NZ, Jepang, Korea, US</b> umumnya rekomen <b>6 bulan</b> validity
          dari rencana pulang.
        </p>
        <p>Wajib juga:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Minimal 2 halaman kosong</b> (untuk sticker visa + cap
            imigrasi). Halaman dengan stempel lama tidak dihitung kosong.
          </li>
          <li>
            Tidak ada waiver untuk 10-year issuance rule dan 2 blank pages
            untuk Schengen.
          </li>
        </ul>
        <p>
          Kalau paspor tinggal &lt;6 bulan: <b>perpanjang dulu sebelum
          apply</b>. Kantor Imigrasi M-Paspor sekarang 3 hingga 5 hari kerja untuk
          paspor biasa. Apply visa pakai paspor yang tinggal sebentar adalah
          ambil risiko sia-sia.
        </p>
      </>
    ),
  },
  {
    q: "Paspor masih kosong, belum pernah ke luar negeri",
    layanan: "Strategi negara pembuka biasanya kami atur via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Tidak otomatis menggagalkan, tapi memang "weak travel history" di
          mata officer Schengen / UK / AU. Strategi yang umum dipakai:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Mulai dari negara "pembuka"</b>: Jepang, Korea, Singapura,
            Malaysia, Thailand. Setelah ada 1 hingga 2 stamp Asia, profil naik.
          </li>
          <li>
            <b>Profil finansial harus lebih kuat</b> dari standar untuk
            mengkompensasi. Saldo lebih tebal, ties pekerjaan/usaha lebih
            jelas.
          </li>
          <li>
            <b>Cover letter</b> jelaskan secara natural kenapa pilih negara
            tujuan tersebut, alasan personal (keluarga, ziarah, event),
            bukan generic "lihat Menara Eiffel".
          </li>
          <li>
            <b>Sponsor / travel partner</b> yang sudah punya riwayat travel
            membantu, apply berbarengan dengan pasangan / saudara yang
            pernah ke sana sebelumnya.
          </li>
          <li>
            Jangan langsung apply Schengen multi-country 30 hari. Mulai dari
            <b> trip pendek single-country</b> 7 hari.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Visa pernah ditolak, wajib declare?",
    layanan: "Apply ulang pasca-reject sebaiknya ditangani via pengurusan visa lengkap",
    a: (
      <>
        <p>
          <b>Wajib jujur, tanpa kompromi.</b> Form aplikasi Schengen, UK,
          US, Australia, NZ semua punya kolom "have you ever been refused a
          visa". Data refusal kamu sudah ada di database global (VIS untuk
          Schengen, US Consular Lookout, Australia VEVO).
        </p>
        <p>
          Konsekuensi tidak declare:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Visa yang sudah terbit bisa <b>dianulir</b> kapan saja kalau
            ketahuan.
          </li>
          <li>
            <b>Permanent record</b> "misrepresentation", masuk daftar
            high-risk, susah apply ke depan.
          </li>
          <li>
            Bisa dianggap pelanggaran hukum negara penerbit visa.
          </li>
        </ul>
        <p>
          Cara declare yang benar:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Tick <b>"Yes"</b>, isi negara, tahun, alasan reject (kalau ada di
            surat penolakan).
          </li>
          <li>
            Di <b>cover letter</b>, tambah paragraf khusus jelaskan apa yang
            berubah sejak reject. Misalnya: "ditolak karena rekening lemah
            tahun X, sekarang saya lampirkan bukti deposit/aset baru dan
            kontrak kerja yang sudah 2 tahun".
          </li>
          <li>
            Jangan defensif / menyalahkan officer sebelumnya, fokus ke apa
            yang sudah diperbaiki.
          </li>
        </ul>
      </>
    ),
  },
];

const DOKUMEN_SENSITIF: FaqItem[] = [
  {
    q: "Ejaan nama beda antara paspor dan dokumen pendukung",
    layanan: "Surat sumpah notaris dan terjemahan tersumpah kami koordinasikan untuk klien pengurusan visa kami",
    a: (
      <>
        <p>
          Salah satu alasan reject paling sering & paling mudah dihindari.
          Yang umum terjadi:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Paspor: "Muhammad Rizky", KTP/akta: "Muhammad Rizki" (huruf
            beda).
          </li>
          <li>
            Paspor tanpa gelar (S.E., S.H.), ijazah / surat kerja pakai
            gelar.
          </li>
          <li>
            Paspor pakai single name "Siti", semua dokumen lain "Siti
            Aminah".
          </li>
          <li>
            Marga / nama belakang berbeda urutan.
          </li>
        </ul>
        <p>
          Cara menanganinya:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat sumpah / pernyataan</b> di atas materai (notaris lebih
            kuat), menjelaskan bahwa nama X di paspor dan Y di dokumen lain
            adalah orang yang sama.
          </li>
          <li>
            Lampirkan <b>akta lahir</b> sebagai dokumen sumber.
          </li>
          <li>
            Untuk kasus berulang (apply visa terus), lebih baik{" "}
            <b>perbaiki di paspor</b> via Kantor Imigrasi, minta endorsement
            atau ganti paspor baru dengan nama lengkap konsisten.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Gaji dibayar tunai, tidak ada slip + transfer bank",
    layanan: "Profil tanpa payroll bank sebaiknya didampingi via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Pekerja informal, UMKM cash-based, atau pegawai usaha kecil yang
          gajinya cash sering kesulitan karena tidak ada jejak digital.
          Kompensasinya:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat keterangan kerja</b> dari pemberi kerja yang menyebut
            posisi, masa kerja, dan <b>nominal gaji tetap</b>.
          </li>
          <li>
            <b>Tabungan rutin</b> ke rekening sendiri, pola setoran tunai
            bulanan yang konsisten menunjukkan income natural.
          </li>
          <li>
            <b>NPWP + SPT</b>, bukti pajak nominal tahunan.
          </li>
          <li>
            <b>Sponsor</b> dari pasangan / anggota keluarga yang punya
            payroll bank kalau memungkinkan.
          </li>
          <li>
            <b>Bukti aset / usaha</b> sebagai pelengkap (sertifikat, BPKB,
            NIB usaha).
          </li>
        </ul>
        <p>
          Hindari "memanipulasi", setoran lump-sum mendadak ke rekening 1 hingga 2
          bulan sebelum apply justru lebih berbahaya daripada tidak ada
          payroll bank sama sekali.
        </p>
      </>
    ),
  },
  {
    q: "Aset / transaksi crypto di rekening, masalah?",
    layanan: "Profil dominan crypto sebaiknya ditangani via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Transaksi crypto (jual-beli IDR ↔ kripto via Tokocrypto / Indodax /
          Binance) di mutasi rekening makin sering muncul. Officer visa
          modern terlatih membaca pola ini, bukan otomatis red flag, tapi
          butuh penjelasan kalau jadi sumber dana mayoritas.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Print rekening exchange</b> (history trading + balance saat
            ini) sebagai dokumen pendukung.
          </li>
          <li>
            <b>Cover letter</b> jelaskan crypto adalah aktivitas investasi
            pribadi, bukan profesi utama (kecuali memang full-time trader,
            jelaskan apa adanya).
          </li>
          <li>
            <b>NPWP + laporan pajak crypto</b> kalau ada (BAPPEBTI sudah
            atur), menunjukkan compliance.
          </li>
          <li>
            <b>Jangan</b> tarik crypto besar-besaran ke rekening 1 hingga 2 minggu
            sebelum apply, terbaca sebagai "parking money" yang asal-usulnya
            samar.
          </li>
        </ul>
        <p>
          Untuk profil yang income utamanya dari crypto, beberapa konsulat
          (terutama UK, Schengen Jerman/Belanda) bisa minta source of funds
          letter. Ini kasus khusus, sebaiknya konsultasi sebelum apply.
        </p>
      </>
    ),
  },
];

const LAYANAN_PENDUKUNG: FaqItem[] = [
  {
    q: "Apa saja yang kami tangani saat urus visa untuk kamu?",
    layanan: null,
    a: PENGURUSAN_VISA_DETAIL,
  },
];

const REJECT_CASES: FaqItem[] = [
  {
    q: "Visa Australia ditolak 2 kali, pakai agen lain atau perbaiki sendiri?",
    layanan: "Reject berulang seperti ini sebaiknya ditangani via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Kasus nyata yang sering masuk ke kami: ibu ditolak via agen
          (September), apply mandiri di Desember juga ditolak. Alasan keduanya
          mirip, <i>"itinerary kurang jelas"</i> dan <i>"tidak ada niat
          kembali ke Indonesia"</i>. Padahal pemohon punya usaha aktif, anak
          masih sekolah, dan aset di Indonesia.
        </p>
        <p>
          Tiga hal yang sering jadi akar masalah, walau dari luar dokumen
          kelihatan lengkap:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Ikatan ke Indonesia ada secara fakta, tapi tidak ter-translasi
            dalam dokumen.</b> Surat keterangan usaha tanpa angka omset, KK
            tanpa konteks anak sekolah kelas berapa, aset tanpa bukti
            kepemilikan terbaru, semua "lemah" di mata officer Australia.
          </li>
          <li>
            <b>Itinerary terlalu generik.</b> "Hari 1: tiba Sydney, Hari 2:
            Opera House", ini pattern yang officer baca ratusan kali sehari.
            Itinerary kuat menyebut konteks (kunjungan keluarga? acara?
            booking spesifik?) dan menjelaskan kenapa harus saat ini.
          </li>
          <li>
            <b>Mutasi rekening tidak natural.</b> Lump-sum 1 hingga 2 bulan sebelum
            apply terbaca sebagai "uang titipan", bukan pendapatan organik.
            Officer ingin lihat pola income yang konsisten 6 bulan ke
            belakang.
          </li>
        </ul>
        <p>
          <b>Reject 2 kali bukan tentang agen vs mandiri</b>, itu sinyal
          bahwa cara mempresentasikan profil ibu belum match dengan apa yang
          officer cari. Ganti agen tanpa restruktur narrative biasanya hasilnya
          sama. Reject ke-3 jauh lebih sulit dicairkan karena sudah ada
          <b> riwayat penolakan berulang</b> di sistem.
        </p>
        <p>
          Saran kami: <b>jangan apply lagi sebelum di-review menyeluruh</b>.
          Cooling period 3 hingga 6 bulan, lalu apply dengan dokumen + cover letter +
          itinerary yang sudah direstruktur dari nol. Untuk kasus dengan
          riwayat reject seperti ini, kami biasanya kerjakan review profil
          gratis dulu lewat WhatsApp sebelum memutuskan langkah selanjutnya.
        </p>
      </>
    ),
  },
  {
    q: "Pernah overstay di negara lain, masih bisa apply visa baru?",
    layanan: "Profil pasca-overstay sebaiknya ditangani via pengurusan visa lengkap",
    a: (
      <>
        <p>
          Bisa, tapi butuh strategi. Overstay tercatat di database imigrasi
          negara penerbit dan sering di-share antar negara mitra. Schengen
          punya VIS, UK punya Home Office record, Australia punya VEVO, data
          ini cross-checkable.
        </p>
        <p>Konsekuensi yang umum:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Overstay &lt;90 hari</b> tanpa niat buruk biasanya tidak
            permanent ban, tapi jadi catatan profil.
          </li>
          <li>
            <b>Overstay yang lebih lama</b> di Schengen bisa kena{" "}
            <b>entry ban 1 hingga 5 tahun</b> (SIS II flag).
          </li>
          <li>
            Untuk apply visa <b>negara mana pun setelah overstay</b>, wajib
            declare jujur, disembunyikan = misrepresentation, lebih berat.
          </li>
        </ul>
        <p>Cara menanganinya:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Surat penjelasan</b> di cover letter, kronologi singkat,
            alasan overstay (sakit, force majeure, salah hitung tanggal), dan
            apa yang sudah dilakukan untuk koreksi (lapor diri, denda
            dibayar, pulang sukarela).
          </li>
          <li>
            <b>Bukti pulang</b> ke Indonesia setelah overstay (stempel
            kedatangan, boarding pass).
          </li>
          <li>
            <b>Cooling period</b> minimal 1 tahun sebelum apply ulang negara
            yang sama. Untuk negara lain bisa lebih cepat tapi tetap deklare.
          </li>
          <li>
            Bangun profil ulang dari "negara pembuka" yang lebih lenient
            sebelum apply ulang Schengen / UK / AU.
          </li>
        </ul>
        <p>
          Kasus dengan riwayat overstay sebaiknya tidak di-apply mandiri ,
          satu jawaban salah di form bisa kunci profil kamu di banyak negara
          sekaligus. Konsultasi dulu.
        </p>
      </>
    ),
  },
];

export default function VisaFaqPage() {
  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "FAQ Teknis Visa", url: "/visa/faq" },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <Link
          href="/visa"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ChevronLeft size={14} />
          Kembali ke Database Visa
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={20} style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            FAQ Teknis Visa
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Kasus Teknis yang Sering Bikin Reject
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Jawaban praktis untuk situasi yang tidak ada di checklist standar
          kedutaan, dari status cerai, anak di bawah 18, sampai strategi apply
          ulang setelah visa ditolak.
        </p>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Schengen: Kasus Teknis
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Pertanyaan paling sering ditanya calon pemohon dengan profil
            non-standar.
          </p>
          <FaqList items={SCHENGEN_TEKNIS} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Profil Pemohon Non-Standar
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Bukan karyawan kantoran tetap dengan slip gaji bulanan, bagaimana
            memposisikan profil di mata officer.
          </p>
          <FaqList items={PROFIL_NONSTANDAR} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Paspor & Riwayat Visa
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Hal teknis seputar dokumen perjalanan dan jejak aplikasi visa
            sebelumnya yang sering terlewat.
          </p>
          <FaqList items={PASPOR_RIWAYAT} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Dokumen & Finansial Sensitif
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Inkonsistensi kecil yang bisa memicu pertanyaan tambahan atau
            penolakan, dan cara meresponsnya dengan benar.
          </p>
          <FaqList items={DOKUMEN_SENSITIF} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Visa Ditolak: Strategi Apply Ulang
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Kasus nyata yang masuk ke kami, dibahas tanpa basa-basi. Reject
            pernah terjadi bukan akhir cerita, tapi cara menanganinya
            menentukan apply berikutnya.
          </p>
          <FaqList items={REJECT_CASES} />
        </section>

        <section id="layanan-pendukung" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pengurusan Visa via Sundaf
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Apa saja yang kami tangani dari hulu ke hilir, plus layanan
            pendukung (asuransi, apostille, terjemahan, notaris) yang kami
            koordinasikan untuk klien pengurusan visa kami.
          </p>
          <FaqList items={LAYANAN_PENDUKUNG} showInlinePreview={false} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Dokumen Pendukung Umum
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Berlaku untuk hampir semua aplikasi visa turis, Schengen, UK,
            Australia, NZ, Jepang, Korea.
          </p>
          <FaqList items={UMUM} />
        </section>

        <div
          className="mb-12 p-6 sm:p-8 border"
          style={{
            background: "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 8%, transparent)",
            borderColor: "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 25%, transparent)",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <MessageCircle
              size={20}
              className="shrink-0 mt-0.5"
              style={{ color: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Punya kasus yang tidak ada di sini?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Profil borderline, pernah reject, atau dokumen tidak standar,
                setiap kasus punya konteks sendiri yang tidak bisa di-template.
                Konsultasi awal gratis lewat WhatsApp di pojok kanan bawah.
                Cerita kondisi kamu, kami bantu tentukan apakah kasusnya butuh
                pengurusan visa lengkap, atau cukup panduan mandiri yang sudah
                ada di FAQ ini.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Disclaimer
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Informasi di halaman ini bersifat panduan praktis berdasarkan
            pengalaman lapangan. Aturan kedutaan bisa berubah tanpa pemberitahuan.
            Selalu cek persyaratan resmi di situs VFS/BLS atau kedutaan negara
            tujuan sebelum submit.
          </p>
        </div>
      </div>

      {/* Buka details Layanan Pendukung saat di-anchor dari FAQ lain */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              function openLayanan(){
                var section = document.getElementById('layanan-pendukung');
                if(!section) return;
                var d = section.querySelector('details');
                if(d) d.open = true;
                section.scrollIntoView({behavior:'smooth', block:'start'});
              }
              document.addEventListener('click', function(e){
                var t = e.target;
                while(t && t !== document){
                  if(t.tagName === 'A' && t.getAttribute('href') === '#layanan-pendukung'){
                    e.preventDefault();
                    if(history.pushState) history.pushState(null, '', '#layanan-pendukung');
                    setTimeout(openLayanan, 10);
                    return;
                  }
                  t = t.parentNode;
                }
              });
              if(location.hash === '#layanan-pendukung'){
                window.addEventListener('load', function(){ setTimeout(openLayanan, 50); });
              }
            })();
          `,
        }}
      />
    </div>
  );
}
