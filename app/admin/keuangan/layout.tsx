import "./keuangan.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
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

  // Halaman cetak (/cetak) pakai layout dokumen sendiri — lewati
  // shell terminal gelap supaya hasil cetak bersih di kertas putih.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.endsWith("/cetak")) {
    return <>{children}</>;
  }

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
