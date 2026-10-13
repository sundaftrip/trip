import { Lora } from "next/font/google";

/* Serif untuk judul halaman B2B — kesan formal / korporat.
   Ini satu-satunya font judul selain DM Sans di situs publik (Company Profile,
   B2B, Partner, Partnership Relation). Body text tetap DM Sans. */
export const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});
