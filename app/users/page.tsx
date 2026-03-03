"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, dept, user_snapshots(rank, image_url, updated_at)")
        .limit(50);

      if (error) {
        setMsg(error.message);
        return;
      }
      setRows(data ?? []);
    };
    run();
  }, [router]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">他ユーザー</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          他メンバーの最新アバター状況を確認できます。
        </p>
        {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}
      </div>

      <div className="grid gap-4">
        {rows.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="text-sm font-semibold text-foreground">
              {u.full_name || "(no name)"}
            </div>
            <div className="text-xs text-muted-foreground">{u.dept || ""}</div>
            <div className="mt-3 text-sm text-muted-foreground">
              Rank: {u.user_snapshots?.rank ?? "(未生成)"} / Updated: {u.user_snapshots?.updated_at ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
