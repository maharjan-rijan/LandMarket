import { Link, useParams } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { PATHS } from "@/routes/paths";
import Badge from "@/components/ui/Badge";
import { PhoneIcon, PinIcon } from "@/hooks/icons";
import EmptyState from "@/components/common/EmptyState";
import LandCard from "@/components/land/LandCard";
import NotFound from "@/pages/public/NotFound";

export default function VendorProfile() {
  const { id } = useParams();
  const { getVendor, lands } = useData();
  const vendor = getVendor(id);
  if (!vendor) return <NotFound />;

  const mine = lands.filter(
    (l) =>
      l.vendorId === vendor.id &&
      (l.status === "active" || l.status === "sold"),
  );

  return (
    <div className="wrap section" style={{ paddingTop: "1.5rem" }}>
      <Link to={PATHS.vendors} className="link text-sm">
        Back to sellers
      </Link>

      <header className="sheet sheet-pad mt-4 flex flex-wrap items-start gap-5">
        <div className="avatar avatar-lg" aria-hidden="true">
          {vendor.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h1
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              letterSpacing: "-0.03em",
            }}
          >
            {vendor.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={vendor.type === "Agency" ? "river" : "gray"}>
              {vendor.type}
            </Badge>
            <span className="text-muted text-sm flex items-center gap-1">
              <PinIcon size={15} aria-hidden="true" /> {vendor.district}
            </span>
            <span className="text-muted text-sm">
              On LandMarket since {vendor.since}
            </span>
          </div>
          {vendor.about && (
            <p className="mt-3" style={{ maxWidth: "42rem" }}>
              {vendor.about}
            </p>
          )}
        </div>
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone.replace(/\s/g, "")}`}
            className="btn btn-outline"
          >
            <PhoneIcon size={18} aria-hidden="true" /> {vendor.phone}
          </a>
        )}
      </header>

      <div className="section-head mt-10">
        <h2>Listings by {vendor.name}</h2>
      </div>
      {mine.length ? (
        <div className="land-grid">
          {mine.map((l) => (
            <LandCard key={l.id} land={l} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active listings"
          text="This seller has nothing listed right now."
        />
      )}
    </div>
  );
}
