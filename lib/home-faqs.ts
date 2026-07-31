export type HomeFaqItem = {
  id?: string;
  question: string;
  answer: string;
};

export function getHomeFaqs(nib: string, legalName: string): HomeFaqItem[] {
  return [
    {
      question: "Sundaf Trip resmi? Bagaimana cara mengeceknya?",
      answer: `Sundaf Trip dioperasikan oleh ${legalName} dan tercatat dengan NIB ${nib}. Sebelum membayar, kamu akan menerima konfirmasi perjalanan, rincian biaya, dan instruksi pembayaran melalui kanal resmi Sundaf Trip.`,
    },
    {
      question: "Apa yang kamu terima sebelum membayar?",
      answer:
        "Kami akan mengirimkan rencana perjalanan, tanggal keberangkatan, fasilitas yang termasuk, biaya wajib, biaya opsional, dan ketentuan pembayaran. Booking baru diproses setelah detailnya kamu setujui.",
    },
    {
      question: "Harga yang tampil sudah mencakup apa saja?",
      answer:
        "Harga paket, biaya wajib, dan tambahan opsional ditampilkan terpisah agar mudah diperiksa. Jumlah akhir mengikuti pilihanmu dan akan kami konfirmasi secara tertulis sebelum pembayaran.",
    },
    {
      question: "Visa dan dokumen perjalanan dibantu sampai mana?",
      answer:
        "Tim membantu memeriksa daftar dokumen, menjelaskan alur pengajuan, dan menyiapkan kebutuhan perjalanan. Keputusan visa tetap menjadi kewenangan kedutaan atau otoritas terkait, sehingga persetujuan visa tidak dapat dijanjikan.",
    },
    {
      question: "Kalau jadwal belum cocok atau rencana berubah?",
      answer:
        "Kami bisa membantu mencari jadwal lain atau menyiapkan private trip. Jika booking sudah berjalan, pilihan perubahan jadwal, pengalihan peserta, atau pengembalian dana mengikuti ketentuan tour dan biaya yang sudah diteruskan kepada pihak ketiga.",
    },
  ];
}
