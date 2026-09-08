import metadata from "@/public/images/latin-america/metadata.json";

type Credit = { id: string; author: string; authorUrl?: string; source: string; license: string; licenseUrl: string };

export default function LatinAmericaPhotoCredit({ image }: { image: string }) {
  const id = image.split("/").at(-1)?.replace(/-1280\.webp$|\.webp$/, "");
  const photo = (metadata as Credit[]).find((item) => item.id === id);
  if (!photo) return null;
  return <span><a href={photo.source}>{photo.author}</a>{photo.authorUrl ? <> · <a href={photo.authorUrl}>delso.photo</a></> : null} · <a href={photo.licenseUrl}>{photo.license}</a></span>;
}
