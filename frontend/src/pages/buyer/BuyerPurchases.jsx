import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea, formatDate, formatNpr } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import OwnershipChain from "@/components/land/OwnershipChain";

export default function BuyerPurchases() {
  const { uid, purchases, getLand } = useData();
  const mine = purchases.filter((p) => p.buyerId === uid);

  return (
    <>
      <PageHeader
        title="Purchases"
        text="Land you bought through LandMarket, with its full ownership record."
      />

      {mine.length ? (
        <ul
          className="flex flex-col gap-5"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {mine.map((p) => {
            const land = getLand(p.landId);
            return (
              <li
                key={p.id}
                className="sheet sheet-pad grid gap-6 md:grid-cols-[1fr_1fr]"
              >
                <div>
                  <p className="text-sm text-muted">
                    Bought on {formatDate(p.date)}
                  </p>
                  <h2 style={{ fontSize: "1.3rem" }} className="mt-1">
                    {land ? (
                      <Link to={PATHS.land(land.id)} className="link">
                        {land.title}
                      </Link>
                    ) : (
                      "Removed listing"
                    )}
                  </h2>
                  {land && (
                    <p className="text-muted mt-1">
                      {land.municipality}-{land.ward}, {land.district},{" "}
                      {formatArea(land.areaAana)}
                    </p>
                  )}
                  <p className="price num mt-4">{formatNpr(p.price)}</p>
                  <p className="text-sm text-muted">Price paid</p>
                </div>
                <div>
                  <h3 className="mb-3">Ownership record</h3>
                  <OwnershipChain chain={land?.chain} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No purchases yet"
          text="When a seller marks a land as sold to you, it appears here."
          action={<Button to={PATHS.lands}>Browse lands</Button>}
        />
      )}
    </>
  );
}
