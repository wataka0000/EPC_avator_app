import StateCard from "./StateCard";
import { buttonClass } from "./ui";

export default function ErrorCard({
  message,
  detail,
  onRetry,
  retryDisabled,
}: {
  message: string;
  detail?: any;
  onRetry?: () => void;
  retryDisabled?: boolean;
}) {
  const hasDetail = detail !== null && detail !== undefined;

  return (
    <StateCard
      title="生成に失敗しました"
      description="一時的な通信エラーの可能性があります。しばらくしてから再試行してください。"
      badge="Failed"
      tone="failed"
    >
      <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200/70 bg-rose-50/70 p-5 text-sm text-rose-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <span className="text-lg font-semibold">!</span>
        </div>
        <p className="text-center font-medium">{message}</p>
      </div>

      {hasDetail ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">技術的な詳細を見る</summary>
          <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
            {typeof detail === "string" ? detail : JSON.stringify(detail, null, 2)}
          </pre>
        </details>
      ) : null}

      {onRetry ? (
        <button
          className={`${buttonClass} w-full max-w-xs gap-2`}
          onClick={onRetry}
          disabled={retryDisabled}
          aria-label="再試行"
        >
          再試行
        </button>
      ) : null}
    </StateCard>
  );
}
