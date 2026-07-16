import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppHref, toWaNumber } from "@/lib/utils";
import styles from "./PremiumChrome.module.css";

const getFooterInfo = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: {
          key: {
            in: [
              "company_whatsapp",
              "company_email",
              "company_phone",
              "company_address",
              "company_instagram",
            ],
          },
        },
      });
      return Object.fromEntries(rows.map((row) => [row.key, row.value]));
    } catch {
      return {} as Record<string, string>;
    }
  },
  ["premium-footer-info-v1"],
  { revalidate: 3600, tags: ["footer-data", "site-colors"] },
);

export default async function PremiumFooter() {
  const info = await getFooterInfo();
  const whatsapp = toWaNumber(info.company_whatsapp);
  const whatsappHref = buildWhatsAppHref(whatsapp);
  const instagram = (info.company_instagram || "sundaf.trip")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");

  return (
    <footer className={styles.footer}>
      <div className={styles.footerShell}>
        <div className={styles.footerBrand}>
          <Image src="/logo.png" alt="Sundaf Trip" width={862} height={241} sizes="150px" />
          <p>Perjalanan Rusia, Asia Tengah, dan aurora yang dirancang untuk traveler Indonesia.</p>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerLabel}>Rencanakan</p>
          <Link href="/tours" prefetch={false}>Jadwal tour</Link>
          <Link href="/custom-trip" prefetch={false}>Private trip</Link>
          <Link href="/visa" prefetch={false}>Layanan visa</Link>
          <Link href="/faq" prefetch={false}>Pertanyaan umum</Link>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerLabel}>Hubungi</p>
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>}
          {info.company_email && <a href={`mailto:${info.company_email}`}>{info.company_email}</a>}
          {info.company_phone && <a href={`tel:${info.company_phone.replace(/\D/g, "")}`}>{info.company_phone}</a>}
          <a href={`https://www.instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}</a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Sundaf Trip · CV Sundaf Holiday Group</p>
        <div>
          <Link href="/legalitas-dan-keamanan" prefetch={false}>Legalitas</Link>
          <Link href="/privacy" prefetch={false}>Privasi</Link>
          <Link href="/terms" prefetch={false}>Syarat &amp; ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}
