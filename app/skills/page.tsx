"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { getFunctionErrorMessage } from "@/lib/supabaseFunctionError";
import { useRouter } from "next/navigation";

type SkillItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  min_value: number;
  max_value: number;
  sort_order: number;
};
type Subdomain = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  skill_items: SkillItem[];
};
type Domain = {
  id: string;
  key: string;
  name: string;
  sort_order: number;
  skill_subdomains: Subdomain[];
};

export default function SkillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setMsg(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("skill_domains")
        .select(
          `
          id, key, name, sort_order,
          skill_subdomains:skill_subdomains (
            id, key, name, sort_order,
            skill_items:skill_items (id, key, name, description, sort_order, min_value, max_value, is_active)
          )
        `
        )
        .order("sort_order", { ascending: true });

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      const filtered = (data ?? []).map((d: any) => ({
        ...d,
        skill_subdomains: (d.skill_subdomains ?? []).map((sd: any) => ({
          ...sd,
          skill_items: (sd.skill_items ?? []).filter((it: any) => it.is_active),
        })),
      })) as Domain[];

      setDomains(filtered);

      const init: Record<string, number> = {};
      for (const d of filtered) {
        for (const sd of d.skill_subdomains) {
          for (const it of sd.skill_items) init[it.id] = 0;
        }
      }
      setValues(init);

      setLoading(false);
    };

    run();
  }, [router]);

  const designDomain = useMemo(
    () => domains.find((d) => d.key === "design") ?? null,
    [domains]
  );

  const onSave = async () => {
    if (saving) return;

    setMsg(null);
    setSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const { data: refreshed, error: refreshErr } =
        await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token ?? session.access_token;

      if (refreshErr) {
        throw new Error(`セッション更新に失敗しました: ${refreshErr.message}`);
      }
      if (!accessToken) {
        throw new Error(
          "ログイン情報（access_token）が取得できません。再ログインしてください。"
        );
      }

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", session.user.id)
        .single();

      if (pErr) throw new Error(pErr.message);
      if (!profile?.org_id)
        throw new Error(
          "org_idが未設定です。管理者がprofiles.org_idを設定してください。"
        );

      const { data: assessment, error: aErr } = await supabase
        .from("skill_assessments")
        .insert({
          user_id: session.user.id,
          org_id: profile.org_id,
          status: "submitted",
        })
        .select("id")
        .single();

      if (aErr) throw new Error(aErr.message);
      if (!assessment?.id) throw new Error("assessment id not returned");

      const rows = Object.entries(values).map(([item_id, value]) => ({
        assessment_id: assessment.id,
        item_id,
        value,
      }));

      const { error: vErr } = await supabase
        .from("skill_assessment_values")
        .insert(rows);

      if (vErr) throw new Error(vErr.message);

      const { error: fnErr } = await supabase.functions.invoke("generate-snapshot", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          assessment_id: assessment.id,
          access_token: accessToken,
        },
      });

      if (fnErr) {
        const detail = await getFunctionErrorMessage(fnErr);
        throw new Error(`generate-snapshot failed: ${detail}`);
      }

      router.push("/lobby");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">スキル入力（0–5）</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          各項目を評価して保存すると、アバター生成が開始されます。
        </p>
        {msg && (
          <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">
            {msg}
          </p>
        )}
      </div>

      {!designDomain ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          設計ドメインが見つかりません（初期データ投入を確認してください）
        </div>
      ) : (
        <section className="grid gap-5">
          {designDomain.skill_subdomains
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((sd) => (
              <div
                key={sd.id}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-foreground">{sd.name}</h2>

                <div className="mt-4 grid gap-4">
                  {sd.skill_items
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((it) => (
                      <div key={it.id} className="grid gap-2">
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {it.name}
                          </div>
                          {it.description && (
                            <div className="text-xs text-muted-foreground">
                              {it.description}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="range"
                            min={it.min_value}
                            max={it.max_value}
                            value={values[it.id] ?? 0}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                [it.id]: Number(e.target.value),
                              }))
                            }
                            className="w-60"
                            disabled={saving}
                          />
                          <input
                            type="number"
                            min={it.min_value}
                            max={it.max_value}
                            value={values[it.id] ?? 0}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                [it.id]: Number(e.target.value),
                              }))
                            }
                            className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                            disabled={saving}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </section>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-6 rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "保存中..." : "保存してロビーへ"}
      </button>
    </main>
  );
}
