import { useState } from "react";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import ChipGroup from "@/components/ui/ChipGroup";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import VendorCard from "@/components/vendor/VendorCard";

export default function Vendors() {
  const { vendors } = useData();
  const [district, setDistrict] = useState("");
  const list = vendors.filter((v) => !district || v.district === district);

  return (
    <div className="wrap section" style={{ paddingTop: "2rem" }}>
      <PageHeader
        title="Sellers"
        text="Owners and agencies who list land on LandMarket. Each has a store page with all of their plots."
      />

      <ChipGroup
        label="Filter by district"
        className="mb-6"
        options={[
          { value: "", label: "All districts" },
          ...DISTRICTS.map((d) => ({ value: d, label: d })),
        ]}
        value={district}
        onChange={setDistrict}
      />

      {list.length ? (
        <div className="vendor-grid">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      ) : (
        <EmptyState title="No sellers in this district yet" />
      )}
    </div>
  );
}
