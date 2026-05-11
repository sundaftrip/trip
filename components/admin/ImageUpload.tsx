"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  multiple?: boolean;
}

export default function ImageUpload({ value, onChange, folder = "travel", multiple = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Gagal upload gambar");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Gagal upload gambar. Periksa koneksi internet.");
    }
    setUploading(false);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await handleFile(file);
  }

  return (
    <div>
      {!multiple && value ? (
        <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
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
          {uploading ? "Mengupload..." : multiple ? "Upload Gambar" : "Upload Gambar Hero"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
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
