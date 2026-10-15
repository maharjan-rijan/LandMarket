// Horizontal bars with the number written out, so it reads without the colour.
export default function BarList({ items, emptyText = "Nothing to show yet." }) {
  if (!items.length) return <p className="text-muted text-sm">{emptyText}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: ".8rem" }}>
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{i.label}</span>
            <span className="num font-semibold">{i.value}</span>
          </div>
          <div style={{ height: ".5rem", marginTop: ".3rem", borderRadius: "999px", background: "var(--wash)" }}>
            <div style={{ width: `${(i.value / max) * 100}%`, height: "100%", borderRadius: "999px", background: i.color || "var(--terrace)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
