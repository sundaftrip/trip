import "./keuangan.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import KeuShell from "@/components/keuangan/KeuShell";

export const metadata: Metadata = {
  title: "Finance Terminal — Sundaftrip",
};

export default async function KeuanganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="keu">
      <div className="keu-bg" aria-hidden />
      <KeuShell
        user={{
          name: session.user.name ?? "Operator",
          role: session.user.role ?? "ADMIN",
        }}
      >
        {children}
      </KeuShell>
    </div>
  );
}
