"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  async function handleLogin() {
    if (loading) return;
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (res.ok) {
        window.location.assign("/homepage");
        return;
      }

      setError(
        res.status === 401
          ? "Email and password don't match with any existing user. Check both and try again."
          : "Something went wrong on our side. Try again in a moment."
      );
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  const inputClass =
    "w-full rounded-[20px] border-1 border-[#00000033] bg-[#f3f3f3] px-3.5 py-3 text-base text-[#0a2638] placeholder:text-slate-500 focus-visible:border-[#4ADEDE] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4ADEDE]/60";


  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(0deg,#f3f3f3,#1ca7ec)] p-6">
      <section
        className="w-full max-w-[400px] rounded-2xl bg-[#1f2f98] px-5 pb-6 pt-7 text-white shadow-[0_20px_50px_rgba(31,47,152,0.35)] sm:px-8 sm:pb-7 sm:pt-9"
        onKeyDown={handleKeyDown}
        aria-labelledby="lg-title"
      >
        <h1 id="lg-title" className="mb-4 text-3xl font-bold leading-tight tracking-tight">
          Log in
        </h1>

        <div className="mb-[18px] flex flex-col gap-2">
          <label htmlFor="lg-email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="lg-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mb-[18px] flex flex-col gap-2">
          <label htmlFor="lg-password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="lg-password"
            type="password"
            autoComplete="off"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border-l-4 border-red-300 bg-red-500/30 px-3 py-2.5 text-sm leading-snug"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-1.5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#4ADEDE,#1AA7EC)] px-6 text-base font-semibold text-[#F3F3F3] hover:enabled:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-65"
        >
          {loading ? "Logging in..." : "Log in"}
          {!loading && (
            <Image src="/login.png"
            alt="log in"
            width={25}
            height={25}
            />
          )}
        </button>

        <p className="mt-[22px] text-center text-sm">
          New here?{" "}
          <a
            href="/register"
            className="font-semibold underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Create an account
          </a>
        </p>
      </section>
    </main>
  );
}