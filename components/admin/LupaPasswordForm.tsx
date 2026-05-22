"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/lib/password-reset";

const INIT: ResetState = { ok: false };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition"
    >
      {pending ? "Memproses…" : "Buat Link Reset"}
    </button>
  );
}

export default function LupaPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, INIT);

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Masukkan email akun CMS Anda. Link reset password akan langsung muncul di layar.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="email@anda.com"
        />
      </div>

      {state.message && (
        <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          {state.message}
        </p>
      )}

      {state.link && (
        <div className="space-y-2 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">
            Link reset password Anda
          </p>
          <a
            href={state.link}
            className="block break-all rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono text-blue-700 dark:text-blue-400 hover:underline"
          >
            {state.link}
          </a>
          <p className="text-[11px] leading-relaxed text-orange-700/80 dark:text-orange-300/80">
            Klik link di atas untuk membuat password baru. Link berlaku 1 jam dan
            hanya bisa dipakai sekali.
          </p>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <SubmitBtn />
      <Link
        href="/admin/login"
        className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Kembali ke halaman login
      </Link>
    </form>
  );
}
