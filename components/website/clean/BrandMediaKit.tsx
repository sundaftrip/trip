import Image from "next/image";
import { ArrowUpRight, Download } from "lucide-react";
import styles from "./BrandMediaKit.module.css";
import tokens from "@/public/brand/sundaf-tokens.json";

export default function BrandMediaKit() {
  return (
    <section className={styles.kit} aria-labelledby="brand-kit-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>SUNDAF / BRAND SYSTEM 1.0</p>
        <h2 id="brand-kit-title">Ruang untuk <em>menjelajah.</em></h2>
        <p>Identitas visual yang tenang, terbuka, dan mudah dikenali. Panduan dan aset untuk menjaga setiap cerita tetap terasa seperti Sundaf.</p>
      </div>
      <div className={styles.resources}>
        <a href="https://www.figma.com/design/FeIZhRRkEwpOCrnprdEGMn" target="_blank" rel="noreferrer">
          <span><small>01 / PANDUAN & TEMPLATE</small><strong>Brand guidelines di Figma</strong><span>Warna, tipografi, komposisi, dan template sosial.</span></span><ArrowUpRight aria-hidden="true" />
        </a>
        <a href="https://drive.google.com/drive/folders/1BWKWxNnSjQ2O_Ty1rzNyMeHe4yhRt8ad" target="_blank" rel="noreferrer">
          <span><small>02 / UNTUK MITRA KREATIF</small><strong>Folder media SUNDAF</strong><span>Panduan PDF, logo, dan berkas untuk agency. Akses folder dikelola oleh SUNDAF.</span></span><ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className={styles.foundations}>
        <div className={styles.logoPanel}>
          <p className={styles.eyebrow}>LOGO UTAMA</p>
          <Image src="/brand/sundaf-logo.png" alt="Logo resmi Sundaf Trip" width={862} height={241} sizes="(max-width: 759px) 80vw, 400px" />
          <p>Gunakan bentuk dan proporsi asli. Beri ruang di sekeliling logo dan gunakan latar yang bersih.</p>
          <a href="/brand/sundaf-logo.png" download>Unduh logo PNG <Download size={17} aria-hidden="true" /></a>
        </div>
        <div className={styles.palettePanel}>
          <p className={styles.eyebrow}>PALET SUNDAF</p>
          <div className={styles.palette}>
            {Object.entries(tokens.color).map(([key, value]) => (
              <div key={key}><span className={styles.swatch} style={{ backgroundColor: value.hex }} /><strong>{value.name}</strong><code>{value.hex}</code></div>
            ))}
          </div>
          <a href="/brand/sundaf-tokens.json" download>Unduh palet & spesifikasi <Download size={17} aria-hidden="true" /></a>
        </div>
      </div>
      <div className={styles.typeSpecimen}>
        <div><small>DISPLAY / SOURCE SERIF 4</small><p>Semua bisa <em>jalan!</em></p></div>
        <div><small>INFORMASI / DM SANS</small><p>Rute yang jelas.<br />Cerita yang dekat.</p></div>
      </div>
      <p className={styles.note}>Teks, harga, jadwal, dan rincian layanan pada materi publik harus mengikuti informasi produk yang sudah dikonfirmasi. Foto destinasi adalah ilustrasi; jangan menjanjikan cuaca atau penampakan aurora.</p>
    </section>
  );
}
