"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClients";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) {
      setMsg("EmailとPasswordを入力してください");
      return;
    }

    const res =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (res.error) {
      setMsg(res.error.message);
      return;
    }

    router.push("/lobby");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          アカウントにサインインしてロビーへ進みます。
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setMode("login")}
            className={
              mode === "login"
                ? "rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                : "rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={
              mode === "signup"
                ? "rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                : "rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Email</span>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Password</span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <button
            type="submit"
            className="rounded-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>

          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
