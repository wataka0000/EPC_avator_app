import { createClient } from "@supabase/supabase-js";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function j(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function setSnapshotStatus(
  admin: any,
  userId: string,
  patch: Record<string, any>
) {
  // upsertで「行が無い」ケースにも対応（初回ユーザー）
  const { error } = await admin.from("user_snapshots").upsert({
    user_id: userId,
    ...patch,
  });
  if (error) console.error("setSnapshotStatus error:", error.message);
}

function toBlueprintMotif(name: string) {
  const n = name.toLowerCase();
  // P&ID
  if (n.includes("p&id") || n.includes("pid")) {
    return "a faint P&ID blueprint overlay in the background with pipes, valves, and instrumentation symbols; no readable text";
  }
  // 配管
  if (n.includes("配管") || n.includes("piping")) {
    return "a faint piping isometric blueprint overlay in the background with pipe runs and valve/flange silhouettes; no readable text";
  }
  // プロセス
  if (n.includes("プロセス") || n.includes("process")) {
    return "a faint process flow diagram blueprint overlay in the background with blocks and arrows; no readable text";
  }

  // デフォルト（汎用）
  return `a faint technical blueprint motif related to "${name}" in the background; no readable text`;
}

Deno.serve(async (req) => {
  console.log("generate-snapshot: VERSION=2026-02-18-A (no auth header required)");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return j({ error: "Method not allowed" }, 405);

  try {
    // Prefer Supabase-managed defaults to avoid mismatched custom secrets.
    const PROJECT_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
    const SERVICE_ROLE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
    if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
      return j({ error: "Missing PROJECT_URL or SERVICE_ROLE_KEY" }, 500);
    }

    const body = await req.json().catch(() => ({} as any));
    const assessmentId = body?.assessment_id as string | undefined;
    const accessTokenFromBody = body?.access_token as string | undefined;
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const accessTokenFromHeader =
      authHeader?.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : undefined;
    const accessToken = accessTokenFromHeader || accessTokenFromBody;

    if (!assessmentId) return j({ code: 400, message: "assessment_id is required" }, 400);
    if (!accessToken) return j({ code: 401, message: "access_token is required" }, 401);

    const admin = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ✅ ここが肝：Authorizationヘッダ不要。bodyのaccess_tokenでユーザー特定
    const { data: userRes, error: userErr } = await admin.auth.getUser(accessToken);
    if (userErr || !userRes?.user) {
      return j({ code: 401, message: "Invalid JWT", detail: userErr?.message ?? null }, 401);
    }
    const userId = userRes.user.id;

    // 連打防止：生成中なら拒否
    const { data: snapNow, error: snapErr } = await admin
      .from("user_snapshots")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (snapErr) return j({ error: snapErr.message }, 500);

    if (snapNow?.status === "generating") {
      return j({ ok: false, code: 409, message: "Already generating" }, 409);
    }

    // assessment 所有チェック
    const { data: assessment, error: aErr } = await admin
      .from("skill_assessments")
      .select("id, user_id, org_id")
      .eq("id", assessmentId)
      .maybeSingle();

    if (aErr) return j({ error: aErr.message }, 500);
    if (!assessment) return j({ error: "assessment not found" }, 404);
    if (assessment.user_id !== userId) return j({ error: "forbidden" }, 403);

    // values取得
    const { data: vals, error: vErr } = await admin
    .from("skill_assessment_values")
    .select(`
      value,
      skill_items:skill_items (
        id, name, key,
        skill_subdomains:skill_subdomains ( id, name, key )
      )
    `)
    .eq("assessment_id", assessmentId);

    const enriched = (vals ?? []).map((v: any) => ({
      value: Number(v.value),
      item_name: v.skill_items?.name ?? "Unknown",
      item_key: v.skill_items?.key ?? null,
      subdomain_name: v.skill_items?.skill_subdomains?.name ?? null,
      subdomain_key: v.skill_items?.skill_subdomains?.key ?? null,
    }));

    const top = enriched
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, 3); // 上位3つ


    // 高スコア（例：4以上）のものだけ背景に反映
    const motifs = top
      .filter((t) => t.value >= 4)
      .map((t) => toBlueprintMotif(t.item_name));

    const blueprintLine = motifs.length
      ? `Background: ${motifs.join(" ; ")}.`
      : `Background: a subtle generic engineering blueprint grid, no readable text.`;



    if (vErr) return j({ error: vErr.message }, 500);
    if (!vals || vals.length === 0) return j({ error: "no values found" }, 400);

    const values = vals.map((x) => Number(x.value));
    const avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);

    const rank = avg >= 4 ? "Gold" : avg >= 3 ? "Silver" : "Bronze";
    const radar_json = { design: Number(avg.toFixed(2)) };
    const character_json = {
      status: "ready",
      avg: Number(avg.toFixed(2)),
      type: avg >= 4 ? "expert" : avg >= 3 ? "balanced" : "learner",
      updated_by: "edge_function",
    };

    // --- OpenAI 画像生成 ---
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      await setSnapshotStatus(admin, userId, {
        status: "failed",
        error_message: "Missing OPENAI_API_KEY",
        error_detail: { message: "OPENAI_API_KEY is not set" },
        generation_finished_at: new Date().toISOString(),
      });
      return j({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    await setSnapshotStatus(admin, userId, {
      org_id: assessment.org_id,
      latest_assessment_id: assessmentId,
      status: "generating",
      error_message: null,
      error_detail: null,
      generation_started_at: new Date().toISOString(),
      generation_finished_at: null,
    });

    // プロンプト（まずはMVPでシンプルに）
    const prompt =
    `Create a single character avatar illustration. ` +
    `Style: clean, modern, friendly, game-like, high quality. ` +
    `Character centered, simple plain background. ` +
    `Rank: ${rank}. Archetype: ${character_json.type}. ` +
    `${blueprintLine} ` +
    `The blueprint overlay must be very faint (like a watermark), behind the character. ` +
    `No readable text, no letters, no numbers, no logos.`;


    const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",        // または "gpt-image-1.5"
        prompt,
        size: "1024x1024",
        output_format: "png",
      }),
    });

    const imgJson = await imgRes.json().catch(() => ({}));
    //openaiのレスポンスは成功してもエラー情報が入ることがあるので、両方チェック
    if (!imgRes.ok) {
    await setSnapshotStatus(admin, userId, {
      status: "failed",
      error_message: "OpenAI image generation failed",
      error_detail: imgJson,
      generation_finished_at: new Date().toISOString(),
    });
    return j({ error: "OpenAI image generation failed", detail: imgJson }, 500);
    }

    // gpt-image 系は data[0].b64_json が返る想定
    const b64 = imgJson?.data?.[0]?.b64_json;
    if (!b64) {
      await setSnapshotStatus(admin, userId, {
        status: "failed",
        error_message: "No b64_json returned from OpenAI",
        error_detail: imgJson,
        generation_finished_at: new Date().toISOString(),
      });
      return j({ error: "No b64_json returned from OpenAI", detail: imgJson }, 500);
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const filePath = `${userId}/${assessmentId}.png`;

    // --- Storage に保存 ---
    const { error: upErr } = await admin.storage
      .from("avatars")
      .upload(filePath, bytes, { contentType: "image/png", upsert: true });

      // 失敗したらステータスを「failed」にしてエラー内容も保存
      if (upErr) {
      await setSnapshotStatus(admin, userId, {
        status: "failed",
        error_message: "Storage upload failed",
        error_detail: { message: upErr.message },
        generation_finished_at: new Date().toISOString(),
      });
      return j({ error: "Storage upload failed", detail: upErr.message }, 500);
    }

    // public bucket 前提：public URL を作る
    const { data: pub } = admin.storage.from("avatars").getPublicUrl(filePath);
    const image_url = pub.publicUrl;


    const { error: sErr } = await admin.from("user_snapshots").upsert({
      user_id: userId,
      org_id: assessment.org_id,
      latest_assessment_id: assessmentId,
      rank,
      radar_json,
      character_json: { ...character_json, status: "ready" },
      image_url,
      status: "ready",
      error_message: null,
      error_detail: null,
      generation_finished_at: new Date().toISOString(),
    });

    // 失敗したらステータスを「failed」にしてエラー内容も保存
    if (sErr) {
      await setSnapshotStatus(admin, userId, {
        status: "failed",
        error_message: "DB upsert failed",
        error_detail: { message: sErr.message },
        generation_finished_at: new Date().toISOString(),
      });
      return j({ error: sErr.message }, 500);
    }

    return j({ ok: true, rank, radar_json });
  } 
  catch (e) {
    return j({ error: String(e) }, 500);
  }
});
