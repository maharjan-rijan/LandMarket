
import data from "@/data/nepal-locations.json";

// ---- Location compatibility exports ---------------------------------------
// MUNICIPALITIES: { [district]: string[] } (names only, same shape as before)
export const MUNICIPALITIES = {};
for (const districts of Object.values(data)) {
  for (const [district, list] of Object.entries(districts)) {
    MUNICIPALITIES[district] = list.map((m) => m.name);
  }
}

// DISTRICTS: all 77 district names, A to Z
export const DISTRICTS = Object.keys(MUNICIPALITIES).sort();

// ---- Listing form options -------------------------------------------------
// "Lalpurja" must stay in this list: AddListing requires it on every listing.
// If your old file had different document names, keep yours instead.
export const DOCUMENTS = [
  "Lalpurja",
  "Naksa (trace map)",
  "Tax receipt (Malpot)",
  "Charkilla certificate",
  "Citizenship copy of owner",
  "Road access letter",
];

export const FACINGS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
