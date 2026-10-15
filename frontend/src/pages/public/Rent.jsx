import { useMemo, useState } from 'react'
import { Field, Input, Label, Select, Tab, TabGroup, TabList } from '@headlessui/react'
import { LuSearch } from 'react-icons/lu'
import RentCard from '@/components/rent/RentCard'
import { rentals } from '@/data/rentals'

const types = ['All', 'Land', 'House', 'Apartment', 'Office']
const cities = ['All', ...new Set(rentals.map((r) => r.city))]
const maxRents = [
  { value: 0, label: 'Any rent' },
  { value: 25000, label: 'Up to Rs 25,000' },
  { value: 50000, label: 'Up to Rs 50,000' },
  { value: 100000, label: 'Up to Rs 1 Lakh' },
  { value: 200000, label: 'Up to Rs 2 Lakh' },
]

const defaults = { type: 'All', query: '', city: 'All', maxRent: 0, sort: 'newest' }
const monthly = (r) => (r.period === 'year' ? r.rent / 12 : r.rent)
const sorters = {
  newest: (a, b) => a.posted - b.posted,
  low: (a, b) => monthly(a) - monthly(b),
  high: (a, b) => monthly(b) - monthly(a),
}

const fieldCls =
  'w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm transition focus:border-moss-600 focus:outline-none focus:ring-4 focus:ring-moss-100'

export default function Rent() {
  const [filters, setFilters] = useState(defaults)
  const set = (key, parse = (v) => v) => (e) =>
    setFilters((f) => ({ ...f, [key]: parse(e.target.value) }))

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return rentals
      .filter((r) =>
        (filters.type === 'All' || r.type === filters.type) &&
        (filters.city === 'All' || r.city === filters.city) &&
        (!filters.maxRent || monthly(r) <= filters.maxRent) &&
        (!q || `${r.title} ${r.location}`.toLowerCase().includes(q))
      )
      .sort(sorters[filters.sort])
  }, [filters])

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(defaults)

  return (
    <>
      <section className="contour border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="text-4xl font-semibold sm:text-5xl">Properties for rent</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Land, houses, apartments and offices from owners and agents across Nepal.
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
              <Field>
                <Label className="sr-only">Search by title or place</Label>
                <div className="relative">
                  <LuSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    value={filters.query}
                    onChange={set('query')}
                    placeholder="Search by title or place"
                    className={`${fieldCls} pl-10`}
                  />
                </div>
              </Field>
              <Field>
                <Label className="sr-only">City</Label>
                <Select value={filters.city} onChange={set('city')} className={fieldCls}>
                  {cities.map((c) => <option key={c} value={c}>{c === 'All' ? 'All cities' : c}</option>)}
                </Select>
              </Field>
              <Field>
                <Label className="sr-only">Maximum rent per month</Label>
                <Select value={filters.maxRent} onChange={set('maxRent', Number)} className={fieldCls}>
                  {maxRents.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted">
            <span className="font-semibold text-ink">{results.length}</span>{' '}
            {results.length === 1 ? 'listing' : 'listings'} found
            {isFiltered && (
              <button onClick={() => setFilters(defaults)} className="ml-3 font-semibold text-moss-700 hover:underline">
                Clear filters
              </button>
            )}
          </p>
          <Field className="flex items-center gap-2">
            <Label className="text-sm text-muted">Sort by</Label>
            <Select value={filters.sort} onChange={set('sort')} className={`${fieldCls} !w-auto !py-2`}>
              <option value="newest">Newest</option>
              <option value="low">Rent: low to high</option>
              <option value="high">Rent: high to low</option>
            </Select>
          </Field>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => <RentCard key={r.id} item={r} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold">No rentals match these filters</h2>
            <p className="mt-2 text-muted">Try a higher rent limit, another city, or a different property type.</p>
            <button onClick={() => setFilters(defaults)} className="btn-primary mt-6">Clear filters</button>
          </div>
        )}

        <p className="mt-8 text-sm text-muted">Rent for land is listed per year. The rent limit and sorting compare everything as a monthly amount.</p>
      </section>
    </>
  )
}
