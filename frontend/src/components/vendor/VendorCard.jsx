import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { PATHS } from "@/routes/paths";
import Badge from "@/components/ui/Badge";
import { PinIcon } from "@/hooks/icons";

export default function VendorCard({ vendor }) {
  const { lands } = useData();
  const count = lands.filter(
    (l) => l.vendorId === vendor.id && l.status === "active",
  ).length;

  return (
    <article
      className="sheet sheet-pad flex flex-col gap-3"
      style={{ position: "relative" }}
    >
      <div className="flex items-center gap-3">
        <div className="avatar" aria-hidden="true">
          {vendor.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate">
            <Link to={PATHS.vendor(vendor.id)} className="vendor-link">
              {vendor.name}
            </Link>
          </h3>
          <p className="text-muted text-sm flex items-center gap-1">
            <PinIcon size={15} aria-hidden="true" /> {vendor.district}
          </p>
        </div>
      </div>

      <p
        className="text-muted text-sm"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {vendor.about || "No store description yet."}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Badge tone={vendor.type === "Agency" ? "river" : "gray"}>
          {vendor.type}
        </Badge>
        <span className="text-sm text-muted ml-auto num">
          {count} active {count === 1 ? "listing" : "listings"}
        </span>
      </div>
    </article>
  );
}
