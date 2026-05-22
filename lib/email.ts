import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Pengiriman email via Gmail SMTP. Kredensial diambil dengan urutan:
//   1. Environment variable GMAIL_USER + GMAIL_APP_PASSWORD (diutamakan)
//   2. Kalau env kosong → dari tabel CompanyInfo (key gmail_user /
//      gmail_app_password) — supaya berlaku di lokal & produksi tanpa
//      perlu set env var di Vercel.

type Creds = { user: string; pass: string };

async function getEmailCreds(): Promise<Creds | null> {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD };
  }
  const rows = await prisma.companyInfo.findMany({
    where: { key: { in: ["gmail_user", "gmail_app_password"] } },
  });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  if (m["gmail_user"] && m["gmail_app_password"]) {
    return { user: m["gmail_user"], pass: m["gmail_app_password"] };
  }
  return null;
}

export async function emailConfigured(): Promise<boolean> {
  return !!(await getEmailCreds());
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  link: string;
}) {
  const creds = await getEmailCreds();
  if (!creds) throw new Error("Kredensial email belum dikonfigurasi.");

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

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: creds.user, pass: creds.pass },
  });
  await transport.sendMail({
    from: `"Sundaf Trip — CMS" <${creds.user}>`,
    to: opts.to,
    subject: "Reset Password CMS — Sundaf Trip",
    html,
  });
}
