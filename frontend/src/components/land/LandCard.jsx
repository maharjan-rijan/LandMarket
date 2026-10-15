import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Badge from "@/components/ui/Badge";
import { PinIcon } from "@/hooks/icons";
import PlotShape from "@/components/land/PlotShape";
import PriceTag from "@/components/land/PriceTag";
import SaveButton from "@/components/land/SaveButton";

export default function LandCard({ land }) {
  const { getVendor } = useData();
  const vendor = getVendor(land.vendorId);

  return (
    <article className="plot">
      <div className="plot-sheet">
        <PlotShape
          seed={land.id}
          areaAana={land.areaAana}
          roadFt={land.roadFt}
        />
        <div className="plot-flags">
          {land.featured && <Badge tone="gold">Featured</Badge>}
          {land.status === "sold" && <Badge tone="river">Sold</Badge>}
        </div>
        <SaveButton landId={land.id} />
      </div>

      <div className="plot-body">
        <h3 className="plot-title">
          <Link to={PATHS.land(land.id)}>{land.title}</Link>
        </h3>

        <p className="text-muted text-sm flex items-center gap-1">
          <PinIcon size={16} aria-hidden="true" />
          {land.municipality}-{land.ward}, {land.district}
        </p>

        <dl className="specs">
          <div>
            <dt>Area</dt>
            <dd>{formatArea(land.areaAana)}</dd>
          </div>
          <div>
            <dt>Road</dt>
            <dd>{land.roadFt} ft</dd>
          </div>
          <div>
            <dt>Facing</dt>
            <dd>{land.facing}</dd>
          </div>
        </dl>

        <div className="mt-auto">
          <PriceTag land={land} />
        </div>

        {vendor && (
          <p className="plot-vendor">
            <Link to={PATHS.vendor(vendor.id)}>{vendor.name}</Link>
          </p>
        )}
      </div>
    </article>
  );
}
