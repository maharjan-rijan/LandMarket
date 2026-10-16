// The Laravel API speaks snake_case; the pages speak camelCase.
// Every API object goes through one of these before it reaches a page.

const id = (x) => x.id ?? x._id;

export const mapLand = (l) => ({
  id: id(l),
  vendorId: l.store_id,
  ownerId: l.owner_id,
  title: l.title,
  district: l.district,
  municipality: l.municipality,
  ward: Number(l.ward),
  areaAana: Number(l.area_aana),
  pricePerAana: Number(l.price_per_aana),
  roadFt: Number(l.road_ft),
  facing: l.facing,
  description: l.description ?? "",
  documents: l.documents ?? [],
  status: l.status,
  featured: Boolean(l.featured),
  views: Number(l.views ?? 0),
  createdAt: l.created_at,
  soldTo: l.sold_to ?? undefined,
  soldAt: l.sold_at ?? undefined,
  // only the detail endpoint sends the ownership record
  ...(l.chain ? { chain: l.chain } : {}),
});

export const mapStore = (s) => ({
  id: id(s),
  ownerId: s.owner_id,
  name: s.name,
  type: s.type,
  district: s.district,
  phone: s.phone ?? "",
  email: s.email ?? "",
  about: s.about ?? "",
  since: s.since,
});

export const mapInquiry = (i) => ({
  id: id(i),
  landId: i.land_id,
  vendorId: i.store_id,
  buyerId: i.buyer_id,
  buyerName: i.buyer_name,
  buyerEmail: i.buyer_email,
  buyerPhone: i.buyer_phone ?? "",
  message: i.message,
  status: i.status,
  createdAt: i.created_at,
  // the seller's replies, oldest first
  replies: (i.replies ?? []).map((r) => ({
    id: r.id,
    from: r.from,
    message: r.message,
    createdAt: r.created_at,
  })),
});

export const mapDemand = (d) => ({
  id: id(d),
  buyerId: d.buyer_id,
  buyerName: d.buyer_name,
  phone: d.phone ?? "",
  district: d.district,
  minAana: Number(d.min_aana),
  maxPricePerAana: Number(d.max_price_per_aana),
  note: d.note ?? "",
  status: d.status,
  createdAt: d.created_at,
});

export const mapUser = (u) => ({
  id: id(u),
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status ?? "active", // accounts created before suspension existed have no status
  joinedAt: u.created_at,
});

export const mapPurchase = (p, buyerId) => ({
  id: p.id,
  landId: p.land ? id(p.land) : undefined,
  buyerId,
  date: p.date, // the day this buyer got the land
  price: p.price,
  owned: p.owned !== false, // false once they have sold it on
  soldToName: p.sold_to_name ?? undefined,
  resoldAt: p.resold_at ?? undefined,
});
