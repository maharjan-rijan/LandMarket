import { useMemo } from "react";
import { formatArea } from "@/lib/format";

// Small seeded random generator: the same land always gets the same outline.
function rng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h = h || 1;
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/*
  Draws a survey-style parcel: boundary pillars at each corner, the road
  along the bottom in marigold (thicker for wider roads) and a north arrow.
  Width grows with area, so a 16 aana plot looks bigger than a 3 aana one.
*/
export default function PlotShape({ seed, areaAana, roadFt, animate = false, dims }) {
  const g = useMemo(() => {
    const r = rng(seed);
    const w = 120 + (Math.min(areaAana, 16) / 16) * 110;
    const L = 160 - w / 2;
    const R = 160 + w / 2;
    const roadY = 150;
    const roadH = 12 + (Math.min(roadFt, 30) / 30) * 12;
    const top = 30 + r() * 12;
    const bottom = roadY - 1 - r() * 7;
    const j = () => 2 + r() * 14;
    const pts = [
      [L + j(), top + j()],
      [R - j(), top + j()],
      [R - j(), bottom],
      [L + j(), bottom],
    ];
    const cx = pts.reduce((s, p) => s + p[0], 0) / 4;
    const cy = pts.reduce((s, p) => s + p[1], 0) / 4;
    return { pts, cx, cy, roadY, roadH };
  }, [seed, areaAana, roadFt]);

  const { pts, cx, cy, roadY, roadH } = g;
  const points = pts.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={`Plot of ${formatArea(areaAana)} on a ${roadFt} ft road`} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y={roadY} width="320" height={roadH} className="plot-road" />
      <line x1="96" x2="320" y1={roadY + roadH / 2} y2={roadY + roadH / 2} className="plot-road-line" />
      <text x="8" y={roadY + roadH / 2 + 3} className="plot-road-text">
        {roadFt} ft road
      </text>

      <polygon points={points} pathLength="1" className={`plot-fill${animate ? " draw" : ""}`} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" className="plot-pillar" />
      ))}

      <text x={cx} y={cy + 5} textAnchor="middle" className="plot-area-text" fontSize="15">
        {formatArea(areaAana)}
      </text>

      <g aria-hidden="true">
        <path d="M296 40 V20 M291 26 L296 20 L301 26" className="plot-north" />
        <text x="296" y="51" textAnchor="middle" className="plot-north-text">
          N
        </text>
      </g>

      {dims && (
        <g className="plot-dim" aria-hidden="true">
          <line x1={pts[0][0]} y1={pts[0][1] - 12} x2={pts[1][0]} y2={pts[1][1] - 12} />
          <text x={(pts[0][0] + pts[1][0]) / 2} y={Math.min(pts[0][1], pts[1][1]) - 17} textAnchor="middle">
            {dims.top}
          </text>
          <line x1={pts[0][0] - 12} y1={pts[0][1]} x2={pts[3][0] - 12} y2={pts[3][1]} />
          <text
            transform={`translate(${Math.min(pts[0][0], pts[3][0]) - 17} ${(pts[0][1] + pts[3][1]) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {dims.side}
          </text>
        </g>
      )}
    </svg>
  );
}
