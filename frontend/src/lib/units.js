// Hill-region land units, expressed in square feet.
export const AREA_UNITS = [
  { key: "ropani", label: "Ropani", sqft: 5476 },
  { key: "aana", label: "Aana", sqft: 342.25 },
  { key: "paisa", label: "Paisa", sqft: 85.5625 },
  { key: "daam", label: "Daam", sqft: 21.390625 },
  { key: "sqft", label: "Square feet", sqft: 1 },
  { key: "sqm", label: "Square metres", sqft: 10.7639104167 },
];

export function convertArea(value, from) {
  const unit = AREA_UNITS.find((u) => u.key === from) ?? AREA_UNITS[1];
  const sqft = (Number(value) || 0) * unit.sqft;
  return AREA_UNITS.map((u) => ({ ...u, value: sqft / u.sqft }));
}

export const sqftOf = (aana) => Math.round(aana * 342.25);
