"use client";

import { useState, useRef } from "react";
import { Upload, X, AlertCircle, Link2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  multiple?: boolean;
}

// Compress & resize image to max 1600px, JPEG quality 85% — keeps under Vercel's 4.5MB limit
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas tidak tersedia")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Gagal membaca gambar"));
    img.src = url;
  });
}

export default function ImageUpload({ value, onChange, folder = "travel", multiple = false }: Props) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [linkText, setLinkText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    // Reject non-image files
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP)");
      setUploading(false);
      return;
    }

    try {
      let uploadFile: File;

      try {
        setProgress("Memproses gambar...");
        const base64 = await compressImage(file);
        // Convert base64 back to File for FormData
        const res0 = await fetch(base64);
        const blob = await res0.blob();
        const baseName = (file.name || "gambar.jpg").replace(/\.[^.]+$/, ".jpg");
        uploadFile = new File([blob], baseName, { type: "image/jpeg" });
      } catch {
        // Compress gagal (misal format HEIC/HEIF dari iOS) — kirim file asli langsung
        uploadFile = file;
      }

      setProgress("Mengupload...");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? `Upload gagal (${res.status})`);
      } else {
        onChange(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload. Coba lagi.");
    }

    setProgress("");
    setUploading(false);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await handleFile(file);
    e.target.value = "";
  }

  function applyLink() {
    const url = linkText.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError("Link harus diawali http:// atau https://");
      return;
    }
    setError(null);
    onChange(url);
    setLinkText("");
  }

  // Tempel (paste) — kalau clipboard berisi gambar (mis. dari WhatsApp) langsung upload
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const imgFile = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (imgFile) {
      e.preventDefault();
      handleFile(imgFile);
    }
  }

  return (
    <div>
      {!multiple && value ? (
        <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div>
          {/* Pilihan: Upload atau Tempel Link */}
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 mb-3">
            <button
              type="button"
              onClick={() => { setMode("upload"); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                mode === "upload"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Upload size={13} /> Upload
            </button>
            <button
              type="button"
              onClick={() => { setMode("link"); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                mode === "link"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Link2 size={13} /> Tempel Link
            </button>
          </div>

          {mode === "upload" ? (
            <div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-60"
              >
                <Upload size={16} />
                {uploading ? progress || "Mengupload..." : multiple ? "Upload Gambar" : "Upload Gambar Hero"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }}
                disabled={uploading}
                placeholder="Tempel link gambar, atau Ctrl/Cmd+V gambar dari WhatsApp"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={applyLink}
                disabled={uploading || !linkText.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40"
              >
                {uploading ? progress || "..." : "Pakai"}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
