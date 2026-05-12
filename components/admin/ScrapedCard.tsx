"use client";

import { ExternalLink, RefreshCw, CheckCircle, Clock, Sparkles } from "lucide-react";

export interface ScrapedPost {
  sourceUrl: string;
  sourcePlatform: string;
  subreddit?: string;
  originalTitle: string;
  originalBody: string;
  coverImage?: string;
  score?: number;
  author?: string;
  numComments?: number;
  alreadyImported: boolean;
  importStatus?: string | null;
  blogId?: string | null;
  isAiGenerated?: boolean;
  rewriteStatus?: "idle" | "loading" | "done" | "error";
  rewriteError?: string;
}

interface Props {
  post: ScrapedPost;
  selected: boolean;
  onToggle: () => void;
  onRewrite: () => void;
}

export default function ScrapedCard({ post, selected, onToggle, onRewrite }: Props) {
  const isDone = post.rewriteStatus === "done" || post.alreadyImported;
  const isLoading = post.rewriteStatus === "loading";

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isDone
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
          : selected
          ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {/* Checkbox + status badge */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          disabled={isDone || isLoading}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
              {post.originalTitle}
            </h3>
            {post.isAiGenerated ? (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded font-medium">
                <Sparkles size={11} /> AI
              </span>
            ) : (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-gray-400 hover:text-blue-500 transition"
                title="Lihat sumber"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="capitalize bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-medium">
              {post.isAiGenerated ? "AI Idea" : post.sourcePlatform}
            </span>
            {!post.isAiGenerated && post.subreddit && <span>r/{post.subreddit}</span>}
            {!post.isAiGenerated && post.score != null && <span>↑ {post.score.toLocaleString()}</span>}
            {!post.isAiGenerated && post.numComments != null && <span>{post.numComments} komentar</span>}
          </div>

          {/* Preview */}
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-3">
            {post.originalBody}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isDone ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                <CheckCircle size={13} />
                {post.blogId ? (
                  <a href={`/admin/blog/${post.blogId}`} className="underline hover:no-underline">
                    Sudah diimport — Edit draft
                  </a>
                ) : (
                  "Sudah diimport"
                )}
              </span>
            ) : isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <RefreshCw size={13} className="animate-spin" />
                Sedang ditulis ulang…
              </span>
            ) : (
              <button
                onClick={onRewrite}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <RefreshCw size={12} />
                Rewrite dengan AI
              </button>
            )}

            {post.rewriteStatus === "error" && (
              <span className="text-xs text-red-500">{post.rewriteError || "Gagal"}</span>
            )}

            {post.importStatus === "pending" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Clock size={12} /> Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
