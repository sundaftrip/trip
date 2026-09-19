import { B2B_GALLERY_IMAGES } from "@/lib/static-gallery-manifests";

/* Proof-wall foto keberangkatan nyata untuk /partner, /b2b, dan
   /company-profile. Manifest statis mencegah seluruh folder disalin ke setiap
   server-function bundle yang mengimpor helper ini. */
export function getProofPhotos(): string[] {
  return [...B2B_GALLERY_IMAGES];
}
