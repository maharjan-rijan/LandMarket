import { useEffect, useState } from "react";
import useCountdown from "@/hooks/useCountdown";
import { getErrors } from "@/lib/api";
import { requestResetCode, verifyResetCode } from "@/lib/passwordReset";
import { OTP_LENGTH, RESEND_SECONDS, maskEmail } from "@/lib/verification";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import OtpInput from "@/components/auth/OtpInput";

// Popup that opens after "Send code". A right code closes it and hands the one-time token
// to the page through onVerified; only then does the new password form appear.
export default function ResetCodeDialog({ open, email, onClose, onVerified }) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState({ message: "", fields: {} });
  const [wait, setWait] = useCountdown();

  // A code was just emailed, so the Resend button starts out waiting.
  useEffect(() => {
    if (!open) return;
    setCode("");
    setError({ message: "", fields: {} });
    setWait(RESEND_SECONDS);
  }, [open, setWait]);

  const submit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError({ message: "", fields: {} });
    try {
      onVerified(await verifyResetCode({ email, code }));
    } catch (err) {
      setError(getErrors(err));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError({ message: "", fields: {} });
    try {
      await requestResetCode(email);
      setCode("");
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(getErrors(err));
    } finally {
      setResending(false);
    }
  };

  const codeError = error.fields.code;

  return (
    <Modal open={open} onClose={onClose} title="Enter verification code">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <p className="text-muted">
          If <strong>{maskEmail(email)}</strong> has an account, we sent a {OTP_LENGTH}-digit code
          to it. It can take a minute to arrive.
        </p>
        <Alert>{codeError ? "" : error.message}</Alert>

        <OtpInput value={code} onChange={setCode} error={codeError} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={resend} loading={resending} disabled={wait > 0}>
            {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={verifying} disabled={code.length !== OTP_LENGTH}>
              Verify
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
