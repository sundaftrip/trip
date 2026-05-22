"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { doPasswordReset, type ResetState } from "@/lib/password-reset";

const INIT: ResetState = { ok: false };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition"
    >
      {pending ? "Menyimpan…" : "Simpan Password Baru"}
    </button>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(doPasswordReset, INIT);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-3 rounded-lg">
          {state.message}
        </p>
        <Link
          href="/admin/login"
          className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password Baru
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className={inputCls}
          placeholder="Minimal 8 karakter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ulangi Password Baru
        </label>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          className={inputCls}
          placeholder="Ketik ulang password"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <SubmitBtn />
    </form>
  );
}
