export type CmsContentArea = {
  area: string;
  publicPath: string;
  controls: { label: string; href: string }[];
  note: string;
};

export const CMS_CONTENT_MAP: CmsContentArea[] = [
  { area: "Beranda: pembuka, cara kerja, FAQ singkat", publicPath: "/", controls: [{ label: "Teks Website", href: "/admin/texts" }], note: "Teks dan gambar pembuka memakai bagian aktif. Judul bagian lain dan pilihan destinasi unggulan masih ditetapkan di kode. Arsip tema lama tidak mengubah Atlas." },
  { area: "Footer dan kontak perusahaan", publicPath: "/contact", controls: [{ label: "Pengaturan", href: "/admin/settings" }, { label: "Teks Website", href: "/admin/texts" }], note: "Identitas badan usaha, alamat, kontak, logo, dan jam layanan di Pengaturan; paragraf footer aktif dan teks kontak di Teks Website. Menu navigasi masih tetap." },
  { area: "FAQ umum", publicPath: "/faq", controls: [{ label: "FAQ", href: "/admin/faq" }], note: "Konten bawaan tetap tampil sampai admin memilih Gunakan FAQ CMS. Setelah aktif, hanya entri aktif ditampilkan; kosong tetap kosong. Judul, pengantar, dan CTA bagian memakai template." },
  { area: "Katalog tour dan filter beranda", publicPath: "/tours", controls: [{ label: "Tour", href: "/admin/tours" }], note: "Harga, negara, tanggal, status, foto, itinerary, dan catatan visa diedit per produk. Pilihan negara/bulan pada filter berasal dari tour publik yang bisa dipesan, bukan daftar yang diisi terpisah." },
  { area: "Jurnal", publicPath: "/blog", controls: [{ label: "Blog", href: "/admin/blog" }], note: "Artikel, gambar, kategori, tanggal, dan status publikasi. Teks pengantar halaman daftar masih tetap." },
  { area: "Layanan dan informasi visa", publicPath: "/visa", controls: [{ label: "Database Visa", href: "/admin/database-visa" }, { label: "FAQ Visa", href: "/admin/faq" }], note: "Informasi, sumber, harga layanan, dan dokumen di database visa; FAQ umum layanan visa di tab Visa. Catatan visa pada katalog tetap diedit manual di Tour, bukan pilihan otomatis." },
  { area: "Cerita peserta", publicPath: "/reviews", controls: [{ label: "Testimoni", href: "/admin/testimonials" }], note: "Isi, kategori, rating, urutan, dan publikasi testimoni. Pengantar bagian masih tetap." },
  { area: "Tentang Kami", publicPath: "/about", controls: [{ label: "Tentang Kami", href: "/admin/about" }], note: "Tagline, cerita, nilai, dan daftar destinasi dapat diedit. Galeri dokumentasi masih berasal dari berkas website dan belum memiliki editor CMS." },
  { area: "Syarat dan ketentuan", publicPath: "/terms", controls: [{ label: "Syarat & Ketentuan", href: "/admin/terms" }], note: "Isi Indonesia dan Inggris tersimpan terpisah. Pengantar, metadata, dan pernyataan badan usaha di luar isi masih tetap." },
  { area: "Halaman GEO yang didukung", publicPath: "/sundaf-trip", controls: [{ label: "Halaman GEO", href: "/admin/geo" }], note: "Hanya rute yang terdaftar dan memakai sumber GEO. Konten bawaan masih menjadi fallback bila entri belum dipublikasikan; ini bukan editor untuk setiap halaman website." },
  { area: "Private / custom trip", publicPath: "/custom-trip", controls: [], note: "Teks dan susunan landing page masih statis. Belum ada editor khusus; perubahan memerlukan pembaruan kode." },
  { area: "Hub destinasi dan menu tujuan", publicPath: "/destinations", controls: [], note: "Daftar hub, pilihan destinasi unggulan di beranda, dan menu tujuan masih statis. Membuat katalog baru tidak otomatis menambahkan hub atau menu baru." },
  { area: "Landing layanan visa terpercaya", publicPath: "/jasa-urus-visa-terpercaya", controls: [], note: "Konten landing page masih statis dan tidak mengikuti editor Database Visa atau GEO. Perubahan memerlukan pembaruan kode." },
  { area: "Bahasa dan identitas tampilan", publicPath: "/", controls: [{ label: "Teks Website", href: "/admin/texts" }, { label: "Pengaturan", href: "/admin/settings" }], note: "EN aktif memakai penerjemah website; nilai EN lama pada Teks Website hanya arsip. Jost dan warna identitas Atlas tetap terkunci. Dokumen Syarat memiliki isi EN tersendiri." },
];
