"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import Trans from "@/lib/i18n/Trans";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    // Use Next router for smoother client navigation and to avoid adding /login to history
    try { router.replace("/dashboard"); router.refresh(); } catch { window.location.href = "/dashboard"; }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6" aria-labelledby="login-title">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-black text-white grid place-items-center text-xs font-bold">EC</div>
            <div>
              <h1 className="text-xl font-semibold" id="login-title"><Trans keyPath="auth.signin" fallback="Sign in" /></h1>
              <p className="text-sm text-gray-600">Welcome back. Please enter your credentials.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <div className="mb-3 text-sm text-red-600" role="alert">{error}</div> : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </FormField>
            <FormField label="Password" htmlFor="password">
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </FormField>
            <Button className="w-full" disabled={loading} aria-labelledby="login-title">{loading ? 'Signing in…' : <Trans keyPath="auth.signin" fallback="Sign in" />}</Button>
            <p className="text-xs text-gray-600">No account? <Link className="underline" href="#">Ask admin</Link></p>
            <p className="text-xs text-gray-600">Want to sign out? Use the header &quot;Sign out&quot; button, or <button type="button" className="underline" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}>logout now</button>.</p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}


