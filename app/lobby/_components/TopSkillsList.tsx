import type { RadarValue } from "./RadarChart";

export default function TopSkillsList({ skills }: { skills: RadarValue[] }) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">スキルデータが取得されていません</p>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Top skills">
      {skills.map((skill, index) => {
        const value = Math.min(Math.max(skill.value, 0), 5);
        return (
          <li key={`${skill.label}-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{skill.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {value.toFixed(1)}
                <span className="text-muted-foreground/60">/5.0</span>
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-label={`${skill.label}: ${value.toFixed(1)} out of 5`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
