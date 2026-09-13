import { Lora, Roboto } from "next/font/google";

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-footer-roboto",
  display: "swap",
  preload: false,
});

/* Serif untuk judul halaman B2B — kesan formal / korporat.
   Body text tetap memakai sans-serif default situs. */
export const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});
