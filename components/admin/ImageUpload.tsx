"use client";

import { useState, useRef } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
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
      setProgress("Memproses gambar...");
      const base64 = await compressImage(file);

      // Convert base64 back to File for FormData
      const res0 = await fetch(base64);
      const blob = await res0.blob();
      const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

      setProgress("Mengupload...");
      const formData = new FormData();
      formData.append("file", compressed);
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

  return (
    <div>
      {!multiple && value ? (
        <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-60"
        >
          <Upload size={16} />
          {uploading ? progress || "Mengupload..." : multiple ? "Upload Gambar" : "Upload Gambar Hero"}
        </button>
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
