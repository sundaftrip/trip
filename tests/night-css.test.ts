import { test } from "node:test";
import { execFileSync } from "node:child_process";

// Blok mode malam di CSS module dibuat oleh scripts/night-css.mjs. Kalau CSS
// diubah tanpa menjalankan ulang skrip, mode malam bisa tertinggal; tes ini
// mengingatkan dengan menjalankan skrip dalam mode --check.
test("blok mode malam di CSS module situs publik sudah mutakhir", () => {
  execFileSync(process.execPath, ["scripts/night-css.mjs", "--check"], { stdio: "pipe" });
});
