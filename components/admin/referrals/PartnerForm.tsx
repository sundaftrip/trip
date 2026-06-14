import Link from "next/link";
import { RotateCcw, Save } from "lucide-react";
import {
  createPartnerAction,
  rotatePartnerTokenAction,
  updatePartnerAction,
} from "@/app/admin/partners/actions";
import { buildDashboardLink, buildReferralLink, COMMISSION_TYPE_LABEL, PARTNER_TYPE_LABEL } from "@/lib/referrals";

type Campaign = {
  id: string;
  campaignName: string;
  packageName: string;
  discountLabel: string;
  whatsappTemplate: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
};

type Partner = {
  id: string;
  partnerName: string;
  partnerType: string;
  referralCode: string;
  slug: string;
  dashboardToken: string;
  status: string;
  commissionType: string;
  commissionValue: number;
  campaigns: Campaign[];
};

const partnerTypes = Object.entries(PARTNER_TYPE_LABEL);
const commissionTypes = Object.entries(COMMISSION_TYPE_LABEL);

function dateValue(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default function PartnerForm({ partner }: { partner?: Partner }) {
  const campaign = partner?.campaigns[0];
  const isEdit = Boolean(partner);
  const action = isEdit ? updatePartnerAction : createPartnerAction;
  const slug = partner?.slug || "";
  const dashboardLink = partner ? buildDashboardLink(partner.slug, partner.dashboardToken) : "";
  const referralLink = slug ? buildReferralLink(slug) : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Partner Referral" : "Partner Referral Baru"}
          </h1>
          <p className="text-sm text-gray-500">Kelola short link, kode referral, campaign, dan akses dashboard partner.</p>
        </div>
        <Link href="/admin/partners" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
          Kembali
        </Link>
      </div>

      <form action={action} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <input type="hidden" name="id" value={partner?.id ?? ""} />
        <input type="hidden" name="campaignId" value={campaign?.id ?? ""} />

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Data Partner</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partner name</span>
                <input name="partnerName" required defaultValue={partner?.partnerName ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partner type</span>
                <select name="partnerType" defaultValue={partner?.partnerType ?? "INFLUENCER"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                  {partnerTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Referral code</span>
                <input name="referralCode" required defaultValue={partner?.referralCode ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Slug pendek</span>
                <input name="slug" required defaultValue={partner?.slug ?? ""} placeholder="nada" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm lowercase dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</span>
                <select name="status" defaultValue={partner?.status ?? "ACTIVE"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Commission type</span>
                <select name="commissionType" defaultValue={partner?.commissionType ?? "FIXED"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                  {commissionTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Commission value</span>
                <input name="commissionValue" type="number" min="0" step="1" defaultValue={partner?.commissionValue ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Campaign Default</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Campaign name</span>
                <input name="campaignName" defaultValue={campaign?.campaignName ?? "Russia Trip"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Package name</span>
                <input name="packageName" defaultValue={campaign?.packageName ?? "Trip Russia"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discount label</span>
                <input name="discountLabel" defaultValue={campaign?.discountLabel ?? "Potongan Rp500.000"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Campaign status</span>
                <select name="campaignStatus" defaultValue={campaign?.status ?? "ACTIVE"} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ENDED">Ended</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start date</span>
                <input name="startDate" type="date" defaultValue={dateValue(campaign?.startDate)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">End date</span>
                <input name="endDate" type="date" defaultValue={dateValue(campaign?.endDate)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">WhatsApp message template</span>
                <textarea name="whatsappTemplate" rows={5} defaultValue={campaign?.whatsappTemplate ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-900" />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Link</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Short referral link</p>
                <p className="mt-1 break-all rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  {referralLink || "Akan dibuat dari slug"}
                </p>
              </div>
              {dashboardLink && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Dashboard partner</p>
                  <p className="mt-1 break-all rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {dashboardLink}
                  </p>
                </div>
              )}
            </div>
          </section>

          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            <Save size={16} />
            {isEdit ? "Simpan Perubahan" : "Buat Partner"}
          </button>
        </aside>
      </form>

      {partner && (
        <form action={rotatePartnerTokenAction} className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <input type="hidden" name="id" value={partner.id} />
          <input type="hidden" name="slug" value={partner.slug} />
          <h2 className="text-base font-bold text-amber-950">Rotate dashboard token</h2>
          <p className="mt-1 text-sm text-amber-800">
            Token lama langsung tidak bisa dipakai. Kirim ulang dashboard link baru ke partner setelah rotasi.
          </p>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">
            <RotateCcw size={16} />
            Rotate Token
          </button>
        </form>
      )}
    </div>
  );
}
