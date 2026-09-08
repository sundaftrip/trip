import LatinAmericaProgramme from "@/components/website/LatinAmericaProgramme";
import { LATIN_AMERICA_PROGRAMMES, latinAmericaMetadata } from "@/lib/latin-america";
import { LATIN_AMERICA_PACKAGES } from "@/lib/latin-america-packages";
import { rupiahMillions } from "@/lib/latin-america-package-types";

const programme = LATIN_AMERICA_PROGRAMMES[1];
const detail = LATIN_AMERICA_PACKAGES[programme.id];
export const metadata = latinAmericaMetadata(`${programme.title} 2027`, `${detail.duration}. Estimasi mulai ${rupiahMillions(detail.price.from)} per orang termasuk tiket Jakarta PP dan regional. Harga untuk 20 peserta; tersedia pilihan 10 dan 15 peserta.`, programme.href);

export default function SouthAmericaPage() {
  return <LatinAmericaProgramme programme={programme} />;
}
