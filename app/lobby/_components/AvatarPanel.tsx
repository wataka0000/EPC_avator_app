import Link from "next/link";
import { cn } from "../../lib/utils";
import type { Snapshot } from "../_types";
import { lobbyClasses as lc } from "./ui";

type SnapshotStatus = "idle" | "generating" | "ready" | "failed";

const statusMeta: Record<
  SnapshotStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  idle: {
    label: "Idle",
    dotClass: "bg-muted-foreground",
    badgeClass: lc.badge.idle,
  },
  generating: {
    label: "Generating",
    dotClass: "animate-pulse bg-primary",
    badgeClass: lc.badge.generating,
  },
  ready: {
    label: "Ready",
    dotClass: "bg-success",
    badgeClass: lc.badge.ready,
  },
  failed: {
    label: "Failed",
    dotClass: "bg-destructive",
    badgeClass: lc.badge.failed,
  },
};

export default function AvatarPanel({
  loading,
  snapshot,
  status,
  errorMessage,
  canRegenerate,
  onRegenerate,
}: {
  loading: boolean;
  snapshot: Snapshot | null;
  status: SnapshotStatus;
  errorMessage: string | null;
  canRegenerate: boolean;
  onRegenerate: () => Promise<void>;
}) {
  const updatedAt = snapshot?.updated_at ? new Date(snapshot.updated_at) : null;
  const hasAssessment = !!snapshot?.latest_assessment_id;
  const imageUrl = snapshot?.image_url ?? null;
  const rank = snapshot?.rank ?? null;
  const errorDetail = snapshot?.error_detail ?? null;
  const errorText = snapshot?.error_message ?? "生成に失敗しました。";
  const isDisabled = !canRegenerate || status === "generating";
  const meta = statusMeta[status];

  return (
    <section className="flex h-full flex-col gap-3">
      {errorMessage ? (
        <section
          className={cn(
            lc.sectionCard,
            "border-destructive/30 bg-destructive/10 px-5 py-3 text-sm text-destructive"
          )}
        >
          システム通知: {errorMessage}
        </section>
      ) : null}

      <div className={cn(lc.contentCard, "flex min-h-0 flex-1 flex-col")}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">My Avatar</h2>
            <p className="text-sm text-muted-foreground">
              {status === "idle" && "スキル入力後にアバターを生成できます。"}
              {status === "generating" && "アバターを生成しています。"}
              {status === "ready" && "最新のアバターが生成されています。"}
              {status === "failed" && "生成に失敗しました。再試行できます。"}
            </p>
          </div>
          <span
            className={cn(lc.badge.base, meta.badgeClass)}
            role="status"
            aria-label={`Avatar status: ${meta.label}`}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)}
              aria-hidden="true"
            />
            {meta.label}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary" />
              <p className="text-sm">読み込み中…</p>
            </div>
          ) : null}

          {!loading && status === "idle" ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted">
                <svg
                  className="h-12 w-12 text-muted-foreground/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  アバターがありません
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  スキル評価を完了してアバターを生成してください
                </p>
              </div>
            </div>
          ) : null}

          {!loading && status === "generating" ? (
            <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
                <div className="absolute inset-2 rounded-full bg-primary/10" />
                <svg
                  className="relative h-11 w-11 animate-spin text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">生成中...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ユニークなアバターを作成しています
                </p>
              </div>
              <div
                className={cn(lc.progressTrack, "relative")}
                role="progressbar"
                aria-label="Generation in progress"
                aria-busy="true"
              >
                <div className={lc.progressIndeterminate} />
              </div>
            </div>
          ) : null}

          {!loading && status === "ready" ? (
            <div className="flex w-full flex-col items-center gap-5">
              <div className={cn(lc.avatarFrame, "h-60 w-60")}>
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="生成されたアバター"
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <svg
                      className="h-20 w-20 text-muted-foreground/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {rank ? (
                <div className="flex flex-col items-center gap-0.5">
                  <p className={lc.rankLabel}>Rank</p>
                  <p className={lc.rankValue}>{rank}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {!loading && status === "failed" ? (
            <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <svg
                  className="h-10 w-10 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{errorText}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  再試行するか、サポートにお問い合わせください。
                </p>
              </div>
              {errorDetail ? (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    技術的な詳細を表示
                  </summary>
                  <pre className="mt-2 max-h-28 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {typeof errorDetail === "string"
                      ? errorDetail
                      : JSON.stringify(errorDetail, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-border px-6 py-4">
          {status === "idle" && !hasAssessment ? (
            <Link className={cn(lc.btnSecondary, "w-full")} href="/skills">
              スキル入力へ
            </Link>
          ) : (
            <button
              onClick={onRegenerate}
              disabled={isDisabled}
              aria-label={
                status === "ready"
                  ? "アバターを再生成"
                  : status === "failed"
                    ? "再試行"
                    : status === "generating"
                      ? "生成中"
                      : "アバターを生成"
              }
              className={cn(
                "w-full",
                status === "failed" && !isDisabled ? lc.btnDestructive : lc.btnPrimary,
                isDisabled ? "cursor-not-allowed" : ""
              )}
            >
              {isDisabled ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {status === "generating" ? "生成中..." : "処理中..."}
                </>
              ) : status === "ready" ? (
                "再生成"
              ) : status === "failed" ? (
                "再試行"
              ) : (
                "アバターを生成"
              )}
            </button>
          )}

          {updatedAt ? (
            <p className="mt-3 text-xs text-muted-foreground">
              最終更新: {updatedAt.toLocaleString("ja-JP")}
            </p>
          ) : null}

          {status === "idle" && !hasAssessment ? (
            <p className="mt-2 text-sm text-muted-foreground">
              先にスキル入力を完了してください。
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
