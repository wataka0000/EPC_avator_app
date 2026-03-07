"use client";

import { TopTabs } from "../lobby/_components/TopTabs";

export default function PageHeaderWithTabs({ title }: { title: string }) {
  return (
    <>
      <header className="mx-auto w-full max-w-6xl px-6 pb-0 pt-8">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Skill Avatar
        </p>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      </header>
      <TopTabs />
    </>
  );
}
