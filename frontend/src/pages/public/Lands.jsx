import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { filterLands, sortLands } from "@/lib/landFilters";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import LandCard from "@/components/land/LandCard";
import LandFilters from "@/components/land/LandFilters";

export default function Lands() {
  const { lands, loading } = useData();
  const [params, setParams] = useSearchParams();

  const onChange = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const filters = Object.fromEntries(params.entries());
  const results = useMemo(
    () => sortLands(filterLands(lands, filters), filters.sort),
    [lands, params], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="wrap section" style={{ paddingTop: "2rem" }}>
      <PageHeader
        title="Land for sale"
        text={
          filters.q
            ? `${results.length} ${results.length === 1 ? "plot" : "plots"} for "${filters.q}".`
            : `${results.length} ${results.length === 1 ? "plot" : "plots"} for sale.`
        }
      />

      <LandFilters
        params={params}
        onChange={onChange}
        onReset={() => setParams({}, { replace: true })}
      />

      <div className="mt-6">
        {loading && !lands.length ? (
          <Loader />
        ) : results.length ? (
          <div className="land-grid">
            {results.map((l) => (
              <LandCard key={l.id} land={l} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No land matches these filters"
            text={
              filters.q
                ? `Nothing matches "${filters.q}". Try fewer words or clear the filters.`
                : "Try a wider budget, a smaller minimum size or another district."
            }
            action={
              <Button
                variant="outline"
                onClick={() => setParams({}, { replace: true })}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
