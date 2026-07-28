"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : {})
      .then((data: unknown) => {
        const companyLogo =
          data && typeof data === "object" && "company_logo" in data
            ? (data as { company_logo?: unknown }).company_logo
            : "";
        setLogo(typeof companyLogo === "string" ? companyLogo : "");
      })
      .catch(() => {
        // Logo bawaan tetap dipakai bila pengaturan belum dapat dimuat.
      });
    return () => controller.abort();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      window.location.assign("/admin");
    }
  }

  return (
    <div className="admin-login min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="admin-login-card w-full max-w-md bg-white/95 p-6 backdrop-blur-xl dark:bg-gray-900/95 sm:p-9">
        <div className="mb-8 flex items-center justify-between">
          <Image src={logo || "/logo.png"} alt="Logo Sundaf Trip" width={150} height={46} className="h-11 w-auto dark:brightness-0 dark:invert" />
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <ShieldCheck size={19} strokeWidth={1.7} />
          </span>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
          Sundaf Content OS
        </p>
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-gray-900 dark:text-white">
          Kelola perjalanan dengan tenang.
        </h1>
        <p className="mb-8 mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Masuk untuk memperbarui katalog, itinerary, visa, artikel, dan informasi operasional Sundaf.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/30 focus:border-teal-700 outline-none transition"
              placeholder="admin@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/30 focus:border-teal-700 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-3 text-white font-semibold transition hover:bg-teal-900 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk ke CMS"}
            {!loading && <ArrowRight size={16} strokeWidth={1.8} />}
          </button>
        </form>
        <p className="mt-7 border-t border-gray-200 pt-5 text-center text-xs text-gray-400 dark:border-gray-700">
          Akses internal Sundaf Trip
        </p>
      </div>
    </div>
  );
}
