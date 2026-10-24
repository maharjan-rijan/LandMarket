import { DISTRICTS } from "@/data/districts";
import { formatNpr } from "@/lib/format";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SearchIcon } from "@/hooks/icons";

const PRICES = [1000000, 2000000, 3000000, 4000000, 6000000];
const AREAS = [3, 5, 8, 10, 16];
const ROADS = [13, 20, 26];

const SORTS = [
  ["", "Newest first"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["area-desc", "Largest area"],
  ["area-asc", "Smallest area"],
];

// Each narrowing filter is a <select>: [key, label, "any" option, options, option text]
const SELECTS = [
  ["district", "District", "All districts", DISTRICTS, (d) => d],
  [
    "maxPrice",
    "Max price per aana",
    "Any price",
    PRICES,
    (p) => `Up to ${formatNpr(p)}`,
  ],
  ["minArea", "Minimum size", "Any size", AREAS, (a) => `${a} aana and up`],
  ["minRoad", "Road width", "Any road", ROADS, (r) => `${r} ft and wider`],
];

const FILTER_KEYS = ["q", "district", "maxPrice", "minArea", "minRoad"];

export default function LandFilters({ params, onChange, onReset }) {
  const val = (k) => params.get(k) ?? "";
  // name / value / onChange for a filter key
  const bind = (k) => ({
    name: k,
    value: val(k),
    onChange: (e) => onChange(k, e.target.value),
  });
  const anyFilter =
    FILTER_KEYS.some((k) => params.get(k)) || params.get("sort");

  return (
    <form
      className="sheet sheet-pad flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
      role="search"
      aria-label="Search and filter lands"
    >
      {/* Search and sort sit together on one line */}
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          {...bind("q")}
          label="Search lands"
          hideLabel
          type="text"
          inputMode="search"
          autoComplete="off"
          icon={<SearchIcon size={20} />}
          onClear={() => onChange("q", "")}
          placeholder="Search by area, ward or title"
          className="flex-1"
          style={{ minHeight: "3rem" }}
        />

        <Input
          {...bind("sort")}
          as="select"
          label="Sort by"
          hideLabel
          className="md:w-60"
          style={{ minHeight: "3rem" }}
        >
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Input>
      </div>

      {/* Narrow the results down */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        {SELECTS.map(([key, label, any, options, text]) => (
          <Input key={key} {...bind(key)} as="select" label={label}>
            <option value="">{any}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {text(o)}
              </option>
            ))}
          </Input>
        ))}

        <div>
          <Button
            variant="ghost"
            onClick={onReset}
            disabled={!anyFilter}
            className="btn-block"
          >
            Clear All
          </Button>
        </div>
      </div>
    </form>
  );
}
