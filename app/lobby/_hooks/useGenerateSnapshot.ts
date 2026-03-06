"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { getFunctionErrorMessage } from "@/lib/supabaseFunctionError";

export function useGenerateSnapshot() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (assessmentId: string) => {
    setSubmitting(true);
    setError(null);

    const { data: s } = await supabase.auth.getSession();
    const { data: refreshed, error: refreshErr } =
      await supabase.auth.refreshSession();
    const accessToken = refreshed.session?.access_token ?? s.session?.access_token;
    if (refreshErr) {
      setSubmitting(false);
      setError(`Session refresh failed: ${refreshErr.message}`);
      return;
    }
    if (!accessToken) {
      setSubmitting(false);
      setError("Not authenticated");
      return;
    }

    try {
      const { error: fnErr } = await supabase.functions.invoke("generate-snapshot", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          assessment_id: assessmentId,
          access_token: accessToken, // 現仕様の互換性維持
        },
      });

      if (fnErr) {
        throw new Error(await getFunctionErrorMessage(fnErr));
      }
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return { generate, submitting, error };
}
