import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { timeAgo } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Button from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/land/StatusBadge";

// Shared by the seller (incoming) and buyer (sent) inquiry pages.
export default function InquiryList({ mode, items }) {
  const { getLand, getVendor, setInquiryStatus, setLandStatus } = useData();
  const [sale, setSale] = useState(null); // { inquiry, land } waiting for confirmation
  const isSeller = mode === "seller";

  if (!items.length) {
    return (
      <EmptyState
        title={
          isSeller ? "No inquiries yet" : "You have not sent any inquiries"
        }
        text={
          isSeller
            ? "When a buyer messages you about a listing, it shows up here."
            : "Open a land listing and use Send inquiry to contact the seller."
        }
        action={!isSeller && <Button to={PATHS.lands}>Browse lands</Button>}
      />
    );
  }

  // Mark sold: the land is sold to the person who sent this inquiry.
  const confirmSale = () => {
    const { inquiry, land } = sale;
    setLandStatus(land.id, "sold", {
      buyerName: inquiry.buyerName,
      buyerEmail: inquiry.buyerEmail,
    });
    setSale(null);
  };

  const actionsFor = (inquiry, land) => [
    {
      label: "Reply",
      onSelect: () => setSale({ inquiry, land }),
      disabled: !land || land.status !== "active",
      hint: !land
        ? "Listing removed"
        : land.status !== "active"
          ? `This land is ${land.status}`
          : undefined,
    },
    {
      label: "Close",
      onSelect: () => setInquiryStatus(inquiry.id, "closed"),
      disabled: inquiry.status === "closed",
      hint: inquiry.status === "closed" ? "Already closed" : undefined,
    },
  ];

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Land</th>
              <th>{isSeller ? "Buyer" : "Seller"}</th>
              <th>Message</th>
              <th>Status</th>
              <th>Sent</th>
              {isSeller && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const land = getLand(i.landId);
              const vendor = getVendor(i.vendorId);
              return (
                <tr key={i.id}>
                  <td style={{ minWidth: "12rem" }}>
                    {land ? (
                      <Link to={PATHS.land(land.id)} className="link">
                        {land.title}
                      </Link>
                    ) : (
                      <span className="text-muted">Removed listing</span>
                    )}
                  </td>
                  <td style={{ minWidth: "9rem" }}>
                    {isSeller ? (
                      <>
                        <p className="font-medium">{i.buyerName}</p>
                        {i.buyerPhone && (
                          <a
                            href={`tel:${i.buyerPhone.replace(/\s/g, "")}`}
                            className="text-sm text-muted"
                          >
                            {i.buyerPhone}
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="font-medium">{vendor?.name ?? "Seller"}</p>
                    )}
                  </td>
                  <td style={{ minWidth: "16rem", maxWidth: "24rem" }}>
                    <p className="text-sm">{i.message}</p>
                  </td>
                  <td>
                    <StatusBadge status={i.status} />
                  </td>
                  <td
                    className="text-muted text-sm"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {timeAgo(i.createdAt)}
                  </td>
                  {isSeller && (
                    <td>
                      <DropdownMenu
                        label="Actions"
                        items={actionsFor(i, land)}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isSeller && (
        <Modal
          open={Boolean(sale)}
          onClose={() => setSale(null)}
          title="Mark as sold"
        >
          {sale && (
            <div className="flex flex-col gap-4">
              <p className="text-muted">
                Mark <strong className="text-ink">{sale.land.title}</strong> as
                sold to{" "}
                <strong className="text-ink">{sale.inquiry.buyerName}</strong>?
                They are added to the land's ownership record and it is removed
                from search.
              </p>
              {sale.inquiry.buyerEmail && (
                <p className="text-sm text-muted">
                  If {sale.inquiry.buyerEmail} is a LandMarket account, the land
                  appears in their Purchases.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSale(null)}>
                  Cancel
                </Button>
                <Button onClick={confirmSale}>Mark as sold</Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
