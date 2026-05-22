import nodemailer from "nodemailer";

// Pengiriman email via Gmail SMTP. Kredensial diisi lewat env:
//   GMAIL_USER          — alamat Gmail pengirim
//   GMAIL_APP_PASSWORD  — "App Password" 16 digit dari Google
// Kalau belum di-set, emailConfigured() = false dan fitur yang
// butuh email akan menolak dengan pesan jelas (tidak crash).

export function emailConfigured(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  link: string;
}) {
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

  await getTransport().sendMail({
    from: `"Sundaf Trip — CMS" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: "Reset Password CMS — Sundaf Trip",
    html,
  });
}
