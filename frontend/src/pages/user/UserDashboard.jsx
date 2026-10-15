import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { getErrors } from "@/lib/api";
import { dashboardPath, ROLES } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/common/PageHeader";

const choices = [
  {
    role: ROLES.BUYER,
    title: "Buy land",
    text: "Save plots you like, message sellers, and post what you are looking for so sellers can contact you.",
    action: "Start buying",
    confirm:
      "Your account becomes a buyer account. You can save lands, send inquiries and post demands.",
  },
  {
    role: ROLES.SELLER,
    title: "Sell land",
    text: "Open a store page, list plots with their documents, and answer buyer inquiries from one inbox.",
    action: "Open a seller store",
    confirm:
      "Your account becomes a seller account and a store is created in your name. You can rename it later.",
  },
];

export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [pick, setPick] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setPick(null);
    setError("");
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch("/account/role", { role: pick.role });
      updateUser(data);
      navigate(dashboardPath(data.role), { replace: true });
    } catch (err) {
      setError(getErrors(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name?.split(" ")[0] ?? ""}`}
        text="Choose how you want to use LandMarket. You can keep browsing land without choosing."
        action={
          <Button to={PATHS.lands} variant="outline">
            Browse lands
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {choices.map((c) => (
          <section
            key={c.role}
            className="sheet sheet-pad flex flex-col gap-3"
            aria-labelledby={`choice-${c.role}`}
          >
            <h2 id={`choice-${c.role}`} style={{ fontSize: "1.35rem" }}>
              {c.title}
            </h2>
            <p className="text-muted">{c.text}</p>
            <div className="mt-auto pt-2">
              <Button
                variant={c.role === ROLES.SELLER ? "accent" : "primary"}
                onClick={() => setPick(c)}
              >
                {c.action}
              </Button>
            </div>
          </section>
        ))}
      </div>

      {!user.phone && (
        <div
          className="notice"
          style={{ marginTop: "1.5rem", marginBottom: 0 }}
        >
          <p>Add a phone number so sellers and buyers can reach you.</p>
          <Link to={PATHS.account} className="link">
            Open my account
          </Link>
        </div>
      )}

      <Modal
        open={Boolean(pick)}
        onClose={close}
        title={pick ? pick.title : ""}
      >
        {pick && (
          <div className="flex flex-col gap-4">
            <p className="text-muted">{pick.confirm}</p>
            <Alert>{error}</Alert>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button onClick={confirm} loading={busy}>
                {pick.action}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
