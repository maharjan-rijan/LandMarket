export const NPR = "रु.";

// 12500000 -> "रु. 1 Crore 25 Lakh"
export function formatNpr(value) {
  const n = Math.round(Number(value) || 0);
  if (n <= 0) return `${NPR} 0`;
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const parts = [];
  if (crore) parts.push(`${crore} Crore`);
  if (lakh) parts.push(`${lakh} Lakh`);
  if (thousand) parts.push(`${thousand} Thousand`);
  if (!parts.length) parts.push(String(n));
  return `${NPR} ${parts.join(" ")}`;
}

const trim = (x) => String(Math.round(x * 100) / 100);

// Short form for tables: "रु. 1.25 Cr", "रु. 30 L"
export function formatNprShort(value) {
  const n = Math.round(Number(value) || 0);
  if (n >= 10000000) return `${NPR} ${trim(n / 10000000)} Cr`;
  if (n >= 100000) return `${NPR} ${trim(n / 100000)} L`;
  return `${NPR} ${n.toLocaleString("en-IN")}`;
}

// 1 ropani = 16 aana = 64 paisa = 256 daam
export function aanaToParts(aana) {
  const totalDaam = Math.round((Number(aana) || 0) * 16);
  const ropani = Math.floor(totalDaam / 256);
  let rest = totalDaam % 256;
  const a = Math.floor(rest / 16);
  rest %= 16;
  const paisa = Math.floor(rest / 4);
  const daam = rest % 4;
  return { ropani, aana: a, paisa, daam };
}

export function formatArea(aana) {
  const p = aanaToParts(aana);
  const out = [];
  if (p.ropani) out.push(`${p.ropani} ropani`);
  if (p.aana) out.push(`${p.aana} aana`);
  if (p.paisa) out.push(`${p.paisa} paisa`);
  if (p.daam) out.push(`${p.daam} daam`);
  return out.length ? out.join(" ") : "0 aana";
}

export function totalPrice(land) {
  return Math.round(land.areaAana * land.pricePerAana);
}

export function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)} min ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)} h ago`;
  const d = h / 24;
  if (d < 30) return `${Math.floor(d)} d ago`;
  return formatDate(iso);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
