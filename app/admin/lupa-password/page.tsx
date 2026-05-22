import type { Metadata } from "next";
import AuthCard from "@/components/admin/AuthCard";
import LupaPasswordForm from "@/components/admin/LupaPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password — CMS Sundaf Trip",
  robots: { index: false, follow: false },
};

export default function LupaPasswordPage() {
  return (
    <AuthCard title="Lupa Password" subtitle="Reset akses CMS lewat email">
      <LupaPasswordForm />
    </AuthCard>
  );
}
