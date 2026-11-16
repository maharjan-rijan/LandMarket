import json, os
import nepal_geo_data as n

def name_of(x):
    """Districts may come back as plain strings or as dicts."""
    if isinstance(x, str):
        return x
    for k in ("district_name_en", "district_name", "name"):
        if k in x:
            return x[k]
    raise ValueError(f"Unknown district format: {x}")

out = {}
problems = []

for p in n.get_provinces():
    province = p["province_name_en"]
    out[province] = {}
    for d in n.get_province_districts(p["province_code"]):
        raw = name_of(d)
        district = raw.title()                      # ACHHAM -> Achham
        munis = n.get_municipalities(raw) or n.get_municipalities(district)
        rows = []
        for m in munis:
            try:
                wards = len(n.get_wards(m))
            except Exception:
                wards = 0
            if wards == 0:
                problems.append(f"{district} / {m}: no ward data")
            rows.append({"name": m, "wards": wards})
        out[province][district] = rows

os.makedirs("src/data", exist_ok=True)
with open("src/data/nepal-locations.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

districts = sum(len(v) for v in out.values())
munis = sum(len(r) for v in out.values() for r in v.values())
print("Provinces:", len(out))
print("Districts:", districts)
print("Municipalities:", munis)
print("Problems:", len(problems))
for line in problems[:20]:
    print(" -", line)