// Sumber tunggal untuk link navigasi situs.
// Navbar memakai `primaryNav`; Footer memakai `footerNav` (selalu superset dari primaryNav).
// Satu sumber ini mencegah nav atas & footer desync (lihat brief P0.1 & P0.2).

export type NavLabel = { id: string; en: string };
export type NavItem = { href: string; label: NavLabel };

// Nav utama (header). Urutan = urutan tampil.
export const primaryNav: NavItem[] = [
  { href: "/", label: { id: "Beranda", en: "Home" } },
  { href: "/tours", label: { id: "Tour", en: "Tours" } },
  { href: "/visa", label: { id: "Layanan Visa", en: "Visa Service" } },
  { href: "/blog", label: { id: "Blog", en: "Blog" } },
  { href: "/about", label: { id: "Tentang Kami", en: "About" } },
  { href: "/#contact", label: { id: "Kontak", en: "Contact" } },
];

// Link tambahan yang hanya muncul di footer (boleh lebih panjang dari nav atas).
const footerExtras: NavItem[] = [
  { href: "/sundaf-trip", label: { id: "Profil Sundaf Trip", en: "Sundaf Trip Profile" } },
  { href: "/reviews", label: { id: "Review", en: "Reviews" } },
  { href: "/media-kit", label: { id: "Media Kit", en: "Media Kit" } },
  { href: "/legalitas-dan-keamanan", label: { id: "Legalitas & Keamanan", en: "Legality & Safety" } },
  { href: "/privacy", label: { id: "Kebijakan Privasi", en: "Privacy Policy" } },
  { href: "/faq", label: { id: "FAQ", en: "FAQ" } },
  { href: "/terms", label: { id: "Syarat & Ketentuan", en: "Terms" } },
];

// Footer = SUPERSET dari primaryNav (dijamin, karena di-derive dari primaryNav).
// "Kontak" dipertahankan di posisi terakhir.
export const footerNav: NavItem[] = [
  ...primaryNav.slice(0, -1),
  ...footerExtras,
  primaryNav[primaryNav.length - 1],
];
