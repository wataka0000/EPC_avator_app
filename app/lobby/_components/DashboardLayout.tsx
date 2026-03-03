import type { ReactNode } from "react";
import Link from "next/link";
import { tabClass } from "./ui";

export default function DashboardLayout({
  left,
  right,
  currentPath,
}: {
  left: ReactNode;
  right: ReactNode;
  currentPath: string;
}) {
  const tabs = [
    { label: "ロビー", href: "/lobby" },
    { label: "スキル入力", href: "/skills" },
    { label: "他ユーザーのアバター", href: "/users" },
    { label: "設定", href: "/settings" },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-background lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-6 py-6 lg:pb-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Skill Avatar
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Lobby</h1>
          </div>
        </header>

        <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
          {tabs.map((tab) => {
            const isCurrent =
              currentPath === tab.href ||
              (tab.href !== "/" && currentPath.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={tabClass(isCurrent)}
                aria-current={isCurrent ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:h-[calc(100vh-220px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-6">
          <div className="flex min-h-0 flex-col">{left}</div>
          <div className="flex min-h-0 flex-col">{right}</div>
        </div>
      </div>
    </div>
  );
}
