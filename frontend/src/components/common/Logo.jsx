import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 8 L23 4 L28 19 L9 24 Z" fill="var(--terrace-wash)" stroke="var(--terrace)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 29 H29" stroke="var(--marigold)" strokeWidth="3.5" strokeLinecap="round" />
      {[[5, 8], [23, 4], [28, 19], [9, 24]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="var(--surface)" stroke="var(--terrace)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export default function Logo() {
  return (
    <Link to={PATHS.home} className="logo" aria-label="LandMarket home">
      <LogoMark />
      <span>LandMarket</span>
    </Link>
  );
}
