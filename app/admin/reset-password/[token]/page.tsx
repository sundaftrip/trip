import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/reset-token";
import AuthCard from "@/components/admin/AuthCard";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password — CMS Sundaf Trip",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  const valid = !!row && !row.usedAt && row.expiresAt > new Date();

  if (!valid) {
    return (
      <AuthCard title="Link Tidak Valid" subtitle="Reset Password">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Link reset password tidak ditemukan, sudah pernah dipakai, atau sudah
          kedaluwarsa (link berlaku 1 jam). Silakan minta link baru.
        </p>
        <Link
          href="/admin/lupa-password"
          className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Minta Link Baru
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Buat Password Baru" subtitle="Reset Password CMS">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
