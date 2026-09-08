import LatinAmericaProgramme from "@/components/website/LatinAmericaProgramme";
import { LATIN_AMERICA_PROGRAMMES, latinAmericaMetadata } from "@/lib/latin-america";

const programme = LATIN_AMERICA_PROGRAMMES[0];
export const metadata = latinAmericaMetadata(`${programme.title} 2027`, `${programme.summary} Program sedang dikembangkan; tanggal dan harga sesuai penawaran.`, programme.href);

export default function PeruPage() {
  return <LatinAmericaProgramme programme={programme} />;
}
