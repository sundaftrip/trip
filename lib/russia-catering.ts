export const cateringPackages = [
  {
    id: "rumahan",
    tier: "Rumahan",
    name: "Nasi Ayam Rempah",
    price: 700,
    image: "01-nasi-ayam-kentang.png",
    composition: "Nasi putih, ayam berbumbu, kentang tumis, timun dan tomat.",
    benefit: "Ayam, nasi, dan pendamping dalam satu kotak.",
  },
  {
    id: "nusantara",
    tier: "Nusantara",
    name: "Nasi Kuning Nusantara",
    price: 850,
    image: "02-nasi-kuning.png",
    composition: "Nasi kuning, ayam goreng berbumbu, telur bumbu merah, bihun goreng, timun dan tomat.",
    benefit: "Nasi kuning dengan ayam, telur, dan bihun.",
  },
  {
    id: "lengkap",
    tier: "Lengkap",
    name: "Nasi Ayam Krispi",
    price: 1000,
    image: "07-ayam-krispi-perkedel.png",
    composition: "Nasi putih, ayam goreng tepung, perkedel, irisan telur dadar, saus terpisah, timun dan tomat.",
    benefit: "Lauk lebih beragam, dengan saus terpisah.",
  },
] as const;

export const cateringGallery = [
  { image: "04-persiapan-rombongan.png", label: "Persiapan rombongan", alt: "Nasi box ditata dan ditutup dalam persiapan katering rombongan." },
  { image: "05-box-siap-saji.png", label: "Dalam setiap kotak", alt: "Nasi box dengan lauk, lalapan, serta sendok, tersusun di meja persiapan." },
  { image: "06-katering-grup.png", label: "Untuk perjalanan bersama", alt: "Deretan nasi box katering untuk kebutuhan makan grup." },
] as const;

export const cateringImage = (name: string) => `/images/russia-catering/${name}`;
export const formatCateringPrice = (price: number) => price.toLocaleString("id-ID");

export type CateringRequest = {
  city: string;
  date: string;
  portions: string;
  menu: string;
  notes: string;
};

export function buildCateringRequest(state: CateringRequest) {
  const selected = cateringPackages.find((item) => item.id === state.menu);
  const [year, month, day] = state.date.split("-").map(Number);
  const formattedDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
  return [
    "Halo SUNDAF, saya ingin menanyakan katering halal untuk perjalanan di Rusia.",
    "",
    `Kota: ${state.city}`,
    `Tanggal: ${formattedDate}`,
    `Jumlah porsi: ${state.portions}`,
    `Pilihan menu: ${selected ? `${selected.name} — Paket ${selected.tier}, ${formatCateringPrice(selected.price)} RUB/porsi` : state.menu}`,
    ...(state.notes.trim() ? [`Catatan: ${state.notes.trim()}`] : []),
    "",
    "Mohon konfirmasi ketersediaan, komposisi menu, harga akhir, dan biaya pengantaran dengan taksi ke titik temu.",
    "https://sundaftrip.com/russia/catering",
  ].join("\n");
}
