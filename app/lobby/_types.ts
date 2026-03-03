export type Snapshot = {
  user_id: string;
  org_id: string | null;
  latest_assessment_id: string | null;
  rank: string | null;
  radar_json: any | null;
  character_json: any | null;
  image_url: string | null;

  status: "idle" | "queued" | "generating" | "ready" | "failed" | null;
  error_message: string | null;
  error_detail: any | null;
  generation_started_at: string | null;
  generation_finished_at: string | null;
  updated_at: string | null;
};