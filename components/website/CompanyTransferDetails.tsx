import { SUNDAF_TRANSFER_ACCOUNT, SUNDAF_TRANSFER_INSTRUCTIONS } from "@/lib/company-transfer";
import CopyButton from "./CopyButton";

export default function CompanyTransferDetails({ lang = "id" }: { lang?: "id" | "en" }) {
  return (
    <section className="space-y-3" aria-label={lang === "en" ? "Company transfer account" : "Rekening transfer perusahaan"}>
      <p className="text-sm leading-relaxed">{SUNDAF_TRANSFER_INSTRUCTIONS[lang]}</p>
      <CopyButton
        value={SUNDAF_TRANSFER_ACCOUNT.number}
        label={lang === "en" ? "Copy account number" : "Salin nomor rekening"}
      />
    </section>
  );
}
