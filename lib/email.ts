import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Pengiriman email reset password CMS via Resend (email transaksional).
// Dipilih supaya email reset tetap masuk Inbox meski tujuannya akun Gmail
// yang sama — Gmail SMTP dulu menyembunyikan email "kirim ke diri sendiri".
//
// Kredensial diambil dengan urutan:
//   1. Environment variable RESEND_API_KEY (+ RESEND_FROM opsional)
//   2. Kalau env kosong → dari tabel CompanyInfo (key resend_api_key /
//      resend_from) — supaya berlaku di lokal & produksi tanpa perlu set
//      env var di Vercel.
//
// Soal alamat pengirim (from):
//   - Tanpa verifikasi domain → pakai "onboarding@resend.dev". Resend hanya
//     mengizinkan kirim ke alamat email yang dipakai DAFTAR akun Resend.
//   - Untuk kirim ke alamat apa pun → verifikasi domain sundaftrip.com di
//     Resend, lalu set resend_from ke mis.
//     "Sundaf Trip — CMS <noreply@sundaftrip.com>".

type Config = { apiKey: string; from: string };

const DEFAULT_FROM = "Sundaf Trip — CMS <onboarding@resend.dev>";

async function getEmailConfig(): Promise<Config | null> {
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM || DEFAULT_FROM,
    };
  }
  const rows = await prisma.companyInfo.findMany({
    where: { key: { in: ["resend_api_key", "resend_from"] } },
  });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  if (m["resend_api_key"]) {
    return { apiKey: m["resend_api_key"], from: m["resend_from"] || DEFAULT_FROM };
  }
  return null;
}

export async function emailConfigured(): Promise<boolean> {
  return !!(await getEmailConfig());
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  link: string;
}) {
  const config = await getEmailConfig();
  if (!config) throw new Error("Kredensial email belum dikonfigurasi.");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1a2433">
    <div style="background:#0c2647;padding:22px 24px;border-radius:12px 12px 0 0">
      <div style="color:#fff;font-size:16px;font-weight:700;letter-spacing:0.06em">
        SUNDAF<span style="color:#fe8032">·</span>TRIP — CMS
      </div>
    </div>
    <div style="border:1px solid #e3e7ee;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p style="font-size:14px;margin:0 0 14px">Halo ${opts.name},</p>
      <p style="font-size:13px;line-height:1.6;color:#5d6675;margin:0 0 18px">
        Ada permintaan untuk mereset password login CMS Sundaf Trip. Klik tombol di
        bawah untuk membuat password baru. Link ini berlaku <b>1 jam</b>.
      </p>
      <a href="${opts.link}"
         style="display:inline-block;background:#fe8032;color:#1a0e03;font-weight:700;
                font-size:14px;text-decoration:none;padding:12px 22px;border-radius:9px">
        Reset Password
      </a>
      <p style="font-size:11.5px;line-height:1.6;color:#8b93a3;margin:20px 0 0">
        Kalau tombol tidak bisa diklik, salin tautan ini ke browser:<br />
        <span style="color:#5d6675;word-break:break-all">${opts.link}</span>
      </p>
      <p style="font-size:11.5px;line-height:1.6;color:#8b93a3;margin:14px 0 0">
        Kalau Anda tidak meminta reset password, abaikan saja email ini —
        password Anda tidak berubah.
      </p>
    </div>
  </div>`;

  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: opts.to,
    subject: "Reset Password CMS — Sundaf Trip",
    html,
  });
  if (error) {
    throw new Error(`Resend gagal kirim email: ${error.message}`);
  }
}
