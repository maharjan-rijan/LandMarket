import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea, formatDate, formatNpr } from "@/lib/format";
import { sqftOf } from "@/lib/units";
import { PATHS } from "@/routes/paths";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { CheckIcon, PhoneIcon, PinIcon } from "@/hooks/icons";
import InquiryForm from "@/components/land/InquiryForm";
import OwnershipChain from "@/components/land/OwnershipChain";
import PlotShape from "@/components/land/PlotShape";
import PriceTag from "@/components/land/PriceTag";
import SaveButton from "@/components/land/SaveButton";
import StatusBadge from "@/components/land/StatusBadge";
import Loader from "@/components/common/Loader";
import NotFound from "@/pages/public/NotFound";

export default function LandDetail() {
  const { id } = useParams();
  const { getLand, getVendor, fetchLand } = useData();
  const land = getLand(id);

  // The list endpoints leave out the ownership record, so load this land in full.
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let live = true;
    setChecked(false);
    fetchLand(id).finally(() => live && setChecked(true));
    return () => {
      live = false;
    };
  }, [id, fetchLand]);

  if (!land) return checked ? <NotFound /> : <Loader />;

  const vendor = getVendor(land.vendorId);
  const available = land.status === "active";

  return (
    <div className="wrap section" style={{ paddingTop: "1.5rem" }}>
      <Link to={PATHS.lands} className="link text-sm">
        Back to all lands
      </Link>

      <div className="detail mt-4">
        <div className="flex flex-col gap-8">
          <div className="sheet" style={{ overflow: "hidden" }}>
            <div className="plot-sheet" style={{ aspectRatio: "16 / 9" }}>
              <PlotShape
                seed={land.id}
                areaAana={land.areaAana}
                roadFt={land.roadFt}
                animate
              />
            </div>
            <div className="sheet-pad">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={land.status} />
                {land.featured && <Badge tone="gold">Featured</Badge>}
              </div>
              <h1
                className="mt-3"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {land.title}
              </h1>
              <p className="text-muted mt-1 flex items-center gap-1">
                <PinIcon size={18} aria-hidden="true" /> {land.municipality}-
                {land.ward}, {land.district}
              </p>
              <p className="mt-4">{land.description}</p>
            </div>
          </div>

          <section className="sheet sheet-pad" aria-labelledby="specs-h">
            <h2 id="specs-h" style={{ fontSize: "1.3rem" }}>
              Plot details
            </h2>
            <dl className="kv mt-3">
              <div>
                <dt>Land ID</dt>
                <dd>{land.id}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd className="num">{formatArea(land.areaAana)}</dd>
              </div>
              <div>
                <dt>Area in square feet</dt>
                <dd className="num">
                  {sqftOf(land.areaAana).toLocaleString()} sq ft
                </dd>
              </div>
              <div>
                <dt>Price per aana</dt>
                <dd className="num">{formatNpr(land.pricePerAana)}</dd>
              </div>
              <div>
                <dt>Road access</dt>
                <dd>{land.roadFt} ft</dd>
              </div>
              <div>
                <dt>Facing</dt>
                <dd>{land.facing}</dd>
              </div>
              <div>
                <dt>Listed on</dt>
                <dd>{formatDate(land.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="sheet sheet-pad" aria-labelledby="docs-h">
            <h2 id="docs-h" style={{ fontSize: "1.3rem" }}>
              Documents
            </h2>
            <ul
              className="mt-3 flex flex-wrap gap-2"
              style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}
            >
              {land.documents.map((d) => (
                <li key={d}>
                  <Badge tone="green">
                    <CheckIcon size={14} /> {d}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="hint">
              Ask the seller to show the originals before you pay any advance.
            </p>
          </section>

          <section className="sheet sheet-pad" aria-labelledby="chain-h">
            <h2 id="chain-h" style={{ fontSize: "1.3rem" }}>
              Ownership record
            </h2>
            <div className="mt-4">
              <OwnershipChain chain={land.chain} />
            </div>
          </section>
        </div>

        <aside
          className="detail-side flex flex-col gap-4"
          aria-label="Price and contact"
        >
          <div className="sheet sheet-pad flex flex-col gap-4">
            <PriceTag land={land} />
            {available ? (
              <>
                <InquiryForm land={land} />
                <SaveButton landId={land.id} variant="button" />
              </>
            ) : (
              <Alert type="info">
                This land is{" "}
                {land.status === "sold" ? "sold" : "no longer listed"}.
              </Alert>
            )}
          </div>

          {vendor && (
            <div className="sheet sheet-pad">
              <div className="flex items-center gap-3">
                <div className="avatar" aria-hidden="true">
                  {vendor.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    <Link to={PATHS.vendor(vendor.id)} className="link">
                      {vendor.name}
                    </Link>
                  </p>
                  <p className="text-muted text-sm">
                    {vendor.type} in {vendor.district}
                  </p>
                </div>
              </div>
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                  className="mt-3 flex items-center gap-2 text-sm text-muted"
                >
                  <PhoneIcon size={16} aria-hidden="true" /> {vendor.phone}
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
