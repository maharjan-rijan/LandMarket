import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { formatArea, formatDate, formatNprShort } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import OwnershipChain from "@/components/land/OwnershipChain";

// Land this buyer bought. They can sell it on: the new owner is added to the ownership
// record, and the land stays here as a record of what they once owned.
export default function BuyerPurchases() {
  const { uid, purchases, getLand, resellLand, error } = useData();

  const mine = useMemo(
    () =>
      purchases
        .filter((p) => p.buyerId === uid)
        .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [purchases, uid],
  );

  const [sell, setSell] = useState(null); // the purchase being sold on
  const [record, setRecord] = useState(null); // the purchase whose ownership record is open
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const openSell = (purchase) => {
    setSell(purchase);
    setName("");
    setEmail("");
    setFieldError("");
    setFailed(false);
  };

  const closeSell = () => {
    setSell(null);
    setFieldError("");
    setFailed(false);
  };

  const confirmSell = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setFieldError(
        "Enter the new owner's name. It is added to the ownership record.",
      );
      return;
    }
    setFieldError("");
    setFailed(false);
    setSending(true);
    const done = await resellLand(sell.landId, {
      buyerName: name.trim(),
      buyerEmail: email.trim(),
    });
    setSending(false);
    if (done) closeSell();
    else setFailed(true); // the box stays open so nothing typed is lost
  };

  const actionsFor = (p) => [
    {
      label: "Mark sold",
      onSelect: () => openSell(p),
      disabled: !p.owned,
      hint: !p.owned ? "You already sold this land" : undefined,
    },
    { label: "Ownership record", onSelect: () => setRecord(p) },
  ];

  const sellLand = sell ? getLand(sell.landId) : null;
  const recordLand = record ? getLand(record.landId) : null;

  return (
    <>
      <PageHeader
        title="Purchases"
        text="Land you bought through LandMarket. If you sell it on, the new owner is added to its ownership record."
      />

      {mine.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Land</th>
                <th>Area</th>
                <th>Paid</th>
                <th>Bought on</th>
                <th>Ownership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((p) => {
                const land = getLand(p.landId);
                return (
                  <tr key={p.id}>
                    <td style={{ minWidth: "13rem" }}>
                      {land ? (
                        <>
                          <Link to={PATHS.land(land.id)} className="link">
                            {land.title}
                          </Link>
                          <p className="text-sm text-muted">
                            {land.municipality}-{land.ward}, {land.district}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted">Removed listing</span>
                      )}
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {land ? formatArea(land.areaAana) : ""}
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {formatNprShort(p.price)}
                    </td>
                    <td className="text-muted" style={{ whiteSpace: "nowrap" }}>
                      {p.date ? formatDate(p.date) : ""}
                    </td>
                    <td style={{ minWidth: "11rem" }}>
                      {p.owned ? (
                        <Badge tone="green">You own this</Badge>
                      ) : (
                        <>
                          <Badge tone="gray">Sold</Badge>
                          <p className="text-sm text-muted mt-1">
                            {p.soldToName ? `to ${p.soldToName}` : ""}
                            {p.resoldAt ? `, ${formatDate(p.resoldAt)}` : ""}
                          </p>
                        </>
                      )}
                    </td>
                    <td>
                      <DropdownMenu label="Actions" items={actionsFor(p)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No purchases yet"
          text="When a seller marks a land as sold to you, it appears here."
          action={<Button to={PATHS.lands}>Browse lands</Button>}
        />
      )}

      <Modal open={Boolean(sell)} onClose={closeSell} title="Mark as sold">
        {sell && (
          <form
            onSubmit={confirmSell}
            className="flex flex-col gap-4"
            noValidate
          >
            <p className="text-muted">
              Selling{" "}
              <strong className="text-ink">
                {sellLand?.title ?? "this land"}
              </strong>{" "}
              adds the new owner to its ownership record. It stays in this table
              as a record of what you owned.
            </p>

            <Input
              label="New owner's name"
              name="newOwnerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldError}
              autoComplete="off"
            />
            <Input
              label="New owner's email"
              name="newOwnerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hint="Optional. If it belongs to a LandMarket account, the land appears in their Purchases."
              autoComplete="off"
            />

            <Alert>
              {failed ? error || "Could not record the sale. Try again." : ""}
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closeSell}>
                Cancel
              </Button>
              <Button type="submit" loading={sending}>
                Mark as sold
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(record)}
        onClose={() => setRecord(null)}
        title="Ownership record"
      >
        {record && (
          <div className="flex flex-col gap-4">
            <p className="text-muted">
              Every owner of{" "}
              <strong className="text-ink">
                {recordLand?.title ?? "this land"}
              </strong>
              , oldest first.
            </p>
            <OwnershipChain chain={recordLand?.chain} />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
