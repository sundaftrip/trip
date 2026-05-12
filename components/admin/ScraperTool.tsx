"use client";

import { useState, useCallback } from "react";
import { Search, RefreshCw, Rss, BookOpen, ExternalLink } from "lucide-react";
import ScrapedCard, { ScrapedPost } from "./ScrapedCard";

type RewriteStatus = "idle" | "loading" | "done" | "error";

interface PostState extends ScrapedPost {
  rewriteStatus: RewriteStatus;
  rewriteError?: string;
}

export default function ScraperTool() {
  const [keyword, setKeyword] = useState("");

  const [posts, setPosts] = useState<PostState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [tab, setTab] = useState<"search" | "history">("search");
  const [history, setHistory] = useState<
    { id: string; originalTitle: string; status: string; blog?: { id: string; title: string; published: boolean } | null }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleScrape = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    setPosts([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/scraper/reddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengambil data");
        return;
      }

      const mapped: PostState[] = (data.results ?? []).map((p: ScrapedPost) => ({
        ...p,
        rewriteStatus: "idle" as RewriteStatus,
      }));
      setPosts(mapped);
      setTotal(data.total ?? mapped.length);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setError(`Terjadi kesalahan: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const rewritePost = useCallback(async (post: PostState) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.sourceUrl === post.sourceUrl ? { ...p, rewriteStatus: "loading" } : p
      )
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(post.sourceUrl);
      return next;
    });

    try {
      const res = await fetch("/api/scraper/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: post.sourceUrl,
          sourcePlatform: post.sourcePlatform,
          subreddit: post.subreddit,
          originalTitle: post.originalTitle,
          originalBody: post.originalBody,
          coverImage: post.coverImage ?? "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.sourceUrl === post.sourceUrl
              ? { ...p, rewriteStatus: "error", rewriteError: data.error || "Gagal" }
              : p
          )
        );
        return;
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.sourceUrl === post.sourceUrl
            ? { ...p, rewriteStatus: "done", alreadyImported: true, blogId: data.blog?.id }
            : p
        )
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.sourceUrl === post.sourceUrl
            ? { ...p, rewriteStatus: "error", rewriteError: "Gagal koneksi" }
            : p
        )
      );
    }
  }, []);

  const rewriteSelected = useCallback(async () => {
    const toRewrite = posts.filter((p) => selected.has(p.sourceUrl) && !p.alreadyImported);
    for (const post of toRewrite) {
      await rewritePost(post);
    }
  }, [posts, selected, rewritePost]);

  const toggleSelect = useCallback((url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/scraper/items");
      if (res.ok) setHistory(await res.json());
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleTabChange = (t: typeof tab) => {
    setTab(t);
    if (t === "history") loadHistory();
  };

  const availablePosts = posts.filter((p) => !p.alreadyImported);
  const selectedCount = [...selected].filter((url) =>
    posts.find((p) => p.sourceUrl === url && !p.alreadyImported)
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scraper Konten</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ambil postingan perjalanan dari <strong>Reddit</strong> (r/travel, r/solotravel, dll), lalu rewrite dengan AI menjadi artikel blog bergaya pengalaman pribadi.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["search", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              tab === t
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {t === "search" ? "Cari Konten" : "Riwayat Import"}
          </button>
        ))}
      </div>

      {/* ── SEARCH TAB ── */}
      {tab === "search" && (
        <>
          {/* Source info */}
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <Rss className="text-blue-500 shrink-0" size={22} />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Reddit Travel Communities</p>
              <p className="text-xs text-gray-500">r/travel · r/solotravel · r/backpacking — cerita perjalanan nyata dari traveler dunia</p>
            </div>
          </div>

          {/* Search form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Destinasi / Keyword
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {["", "russia", "europe", "japan", "turkey", "bali", "thailand"].map((s) => (
                  <button
                    key={s || "semua"}
                    onClick={() => setKeyword(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition capitalize ${
                      keyword === s
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100"
                    }`}
                  >
                    {s || "Semua"}
                  </button>
                ))}
              </div>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Contoh: russia, japan, turkey, europe..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? "Mengambil data..." : "Cari Konten"}
            </button>
          </div>

          {/* Errors */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Warning */}
          {warning && !error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">{warning}</p>
            </div>
          )}

          {/* Results header + bulk action */}
          {posts.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ditemukan <strong>{total}</strong> konten ({availablePosts.length} belum diimport)
              </p>
              {selectedCount > 0 && (
                <button
                  onClick={rewriteSelected}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                >
                  <RefreshCw size={14} />
                  Rewrite {selectedCount} Terpilih
                </button>
              )}
            </div>
          )}

          {/* Results grid */}
          {posts.length > 0 && (
            <div className="space-y-3">
              {posts.map((post) => (
                <ScrapedCard
                  key={post.sourceUrl}
                  post={post}
                  selected={selected.has(post.sourceUrl)}
                  onToggle={() => toggleSelect(post.sourceUrl)}
                  onRewrite={() => rewritePost(post)}
                />
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Masukkan destinasi lalu klik "Cari Konten" untuk mengambil postingan dari Reddit</p>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {historyLoading ? (
            <div className="text-center py-12">
              <RefreshCw size={24} className="mx-auto animate-spin text-gray-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada konten yang diimport</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.originalTitle}
                  </p>
                  {item.blog && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      Draft: {item.blog.title}{" "}
                      {item.blog.published ? (
                        <span className="text-green-600">(Published)</span>
                      ) : (
                        <span className="text-amber-600">(Draft)</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === "rewritten" || item.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.blog?.id && (
                    <a
                      href={`/admin/blog/${item.blog.id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit draft"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
