import { formatCurrency } from "./utils";

export const TOUR_COST_DETAILS_NOTE = "Periksa rincian fasilitas, biaya di luar paket, dan pilihan tambahan pada halaman paket.";

export function tourSubtotalLabel(hasMandatory: boolean, hasOptionalSelection = false) {
  if (hasOptionalSelection) return "Subtotal pilihan per orang";
  return hasMandatory ? "Subtotal paket + tambahan wajib" : "Harga paket";
}

export function formatPackageCostDisclosure(
  exclusions: readonly string[] | null | undefined,
  hasMandatory: boolean,
) {
  const items = exclusions?.map((item) => item.trim()).filter(Boolean) ?? [];
  return [
    items.length ? `Belum termasuk dalam harga paket: ${items.join("; ")}.` : TOUR_COST_DETAILS_NOTE,
    hasMandatory ? "Tambahan wajib yang ditampilkan sudah dihitung dalam subtotal." : "",
    "Tambahan opsional yang belum dipilih tidak termasuk subtotal.",
  ].filter(Boolean).join(" ");
}

export function formatOptionalActivityDisclosure(addOns: unknown) {
  if (!Array.isArray(addOns)) return "";
  const items = addOns.flatMap((item) => {
    if (!item || typeof item !== "object" || item.tag === "wajib"
      || typeof item.name !== "string" || !item.name.trim() || /\b(?:e[\s-]?)?visa\b/i.test(item.name)) return [];
    const price = Number(item.price);
    const priceLabel = Number.isFinite(price) && price > 0 ? formatCurrency(price) : "harga dikonfirmasi";
    const description = typeof item.desc === "string" ? item.desc.trim().replace(/\.$/, "") : "";
    return [`${item.name.trim()} (${priceLabel})${description ? `: ${description}` : ""}`];
  });
  return items.length ? `Tambahan opsional di luar subtotal: ${items.join("; ")}.` : "";
}
