import { useData } from "@/store/DataContext";
import { formatArea, formatNpr, timeAgo } from "@/lib/format";
import { matchesDemand } from "@/lib/landFilters";
import Badge from "@/components/ui/Badge";
import { PhoneIcon, PinIcon } from "@/hooks/icons";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";

// Buyers post what they want; sellers see which of their plots match.
export default function SellerDemands() {
  const { demands, lands, myStore } = useData();
  const mine = lands.filter((l) => l.vendorId === myStore?.id);
  const open = demands
    .filter((d) => d.status === "open")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <PageHeader
        title="Buyer demands"
        text="Buyers post what they are looking for. Contact the ones that match your plots."
      />

      {!open.length ? (
        <EmptyState
          title="No open demands"
          text="New buyer requests will appear here."
        />
      ) : (
        <ul
          className="grid gap-4 md:grid-cols-2"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {open.map((d) => {
            const matches = mine.filter((l) => matchesDemand(l, d)).length;
            return (
              <li key={d.id} className="sheet sheet-pad flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <PinIcon size={17} aria-hidden="true" /> {d.district}
                    </p>
                    <p className="text-sm text-muted">
                      {d.buyerName}, {timeAgo(d.createdAt)}
                    </p>
                  </div>
                  {matches > 0 ? (
                    <Badge tone="green">{matches} of your plots match</Badge>
                  ) : (
                    <Badge tone="gray">No match</Badge>
                  )}
                </div>
                <dl
                  className="specs"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div>
                    <dt>Wants at least</dt>
                    <dd>{formatArea(d.minAana)}</dd>
                  </div>
                  <div>
                    <dt>Budget per aana</dt>
                    <dd className="num">{formatNpr(d.maxPricePerAana)}</dd>
                  </div>
                </dl>
                {d.note && <p className="text-sm">{d.note}</p>}
                {d.phone && (
                  <a
                    href={`tel:${d.phone.replace(/\s/g, "")}`}
                    className="btn btn-outline btn-sm"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <PhoneIcon size={16} aria-hidden="true" /> Call {d.phone}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
