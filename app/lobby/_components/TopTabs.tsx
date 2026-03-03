"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const tabs = [
  { label: "ロビー", href: "/lobby" },
  { label: "スキル入力", href: "/skills" },
  { label: "他ユーザーのアバター", href: "/users" },
  { label: "設定", href: "/settings" },
];

export function TopTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-border bg-background pt-6"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex w-full max-w-6xl items-end gap-1 px-6">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative rounded-t-lg px-4 py-2.5 text-sm font-medium",
                "transition-colors duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isActive
                  ? "border border-border border-b-card bg-card text-foreground shadow-[0_-1px_4px_rgba(0,0,0,0.04)]"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive ? (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
