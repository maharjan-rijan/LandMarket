// scripts/build-locations.mjs
// Run from the frontend root:  node scripts/build-locations.mjs
// Input : scripts/municipalities.simplified.geojson  (from younginnovations/nepal-locallevel-map, out/ folder)
// Output: src/data/nepal-locations.json
import fs from "node:fs";

const INPUT = "scripts/municipalities.simplified.geojson";
const OUTPUT = "src/data/nepal-locations.json";

const PROVINCES = {
  1: "Koshi",
  2: "Madhesh",
  3: "Bagmati",
  4: "Gandaki",
  5: "Lumbini",
  6: "Karnali",
  7: "Sudurpashchim",
};

// The file also holds national parks, reserves etc. Keep only real local levels.
const TYPES = {
  Mahanagarpalika: "Metropolitan City",
  Upamahanagarpalika: "Sub-Metropolitan City",
  Nagarpalika: "Municipality",
  Gaunpalika: "Rural Municipality",
};

const geo = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const seen = new Set(); // a municipality can have 2 polygons (e.g. Bansagadhi)
const out = {};

for (const { properties: p } of geo.features) {
  const type = TYPES[p.locallevel_type];
  if (!type) continue;
  if (seen.has(p.locallevel_fullcode)) continue;
  seen.add(p.locallevel_fullcode);

  const province = PROVINCES[p.province];
  if (!province) throw new Error("Unknown province: " + p.province);

  const base = String(p.locallevel_name).trim();
  const name = base.toLowerCase().endsWith(type.toLowerCase())
    ? base
    : `${base} ${type}`;

  out[province] ??= {};
  out[province][p.district] ??= [];
  out[province][p.district].push({ name, type, wards: Number(p.wards) || 0 });
}

for (const prov of Object.values(out))
  for (const list of Object.values(prov)) list.sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(out));

const districts = Object.values(out).reduce((n, d) => n + Object.keys(d).length, 0);
const munis = Object.values(out).flatMap((d) => Object.values(d)).flat();
console.log("Provinces     :", Object.keys(out).length, "(expect 7)");
console.log("Districts     :", districts, "(expect 77)");
console.log("Local levels  :", munis.length, "(expect 753)");
console.log("Missing wards :", munis.filter((m) => !m.wards).length, "(expect 0)");
