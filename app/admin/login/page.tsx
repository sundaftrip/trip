"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import styles from "@/components/admin/AdminWorkspace.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setLogo(d.company_logo || ""));
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
    <div className={styles.login}>
      <div className={styles.loginForm}>
        <Image src={logo || "/logo.png"} alt="Sundaf Trip" width={160} height={48} className="dark:brightness-0 dark:invert" />
        <h1>
          Masuk ke CMS
        </h1>
        <p>
          Gunakan akun tim Sundaf Trip.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="cms-email">
              Email
            </label>
            <input
              type="email"
              id="cms-email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@email.com"
            />
          </div>
          <div>
            <label htmlFor="cms-password">
              Password
            </label>
            <input
              type="password"
              id="cms-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className={styles.loginError} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={styles.primaryButton}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
