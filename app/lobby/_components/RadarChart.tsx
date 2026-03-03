export type RadarValue = { label: string; value: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function RadarChart({
  values,
  size = 220,
  max = 5,
}: {
  values: RadarValue[];
  size?: number;
  max?: number;
}) {
  if (values.length === 0) return null;

  const center = size / 2;
  const radius = size / 2 - 20;
  const numPoints = values.length;

  const rings = [1, 2, 3, 4, 5];
  const ringPolygons = rings.map((level) => {
    const points = values.map((_, i) => {
      const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
      const r = (radius * level) / max;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    });
    return points.join(" ");
  });

  const axisData = values.map((entry, i) => {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const axisX = center + radius * Math.cos(angle);
    const axisY = center + radius * Math.sin(angle);
    const labelX = center + (radius + 15) * Math.cos(angle);
    const labelY = center + (radius + 15) * Math.sin(angle);

    const safeValue = clamp(entry.value, 0, max);
    const dataR = (radius * safeValue) / max;
    const pointX = center + dataR * Math.cos(angle);
    const pointY = center + dataR * Math.sin(angle);

    return {
      label: entry.label,
      value: safeValue,
      x1: center,
      y1: center,
      x2: axisX,
      y2: axisY,
      labelX,
      labelY,
      pointX,
      pointY,
    };
  });

  const dataPath = axisData.map((p) => `${p.pointX},${p.pointY}`).join(" ");

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        className="mx-auto"
        aria-label={`スキルレーダーチャート: ${values
          .map((entry) => `${entry.label} ${clamp(entry.value, 0, max).toFixed(1)}`)
          .join(", ")}`}
      >
        <title>Skill Radar Chart</title>
        <desc>Top skills and their scores from 0 to 5.</desc>
        {ringPolygons.map((polygon, i) => (
          <polygon
            key={`ring-${i}`}
            points={polygon}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}

        {axisData.map((axis, i) => (
          <g key={`axis-${axis.label}-${i}`}>
            <line
              x1={axis.x1}
              y1={axis.y1}
              x2={axis.x2}
              y2={axis.y2}
              stroke="var(--border)"
              strokeWidth="1"
              opacity="0.8"
            />
            <text
              x={axis.labelX}
              y={axis.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="500"
              fill="var(--muted-foreground)"
            >
              {axis.label}
            </text>
          </g>
        ))}

        <polygon
          points={dataPath}
          fill="color-mix(in oklch, var(--primary) 22%, transparent)"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {axisData.map((point, i) => (
          <circle
            key={`point-${point.label}-${i}`}
            cx={point.pointX}
            cy={point.pointY}
            r="3.5"
            fill="var(--primary)"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}
