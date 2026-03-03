export const lobbyClasses = {
  container: "min-h-screen bg-background",
  contentWrapper: "mx-auto max-w-screen-xl px-6",

  sectionCard:
    "rounded-xl border border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
  contentCard:
    "rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
  statusCard:
    "rounded-xl border border-primary/20 bg-primary/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]",

  badge: {
    base: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
    idle: "bg-muted text-muted-foreground",
    generating: "border border-primary/20 bg-primary/10 text-primary",
    ready: "border border-success/20 bg-success/10 text-success",
    failed: "border border-destructive/20 bg-destructive/10 text-destructive",
  },

  btnPrimary: [
    "inline-flex items-center justify-center gap-2 rounded-lg",
    "bg-primary text-primary-foreground",
    "px-5 py-2.5 text-sm font-semibold",
    "shadow-sm",
    "transition-[transform,box-shadow,background-color] duration-150 ease-out",
    "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
    "active:translate-y-px active:shadow-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),

  btnSecondary: [
    "inline-flex items-center justify-center gap-2 rounded-lg",
    "border border-border bg-card text-foreground",
    "px-5 py-2.5 text-sm font-semibold",
    "shadow-sm",
    "transition-[transform,box-shadow,background-color] duration-150 ease-out",
    "hover:-translate-y-0.5 hover:bg-muted hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)]",
    "active:translate-y-px active:shadow-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),

  btnDestructive: [
    "inline-flex items-center justify-center gap-2 rounded-lg",
    "border border-destructive/30 bg-destructive/10 text-destructive",
    "px-5 py-2.5 text-sm font-semibold",
    "transition-[transform,box-shadow,background-color] duration-150 ease-out",
    "hover:-translate-y-0.5 hover:bg-destructive/20",
    "active:translate-y-px",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),

  progressTrack: "h-1.5 w-full overflow-hidden rounded-full bg-muted",
  progressFill: "h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
  progressIndeterminate:
    "h-full w-1/2 origin-left animate-[progress-indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-primary",

  avatarFrame:
    "overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
  rankLabel: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
  rankValue: "text-3xl font-bold leading-none text-foreground",
} as const;

// Backward-compatible aliases for existing components.
export const panelClass = lobbyClasses.sectionCard;
export const buttonClass = lobbyClasses.btnSecondary;
export const linkClass =
  "text-sm font-medium text-foreground/80 underline decoration-border underline-offset-4 transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const badgeBaseClass =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide";

export const tabClass = (isCurrent: boolean) =>
  [
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    isCurrent ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-muted",
  ].join(" ");
