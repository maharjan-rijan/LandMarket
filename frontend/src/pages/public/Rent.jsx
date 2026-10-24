import { useMemo, useState } from "react";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { LuSearch } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RentCard from "@/components/rent/RentCard";
import { rentals } from "@/data/rentals";

const types = ["All", "Land", "House", "Apartment", "Office"];
const cities = ["All", ...new Set(rentals.map((r) => r.city))];
const maxRents = [
  { value: 0, label: "Any rent" },
  { value: 25000, label: "Up to Rs 25,000" },
  { value: 50000, label: "Up to Rs 50,000" },
  { value: 100000, label: "Up to Rs 1 Lakh" },
  { value: 200000, label: "Up to Rs 2 Lakh" },
];

const defaults = {
  type: "All",
  query: "",
  city: "All",
  maxRent: 0,
  sort: "newest",
};
const monthly = (r) => (r.period === "year" ? r.rent / 12 : r.rent);
const sorters = {
  newest: (a, b) => a.posted - b.posted,
  low: (a, b) => monthly(a) - monthly(b),
  high: (a, b) => monthly(b) - monthly(a),
};

export default function Rent() {
  const [filters, setFilters] = useState(defaults);
  const set =
    (key, parse = (v) => v) =>
    (e) =>
      setFilters((f) => ({ ...f, [key]: parse(e.target.value) }));

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rentals
      .filter(
        (r) =>
          (filters.type === "All" || r.type === filters.type) &&
          (filters.city === "All" || r.city === filters.city) &&
          (!filters.maxRent || monthly(r) <= filters.maxRent) &&
          (!q || `${r.title} ${r.location}`.toLowerCase().includes(q)),
      )
      .sort(sorters[filters.sort]);
  }, [filters]);

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(defaults);

  return (
    <>
      <section className="contour border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Properties for rent
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Land, houses, apartments and offices from owners and agents across
            Nepal.
          </p>

          <div className="parcel mt-8 rounded-2xl border border-line bg-white p-4 shadow-lg shadow-moss-800/5">
            <TabGroup
              selectedIndex={types.indexOf(filters.type)}
              onChange={(i) => setFilters((f) => ({ ...f, type: types[i] }))}
            >
              <TabList className="mb-4 flex flex-wrap gap-1 rounded-xl bg-sand p-1 sm:inline-flex">
                {types.map((t) => (
                  <Tab
                    key={t}
                    className="rounded-lg px-4 py-1.5 text-sm font-semibold text-muted focus:outline-none data-selected:bg-moss-700 data-selected:text-white data-focus:ring-2 data-focus:ring-moss-600"
                  >
                    {t}
                  </Tab>
                ))}
              </TabList>
            </TabGroup>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
              <Input
                name="rent-query"
                label="Search by title or place"
                hideLabel
                icon={<LuSearch size={17} />}
                value={filters.query}
                onChange={set("query")}
                placeholder="Search by title or place"
              />
              <Input
                as="select"
                name="rent-city"
                label="City"
                hideLabel
                value={filters.city}
                onChange={set("city")}
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All cities" : c}
                  </option>
                ))}
              </Input>
              <Input
                as="select"
                name="rent-max"
                label="Maximum rent per month"
                hideLabel
                value={filters.maxRent}
                onChange={set("maxRent", Number)}
              >
                {maxRents.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted">
            <span className="font-semibold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "listing" : "listings"} found
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(defaults)}
                className="ml-3"
              >
                Clear filters
              </Button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="rent-sort" className="text-sm text-muted">
              Sort by
            </label>
            <Input
              as="select"
              name="rent-sort"
              value={filters.sort}
              onChange={set("sort")}
            >
              <option value="newest">Newest</option>
              <option value="low">Rent: low to high</option>
              <option value="high">Rent: high to low</option>
            </Input>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <RentCard key={r.id} item={r} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold">
              No rentals match these filters
            </h2>
            <p className="mt-2 text-muted">
              Try a higher rent limit, another city, or a different property
              type.
            </p>
            <Button onClick={() => setFilters(defaults)} className="mt-6">
              Clear filters
            </Button>
          </div>
        )}

        <p className="mt-8 text-sm text-muted">
          Rent for land is listed per year. The rent limit and sorting compare
          everything as a monthly amount.
        </p>
      </section>
    </>
  );
}
