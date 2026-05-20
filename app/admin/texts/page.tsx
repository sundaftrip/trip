import { prisma } from "@/lib/prisma";
import TextsForm from "@/components/admin/TextsForm";

const TEXT_KEYS = [
  { section: "Hero", keys: ["hero_eyebrow", "hero_title", "hero_subtitle", "hero_btn", "hero_welcome", "hero_updates_title", "hero_updates"] },
  { section: "Mengapa Sundaf — Konten", keys: ["hero_sundaf_title", "hero_sundaf"] },
  { section: "Mengapa Sundaf — Style (lihat petunjuk di bawah)", keys: ["hero_sundaf_position", "hero_sundaf_width", "hero_sundaf_font", "hero_sundaf_highlight", "hero_sundaf_rotate"] },
  { section: "Footer", keys: ["footer_tagline"] },
  { section: "Kontak", keys: ["contact_title", "contact_desc"] },
  { section: "Pembayaran", keys: ["payment_bank_name", "payment_bank_acc", "payment_bank_holder"] },
];

export default async function TextsPage() {
  const existing = await prisma.siteText.findMany();
  const textsMap: Record<string, { id?: string; en?: string }> = {};
  existing.forEach((t) => {
    textsMap[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teks Website</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Edit semua teks yang tampil di halaman publik</p>
      </div>
      <TextsForm sections={TEXT_KEYS} initialValues={textsMap} />

      <details className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm" open>
        <summary className="font-semibold cursor-pointer text-amber-900 dark:text-amber-100">
          ℹ Petunjuk Style "Mengapa Sundaf"
        </summary>
        <div className="mt-3 space-y-2 text-amber-900 dark:text-amber-200">
          <p><strong>hero_sundaf_position</strong> — pilihan: <code>center-right</code> (default), <code>top-right</code>, <code>bottom-right</code>, <code>top-left</code>, <code>bottom-left</code>, <code>above-buttons</code>. Posisi di desktop (≥1024px). Mobile selalu inline di bawah judul.</p>
          <p><strong>hero_sundaf_width</strong> — angka dalam px, mis <code>260</code> (default), <code>200</code>, <code>320</code>. Maksimum width block.</p>
          <p><strong>hero_sundaf_font</strong> — pilihan: <code>mono</code> (default, monospace boarding pass), <code>handwritten</code> (Caveat, tulisan tangan), <code>serif</code> (Georgia), <code>sans</code> (Jost).</p>
          <p><strong>hero_sundaf_highlight</strong> — warna stabilo dalam hex, mis <code>#fff06a</code> (kuning), <code>#ff6b6b</code> (merah), <code>#86b2ca</code> (biru). Kosongkan untuk tanpa stabilo.</p>
          <p><strong>hero_sundaf_rotate</strong> — derajat rotasi, mis <code>-2</code> (miring kiri), <code>3</code> (miring kanan), <code>0</code> (lurus, default).</p>
          <p className="text-xs opacity-80">Cara cepat: ubah satu field → Simpan → refresh homepage untuk lihat hasil.</p>
        </div>
      </details>
    </div>
  );
}
