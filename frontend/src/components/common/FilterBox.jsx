import { useState } from "react";
import Button from "@/components/ui/Button";
import FilterChip from "@/components/ui/FilterClip";
import LocationFilter, {
  NO_LOCATION,
} from "@/components/common/LocationFilter";

export default function FilterBox({
  value,
  onChange,
  count,
  noun = "listing",
  showMunicipality = true,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const { province = "", district = "", municipality = "" } = value;

  // Removing a chip also removes the levels under it
  const chips = [
    province && { key: "province", label: province, next: NO_LOCATION },
    district && {
      key: "district",
      label: district,
      next: { province, district: "", municipality: "" },
    },
    showMunicipality &&
      municipality && {
        key: "municipality",
        label: municipality,
        next: { province, district, municipality: "" },
      },
  ].filter(Boolean);

  const hasCount = typeof count === "number";

  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      aria-label={`Filter ${noun}s`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="font-semibold">Filter {noun}s</h2>
          {hasCount && (
            <p className="text-sm text-gray-500" aria-live="polite">
              {count} {count === 1 ? noun : `${noun}s`} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {chips.length > 0 && (
            <Button
              type="button"
              variant="accent"
              onClick={() => onChange(NO_LOCATION)}
            >
              Clear all
            </Button>
          )}
          <div className="sm:hidden">
            <Button
              type="button"
              variant="accent"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              {open ? "Hide" : "Filters"}
              {chips.length > 0 && ` (${chips.length})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Body: toggled on phones, always shown from sm up */}
      <div
        className={`${open ? "block" : "hidden"} border-t border-gray-100 px-4 py-4 sm:block sm:px-5`}
      >
        <LocationFilter
          value={value}
          onChange={onChange}
          showMunicipality={showMunicipality}
          showClear={false}
        />

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key} className="max-w-full">
                <FilterChip label={c.label} onRemove={() => onChange(c.next)} />
              </li>
            ))}
          </ul>
        )}

        {/* phones only: close the panel and look at the results */}
        <div className="mt-4 sm:hidden [&>*]:w-full">
          <Button type="button" onClick={() => setOpen(false)}>
            {hasCount
              ? `Show ${count} ${count === 1 ? noun : `${noun}s`}`
              : "Show results"}
          </Button>
        </div>
      </div>
    </section>
  );
}
