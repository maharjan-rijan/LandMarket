import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatNprShort, timeAgo, totalPrice } from "@/lib/format";
import { makeActivity } from "@/lib/activity";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@/hooks/icons";
import ActivityChart from "@/components/dashboard/ActivityChart";
import StatStrip from "@/components/dashboard/StatStrip";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/land/StatusBadge";

export default function SellerOverview() {
  const { lands, inquiries, myStore, getLand } = useData();
  const storeId = myStore?.id;

  const mine = useMemo(
    () => lands.filter((l) => l.vendorId === storeId),
    [lands, storeId],
  );
  const myInquiries = useMemo(
    () =>
      inquiries
        .filter((i) => i.vendorId === storeId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [inquiries, storeId],
  );

  const totalViews = mine.reduce((s, l) => s + l.views, 0);
  const activity = useMemo(
    () => makeActivity(totalViews, storeId || "none"),
    [totalViews, storeId],
  );
  const top = [...mine].sort((a, b) => b.views - a.views).slice(0, 4);

  const stats = [
    {
      label: "Active listings",
      value: mine.filter((l) => l.status === "active").length,
    },
    { label: "Sold", value: mine.filter((l) => l.status === "sold").length },
    { label: "Total views", value: totalViews.toLocaleString() },
    {
      label: "New inquiries",
      value: myInquiries.filter((i) => i.status === "new").length,
    },
  ];

  return (
    <>
      <PageHeader
        title="Seller overview"
        text={myStore ? `Store: ${myStore.name}` : undefined}
        action={
          <Button to={PATHS.seller.newListing}>
            <PlusIcon size={18} /> Add listing
          </Button>
        }
      />

      {!mine.length ? (
        <EmptyState
          title="List your first plot"
          text="Add the area, price per aana and documents. Buyers will see a drawing of the plot and can message you straight away."
          action={<Button to={PATHS.seller.newListing}>Add listing</Button>}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <StatStrip items={stats} />

          <section className="sheet sheet-pad" aria-labelledby="act-h">
            <h2 id="act-h" style={{ fontSize: "1.2rem" }} className="mb-3">
              Traffic
            </h2>
            <ActivityChart data={activity} label="Views across all listings" />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="sheet sheet-pad" aria-labelledby="inq-h">
              <div className="flex items-center justify-between gap-2">
                <h2 id="inq-h" style={{ fontSize: "1.2rem" }}>
                  Recent inquiries
                </h2>
                <Link to={PATHS.seller.inquiries} className="link text-sm">
                  View all
                </Link>
              </div>
              {myInquiries.length ? (
                <ul
                  className="mt-3"
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0.75rem 0 0",
                  }}
                >
                  {myInquiries.slice(0, 4).map((i) => (
                    <li
                      key={i.id}
                      className="flex items-start justify-between gap-3"
                      style={{
                        padding: ".7rem 0",
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{i.buyerName}</p>
                        <p className="text-sm text-muted truncate">
                          {getLand(i.landId)?.title ?? "Removed listing"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={i.status} />
                        <p className="text-sm text-muted mt-1">
                          {timeAgo(i.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm mt-3">No inquiries yet.</p>
              )}
            </section>

            <section className="sheet sheet-pad" aria-labelledby="top-h">
              <div className="flex items-center justify-between gap-2">
                <h2 id="top-h" style={{ fontSize: "1.2rem" }}>
                  Most viewed
                </h2>
                <Link to={PATHS.seller.listings} className="link text-sm">
                  All listings
                </Link>
              </div>
              <ul
                className="mt-3"
                style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}
              >
                {top.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-start justify-between gap-3"
                    style={{
                      padding: ".7rem 0",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <div className="min-w-0">
                      <Link
                        to={PATHS.land(l.id)}
                        className="font-medium truncate block"
                      >
                        {l.title}
                      </Link>
                      <p className="text-sm text-muted num">
                        {formatNprShort(totalPrice(l))}
                      </p>
                    </div>
                    <p className="text-sm shrink-0 num">
                      <strong>{l.views.toLocaleString()}</strong> views
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
