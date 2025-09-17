"use client";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, callbackUrl: "/" }),
    });
    setLoading(false);
    window.location.href = "/";
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <button disabled={loading} className="underline" type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}


