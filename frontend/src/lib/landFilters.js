export function filterLands(lands, p) {
  // every word typed must appear somewhere in the title, place or facing
  const words = (p.q || "").toLowerCase().split(/\s+/).filter(Boolean);
  return lands.filter((l) => {
    if (l.status !== "active") return false;
    if (p.district && l.district !== p.district) return false;
    if (words.length) {
      const text = `${l.title} ${l.municipality} ${l.district} ${l.facing}`.toLowerCase();
      if (!words.every((w) => text.includes(w))) return false;
    }
    if (p.maxPrice && l.pricePerAana > Number(p.maxPrice)) return false;
    if (p.minArea && l.areaAana < Number(p.minArea)) return false;
    if (p.minRoad && l.roadFt < Number(p.minRoad)) return false;
    return true;
  });
}

export function sortLands(lands, sort) {
  const a = [...lands];
  switch (sort) {
    case "price-asc":
      return a.sort((x, y) => x.pricePerAana - y.pricePerAana);
    case "price-desc":
      return a.sort((x, y) => y.pricePerAana - x.pricePerAana);
    case "area-desc":
      return a.sort((x, y) => y.areaAana - x.areaAana);
    case "area-asc":
      return a.sort((x, y) => x.areaAana - y.areaAana);
    default:
      return a.sort(
        (x, y) => Number(y.featured) - Number(x.featured) || new Date(y.createdAt) - new Date(x.createdAt)
      );
  }
}

// Does a land satisfy a buyer's posted demand?
export function matchesDemand(land, d) {
  if (land.status !== "active") return false;
  if (d.district && land.district !== d.district) return false;
  if (d.minAana && land.areaAana < Number(d.minAana)) return false;
  if (d.maxPricePerAana && land.pricePerAana > Number(d.maxPricePerAana)) return false;
  return true;
}
