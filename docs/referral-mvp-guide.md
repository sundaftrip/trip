# Sundaf Trip Referral MVP Guide

Tanggal: 2026-06-14

## Ringkasan

MVP referral ini dibangun di dalam arsitektur Sundaf Trip yang sudah ada:

- Next.js App Router untuk public page, partner dashboard, dan admin dashboard.
- Prisma sebagai data access layer.
- PostgreSQL sebagai database. Supabase bisa dipakai sebagai hosted Postgres melalui `DATABASE_URL`, tetapi repo ini tidak perlu Supabase SDK untuk MVP.
- Admin tetap memakai auth `/admin/login` yang sudah ada.
- Partner dashboard memakai token unik di URL untuk MVP.

Keputusan penting: referral dibuat sebagai modul terpisah dari `Inquiry`, karena referral butuh partner, campaign, commission, dispute, dan activity log sendiri.

## Alur Utama

1. Admin membuat partner di `/admin/partners`.
2. Sistem membuat:
   - referral code, contoh `NADA10`
   - slug pendek, contoh `nada`
   - short link, contoh `https://sundaftrip.com/nada`
   - dashboard token, contoh `/partner/nada?token=...`
3. Customer membuka short link `/nada`.
4. Sistem mencatat `referral_page_view` dan menyimpan kode referral ke localStorage/cookie.
5. Customer klik `Klaim Diskon`.
6. Sistem mencatat klik dan mengarahkan customer ke WhatsApp dengan pesan otomatis.
7. Admin membuat lead manual di `/admin/leads` setelah chat WhatsApp masuk.
8. Admin update status lead, booking, payment, dan commission.
9. Partner membuka dashboard read-only untuk melihat performa tanpa melihat data sensitif customer.
10. Partner bisa membuat missing lead report dari dashboard partner.

## Halaman Baru

- Public referral gate: `/[slug]`, contoh `/nada`
- Partner dashboard: `/partner/[slug]?token=...`
- Admin partners: `/admin/partners`
- Admin leads: `/admin/leads`
- Admin commissions: `/admin/commissions`
- Admin disputes: `/admin/disputes`
- Public event API: `/api/referrals/events`

## Data Privacy

Partner dashboard hanya menampilkan data milik partner berdasarkan `slug` dan `dashboardToken`.

Partner dashboard tidak menampilkan:

- nama lengkap customer
- nomor WhatsApp penuh
- admin notes
- profit atau margin internal
- data partner lain

Lead di dashboard partner memakai `customerAlias`, contoh `R***` atau `Customer #1024`.
Nomor WhatsApp disimpan untuk admin, tetapi partner hanya melihat data yang sudah dianonimkan.

## Activity Log

Event yang dicatat:

- `referral_page_view`
- `referral_code_detected`
- `claim_discount_clicked`
- `continue_without_code_clicked`
- `whatsapp_redirect_clicked`
- `lead_created`
- `lead_status_updated`
- `booking_status_updated`
- `payment_status_updated`
- `commission_status_updated`
- `dispute_created`

Log ini ada di tabel `activity_logs` model `ReferralActivityLog`, bukan tabel admin `ActivityLog` lama.

## Database

Source of truth untuk repo ini adalah `prisma/schema.prisma`.

Model baru:

- `ReferralPartner` mapped ke tabel `partners`
- `ReferralCampaign` mapped ke tabel `campaigns`
- `ReferralLead` mapped ke tabel `leads`
- `ReferralActivityLog` mapped ke tabel `activity_logs`
- `ReferralCommission` mapped ke tabel `commissions`
- `ReferralDispute` mapped ke tabel `disputes`

Catatan: jika memakai Supabase sebagai database, tetap jalankan lewat Prisma:

```bash
npx prisma db push
npm run db:seed
```

Jangan menjalankan SQL manual jika repo ini sudah memakai Prisma, supaya schema Prisma dan database tidak beda.

## Supabase SQL Reference

Gunakan ini hanya sebagai referensi struktur jika suatu saat membuat project Supabase-only tanpa Prisma.

```sql
create table partners (
  id text primary key,
  partner_name text not null,
  partner_type text not null,
  referral_code text not null unique,
  slug text not null unique,
  dashboard_token text not null unique,
  status text not null default 'ACTIVE',
  commission_type text not null default 'FIXED',
  commission_value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaigns (
  id text primary key,
  partner_id text not null references partners(id),
  campaign_name text not null,
  package_name text not null,
  discount_label text not null,
  short_link text,
  whatsapp_template text not null,
  start_date timestamptz,
  end_date timestamptz,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id text primary key,
  customer_name text,
  customer_alias text,
  whatsapp_number text,
  whatsapp_masked text,
  package_name text not null,
  referral_code text,
  partner_id text references partners(id) on delete set null,
  campaign_id text references campaigns(id) on delete set null,
  source_url text,
  lead_status text not null default 'NEW_LEAD',
  booking_status text not null default 'NOT_BOOKED',
  payment_status text not null default 'UNPAID',
  transaction_value numeric not null default 0,
  commission_amount numeric not null default 0,
  commission_status text not null default 'PENDING',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activity_logs (
  id text primary key,
  partner_id text references partners(id) on delete set null,
  campaign_id text references campaigns(id) on delete set null,
  lead_id text references leads(id) on delete set null,
  event_type text not null,
  event_label text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table commissions (
  id text primary key,
  partner_id text not null references partners(id),
  lead_id text not null unique references leads(id) on delete cascade,
  commission_type text not null,
  commission_amount numeric not null default 0,
  commission_status text not null default 'PENDING',
  estimated_payout_date timestamptz,
  paid_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table disputes (
  id text primary key,
  partner_id text not null references partners(id),
  customer_hint text not null,
  package_name text,
  approximate_date text,
  note text not null,
  screenshot_url text,
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Environment Variables

Tambahkan atau cek:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://sundaftrip.com"
NEXT_PUBLIC_SITE_URL="https://sundaftrip.com"
AUTH_TRUST_HOST="true"
SUNDAF_WHATSAPP_NUMBER="628xxxxxxxxxx"
```

Jika `SUNDAF_WHATSAPP_NUMBER` kosong, sistem fallback ke setting CMS `company_whatsapp`.

## Local Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Seed membuat sample:

- Partner: Nada Travel
- Referral code: `NADA10`
- Slug: `nada`
- Campaign: Russia Trip
- Package: Trip Russia
- Discount: Potongan Rp500.000

Test manual:

1. Buka `/admin/partners`, cek Nada Travel.
2. Buka `/nada`, klik `Klaim Diskon`, pastikan WhatsApp message terisi.
3. Buka partner dashboard dari link di admin.
4. Tambah lead di `/admin/leads`.
5. Update status lead dan komisi.
6. Cek angka di dashboard partner berubah.

## Deployment

Workflow existing repo:

1. Push ke GitHub.
2. Vercel production build menjalankan `prisma db push --skip-generate`.
3. Vercel production build menjalankan `tsx prisma/seed.ts`.
4. Next.js build deploy ke production.

Preview build sengaja tidak menyentuh database karena `VERCEL_ENV=preview` akan skip `db push` dan seed.

Setelah deploy:

1. Cek `/admin/partners`.
2. Cek `/nada`.
3. Buat satu test lead.
4. Cek partner dashboard dengan token.
5. Hapus atau tandai test lead jika tidak ingin masuk laporan.

## Batasan MVP

- Belum ada login partner.
- Token dashboard bisa dibagikan ulang, tetapi jika bocor harus rotate token dari admin.
- Lead dari WhatsApp tetap dibuat manual oleh admin.
- Belum ada WhatsApp Business API.
- Belum ada payment gateway.
- Belum ada payout automation.
- Belum ada UTM dashboard terpisah.

## Future Upgrade

- Partner login proper dengan magic link atau passwordless auth.
- UTM tracking dan source attribution per platform.
- Looker Studio untuk laporan bulanan.
- WhatsApp Business API untuk membuat lead otomatis dari chat.
- Payment gateway untuk otomatis menandai DP dan fully paid.
- Influencer payout automation setelah commission approved.
