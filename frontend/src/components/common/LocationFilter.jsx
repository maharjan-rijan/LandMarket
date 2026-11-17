import { PROVINCES, districtsOf, municipalitiesOf } from "@/data/locations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

/*
  Province > District > Municipality dropdowns, built with the app's own <Input as="select">.

    const [loc, setLoc] = useState({ province: "", district: "", municipality: "" });
    <LocationFilter value={loc} onChange={setLoc} />
    const shown = lands.filter((l) => matchesLocation(l, loc));

  Layout:  phone 1 column | tablet 2 columns | desktop one row.
  Props:   showMunicipality={false} for things that only have a district (sellers),
           showClear={false} when a parent (FilterBox) already has a Clear button.
*/

// district -> province, so older listings that have no "province" saved still match
const PROVINCE_OF = {};
for (const p of PROVINCES) for (const d of districtsOf(p)) PROVINCE_OF[d] = p;

export const NO_LOCATION = { province: "", district: "", municipality: "" };

export function matchesLocation(
  item,
  { province = "", district = "", municipality = "" } = {},
) {
  if (province && (item.province || PROVINCE_OF[item.district]) !== province)
    return false;
  if (district && item.district !== district) return false;
  if (municipality && item.municipality !== municipality) return false;
  return true;
}

export default function LocationFilter({
  value,
  onChange,
  showMunicipality = true,
  showClear = true,
  className = "",
}) {
  const { province = "", district = "", municipality = "" } = value;

  const districts = districtsOf(province);
  const municipalities = municipalitiesOf(province, district);
  const active = province || district || municipality;

  // columns: 1 on phones, 2 from sm, and one row on lg
  const cols = showMunicipality ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className={className}>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${cols}`}>
        <div className="min-w-0">
          <Input
            as="select"
            label="Province"
            name="filter-province"
            value={province}
            onChange={(e) =>
              onChange({
                province: e.target.value,
                district: "",
                municipality: "",
              })
            }
          >
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Input>
        </div>

        <div className="min-w-0">
          <Input
            as="select"
            label="District"
            name="filter-district"
            value={district}
            disabled={!province}
            onChange={(e) =>
              onChange({ province, district: e.target.value, municipality: "" })
            }
          >
            <option value="">
              {province ? "All districts" : "Select province first"}
            </option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Input>
        </div>

        {showMunicipality && (
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Input
              as="select"
              label="Municipality"
              name="filter-municipality"
              value={municipality}
              disabled={!district}
              onChange={(e) =>
                onChange({ province, district, municipality: e.target.value })
              }
            >
              <option value="">
                {district ? "All municipalities" : "Select district first"}
              </option>
              {municipalities.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Input>
          </div>
        )}
      </div>

      {showClear && (
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(NO_LOCATION)}
            disabled={!active}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
