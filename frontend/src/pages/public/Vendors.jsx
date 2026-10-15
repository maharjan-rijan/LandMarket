import { useState } from "react";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import VendorCard from "@/components/vendor/VendorCard";

export default function Vendors() {
  const { vendors } = useData();
  const [district, setDistrict] = useState("");
  const list = vendors.filter((v) => !district || v.district === district);

  return (
    <div className="wrap section" style={{ paddingTop: "2rem" }}>
      <PageHeader title="Sellers" text="Owners and agencies who list land on LandMarket. Each has a store page with all of their plots." />

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by district">
        <button type="button" className={`chip${district === "" ? " is-on" : ""}`} aria-pressed={district === ""} onClick={() => setDistrict("")}>
          All districts
        </button>
        {DISTRICTS.map((d) => (
          <button key={d} type="button" className={`chip${district === d ? " is-on" : ""}`} aria-pressed={district === d} onClick={() => setDistrict(d)}>
            {d}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="vendor-grid">{list.map((v) => <VendorCard key={v.id} vendor={v} />)}</div>
      ) : (
        <EmptyState title="No sellers in this district yet" />
      )}
    </div>
  );
}
