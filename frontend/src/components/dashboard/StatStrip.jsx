// A single ruled ledger instead of a row of identical cards.
export default function StatStrip({ items }) {
  return (
    <div className="sheet stats" style={{ "--cols": items.length }}>
      {items.map((i) => (
        <div className="stat" key={i.label}>
          <p className="stat-label">{i.label}</p>
          <p className="stat-value num">{i.value}</p>
          {i.hint && <p className="stat-hint">{i.hint}</p>}
        </div>
      ))}
    </div>
  );
}
