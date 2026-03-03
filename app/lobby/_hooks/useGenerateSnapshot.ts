"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClients";

export function useGenerateSnapshot() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (assessmentId: string) => {
    setSubmitting(true);
    setError(null);

    const { data: s } = await supabase.auth.getSession();
    const accessToken = s.session?.access_token;
    if (!accessToken) {
      setSubmitting(false);
      setError("Not authenticated");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-snapshot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessment_id: assessmentId,
            access_token: accessToken, // あなたの現仕様に合わせる
          }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // 409 already generating など
        throw new Error(json?.message ?? json?.error ?? `Request failed: ${res.status}`);
      }
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return { generate, submitting, error };
}