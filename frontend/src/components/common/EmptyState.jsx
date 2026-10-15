export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {text && <p className="text-muted text-sm mt-1" style={{ maxWidth: "28rem", marginInline: "auto" }}>{text}</p>}
      {action && <div className="mt-4 flex justify-center gap-2 flex-wrap">{action}</div>}
    </div>
  );
}
