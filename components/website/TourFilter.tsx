import Link from "next/link";

/* Filter region tour — minimalist boarding-pass style.
   Map negara → region untuk tampilan filter. */
export const REGIONS = [
  { key: "all", label: "Semua" },
  { key: "rusia", label: "Russia" },
  { key: "asia-tengah", label: "Asia Tengah" },
  { key: "eropa", label: "Eropa" },
  { key: "asia", label: "Asia" },
] as const;

export type RegionKey = (typeof REGIONS)[number]["key"];

/* Klasifikasi negara → region. */
export function regionOf(country: string | null | undefined): RegionKey {
  const c = (country || "").toLowerCase();
  if (c.includes("russia") || c.includes("rusia")) return "rusia";
  if (
    c.includes("kazakh") || c.includes("kyrgyz") || c.includes("uzbek") ||
    c.includes("tajik") || c.includes("turkmen")
  ) return "asia-tengah";
  if (
    c.includes("indonesia") || c.includes("singapore") || c.includes("singapura") ||
    c.includes("malaysia") || c.includes("thailand") || c.includes("vietnam") ||
    c.includes("filipina") || c.includes("japan") || c.includes("jepang") ||
    c.includes("korea") || c.includes("china") || c.includes("china") ||
    c.includes("india") || c.includes("dubai") || c.includes("turki") || c.includes("turkey")
  ) return "asia";
  if (
    c.includes("germany") || c.includes("france") || c.includes("italy") ||
    c.includes("spain") || c.includes("netherlands") || c.includes("eropa") ||
    c.includes("europe") || c.includes("austria") || c.includes("swiss")
  ) return "eropa";
  return "all";
}

export default function TourFilter({ active }: { active: RegionKey }) {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6"
      style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <span className="text-[9px] tracking-[0.22em] uppercase opacity-50 mr-1 sm:mr-2">
          Filter
        </span>
        {REGIONS.map((r) => {
          const isActive = r.key === active;
          const href = r.key === "all" ? "/#tours" : `/?region=${r.key}#tours`;
          return (
            <Link
              key={r.key}
              href={href}
              aria-current={isActive ? "true" : undefined}
              className={`px-3 sm:px-4 h-8 inline-flex items-center text-[11px] tracking-[0.14em] uppercase font-bold transition-all rounded-sm border ${
                isActive
                  ? "border-current opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80 hover:border-current"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
