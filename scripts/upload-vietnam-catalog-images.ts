import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const body = fs.readFileSync(filePath, "utf8");
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}

function listImages(root: string) {
  const entries: Array<{ filePath: string; folder: string; publicId: string }> = [];
  for (const destination of fs.readdirSync(root)) {
    const destinationPath = path.join(root, destination);
    if (!fs.statSync(destinationPath).isDirectory()) continue;
    for (const fileName of fs.readdirSync(destinationPath)) {
      if (!fileName.endsWith(".webp")) continue;
      entries.push({
        filePath: path.join(destinationPath, fileName),
        folder: `sundaftrip/vietnam/catalog/${destination}`,
        publicId: path.basename(fileName, ".webp"),
      });
    }
  }
  return entries.sort((a, b) => a.filePath.localeCompare(b.filePath));
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const root = path.resolve(process.argv[2] ?? "public/vietnam/catalog");
  const images = listImages(root);
  if (images.length === 0) throw new Error(`No Vietnam catalog images found in ${root}`);

  let uploaded = 0;
  for (const image of images) {
    await cloudinary.uploader.upload(image.filePath, {
      folder: image.folder,
      public_id: image.publicId,
      overwrite: true,
      resource_type: "image",
    });
    uploaded += 1;
    if (uploaded % 10 === 0 || uploaded === images.length) {
      console.log(`Uploaded ${uploaded}/${images.length}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
