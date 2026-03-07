"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { useRouter } from "next/navigation";
import PageHeaderWithTabs from "../_components/PageHeaderWithTabs";

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
    <div className="min-h-screen bg-background">
      <PageHeaderWithTabs title="他ユーザーのアバター" />
      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="mb-6">
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
    </div>
  );
}
