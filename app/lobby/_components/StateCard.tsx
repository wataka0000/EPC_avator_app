import type { ReactNode } from "react";
import { badgeBaseClass, panelClass } from "./ui";

const toneBadgeClass: Record<StateTone, string> = {
  idle: "border-border bg-muted text-muted-foreground",
  generating: "border-amber-200 bg-amber-100 text-amber-900",
  ready: "border-emerald-200 bg-emerald-100 text-emerald-900",
  failed: "border-rose-200 bg-rose-100 text-rose-900",
  loading: "border-border bg-muted text-muted-foreground",
};

export type StateTone = "idle" | "generating" | "ready" | "failed" | "loading";

export default function StateCard({
  title,
  description,
  badge,
  tone,
  children,
  footer,
}: {
  title: string;
  description?: string;
  badge?: string;
  tone: StateTone;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={`${panelClass} p-6`} aria-live="polite">
      <div className="mb-6 space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Lobby
        </p>
        {badge ? (
          <div className="flex justify-center">
            <span className={`${badgeBaseClass} ${toneBadgeClass[tone]}`}>
              {badge}
            </span>
          </div>
        ) : null}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
