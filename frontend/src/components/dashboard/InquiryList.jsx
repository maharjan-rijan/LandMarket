import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { timeAgo } from "@/lib/format";
import { PATHS } from "@/routes/paths";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/land/StatusBadge";

// Shared by the seller (incoming) and buyer (sent) inquiry pages.
export default function InquiryList({ mode, items }) {
  const {
    getLand,
    getVendor,
    setInquiryStatus,
    setLandStatus,
    replyToInquiry,
    error,
  } = useData();
  const isSeller = mode === "seller";

  const [sale, setSale] = useState(null); // { inquiry, land } waiting for confirmation

  // reply box
  const [replyTo, setReplyTo] = useState(null); // the inquiry being answered
  const [text, setText] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

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

  // ---- reply ----
  const openReply = (inquiry) => {
    setReplyTo(inquiry);
    setText("");
    setFieldError("");
    setFailed(false);
  };

  const closeReply = () => {
    setReplyTo(null);
    setText("");
    setFieldError("");
    setFailed(false);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (text.trim().length < 2) {
      setFieldError("Write a message to send to the buyer.");
      return;
    }
    setFieldError("");
    setFailed(false);
    setSending(true);
    const sent = await replyToInquiry(replyTo.id, text.trim());
    setSending(false);
    if (sent) closeReply();
    else setFailed(true); // the box stays open so the message is not lost
  };

  // ---- mark sold: the land is sold to the person who sent this inquiry ----
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
      onSelect: () => openReply(inquiry),
      disabled: inquiry.status === "closed",
      hint: inquiry.status === "closed" ? "This inquiry is closed" : undefined,
    },
    {
      label: "Mark sold",
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

  const replyLand = replyTo ? getLand(replyTo.landId) : null;

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
              const replies = i.replies ?? [];
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
                  <td style={{ minWidth: "16rem", maxWidth: "26rem" }}>
                    <p className="text-sm">{i.message}</p>
                    {replies.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          margin: ".6rem 0 0",
                          padding: 0,
                          display: "grid",
                          gap: ".4rem",
                        }}
                      >
                        {replies.map((r, n) => (
                          <li
                            key={r.id ?? n}
                            style={{
                              padding: ".5rem .7rem",
                              borderLeft: "3px solid var(--terrace)",
                              borderRadius: "0 var(--r-sm) var(--r-sm) 0",
                              background: "var(--terrace-wash)",
                            }}
                          >
                            <p
                              className="text-sm"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {r.message}
                            </p>
                            <p className="text-xs text-muted">
                              {isSeller
                                ? "You replied"
                                : `${vendor?.name ?? "The seller"} replied`}
                              , {timeAgo(r.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
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
        <>
          <Modal
            open={Boolean(replyTo)}
            onClose={closeReply}
            title={replyTo ? `Reply to ${replyTo.buyerName}` : ""}
          >
            {replyTo && (
              <form
                onSubmit={sendReply}
                className="flex flex-col gap-4"
                noValidate
              >
                <div
                  style={{
                    padding: ".65rem .85rem",
                    borderRadius: "var(--r-md)",
                    background: "var(--wash)",
                  }}
                >
                  <p className="text-xs text-muted">
                    {replyLand?.title ?? "Listing removed"}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {replyTo.message}
                  </p>
                </div>

                <Input
                  as="textarea"
                  label="Your reply"
                  name="reply"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  error={fieldError}
                  maxLength={2000}
                  placeholder={`Write your reply to ${replyTo.buyerName}`}
                  hint="The buyer sees this under their message in My inquiries."
                />

                <Alert>
                  {failed
                    ? error || "Could not send your reply. Try again."
                    : ""}
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={closeReply}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={sending}>
                    Send reply
                  </Button>
                </div>
              </form>
            )}
          </Modal>

          <Modal
            open={Boolean(sale)}
            onClose={() => setSale(null)}
            title="Mark as sold"
          >
            {sale && (
              <div className="flex flex-col gap-4">
                <p className="text-muted">
                  Mark <strong className="text-ink">{sale.land.title}</strong>{" "}
                  as sold to{" "}
                  <strong className="text-ink">{sale.inquiry.buyerName}</strong>
                  ? They are added to the land's ownership record and it is
                  removed from search.
                </p>
                {sale.inquiry.buyerEmail && (
                  <p className="text-sm text-muted">
                    If {sale.inquiry.buyerEmail} is a LandMarket account, the
                    land appears in their Purchases.
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
        </>
      )}
    </>
  );
}
