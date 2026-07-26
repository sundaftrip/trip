"use client";

import {
  ArrowRight,
  BookOpen,
  Compass,
  FileCheck,
  HelpCircle,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./CleanShell.module.css";

type SearchRow = {
  title: string;
  href: string;
  description?: string | null;
};

type SearchResults = {
  primary: Array<SearchRow & { kind: "tour" | "visa" }>;
  destinations: Array<SearchRow & { name: string; region: string }>;
  tours: Array<SearchRow & {
    country: string;
    statusLabel: string;
    active: boolean;
    dateLabel?: string | null;
  }>;
  visa: Array<SearchRow & { name: string; en: string }>;
  pages: Array<SearchRow & { label: string }>;
  articles: Array<SearchRow & { label: string }>;
  faqs: Array<{ question: string; section: string; href: string }>;
  notice?: string | null;
  suggestion?: string | null;
};

const EMPTY_RESULTS: SearchResults = {
  primary: [],
  destinations: [],
  tours: [],
  visa: [],
  pages: [],
  articles: [],
  faqs: [],
  notice: null,
  suggestion: null,
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function CleanGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase("id-ID") === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => (
        !element.hasAttribute("disabled")
        && element.getClientRects().length > 0
        && window.getComputedStyle(element).visibility !== "hidden"
      ));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const normalized = query.trim();
    if (normalized.length < 2) {
      const resetFrame = window.requestAnimationFrame(() => {
        setResults(EMPTY_RESULTS);
        setLoading(false);
      });
      return () => window.cancelAnimationFrame(resetFrame);
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        setResults((await response.json()) as SearchResults);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    const closeFrame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(closeFrame);
  }, [pathname]);

  const go = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (normalized.length < 2) {
      inputRef.current?.focus();
      return;
    }
    go(`/search?q=${encodeURIComponent(normalized)}`);
  }

  const total = results.primary.length
    + results.destinations.length
    + results.tours.length
    + results.visa.length
    + results.pages.length
    + results.articles.length
    + results.faqs.length;
  const hasQuery = query.trim().length >= 2;
  const empty = hasQuery && !loading && total === 0;

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.searchButton}
        type="button"
        aria-label="Buka pencarian"
        aria-expanded={open}
        aria-controls="clean-global-search"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden="true" />
      </button>

      <div
        className={`${styles.searchLayer} ${open ? styles.searchLayerOpen : ""}`}
        aria-hidden={!open}
      >
        <button
          className={styles.searchBackdrop}
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Tutup pencarian"
          onClick={close}
        />
        <div
          ref={dialogRef}
          className={styles.searchDialog}
          id="clean-global-search"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clean-search-title"
          tabIndex={-1}
        >
          <div className={styles.searchDialogHeader}>
            <div>
              <p>JELAJAHI SUNDAF</p>
              <h2 id="clean-search-title">Cari tour, visa, dan inspirasi</h2>
            </div>
            <button className={styles.searchClose} type="button" aria-label="Tutup pencarian" onClick={close}>
              <X aria-hidden="true" />
            </button>
          </div>

          <form className={styles.searchForm} role="search" onSubmit={submit}>
            <Search aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Coba: Kanada, Russia, Astana..."
              aria-label="Cari tour, visa, destinasi, atau artikel"
              autoComplete="off"
            />
            {loading ? <Loader2 className={styles.searchSpinner} aria-hidden="true" /> : null}
          </form>

          <p className="sr-only" aria-live="polite">
            {loading
              ? "Mencari."
              : hasQuery
                ? `${total} hasil ditemukan.`
                : "Ketik minimal dua huruf untuk mencari."}
          </p>

          <div className={styles.searchResults}>
            {!hasQuery ? (
              <div className={styles.searchPrompt}>
                <Compass aria-hidden="true" />
                <p>
                  Ketik negara, kota, atau topik. “Astana” akan mencari tour dan
                  informasi visa Kazakhstan.
                </p>
              </div>
            ) : null}

            {results.suggestion ? (
              <p className={styles.searchSuggestion}>
                Mungkin maksud Anda{" "}
                <button type="button" onClick={() => setQuery(results.suggestion || "")}>
                  {results.suggestion}
                </button>
                ?
              </p>
            ) : null}

            {empty ? (
              <div className={styles.searchEmpty}>
                <p>Belum ada hasil untuk “{query.trim()}”.</p>
                <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}>
                  Buka pencarian lengkap
                </button>
              </div>
            ) : null}

            {results.primary.length ? (
              <SearchGroup label="Pilihan utama">
                <div className={styles.searchPrimaryGrid}>
                  {results.primary.map((item) => (
                    <SearchResultButton
                      key={`${item.kind}-${item.href}`}
                      featured
                      icon={item.kind === "tour" ? <Compass /> : <FileCheck />}
                      title={item.title}
                      description={item.description}
                      onClick={() => go(item.href)}
                    />
                  ))}
                </div>
              </SearchGroup>
            ) : null}

            {results.tours.length && !results.notice ? (
              <SearchGroup label="Produk tour">
                {results.tours.map((item) => (
                  <SearchResultButton
                    key={item.href}
                    icon={<MapPin />}
                    title={item.title}
                    description={[item.statusLabel, item.country, item.dateLabel].filter(Boolean).join(" · ")}
                    onClick={() => go(item.href)}
                  />
                ))}
              </SearchGroup>
            ) : null}

            {!results.primary.some((item) => item.kind === "visa") && results.visa.length ? (
              <SearchGroup label="Layanan visa">
                {results.visa.map((item) => (
                  <SearchResultButton
                    key={item.href}
                    icon={<FileCheck />}
                    title={`Visa ${item.name}`}
                    description="Persyaratan dan bantuan pengurusan visa"
                    onClick={() => go(item.href)}
                  />
                ))}
              </SearchGroup>
            ) : null}

            {results.notice ? (
              <SearchGroup label="Produk tour">
                <p className={styles.searchNotice}>{results.notice}</p>
              </SearchGroup>
            ) : null}

            {results.destinations.length || results.pages.length ? (
              <SearchGroup label="Halaman terkait">
                {results.destinations.map((item) => (
                  <SearchResultButton
                    key={item.href}
                    icon={<Compass />}
                    title={item.name}
                    description={item.region}
                    onClick={() => go(item.href)}
                  />
                ))}
                {results.pages.map((item) => (
                  <SearchResultButton
                    key={item.href}
                    icon={<Compass />}
                    title={item.title}
                    description={item.label}
                    onClick={() => go(item.href)}
                  />
                ))}
              </SearchGroup>
            ) : null}

            {results.articles.length ? (
              <SearchGroup label="Artikel">
                {results.articles.map((item) => (
                  <SearchResultButton
                    key={item.href}
                    icon={<BookOpen />}
                    title={item.title}
                    description={item.label}
                    onClick={() => go(item.href)}
                  />
                ))}
              </SearchGroup>
            ) : null}

            {results.faqs.length ? (
              <SearchGroup label="Pertanyaan">
                {results.faqs.map((item, index) => (
                  <SearchResultButton
                    key={`${item.href}-${index}`}
                    icon={<HelpCircle />}
                    title={item.question}
                    description={item.section}
                    onClick={() => go(item.href)}
                  />
                ))}
              </SearchGroup>
            ) : null}

          </div>

          {hasQuery && total > 0 ? (
            <button
              className={styles.searchAllResults}
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
            >
              Lihat semua hasil
              <ArrowRight aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function SearchGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.searchGroup} aria-label={label}>
      <h3>{label}</h3>
      <div>{children}</div>
    </section>
  );
}

function SearchResultButton({
  icon,
  title,
  description,
  featured = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description?: string | null;
  featured?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${styles.searchResultButton} ${featured ? styles.searchResultFeatured : ""}`}
      type="button"
      onClick={onClick}
    >
      <span className={styles.searchResultIcon} aria-hidden="true">{icon}</span>
      <span>
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <ArrowRight aria-hidden="true" />
    </button>
  );
}
