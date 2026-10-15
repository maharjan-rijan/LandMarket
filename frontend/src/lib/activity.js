// Deterministic mock "views per day" so charts look the same on every render.
export function makeActivity(totalViews, seedStr, days = 14) {
  let h = 2166136261;
  for (const c of String(seedStr)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
  const weights = Array.from({ length: days }, () => 0.4 + rnd());
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000),
    views: Math.round((totalViews * 0.35 * w) / sum),
  }));
}
