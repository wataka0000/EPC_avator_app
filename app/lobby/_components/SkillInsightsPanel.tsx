import { useMemo } from "react";
import { cn } from "../../lib/utils";
import type { Snapshot } from "../_types";
import RadarChart, { type RadarValue } from "./RadarChart";
import TopSkillsList from "./TopSkillsList";
import { lobbyClasses as lc } from "./ui";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value) ? value : null;

const extractSkills = (snapshot: Snapshot | null): RadarValue[] => {
  if (!snapshot) return [];

  const entries: RadarValue[] = [];
  const radar = snapshot.radar_json;
  const character = snapshot.character_json;

  if (radar && typeof radar === "object") {
    for (const [key, value] of Object.entries(radar as Record<string, unknown>)) {
      const num = toNumber(value);
      if (num !== null) entries.push({ label: key, value: num });
    }
  }

  if (entries.length === 0 && character && typeof character === "object") {
    const possibleMaps = [
      (character as any).skills,
      (character as any).skill_map,
      (character as any).skillMap,
    ];

    for (const map of possibleMaps) {
      if (map && typeof map === "object") {
        for (const [key, value] of Object.entries(map)) {
          const num = toNumber(value);
          if (num !== null) entries.push({ label: key, value: num });
        }
      }
    }
  }

  return entries;
};

const formatSummary = (skills: RadarValue[]) => {
  if (skills.length === 0) return null;
  const top = skills[0];
  const avg = skills.reduce((sum, item) => sum + item.value, 0) / skills.length;
  const level = avg >= 4 ? "高い" : avg >= 3 ? "良好な" : "発展中の";
  return `最も得意なスキルは ${top.label}（${clamp(
    top.value,
    0,
    5
  ).toFixed(1)}/5.0）です。上位5スキルの平均習熟度は ${avg.toFixed(
    1
  )}/5.0 で、${level}スキルセットです。`;
};

export default function SkillInsightsPanel({ snapshot }: { snapshot: Snapshot | null }) {
  const skills = useMemo(
    () =>
      extractSkills(snapshot)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [snapshot]
  );

  const hasSkills = skills.length > 0;
  const summary = useMemo(() => formatSummary(skills), [skills]);

  return (
    <section className="flex h-full flex-col gap-3">
      <div className={cn(lc.contentCard, "flex min-h-0 flex-1 flex-col")}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Skill Insights</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">上位スキルと傾向のサマリー</p>
          </div>
          {hasSkills ? (
            <span
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
              aria-label={`Top ${skills.length} skills shown`}
            >
              TOP {skills.length}
            </span>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!hasSkills ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <span className="text-xl text-muted-foreground">★</span>
              </div>
              <p className="text-sm font-semibold text-foreground">スキルデータなし</p>
              <p className="text-sm text-muted-foreground">
                スキル評価を完了するとここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              <section aria-labelledby="top-skills-heading">
                <h3
                  id="top-skills-heading"
                  className="mb-3 text-sm font-semibold text-foreground"
                >
                  Top 5 Skills
                </h3>
                <TopSkillsList skills={skills} />
              </section>

              <section aria-labelledby="radar-heading">
                <h3
                  id="radar-heading"
                  className="mb-3 text-sm font-semibold text-foreground"
                >
                  Skill Profile
                </h3>
                <div className="flex items-center justify-center rounded-xl bg-muted/30 py-4">
                  <RadarChart values={skills} size={240} />
                </div>
              </section>

              {summary ? (
                <section aria-labelledby="summary-heading">
                  <h3
                    id="summary-heading"
                    className="mb-2 text-sm font-semibold text-foreground"
                  >
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
