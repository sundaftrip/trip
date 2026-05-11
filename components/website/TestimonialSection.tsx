import { Star, Quote } from "lucide-react";
import AnimateIn from "./AnimateIn";

interface Testimonial {
  id: string; name: string; role: string | null;
  content: string; rating: number; avatar: string | null;
}

interface Props {
  items: Testimonial[];
  theme?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"} />
      ))}
    </div>
  );
}

function Avatar({ avatar, name, size = "md" }: { avatar: string | null; name: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-9 h-9 text-sm" : "w-12 h-12 text-base";
  if (avatar) return <img src={avatar} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: "var(--site-accent,#2d6a4f)", color: "white" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function TestimonialSection({ items, theme = "classic" }: Props) {
  if (items.length === 0) return null;

  /* ── CLASSIC ── */
  if (theme === "classic") return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="mb-12">
            <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Testimoni</p>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "var(--site-heading,#111827)" }}>
              Kata Mereka
            </h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <AnimateIn key={item.id} delay={i * 80}>
              <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-900 h-full flex flex-col">
                <Stars rating={item.rating} />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4 flex-1">
                  &ldquo;{item.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-900">
                  <Avatar avatar={item.avatar} name={item.name} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    {item.role && <p className="text-xs text-gray-400">{item.role}</p>}
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── CATALOG (vibrant) ── */
  if (theme === "vibrant") return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">Testimoni</p>
              <h2 className="text-3xl lg:text-4xl font-black" style={{ color: "var(--site-heading,#111827)" }}>
                Kata Mereka
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--site-accent,#2d6a4f)" }}>
                <Quote size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-400">{items.length} ulasan</span>
            </div>
          </div>
        </AnimateIn>

        {/* Featured first testimonial */}
        {items[0] && (
          <AnimateIn>
            <div className="rounded-3xl p-8 mb-6 relative overflow-hidden" style={{ background: "var(--site-accent,#2d6a4f)" }}>
              <Quote size={64} className="absolute top-4 right-8 text-white/10" />
              <Stars rating={items[0].rating} />
              <p className="text-white text-lg font-medium leading-relaxed mt-4 mb-6 max-w-2xl relative z-10">
                &ldquo;{items[0].content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar avatar={items[0].avatar} name={items[0].name} size="md" />
                <div>
                  <p className="font-bold text-white">{items[0].name}</p>
                  {items[0].role && <p className="text-sm text-white/70">{items[0].role}</p>}
                </div>
              </div>
            </div>
          </AnimateIn>
        )}

        {items.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(1).map((item, i) => (
              <AnimateIn key={item.id} delay={i * 70}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                  <Stars rating={item.rating} />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-3 flex-1">
                    &ldquo;{item.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Avatar avatar={item.avatar} name={item.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      {item.role && <p className="text-[11px] text-gray-400">{item.role}</p>}
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  /* ── BOLD ── */
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-16">Kata Mereka</h2>
        </AnimateIn>
        <div className="space-y-0 divide-y divide-gray-800">
          {items.map((item, i) => (
            <AnimateIn key={item.id} delay={i * 70} direction="left">
              <div className="py-8 flex flex-col sm:flex-row sm:items-center gap-6 group hover:bg-gray-900 px-4 -mx-4 rounded-xl transition-colors duration-300">
                <div className="shrink-0 text-center sm:w-32">
                  <Avatar avatar={item.avatar} name={item.name} />
                  <p className="text-xs font-semibold text-white mt-2">{item.name}</p>
                  {item.role && <p className="text-[10px] text-gray-600">{item.role}</p>}
                  <div className="flex justify-center mt-1"><Stars rating={item.rating} /></div>
                </div>
                <div className="flex-1">
                  <Quote size={20} className="mb-3" style={{ color: "var(--site-accent,#2d6a4f)" }} />
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {item.content}
                  </p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
