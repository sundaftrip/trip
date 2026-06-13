"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { idx: string; href: string; label: string; group: string }[] = [
  { idx: "01", href: "/admin/keuangan", label: "Ringkasan", group: "MONITOR" },
  { idx: "02", href: "/admin/keuangan/trip", label: "Cashflow Trip", group: "MONITOR" },
  { idx: "03", href: "/admin/keuangan/posisi-kas", label: "Posisi Kas", group: "MONITOR" },
  { idx: "04", href: "/admin/keuangan/laporan", label: "Laporan P&L", group: "MONITOR" },
  { idx: "05", href: "/admin/keuangan/neraca", label: "Neraca", group: "MONITOR" },
  { idx: "06", href: "/admin/keuangan/bank", label: "Bank & Kas", group: "OPERASI" },
  { idx: "07", href: "/admin/keuangan/vendor", label: "Vendor & Hutang", group: "OPERASI" },
  { idx: "08", href: "/admin/keuangan/jurnal", label: "Jurnal Manual", group: "OPERASI" },
  { idx: "09", href: "/admin/keuangan/lapangan", label: "Pengeluaran Lapangan", group: "OPERASI" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/keuangan") return pathname === href;
  return pathname.startsWith(href);
}

export default function KeuShell({
  user,
  children,
}: {
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [today, setToday] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString("id-ID", { hour12: false }));
      setToday(
        d.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    };
    const initial = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className="keu-shell">
      <div
        className={`keu-scrim ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside className={`keu-rail ${open ? "open" : ""}`}>
        <div className="keu-brand">
          <div className="keu-brand-mark">
            SUNDAF<b>·</b>FINANCE
          </div>
          <div className="keu-brand-sub">REAL-TIME ACCOUNTING TERMINAL</div>
        </div>

        <nav className="keu-rail-nav">
          {NAV.map((item, index) => {
            const showGroup = item.group !== NAV[index - 1]?.group;
            return (
              <div key={item.href}>
                {showGroup && <div className="keu-rail-group">{item.group}</div>}
                <Link
                  href={item.href}
                  className={`keu-rail-link ${isActive(pathname, item.href) ? "active" : ""}`}
                >
                  <span className="keu-rail-idx">{item.idx}</span>
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <Link href="/admin" className="keu-rail-foot">
          ‹ KEMBALI KE KONSOL ADMIN
        </Link>
      </aside>

      <div className="keu-body">
        <header className="keu-topbar">
          <button
            className="keu-btn keu-btn-ghost keu-rail-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="keu-live">
            <span className="keu-dot" />
            LIVE
          </div>
          <div className="keu-ticker">
            SISTEM AKUNTANSI REAL-TIME · <b>SUNDAFTRIP</b> · SEMUA NILAI DALAM IDR ·
            DATA TER-SINKRON DARI PAYMENT PESERTA + HPP VENDOR + JURNAL
          </div>
          <div className="keu-clock">
            {today} · {clock}
          </div>
          <div className="keu-user">
            {user.name.toUpperCase()} / {user.role}
          </div>
        </header>

        <main className="keu-main">{children}</main>
      </div>
    </div>
  );
}
