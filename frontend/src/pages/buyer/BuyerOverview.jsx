import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { sortLands } from "@/lib/landFilters";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import StatStrip from "@/components/dashboard/StatStrip";
import InquiryList from "@/components/dashboard/InquiryList";
import PageHeader from "@/components/common/PageHeader";
import LandCard from "@/components/land/LandCard";

export default function BuyerOverview() {
  const { user } = useAuth();
  const { uid, lands, savedIds, inquiries, demands, purchases } = useData();

  const myInquiries = useMemo(
    () =>
      inquiries
        .filter((i) => i.buyerId === uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [inquiries, uid],
  );
  const newest = useMemo(
    () =>
      sortLands(
        lands.filter((l) => l.status === "active"),
        "",
      )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    [lands],
  );

  const stats = [
    { label: "Saved lands", value: savedIds.length },
    { label: "Inquiries sent", value: myInquiries.length },
    {
      label: "Open demands",
      value: demands.filter((d) => d.buyerId === uid && d.status === "open")
        .length,
    },
    {
      label: "Purchases",
      value: purchases.filter((p) => p.buyerId === uid).length,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name?.split(" ")[0] ?? ""}`}
        text="Your saved lands, inquiries and purchases in one place."
        action={<Button to={PATHS.lands}>Browse lands</Button>}
      />

      <div className="flex flex-col gap-8">
        <StatStrip items={stats} />

        <section aria-labelledby="new-h">
          <div className="section-head" style={{ marginBottom: "1rem" }}>
            <h2 id="new-h" style={{ fontSize: "1.3rem" }}>
              New on LandMarket
            </h2>
            <Link to={PATHS.lands} className="link text-sm">
              See all lands
            </Link>
          </div>
          <div className="land-grid">
            {newest.map((l) => (
              <LandCard key={l.id} land={l} />
            ))}
          </div>
        </section>

        <section aria-labelledby="my-inq-h">
          <div className="section-head" style={{ marginBottom: "1rem" }}>
            <h2 id="my-inq-h" style={{ fontSize: "1.3rem" }}>
              Latest inquiries
            </h2>
            <Link to={PATHS.buyer.inquiries} className="link text-sm">
              View all
            </Link>
          </div>
          <InquiryList mode="buyer" items={myInquiries.slice(0, 3)} />
        </section>
      </div>
    </>
  );
}
