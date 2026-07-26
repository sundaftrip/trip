// Build wrapper untuk Vercel & lokal.
// Masalah yang dicegah: build PREVIEW (branch apa pun) ikut menjalankan
// `prisma db push` + seed terhadap DATABASE_URL — kalau Preview memakai DB
// yang sama dengan production, push branch eksperimen bisa mengubah schema
// DB production sebelum kodenya live.
// Aturan: preview cukup `next build`. Production hanya boleh menyentuh schema
// atau data jika flag terpisah dan eksplisit dipasang untuk deploy itu.
// Build lokal tanpa VERCEL_ENV tetap menjalankan db push + seed seperti workflow
// maintenance lama.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const allowProductionDbMigration = process.env.ALLOW_PRODUCTION_DB_MIGRATION === "true";
const allowProductionDbSeed = process.env.ALLOW_PRODUCTION_DB_SEED === "true";

// Static generation reads CMS data from Prisma. Keep build concurrency below the
// hosted Postgres pool limit so `next build` is repeatable instead of racing DB.
process.env.NEXT_PRIVATE_BUILD_WORKER_COUNT ??= "1";

if (process.env.VERCEL_ENV === "preview") {
  console.log("ℹ️  Preview build — skip prisma db push + seed (DB tidak disentuh)");
} else if (process.env.VERCEL_ENV === "production") {
  if (allowProductionDbMigration) {
    run("prisma db push --skip-generate");
  } else {
    console.log("ℹ️  Production build — skip prisma db push (set ALLOW_PRODUCTION_DB_MIGRATION=true untuk migrasi schema eksplisit)");
  }

  if (allowProductionDbSeed) {
    run("tsx prisma/seed.ts");
  } else {
    console.log("ℹ️  Production build — skip seed (set ALLOW_PRODUCTION_DB_SEED=true untuk seed data eksplisit)");
  }
} else {
  run("prisma db push --skip-generate");
  run("tsx prisma/seed.ts");
}

run("next build --webpack");
