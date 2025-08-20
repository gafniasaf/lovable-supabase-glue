"use client";
import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import Trans from "@/lib/i18n/Trans";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6" aria-labelledby="login-title">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold" id="login-title"><Trans keyPath="auth.signin" fallback="Sign in" /></h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <label className="sr-only" htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label className="sr-only" htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white py-2 rounded disabled:opacity-50" disabled={loading} aria-labelledby="login-title">
          {loading ? "Signing in..." : <Trans keyPath="auth.signin" fallback="Sign in" />}
        </button>
        <p className="text-sm text-gray-600">
          No account? <Link className="underline" href="#">Ask admin</Link>
        </p>
        <p className="text-sm text-gray-600">
          Want to sign out? Use the header &quot;Sign out&quot; button, or
          <button
            type="button"
            className="underline ml-1"
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
          >logout now</button>.
        </p>
      </form>
    </section>
  );
}


