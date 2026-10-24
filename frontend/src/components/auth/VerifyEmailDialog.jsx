import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getErrors } from "@/lib/api";
import {
  OTP_LENGTH,
  RESEND_SECONDS,
  maskEmail,
  sendEmailOtp,
  verifyEmailOtp,
} from "@/lib/verification";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

// Popup that emails a one-time code and checks it.
// The code is sent when the popup opens; the user can ask for another after a short wait.
export default function VerifyEmailDialog({ open, onClose }) {
  const { user, refresh } = useAuth();
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [wait, setWait] = useState(0); // seconds until "Resend" works again
  const [error, setError] = useState({ message: "", fields: {} });

  const send = async () => {
    setSending(true);
    setError({ message: "", fields: {} });
    try {
      await sendEmailOtp();
      setSent(true);
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(getErrors(err));
    } finally {
      setSending(false);
    }
  };

  // Fresh start every time the popup opens; email the code straight away.
  useEffect(() => {
    if (!open) return;
    setCode("");
    setSent(false);
    setDone(false);
    setWait(0);
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Resend countdown
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError({ message: "", fields: {} });
    try {
      await verifyEmailOtp(code);
      await refresh(); // the user now carries email_verified_at, so the warning updates
      setDone(true);
    } catch (err) {
      setError(getErrors(err));
    } finally {
      setVerifying(false);
    }
  };

  const codeError = error.fields.code;
  const general = codeError ? "" : error.message;

  return (
    <Modal open={open} onClose={onClose} title={done ? "Email verified" : "Verify your email"}>
      {done ? (
        <div className="flex flex-col gap-4">
          <Alert type="success">Thank you. {user?.email} is now verified.</Alert>
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          {sent && (
            <p className="text-muted">
              We sent a {OTP_LENGTH}-digit code to <strong>{maskEmail(user?.email)}</strong>.
              It can take a minute to arrive.
            </p>
          )}
          <Alert>{general}</Alert>

          <Input
            name="otp"
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            error={codeError}
            disabled={!sent}
            style={{ letterSpacing: "0.4em", fontSize: "1.25rem", textAlign: "center" }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={send}
              loading={sending}
              disabled={wait > 0}
            >
              {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {/* Button defaults to type="button"; submit needs it spelled out */}
              <Button
                type="submit"
                loading={verifying}
                disabled={code.length !== OTP_LENGTH}
              >
                Verify
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
