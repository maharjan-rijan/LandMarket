// Plain SVG bar chart: views per day. The latest day is marked in marigold.
export default function ActivityChart({ data, label = "Views per day" }) {
  const W = 640;
  const H = 180;
  const pad = { l: 8, r: 8, t: 14, b: 24 };
  const max = Math.max(1, ...data.map((d) => d.views));
  const bw = (W - pad.l - pad.r) / data.length;
  const total = data.reduce((s, d) => s + d.views, 0);
  const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}, ${total} in total over the last ${data.length} days`} style={{ width: "100%", height: "auto" }}>
        {data.map((d, i) => {
          const h = (d.views / max) * (H - pad.t - pad.b);
          return (
            <rect
              key={i}
              x={pad.l + i * bw + 3}
              y={H - pad.b - h}
              width={bw - 6}
              height={Math.max(h, 1)}
              rx="2"
              className={i === data.length - 1 ? "bar-last" : "bar"}
            >
              <title>{`${fmt(d.date)}: ${d.views} views`}</title>
            </rect>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="axis" />
        <text x={pad.l} y={H - 6} className="chart-text">{fmt(data[0].date)}</text>
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="chart-text">{fmt(data[data.length - 1].date)}</text>
      </svg>
      <figcaption className="text-muted text-sm mt-1">
        {label}, last {data.length} days: <strong className="text-ink num">{total.toLocaleString()}</strong>
      </figcaption>
    </figure>
  );
}
