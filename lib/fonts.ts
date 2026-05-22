import { Lora } from "next/font/google";

/* Serif untuk judul halaman B2B — kesan formal / korporat.
   Body text tetap memakai sans-serif default situs. */
export const lora = Lora({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
