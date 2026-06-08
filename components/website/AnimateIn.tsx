interface Props {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}

/* CSS-only scroll reveal (lihat .ai-reveal di globals.css).
   Server Component — TIDAK ada IntersectionObserver/JS, jadi tidak menambah
   island ke client bundle. Browser tanpa `animation-timeline: view()`
   menampilkan konten apa adanya (fallback aman).
   `delay` dipertahankan demi kompatibilitas API tapi tidak dipakai
   (stagger berbasis waktu tidak berlaku pada view-timeline). */
export default function AnimateIn({ children, direction = "up", className = "" }: Props) {
  return (
    <div className={`ai-reveal ${className}`} data-dir={direction}>
      {children}
    </div>
  );
}
