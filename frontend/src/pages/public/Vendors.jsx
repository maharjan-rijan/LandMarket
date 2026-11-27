import { useState } from "react";
import { useData } from "@/store/DataContext";
import EmptyState from "@/components/common/EmptyState";
import FilterBox from "@/components/common/FilterBox";
import Pagination from "@/components/ui/Pagination";
import usePagination from "@/hooks/usePagination";
import {
  matchesLocation,
  NO_LOCATION,
} from "@/components/common/LocationFilter";
import PageHeader from "@/components/common/PageHeader";
import VendorCard from "@/components/vendor/VendorCard";

export default function Vendors() {
  const { vendors } = useData();
  const [loc, setLoc] = useState(NO_LOCATION);

  // A seller (store) has a district, not a municipality, so only province and district filter here.
  const list = vendors.filter((v) => matchesLocation(v, loc));
  const { items, pager } = usePagination(list, {
    pageSize: 12,
    resetKey: district,
  });

  const filtered = Boolean(loc.province || loc.district);

  return (
    <div className="wrap section" style={{ paddingTop: "2rem" }}>
      <PageHeader
        title="Sellers"
        text="Owners and agencies who list land on LandMarket. Each has a store page with all of their plots."
      />

      <FilterBox
        value={loc}
        onChange={setLoc}
        count={list.length}
        noun="seller"
        showMunicipality={false}
        className="mb-6"
      />

      {list.length ? (
        <>
          <div className="vendor-grid">
            {items.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
          <Pagination {...pager} noun="sellers" />
        </>
      ) : (
        <EmptyState
          title={
            filtered ? "No sellers match this filter yet" : "No sellers yet"
          }
        />
      )}
    </div>
  );
}
