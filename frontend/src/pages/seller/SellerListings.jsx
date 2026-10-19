import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea, formatNprShort, totalPrice } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { PlusIcon } from "@/hooks/icons";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/land/StatusBadge";

const FILTERS = ["all", "active", "sold", "closed"];

export default function SellerListings() {
  const { lands, inquiries, myStore, setLandStatus, removeLand } = useData();
  const [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState(null); // { type: "sold" | "close" | "delete", land }
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  const mine = useMemo(
    () => lands.filter((l) => l.vendorId === myStore?.id),
    [lands, myStore],
  );
  const shown = mine.filter((l) => filter === "all" || l.status === filter);
  const count = (s) =>
    s === "all" ? mine.length : mine.filter((l) => l.status === s).length;
  const inquiryCount = (id) => inquiries.filter((i) => i.landId === id).length;

  const closeDialog = () => {
    setDialog(null);
    setBuyerName("");
    setBuyerEmail("");
  };

  const confirm = () => {
    const { type, land } = dialog;
    if (type === "sold")
      setLandStatus(land.id, "sold", {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
      });
    if (type === "close") setLandStatus(land.id, "closed");
    if (type === "delete") removeLand(land.id);
    closeDialog();
  };

  // The Actions menu for one row. Each item runs the same function as before:
  // Mark sold and Close and Delete open their confirmation, Reopen acts straight away.
  const rowActions = (l) => [
    {
      label: "Mark sold",
      onSelect: () => setDialog({ type: "sold", land: l }),
      disabled: l.status !== "active",
      hint:
        l.status === "sold"
          ? "Already sold"
          : l.status === "closed"
            ? "Reopen it first"
            : undefined,
    },
    l.status === "closed"
      ? { label: "Reopen", onSelect: () => setLandStatus(l.id, "active") }
      : {
          label: "Close",
          onSelect: () => setDialog({ type: "close", land: l }),
          disabled: l.status !== "active",
          hint: l.status === "sold" ? "Sold listings stay sold" : undefined,
        },
    {
      label: "Delete",
      onSelect: () => setDialog({ type: "delete", land: l }),
      danger: true,
      separatorBefore: true,
    },
  ];

  const titles = {
    sold: "Mark as sold",
    close: "Close this listing",
    delete: "Delete this listing",
  };

  return (
    <>
      <PageHeader
        title="My listings"
        text="Manage every plot in your store."
        action={
          <Button to={PATHS.seller.newListing}>
            <PlusIcon size={18} /> Add listing
          </Button>
        }
      />

      {!mine.length ? (
        <EmptyState
          title="No listings yet"
          text="Your plots will appear here once you add them."
          action={<Button to={PATHS.seller.newListing}>Add listing</Button>}
        />
      ) : (
        <>
          <ChipGroup
            label="Filter by status"
            className="mb-4"
            options={FILTERS.map((f) => ({
              value: f,
              label: f[0].toUpperCase() + f.slice(1),
              count: count(f),
            }))}
            value={filter}
            onChange={setFilter}
          />

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Land</th>
                  <th>Area</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Inquiries</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id}>
                    <td style={{ minWidth: "12rem" }}>
                      <Link to={PATHS.land(l.id)} className="link">
                        {l.title}
                      </Link>
                      <p className="text-sm text-muted">
                        {l.municipality}-{l.ward}, {l.district}
                      </p>
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {formatArea(l.areaAana)}
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {formatNprShort(totalPrice(l))}
                    </td>
                    <td className="num">{l.views.toLocaleString()}</td>
                    <td className="num">{inquiryCount(l.id)}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      <DropdownMenu label="Actions" items={rowActions(l)} />
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-muted"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No {filter} listings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={Boolean(dialog)}
        onClose={closeDialog}
        title={dialog ? titles[dialog.type] : ""}
      >
        {dialog && (
          <div className="flex flex-col gap-4">
            <p className="text-muted">
              {dialog.type === "sold" && (
                <>
                  Marking{" "}
                  <strong className="text-ink">{dialog.land.title}</strong> as
                  sold adds the buyer to its ownership record and removes it
                  from search.
                </>
              )}
              {dialog.type === "close" && (
                <>
                  Closing{" "}
                  <strong className="text-ink">{dialog.land.title}</strong>{" "}
                  hides it from search. You can reopen it later.
                </>
              )}
              {dialog.type === "delete" && (
                <>
                  This permanently removes{" "}
                  <strong className="text-ink">{dialog.land.title}</strong> and
                  cannot be undone.
                </>
              )}
            </p>
            {dialog.type === "sold" && (
              <>
                <Input
                  label="Buyer name"
                  name="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  hint="Optional. Added to the ownership record."
                />
                <Input
                  label="Buyer email"
                  name="buyerEmail"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  hint="Optional. If the buyer has a LandMarket account, the land appears in their Purchases."
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                variant={dialog.type === "delete" ? "danger" : "primary"}
                onClick={confirm}
              >
                {dialog.type === "delete" ? "Delete listing" : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
