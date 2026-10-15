export default function Badge({ tone = "gray", children, className = "" }) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}
