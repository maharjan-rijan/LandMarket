export default function Card({ className = "", children }) {
  return <div className={`sheet sheet-pad ${className}`}>{children}</div>;
}
