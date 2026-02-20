"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setExiting(true);
        await new Promise((r) => setTimeout(r, 300));
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-opacity duration-300"
      style={{ background: "var(--bg)", opacity: exiting ? 0 : 1 }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6 border border-white/6"
        style={{ background: "var(--surface)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(43,238,121,0.12)" }}
          >
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ color: "#2bee79", fontVariationSettings: "'FILL' 1" }}
            >
              headphones
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">LocalFM</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Enter your password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
            style={{
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
            style={{ background: "#2bee79", color: "#102217" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
