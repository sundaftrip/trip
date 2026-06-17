"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type B2BCatalogLoginFormProps = {
  showError: boolean;
};

export default function B2BCatalogLoginForm({ showError }: B2BCatalogLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[23rem]">
      <h1 className="text-center text-[1.7rem] font-semibold leading-tight text-gray-950 sm:text-2xl">
        B2B Russia Tour Catalog
      </h1>

      <form action="/api/b2b-catalog/login" method="post" className="mt-7 space-y-3 sm:mt-8">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            required
            placeholder="Password"
            className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white/95 px-4 py-3 pr-14 text-center text-base text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950/20 active:bg-gray-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="min-h-[54px] w-full rounded-xl bg-gray-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-gray-800 active:bg-gray-700"
        >
          Masuk
        </button>
      </form>

      {showError && (
        <p className="mt-4 text-center text-sm font-medium text-red-600">Password tidak valid.</p>
      )}
    </div>
  );
}
