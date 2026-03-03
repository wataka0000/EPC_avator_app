"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import type { Snapshot } from "../_types";

const SELECT = `
  user_id, org_id, latest_assessment_id, rank, radar_json, character_json, image_url,
  status, error_message, error_detail, generation_started_at, generation_finished_at, updated_at
`;

export function useLobbySnapshot(userId: string | null) {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);

  const fetchOnce = useMemo(() => {
    return async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("user_snapshots")
        .select(SELECT)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setSnapshot((data as Snapshot) ?? null);
    };
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        await fetchOnce();
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message ?? String(e));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }

      // Realtime購読（user_snapshotsの更新だけ）
      const channel = supabase
        .channel(`lobby-snapshot-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_snapshots",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const next = (payload.new ?? null) as Snapshot | null;
            // payload.newはselect項目の制限が無いので、そのまま入れ替えでOK
            setSnapshot(next);
          }
        )
        .subscribe((status) => {
          // Realtimeが死んでる/繋がらない場合の保険（簡易ポーリング）
          if (status === "SUBSCRIBED") return;

          if (pollingRef.current == null) {
            pollingRef.current = window.setInterval(async () => {
              try {
                await fetchOnce();
              } catch {
                // ポーリング失敗は無視（UIは維持）
              }
            }, 2500);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = start();

    return () => {
      mounted = false;
      // ポーリング停止
      if (pollingRef.current != null) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      // チャンネル停止は start内のreturnで行う想定だが、ここでは簡潔に
      void cleanupPromise;
    };
  }, [userId, fetchOnce]);

  return { loading, snapshot, error, refetch: fetchOnce };
}