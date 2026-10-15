import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import { formatNpr } from "@/lib/format";
import { dashboardPath } from "@/lib/roles";
import { sortLands } from "@/lib/landFilters";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AreaConverterWidget from "@/components/common/AreaConverterWidget";
import ContourBackdrop from "@/components/common/ContourBackdrop";
import LandCard from "@/components/land/LandCard";
import PlotShape from "@/components/land/PlotShape";
import VendorCard from "@/components/vendor/VendorCard";

const buyerSteps = [
  "Search by district, price per aana and road width.",
  "Check the plot drawing, the documents and the ownership record.",
  "Message the seller, then follow the inquiry from your dashboard.",
];
const sellerSteps = [
  "Create a seller account and set up your store page.",
  "List each plot with its area, price per aana and documents.",
  "Answer inquiries and mark the land sold. The ownership record updates itself.",
];

function Steps({ title, steps }) {
  return (
    <div className="sheet sheet-pad">
      <h3 style={{ fontSize: "1.25rem" }}>{title}</h3>
      <ol
        className="mt-4 flex flex-col gap-4"
        style={{ listStyle: "none", padding: 0, margin: "1rem 0 0" }}
      >
        {steps.map((s, i) => (
          <li key={s} className="step">
            <span className="step-no" aria-hidden="true">
              {i + 1}
            </span>
            <p>{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { lands, vendors } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState({ district: "", maxPrice: "", minArea: "" });

  const active = useMemo(
    () => lands.filter((l) => l.status === "active"),
    [lands],
  );
  const featured = useMemo(() => sortLands(active, "").slice(0, 6), [active]);
  // sellers with the most active listings first
  const topSellers = vendors
    .map((v) => ({ v, n: active.filter((l) => l.vendorId === v.id).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((x) => x.v);
  const counts = DISTRICTS.map((d) => ({
    d,
    n: active.filter((l) => l.district === d).length,
  }));

  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && p.set(k, v));
    navigate(`${PATHS.lands}?${p.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <ContourBackdrop />
        <div className="wrap hero-grid">
          <div>
            <h1>Land by the aana, with every paper in view.</h1>
            <p
              className="mt-5 text-lg text-muted"
              style={{ maxWidth: "34rem" }}
            >
              Browse plots from owners and agencies across the valley, Pokhara
              and Chitwan. See the shape, the road and the lalpurja before you
              pick up the phone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={PATHS.lands} className="px-6">
                Browse land
              </Button>
              {user ? (
                <Button to={dashboardPath(user.role)} variant="outline">
                  Go to dashboard
                </Button>
              ) : (
                <Button to={PATHS.register} variant="outline">
                  Sell your land
                </Button>
              )}
            </div>
            <p className="mt-6 text-sm text-muted num">
              {active.length} plots listed by {vendors.length} sellers across{" "}
              {DISTRICTS.length} districts
            </p>
          </div>

          <div className="hero-art">
            <div className="plot-sheet" style={{ borderBottom: 0 }}>
              <PlotShape
                seed="hero"
                areaAana={4}
                roadFt={20}
                animate
                dims={{ top: "26 ft", side: "53 ft" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="wrap search-wrap">
        <form
          className="search-panel"
          onSubmit={search}
          role="search"
          aria-label="Search land"
        >
          <Input
            as="select"
            label="Where"
            name="district"
            value={q.district}
            onChange={(e) => setQ({ ...q, district: e.target.value })}
          >
            <option value="">Any district</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Input>
          <Input
            as="select"
            label="Budget per aana"
            name="maxPrice"
            value={q.maxPrice}
            onChange={(e) => setQ({ ...q, maxPrice: e.target.value })}
          >
            <option value="">Any budget</option>
            {[1000000, 2000000, 3000000, 4000000, 6000000].map((p) => (
              <option key={p} value={p}>
                Up to {formatNpr(p)}
              </option>
            ))}
          </Input>
          <Input
            as="select"
            label="Size"
            name="minArea"
            value={q.minArea}
            onChange={(e) => setQ({ ...q, minArea: e.target.value })}
          >
            <option value="">Any size</option>
            {[3, 5, 8, 10, 16].map((a) => (
              <option key={a} value={a}>
                {a} aana and up
              </option>
            ))}
          </Input>
          <Button type="submit" variant="accent">
            Search land
          </Button>
        </form>
      </div>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <h2>Featured plots</h2>
            <p className="text-muted mt-1">
              The newest plots from owners and agencies.
            </p>
          </div>
          <Link to={PATHS.lands} className="link">
            View all lands
          </Link>
        </div>
        <div className="land-grid">
          {featured.map((l) => (
            <LandCard key={l.id} land={l} />
          ))}
        </div>

        <div
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Browse by district"
        >
          {counts.map(({ d, n }) => (
            <Link key={d} to={`${PATHS.lands}?district=${d}`} className="chip">
              {d} <small className="num">{n}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingBlock: "1rem 3.5rem" }}>
        <div className="section-head">
          <h2>One marketplace, two ways in</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Steps title="If you are buying" steps={buyerSteps} />
          <Steps title="If you are selling" steps={sellerSteps} />
        </div>
      </section>

      <section
        style={{
          background: "var(--wash)",
          borderBlock: "1px solid var(--line)",
        }}
      >
        <div className="wrap section grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2>Ropani, aana, paisa, daam. In square feet.</h2>
            <p className="text-muted mt-3" style={{ maxWidth: "30rem" }}>
              Listings here use the hill-region units you will see on a
              lalpurja. Convert any area before you compare prices.
            </p>
            <Link to={PATHS.converter} className="link mt-4 inline-block">
              Open the full converter
            </Link>
          </div>
          <div className="sheet sheet-pad">
            <AreaConverterWidget />
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <h2>Sellers on LandMarket</h2>
            <p className="text-muted mt-1">
              Owners and agencies with the most active listings.
            </p>
          </div>
          <Link to={PATHS.vendors} className="link">
            All sellers
          </Link>
        </div>
        <div className="vendor-grid">
          {topSellers.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      </section>
    </>
  );
}
