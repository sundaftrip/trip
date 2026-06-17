"use client";

import { useRef, useState } from "react";
import { Download, Eye, EyeOff, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";

type CatalogDocument = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type CatalogPassword = {
  id: string;
  label: string;
  active: boolean;
  lastUsedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type UploadSignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
  uniqueFilename: string;
  useFilename: string;
};

function formatBytes(value: number) {
  if (!value) return "-";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi error.";
}

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Request gagal (${res.status})`);
  return data as T;
}

function DocumentRow({
  document,
  onUpdate,
  onDelete,
}: {
  document: CatalogDocument;
  onUpdate: (document: CatalogDocument) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(document.title);
  const [sortOrder, setSortOrder] = useState(String(document.sortOrder));
  const [active, setActive] = useState(document.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/b2b-catalog/admin/documents/${document.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sortOrder: Number(sortOrder), active }),
      });
      onUpdate(await readJson<CatalogDocument>(res));
    } catch (err) {
      setError(asErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Hapus PDF "${document.title}" dari katalog?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/b2b-catalog/admin/documents/${document.id}`, { method: "DELETE" });
      await readJson<{ success: boolean }>(res);
      onDelete(document.id);
    } catch (err) {
      setError(asErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 border-b border-gray-100 px-4 py-4 last:border-0 dark:border-gray-700 lg:grid-cols-[minmax(220px,1fr)_100px_110px_190px] lg:items-center">
      <div className="min-w-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <p className="mt-1 truncate text-xs text-gray-400">{document.fileName} · {formatBytes(document.fileSize)}</p>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <input
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />

      <button
        type="button"
        onClick={() => setActive((value) => !value)}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {active ? <Eye size={15} /> : <EyeOff size={15} />}
        {active ? "Aktif" : "Nonaktif"}
      </button>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Download size={15} />
          Buka
        </a>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-300"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function PasswordRow({
  password,
  onUpdate,
  onDelete,
}: {
  password: CatalogPassword;
  onUpdate: (password: CatalogPassword) => void;
  onDelete: (id: string) => void;
}) {
  const [label, setLabel] = useState(password.label);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [active, setActive] = useState(password.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/b2b-catalog/admin/passwords/${password.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, password: newPassword, active }),
      });
      onUpdate(await readJson<CatalogPassword>(res));
      setNewPassword("");
    } catch (err) {
      setError(asErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Hapus akses "${password.label}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/b2b-catalog/admin/passwords/${password.id}`, { method: "DELETE" });
      await readJson<{ success: boolean }>(res);
      onDelete(password.id);
    } catch (err) {
      setError(asErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 border-b border-gray-100 px-4 py-4 last:border-0 dark:border-gray-700 lg:grid-cols-[minmax(180px,1fr)_180px_110px_150px_190px] lg:items-center">
      <div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div className="relative">
        <input
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password baru"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword((value) => !value)}
          aria-label={showNewPassword ? "Sembunyikan password baru" : "Lihat password baru"}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setActive((value) => !value)}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {active ? "Aktif" : "Nonaktif"}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400">Terakhir: {formatDate(password.lastUsedAt)}</p>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-300"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function B2BCatalogManager({
  initialDocuments,
  initialPasswords,
}: {
  initialDocuments: CatalogDocument[];
  initialPasswords: CatalogPassword[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [passwords, setPasswords] = useState(initialPasswords);
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [agentLabel, setAgentLabel] = useState("");
  const [agentPassword, setAgentPassword] = useState("");
  const [showAgentPassword, setShowAgentPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setUploadError("Judul PDF wajib diisi.");
      return;
    }
    if (!file) {
      setUploadError("Pilih file PDF dulu.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("File harus PDF.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const sigRes = await fetch("/api/b2b-catalog/admin/upload-signature", { method: "POST" });
      const signature = await readJson<UploadSignature>(sigRes);

      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("api_key", signature.apiKey);
      cloudForm.append("timestamp", String(signature.timestamp));
      cloudForm.append("signature", signature.signature);
      cloudForm.append("folder", signature.folder);
      cloudForm.append("use_filename", signature.useFilename);
      cloudForm.append("unique_filename", signature.uniqueFilename);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/raw/upload`, {
        method: "POST",
        body: cloudForm,
      });
      const cloudData = await readJson<{ secure_url: string }>(cloudRes);

      const createRes = await fetch("/api/b2b-catalog/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          fileUrl: cloudData.secure_url,
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          fileSize: file.size,
          sortOrder: Number(sortOrder),
          active: true,
        }),
      });
      const created = await readJson<CatalogDocument>(createRes);
      setDocuments((items) => [created, ...items].sort((a, b) => a.sortOrder - b.sortOrder));
      setTitle("");
      setSortOrder("0");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setUploadError(asErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function createPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/b2b-catalog/admin/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: agentLabel, password: agentPassword, active: true }),
      });
      const created = await readJson<CatalogPassword>(res);
      setPasswords((items) => [created, ...items]);
      setAgentLabel("");
      setAgentPassword("");
    } catch (err) {
      setPasswordError(asErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Upload size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Upload PDF</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">File dikirim langsung ke Cloudinary, lalu judulnya tampil di katalog agen.</p>
            </div>
          </div>

          <form onSubmit={uploadDocument} className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_90px_minmax(220px,1fr)_auto]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul PDF di katalog"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:file:bg-gray-700 dark:file:text-gray-200"
            />
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {uploading ? "Upload..." : "Tambah"}
            </button>
          </form>
          {uploadError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <FileText size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Password Agen</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Satu halaman yang sama, password berbeda per travel agent.</p>
            </div>
          </div>

          <form onSubmit={createPassword} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
            <input
              value={agentLabel}
              onChange={(e) => setAgentLabel(e.target.value)}
              placeholder="Nama agent"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <div className="relative">
              <input
                type={showAgentPassword ? "text" : "password"}
                value={agentPassword}
                onChange={(e) => setAgentPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowAgentPassword((value) => !value)}
                aria-label={showAgentPassword ? "Sembunyikan password" : "Lihat password"}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                {showAgentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Buat
            </button>
          </form>
          {passwordError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">PDF Katalog</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{documents.length} dokumen tersimpan</p>
          </div>
          <a
            href="/b2b-russia-catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Eye size={15} />
            Preview
          </a>
        </div>
        {documents.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">Belum ada PDF.</div>
        ) : (
          documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onUpdate={(next) => setDocuments((items) => items.map((item) => item.id === next.id ? next : item).sort((a, b) => a.sortOrder - b.sortOrder))}
              onDelete={(id) => setDocuments((items) => items.filter((item) => item.id !== id))}
            />
          ))
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Daftar Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Password tersimpan sebagai hash dan tidak ditampilkan ulang.</p>
        </div>
        {passwords.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">Belum ada password agen.</div>
        ) : (
          passwords.map((password) => (
            <PasswordRow
              key={password.id}
              password={password}
              onUpdate={(next) => setPasswords((items) => items.map((item) => item.id === next.id ? next : item))}
              onDelete={(id) => setPasswords((items) => items.filter((item) => item.id !== id))}
            />
          ))
        )}
      </section>
    </div>
  );
}
