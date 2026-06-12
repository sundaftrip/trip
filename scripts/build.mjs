// Build wrapper untuk Vercel & lokal.
// Masalah yang dicegah: build PREVIEW (branch apa pun) ikut menjalankan
// `prisma db push` + seed terhadap DATABASE_URL — kalau Preview memakai DB
// yang sama dengan production, push branch eksperimen bisa mengubah schema
// DB production sebelum kodenya live.
// Aturan: db push + seed hanya jalan di production build & build lokal
// (VERCEL_ENV tidak di-set). Preview cukup `next build`.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (process.env.VERCEL_ENV === "preview") {
  console.log("ℹ️  Preview build — skip prisma db push + seed (DB tidak disentuh)");
} else {
  run("prisma db push --skip-generate");
  run("tsx prisma/seed.ts");
}

run("next build --webpack");
