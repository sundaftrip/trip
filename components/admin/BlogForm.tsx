"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import StickyFormActions from "./StickyFormActions";
import slugify from "slugify";

interface BlogData {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  cover?: string;
  category?: string;
  author?: string;
  body?: string;
  readTime?: string;
  published?: boolean;
}

export default function BlogForm({ post }: { post?: BlogData }) {
  const router = useRouter();
  const isEdit = !!post?.id;
  const [loading, setLoading] = useState(false);
  // Tiptap drops script elements while loading content, including FAQ JSON-LD.
  // Keep these articles out of the visual editor from the very first render.
  const [htmlMode, setHtmlMode] = useState(() => /<script\b/i.test(post?.body ?? ""));
  const htmlModeRef = useRef(htmlMode);
  const [form, setForm] = useState<BlogData>({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    cover: post?.cover ?? "",
    category: post?.category ?? "",
    author: post?.author ?? "",
    body: post?.body ?? "",
    readTime: post?.readTime ?? "",
    published: post?.published ?? false,
  });

  function set(key: keyof BlogData, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function enableHtmlMode() {
    // Ignore any final visual-editor update emitted before it unmounts.
    htmlModeRef.current = true;
    setHtmlMode(true);
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!isEdit) {
      set("slug", slugify(title, { lower: true, strict: true }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(isEdit ? `/api/blog/${post!.id}` : "/api/blog", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push("/admin/blog");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Buat Artikel"}
        cancelHref="/admin/blog"
      />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label mb-1">Judul *</label>
            <input required className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Judul artikel" />
          </div>
          <div>
            <label className="label mb-1">Slug *</label>
            <input required className="input font-mono text-sm" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="url-artikel" />
          </div>
          <div>
            <label className="label mb-1">Kategori</label>
            <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="cth: Umroh, Travel Tips" />
          </div>
          <div>
            <label className="label mb-1">Penulis</label>
            <input className="input" value={form.author} onChange={(e) => set("author", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Estimasi Baca</label>
            <input className="input" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} placeholder="cth: 5 menit" />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1">Ringkasan</label>
            <textarea className="input min-h-[80px]" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Deskripsi singkat artikel" />
          </div>
        </div>

        <div>
          <label className="label mb-2">Cover</label>
          <ImageUpload value={form.cover ?? ""} onChange={(url) => set("cover", url)} folder="blog" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="published" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-300">Publish artikel</label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="label">Konten *</span>
          {!htmlMode && (
            <button type="button" onClick={enableHtmlMode} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600">
              Edit HTML
            </button>
          )}
        </div>
        {htmlMode ? (
          <div className="space-y-2">
            <label htmlFor="blog-body-html" className="label">Sumber HTML</label>
            <p id="blog-body-html-help" className="text-sm text-gray-600 dark:text-gray-400">
              HTML disimpan apa adanya, termasuk data FAQ. Mode visual dinonaktifkan selama sesi ini agar kode tidak terhapus.
            </p>
            <textarea
              id="blog-body-html"
              aria-describedby="blog-body-html-help"
              className="input min-h-[480px] font-mono text-sm"
              spellCheck={false}
              value={form.body ?? ""}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>
        ) : (
          <RichTextEditor value={form.body ?? ""} onChange={(val) => {
            if (!htmlModeRef.current) set("body", val);
          }} />
        )}
      </div>

    </form>
  );
}
