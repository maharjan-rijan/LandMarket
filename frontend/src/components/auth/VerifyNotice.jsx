import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isEmailVerified, isPhoneVerified } from "@/lib/verification";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ChevronDownIcon, MailIcon, PhoneIcon, WarningIcon } from "@/hooks/icons";
import VerifyEmailDialog from "@/components/auth/VerifyEmailDialog";

// Warning strip at the top of the dashboard while the account is not fully verified.
// Click it to pick what to verify. Phone verification is not built yet.
export default function VerifyNotice() {
  const { user } = useAuth();
  const [dialog, setDialog] = useState(null); // null | "choose" | "email"

  const emailDone = isEmailVerified(user);
  const phoneDone = isPhoneVerified(user);
  if (emailDone && phoneDone) return null;

  const missing = [!emailDone && "email", !phoneDone && "number"].filter(Boolean);
  // A closing popup reports back late (native <dialog> "close" event). Only clear the
  // state if it still points at that popup, or switching popups would close the new one.
  const closer = (name) => () => setDialog((d) => (d === name ? null : d));

  const options = [
    {
      key: "email",
      icon: MailIcon,
      title: "Verify email",
      hint: user.email,
      done: emailDone,
      onClick: () => setDialog("email"),
    },
    {
      key: "number",
      icon: PhoneIcon,
      title: "Verify number",
      hint: "Coming soon",
      done: phoneDone,
      disabled: true,
    },
  ];

  return (
    <>
      <Button variant="bare" className="notice-warn" onClick={() => setDialog("choose")}>
        <WarningIcon size={20} aria-hidden="true" />
        <span>Please verify your {missing.join(" and ")}.</span>
        <ChevronDownIcon size={16} aria-hidden="true" style={{ marginLeft: "auto" }} />
      </Button>

      <Modal open={dialog === "choose"} onClose={closer("choose")} title="Verify your account">
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          Choose what you would like to verify.
        </p>
        <div className="flex flex-col gap-3">
          {options.map(({ key, icon: Icon, title, hint, done, disabled, onClick }) => (
            <Button
              key={key}
              variant="bare"
              className="verify-opt"
              disabled={done || disabled}
              onClick={onClick}
            >
              <Icon size={22} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted truncate">{hint}</span>
              </span>
              {done && <span className="verify-done">Verified</span>}
            </Button>
          ))}
        </div>
      </Modal>

      <VerifyEmailDialog open={dialog === "email"} onClose={closer("email")} />
    </>
  );
}
