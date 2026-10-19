import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea, formatNprShort, timeAgo, totalPrice } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import Modal from "@/components/ui/Modal";
import { SearchIcon, TrashIcon } from "@/hooks/icons";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import PlotShape from "@/components/land/PlotShape";
import StatusBadge from "@/components/land/StatusBadge";
import Input from "@/components/ui/Input";

const FILTERS = ["all", "active", "sold", "closed"];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// Every listing on the site. Listings go live when a seller adds them,
// so this page is for finding one and removing it if it should not be there.
export default function AdminListings() {
  const { lands, getVendor, removeLand } = useData();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState(null);

  const sorted = useMemo(
    () =>
      [...lands].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [lands],
  );
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = sorted.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    const text =
      `${l.title} ${l.municipality} ${l.district} ${getVendor(l.vendorId)?.name ?? ""}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
  const count = (f) =>
    f === "all" ? lands.length : lands.filter((l) => l.status === f).length;

  const confirm = () => {
    removeLand(target.id);
    setTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Listings"
        text="Every listing on LandMarket. Remove the ones that should not be there."
      />

      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <ChipGroup
          label="Filter by status"
          options={FILTERS.map((f) => ({
            value: f,
            label: cap(f),
            count: count(f),
          }))}
          value={filter}
          onChange={setFilter}
        />

        <Input
          name="admin-q"
          label="Search listings"
          hideLabel
          type="text"
          icon={<SearchIcon size={19} />}
          onClear={() => setQ("")}
          placeholder="Title, place or seller"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          className="w-full md:w-72"
        />
      </div>

      {shown.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Plot</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Views</th>
                <th>Listed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => {
                const vendor = getVendor(l.vendorId);
                return (
                  <tr key={l.id}>
                    <td style={{ minWidth: "18rem" }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="plot-sheet"
                          style={{
                            width: "6.5rem",
                            flex: "none",
                            border: "1px solid var(--line)",
                            borderRadius: "var(--r-sm)",
                            overflow: "hidden",
                          }}
                        >
                          <PlotShape
                            seed={l.id}
                            areaAana={l.areaAana}
                            roadFt={l.roadFt}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link to={PATHS.land(l.id)} className="link">
                            {l.title}
                          </Link>
                          <p className="text-sm text-muted">
                            {l.municipality}-{l.ward}, {l.district}
                          </p>
                          <p className="text-sm text-muted num">
                            {formatArea(l.areaAana)}, {l.roadFt} ft road
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth: "9rem" }}>
                      {vendor ? (
                        <Link to={PATHS.vendor(vendor.id)} className="link">
                          {vendor.name}
                        </Link>
                      ) : (
                        <span className="text-muted">Unknown</span>
                      )}
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {formatNprShort(totalPrice(l))}
                    </td>
                    <td className="num">{l.views.toLocaleString()}</td>
                    <td
                      className="text-muted text-sm"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {timeAgo(l.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          to={PATHS.land(l.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="icon"
                          aria-label={`Delete ${l.title}`}
                          onClick={() => setTarget(l)}
                        >
                          <TrashIcon size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={
            q
              ? "No listing matches your search"
              : `No ${filter === "all" ? "" : filter + " "}listings`
          }
          text={
            q
              ? "Try fewer words, or another status above."
              : "Listings appear here as soon as a seller adds them."
          }
        />
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Delete this listing"
      >
        {target && (
          <div className="flex flex-col gap-4">
            <p className="text-muted">
              This permanently removes{" "}
              <strong className="text-ink">{target.title}</strong> and its
              ownership record. It cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirm}>
                Delete listing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
