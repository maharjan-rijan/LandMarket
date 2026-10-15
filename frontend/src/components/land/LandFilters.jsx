import { DISTRICTS } from "@/data/districts";
import { formatNpr } from "@/lib/format";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CloseIcon, SearchIcon } from "@/hooks/icons";

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

const FILTER_KEYS = ["q", "district", "maxPrice", "minArea", "minRoad"];

export default function LandFilters({ params, onChange, onReset }) {
  const val = (k) => params.get(k) ?? "";
  const set = (k) => (e) => onChange(k, e.target.value);
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
        <div className="relative flex-1">
          <label htmlFor="q" className="sr-only">
            Search lands
          </label>
          <SearchIcon
            size={20}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: ".85rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          />
          <input
            id="q"
            name="q"
            type="text"
            inputMode="search"
            autoComplete="off"
            className="input"
            style={{
              paddingLeft: "2.7rem",
              paddingRight: val("q") ? "2.7rem" : undefined,
              minHeight: "3rem",
            }}
            placeholder="Search by area, ward or title"
            value={val("q")}
            onChange={set("q")}
          />
          {val("q") && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Clear search"
              onClick={() => onChange("q", "")}
              style={{
                position: "absolute",
                right: ".3rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>

        <div className="md:w-60">
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            className="input"
            style={{ minHeight: "3rem" }}
            value={val("sort")}
            onChange={set("sort")}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Narrow the results down */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <Input
          as="select"
          label="District"
          name="district"
          value={val("district")}
          onChange={set("district")}
        >
          <option value="">All districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Input>

        <Input
          as="select"
          label="Max price per aana"
          name="maxPrice"
          value={val("maxPrice")}
          onChange={set("maxPrice")}
        >
          <option value="">Any price</option>
          {PRICES.map((p) => (
            <option key={p} value={p}>
              Up to {formatNpr(p)}
            </option>
          ))}
        </Input>

        <Input
          as="select"
          label="Minimum size"
          name="minArea"
          value={val("minArea")}
          onChange={set("minArea")}
        >
          <option value="">Any size</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a} aana and up
            </option>
          ))}
        </Input>

        <Input
          as="select"
          label="Road width"
          name="minRoad"
          value={val("minRoad")}
          onChange={set("minRoad")}
        >
          <option value="">Any road</option>
          {ROADS.map((r) => (
            <option key={r} value={r}>
              {r} ft and wider
            </option>
          ))}
        </Input>

        <div>
          <Button
            variant="ghost"
            onClick={onReset}
            disabled={!anyFilter}
            className="btn-block"
          >
            Clear all
          </Button>
        </div>
      </div>
    </form>
  );
}
